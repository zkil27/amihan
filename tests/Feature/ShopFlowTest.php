<?php

namespace Tests\Feature;

use App\Mail\OrderPlaced;
use App\Mail\OrderStatusChanged;
use App\Mail\ReturnRequestUpdated;
use App\Models\Cart;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * The core transactional flow from the rubric, end to end:
 * register -> browse -> cart -> checkout -> admin fulfils -> courier
 * delivers -> customer returns -> admin restocks + refunds.
 */
class ShopFlowTest extends TestCase
{
    use RefreshDatabase;

    private ProductVariant $variant;

    protected function setUp(): void
    {
        parent::setUp();
        $cat = Category::create(['name' => 'Whole Beans', 'slug' => 'whole-beans']);
        $product = Product::create(['category_id' => $cat->id, 'name' => 'Atok Highland', 'slug' => 'atok-highland', 'origin' => 'Atok, Benguet', 'elevation_masl' => 1650, 'status' => 'active']);
        $this->variant = $product->variants()->create(['sku' => 'ATK-1', 'name' => '250 g', 'price' => 680, 'stock_qty' => 5]);
        Coupon::create(['code' => 'AMIHAN10', 'type' => 'percent', 'value' => 10, 'min_subtotal' => 500]);
    }

    private function checkoutPayload(array $overrides = []): array
    {
        return array_merge([
            'billing_name' => 'Juan dela Cruz', 'billing_email' => 'juan@example.com', 'billing_phone' => '09171234567',
            'shipping_recipient' => 'Juan dela Cruz', 'shipping_phone' => '09171234567', 'shipping_line1' => '14 Pine Ridge Road',
            'shipping_barangay' => 'Kaybagal South', 'shipping_city' => 'Tagaytay', 'shipping_province' => 'Cavite', 'shipping_postal_code' => '4120',
            'delivery_window' => 'Morning Breeze', 'payment_method' => 'card', 'card_name' => 'Juan dela Cruz',
            'card_number' => '4242424242424242', 'card_expiry' => '12/30', 'card_cvc' => '123',
        ], $overrides);
    }

