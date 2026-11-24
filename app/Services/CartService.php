<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Validation\ValidationException;

/**
 * The shopping cart. It is stored in the database and found by the
 * signed-in user, or by the browser session for guests, so its contents
 * survive every page change and merge into the account at login.
 */
class CartService
{
    public const DELIVERY_FEE = 150.0;

    public const FREE_DELIVERY_OVER = 2000.0;

    public function current(bool $create = false): ?Cart
    {
        $user = auth()->user();
        $query = Cart::query()->where('status', 'active');

        $cart = $user
            ? $query->where('user_id', $user->id)->latest('id')->first()
            : $query->whereNull('user_id')->where('session_id', session()->getId())->latest('id')->first();

        if (! $cart && $create) {
            $cart = Cart::create([
                'user_id' => $user?->id,
                'session_id' => session()->getId(),
                'status' => 'active',
            ]);
        }

        return $cart;
    }

    /** Called on login: move the guest cart's lines into the user's cart. */
    public function mergeGuestCart(User $user, string $guestSessionId): void
    {
        $guest = Cart::where('status', 'active')->whereNull('user_id')->where('session_id', $guestSessionId)->with('items')->first();
        if (! $guest || $guest->items->isEmpty()) {
            return;
        }

        $cart = Cart::firstOrCreate(['user_id' => $user->id, 'status' => 'active'], ['session_id' => $guestSessionId]);

        foreach ($guest->items as $line) {
            $existing = $cart->items()->where('product_variant_id', $line->product_variant_id)->first();
            $existing
                ? $existing->update(['qty' => $existing->qty + $line->qty])
                : $cart->items()->create(['product_variant_id' => $line->product_variant_id, 'qty' => $line->qty]);
        }

        $cart->update(['coupon_id' => $cart->coupon_id ?? $guest->coupon_id]);
        $guest->delete();
    }

    public function add(ProductVariant $variant, int $qty): CartItem
    {
        $cart = $this->current(create: true);
        $line = $cart->items()->firstOrNew(['product_variant_id' => $variant->id]);
        $wanted = ($line->exists ? $line->qty : 0) + $qty;

        $this->assertStock($variant, $wanted);

        $line->qty = $wanted;
        $line->save();
        $cart->touch();

        return $line;
    }

    public function update(CartItem $line, int $qty): void
    {
        $this->assertStock($line->variant, $qty);
        $line->update(['qty' => $qty]);
        $line->cart->touch();
    }

    public function remove(CartItem $line): void
    {
        $line->delete();
    }

    public function applyCoupon(string $code): void
    {
        $cart = $this->current(create: true);
        $coupon = Coupon::whereRaw('UPPER(code) = ?', [strtoupper(trim($code))])->first();

        if (! $coupon) {
            throw ValidationException::withMessages(['code' => 'We could not find that code.']);
        }

        $problem = $coupon->problemFor($this->summary($cart)['subtotal']);
        if ($problem) {
            throw ValidationException::withMessages(['code' => $problem]);
        }

        $cart->update(['coupon_id' => $coupon->id]);
    }

    public function removeCoupon(): void
    {
        $this->current()?->update(['coupon_id' => null]);
    }

    public function ownsLine(CartItem $line): bool
    {
        return $line->cart_id === $this->current()?->id;
    }

    private function assertStock(ProductVariant $variant, int $qty): void
    {
        if ($qty < 1) {
            throw ValidationException::withMessages(['qty' => 'Quantity must be at least 1.']);
        }
        if (! $variant->is_active || $variant->product?->status !== 'active') {
            throw ValidationException::withMessages(['qty' => 'This item is no longer available.']);
        }
        if ($qty > $variant->stock_qty) {
            throw ValidationException::withMessages([
                'qty' => $variant->stock_qty > 0 ? "That's all we have: only {$variant->stock_qty} left." : 'This item is sold out.',
            ]);
        }
    }

    /**
     * Everything the cart UI needs: lines, subtotal, discount,
     * delivery fee and total. Shared with every page via Inertia.
     */
    public function summary(?Cart $cart = null): array
    {
        $cart ??= $this->current();

        if (! $cart) {
            return $this->totals([], null);
        }

        $cart->loadMissing(['items.variant.product.images', 'coupon']);

        $lines = $cart->items->filter(fn ($i) => $i->variant && $i->variant->product)->map(function (CartItem $item) {
            $variant = $item->variant;
            $product = $variant->product;

            return [
                'id' => $item->id,
                'variant_id' => $variant->id,
                'product_name' => $product->name,
                'product_slug' => $product->slug,
                'variant_name' => $variant->name,
                'origin' => $product->origin,
                'elevation_masl' => $product->elevation_masl,
                'image' => $product->images->first()?->url,
                'price' => (float) $variant->price,
                'qty' => $item->qty,
                'stock' => $variant->stock_qty,
                'line_total' => round((float) $variant->price * $item->qty, 2),
            ];
        })->values()->all();

        return $this->totals($lines, $cart->coupon);
    }

    private function totals(array $lines, ?Coupon $coupon): array
    {
        $subtotal = round(array_sum(array_column($lines, 'line_total')), 2);
        $couponValid = $coupon && ! $coupon->problemFor($subtotal);
        $discount = $couponValid ? $coupon->discountFor($subtotal) : 0.0;
        $afterDiscount = $subtotal - $discount;
        $delivery = ($subtotal === 0.0 || $afterDiscount >= self::FREE_DELIVERY_OVER) ? 0.0 : self::DELIVERY_FEE;

        return [
            'lines' => $lines,
            'count' => array_sum(array_column($lines, 'qty')),
            'subtotal' => $subtotal,
            'coupon' => $couponValid ? ['code' => $coupon->code, 'label' => $coupon->type === 'percent' ? ((float) $coupon->value).'% off' : 'PHP '.number_format((float) $coupon->value).' off'] : null,
            'coupon_id' => $couponValid ? $coupon->id : null,
            'discount' => $discount,
            'delivery_fee' => $delivery,
            'free_delivery_over' => self::FREE_DELIVERY_OVER,
            'total' => round($afterDiscount + $delivery, 2),
        ];
    }
}