    public function test_registration_stores_a_bcrypt_hash_and_wrong_password_fails(): void
    {
        $this->post('/register', ['name' => 'Maria', 'email' => 'maria@example.com', 'password' => 'mountain-air-9', 'password_confirmation' => 'mountain-air-9'])
            ->assertRedirect('/account');

        $user = User::where('email', 'maria@example.com')->first();
        $this->assertSame('customer', $user->role);
        $this->assertNotSame('mountain-air-9', $user->password);
        $this->assertTrue(Hash::check('mountain-air-9', $user->password));

        $this->post('/logout');
        $this->post('/login', ['email' => 'maria@example.com', 'password' => 'wrong'])->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_cart_persists_across_requests_and_merges_on_login(): void
    {
        // The cart is stored in the database, so it is the same on every page.
        $user = User::factory()->create();
        $this->actingAs($user)->post('/cart/items', ['variant_id' => $this->variant->id, 'qty' => 2])->assertSessionHasNoErrors();
        $this->get('/pantry')->assertInertia(fn ($page) => $page->where('cart.count', 2));
        $this->get('/story')->assertInertia(fn ($page) => $page->where('cart.count', 2)->where('cart.subtotal', 1360));

        // A guest's cart (found by session id) merges into the account at login.
        $guest = Cart::create(['session_id' => 'guest-session', 'status' => 'active']);
        $guest->items()->create(['product_variant_id' => $this->variant->id, 'qty' => 1]);
        app(\App\Services\CartService::class)->mergeGuestCart($user, 'guest-session');
        $this->get('/pantry')->assertInertia(fn ($page) => $page->where('cart.count', 3));
        $this->assertNull(Cart::find($guest->id));
    }

    public function test_cart_refuses_more_than_stock(): void
    {
        $this->post('/cart/items', ['variant_id' => $this->variant->id, 'qty' => 6])->assertSessionHasErrors('qty');
    }

    public function test_checkout_validates_address_and_declined_card(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->post('/cart/items', ['variant_id' => $this->variant->id, 'qty' => 1]);

        $this->post('/checkout', $this->checkoutPayload(['shipping_postal_code' => '12', 'billing_phone' => '123']))
            ->assertSessionHasErrors(['shipping_postal_code', 'billing_phone']);

        $this->post('/checkout', $this->checkoutPayload(['card_number' => '4000000000000002']))->assertSessionHasErrors('card_number');
        $this->assertSame(0, Order::count());
        $this->assertSame(5, $this->variant->fresh()->stock_qty);
    }

    public function test_full_order_lifecycle_with_return_and_refund(): void
    {
        Mail::fake();
        $customer = User::factory()->create(['email' => 'juan@example.com']);
        $admin = User::factory()->create(['role' => 'admin']);
        $courier = User::factory()->create(['role' => 'courier']);

        // Customer: cart + coupon + checkout.
        $this->actingAs($customer)->post('/cart/items', ['variant_id' => $this->variant->id, 'qty' => 2]);
        $this->post('/cart/coupon', ['code' => 'amihan10'])->assertSessionHasNoErrors();
        $this->post('/checkout', $this->checkoutPayload())->assertRedirect();

        $order = Order::first();
        $this->assertSame('pending', $order->status);
        $this->assertEquals(1360 - 136 + 150, (float) $order->total); // 10% off, delivery fee under PHP 2,000
        $this->assertSame(3, $this->variant->fresh()->stock_qty);
        $this->assertSame('paid', $order->payment->status);
        Mail::assertSent(OrderPlaced::class);

        // Admin: confirm, pack, assign courier.
        $this->actingAs($admin)->post("/admin/orders/{$order->order_no}/status", ['status' => 'confirmed'])->assertSessionHasNoErrors();
        $this->post("/admin/orders/{$order->order_no}/status", ['status' => 'packed'])->assertSessionHasNoErrors();
        $this->post("/admin/orders/{$order->order_no}/courier", ['courier_id' => $courier->id])->assertSessionHasNoErrors();

        // Courier: on the way, then delivered.
        $shipment = $order->fresh()->shipment;
        $this->actingAs($courier)->post("/courier/shipments/{$shipment->id}/transit")->assertSessionHasNoErrors();
        $this->post("/courier/shipments/{$shipment->id}/delivered")->assertSessionHasNoErrors();
        $this->assertSame('delivered', $order->fresh()->status);
        Mail::assertSent(OrderStatusChanged::class, fn ($m) => $m->order->status === 'shipped' || $m->order->status === 'delivered');

        // Customer: request a return.
        $this->actingAs($customer)->post("/account/orders/{$order->order_no}/requests", ['type' => 'return', 'reason' => 'Arrived damaged'])->assertSessionHasNoErrors();
        $request = $order->returnRequests()->first();

        // Admin: approve -> restock + refund.
        $this->actingAs($admin)->post("/admin/returns/{$request->id}/approve")->assertSessionHasNoErrors();
        $this->assertSame('returned', $order->fresh()->status);
        $this->assertSame(5, $this->variant->fresh()->stock_qty);
        $this->assertSame('refunded', $order->fresh()->payment->status);
        $this->assertNotNull($request->fresh()->refund);
        Mail::assertSent(ReturnRequestUpdated::class);
    }

    public function test_role_based_access(): void
    {
        $customer = User::factory()->create();
        $this->actingAs($customer)->get('/admin')->assertForbidden();

        $fulfillment = User::factory()->create(['role' => 'fulfillment']);
        $this->actingAs($fulfillment)->get('/admin/orders')->assertOk();
        $this->get('/admin/products')->assertForbidden();
        $this->get('/admin/employees')->assertForbidden();

        $staff = User::factory()->create(['role' => 'staff']);
        $this->actingAs($staff)->get('/admin/products')->assertOk();
        $this->get('/admin/employees')->assertForbidden();
    }

    public function test_admin_login_refuses_customers(): void
    {
        $customer = User::factory()->create();
        $this->post('/admin/login', ['email' => $customer->email, 'password' => 'password'])->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_admin_creates_product_with_image_upload(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post('/admin/products', [
            'name' => 'Sagada Ridge', 'category_id' => Category::first()->id, 'status' => 'active', 'is_featured' => false,
            'variants' => [['sku' => 'SGD-1', 'name' => '250 g', 'price' => 650, 'stock_qty' => 10, 'low_stock_threshold' => 3, 'is_active' => true]],
            'images' => [UploadedFile::fake()->image('sagada.jpg', 1200, 1500)],
        ])->assertRedirect();

        $product = Product::where('slug', 'sagada-ridge')->first();
        $this->assertNotNull($product);
        $this->assertCount(1, $product->images);
        Storage::disk('public')->assertExists($product->images->first()->path);
    }
}
