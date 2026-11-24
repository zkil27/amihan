<?php

namespace Database\Seeders;

use App\Models\Cart;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\InventoryMovement;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * Demo data. Everything here is synthetic: the accounts, the past orders
 * and the customers are made up so the reports have something to show.
 */
class DatabaseSeeder extends Seeder
{
    public const PASSWORD = 'amihan2026';

    public function run(): void
    {
        mt_srand(25112026);

        // --- People (one account per role) --------------------------------
        $admin = User::create(['name' => 'Amihan Admin', 'email' => 'admin@amihan.test', 'role' => 'admin', 'password' => self::PASSWORD, 'email_verified_at' => now()]);
        User::create(['name' => 'Staff Member', 'email' => 'staff@amihan.test', 'role' => 'staff', 'password' => self::PASSWORD, 'email_verified_at' => now()]);
        User::create(['name' => 'Fulfillment Desk', 'email' => 'fulfillment@amihan.test', 'role' => 'fulfillment', 'password' => self::PASSWORD, 'email_verified_at' => now()]);
        $courier = User::create(['name' => 'Rafael Courier', 'email' => 'courier@amihan.test', 'role' => 'courier', 'password' => self::PASSWORD, 'email_verified_at' => now()]);
        User::create(['name' => 'Lia Courier', 'email' => 'courier2@amihan.test', 'role' => 'courier', 'password' => self::PASSWORD, 'email_verified_at' => now()]);

        $customer = User::create(['name' => 'Juan dela Cruz', 'email' => 'customer@amihan.test', 'phone' => '09171234567', 'role' => 'customer', 'password' => self::PASSWORD, 'email_verified_at' => now()]);
        $customer->addresses()->create([
            'label' => 'Home', 'recipient' => 'Juan dela Cruz', 'phone' => '09171234567', 'line1' => '14 Pine Ridge Road',
            'barangay' => 'Kaybagal South', 'city' => 'Tagaytay', 'province' => 'Cavite', 'postal_code' => '4120', 'is_default' => true,
        ]);

        $names = ['Maria Santos', 'Paolo Reyes', 'Bea Villanueva', 'Carlo Mendoza', 'Andrea Lim', 'Miguel Bautista', 'Trina Ocampo', 'Joaquin Tan', 'Sofia Ramos'];
        $customers = collect($names)->map(fn ($n) => User::create([
            'name' => $n, 'email' => Str::slug($n, '.').'@example.com', 'phone' => '0917'.mt_rand(1000000, 9999999),
            'role' => 'customer', 'password' => self::PASSWORD, 'email_verified_at' => now(),
            'created_at' => now()->subDays(mt_rand(20, 90)),
        ]))->push($customer);

        // --- Coupons ----------------------------------------------------------
        Coupon::create(['code' => 'AMIHAN10', 'type' => 'percent', 'value' => 10, 'min_subtotal' => 500]);
        Coupon::create(['code' => 'FIRSTBREEZE', 'type' => 'fixed', 'value' => 150, 'min_subtotal' => 1000]);
        Coupon::create(['code' => 'OLDMIST', 'type' => 'percent', 'value' => 20, 'min_subtotal' => 0, 'expires_at' => now()->subMonth()]);

        // --- Catalog ----------------------------------------------------------
        $cats = collect([
            ['Whole Beans', 'whole-beans', 'Single origins from four Philippine highlands.'],
            ['Cloud Pour', 'cloud-pour', 'Bottled 12-hour slow drip.'],
            ['Ritual Kits', 'ritual-kits', 'Everything for a slow morning.'],
            ['Gifts & Tins', 'gifts-tins', 'For someone who should slow down.'],
            ['Hearth Bakes', 'hearth-bakes', 'From the cast-iron hearth.'],
        ])->mapWithKeys(fn ($c, $i) => [$c[1] => Category::create(['name' => $c[0], 'slug' => $c[1], 'description' => $c[2], 'sort' => $i + 1])]);

        $catalog = [
            ['whole-beans', 'Atok Highland', 'Washed arabica from the Sitio slopes', 'Atok, Benguet', 1650, 'Washed', 'Mountain honey, red apple, cacao nib', true,
                'Grown among Benguet pines where the morning cloud sits below the ridge. Cold nights slow the cherry down, and slow cherries are sweet cherries.',
                [['250 g · Whole bean', 680, 40], ['500 g · Whole bean', 1250, 18]]],
            ['whole-beans', 'Sagada Ridge', 'Natural process, limestone country', 'Sagada, Mountain Province', 1400, 'Natural', 'Dark cherry, brown sugar, pine resin', true,
                'Every household in Sagada keeps coffee trees. Dried whole in the cherry under highland sun, this lot tastes of the forest it grew in.',
                [['250 g · Whole bean', 650, 32], ['500 g · Whole bean', 1190, 4]]],
            ['whole-beans', 'Mt. Apo Volcanic', 'Honey process from the island\'s summit', 'Mt. Apo, Davao', 1800, 'Honey', 'Ripe mango, muscovado, black tea', true,
                'The highest farms we buy from, on the volcanic shoulders of the country\'s tallest mountain. Bright, layered and quietly sweet.',
                [['250 g · Whole bean', 720, 28], ['500 g · Whole bean', 1320, 12]]],
            ['whole-beans', 'Amadeo Hearth Espresso', 'The lowland base of our espresso', 'Amadeo, Cavite', 500, 'Washed', 'Dark chocolate, toasted rice, molasses', false,
                'Amadeo is where Philippine coffee first found its footing. Heavier and rounder than the highland lots, it anchors every cortado we pour.',
                [['250 g · Whole bean', 560, 50], ['250 g · Ground for moka', 560, 22], ['1 kg · Whole bean', 1980, 9]]],
            ['cloud-pour', 'Cloud Pour · Atok', '12-hour slow drip, bottled', 'Atok, Benguet', 1650, 'Slow drip', 'Honey, apple skin, clean finish', true,
                'Cold water, one drop every second for twelve hours. Nothing added. Keep it cold and drink it within a week.',
                [['250 ml bottle', 220, 60], ['Set of 4 bottles', 820, 15]]],
            ['cloud-pour', 'Cloud Pour · Mt. Apo', 'The summit lot, slow dripped', 'Mt. Apo, Davao', 1800, 'Slow drip', 'Mango, black tea, cocoa', false,
                'Our highest coffee, dripped slowly overnight. Bright enough to drink over ice with nothing else.',
                [['250 ml bottle', 240, 36]]],
            ['ritual-kits', 'The Morning Mist Kit', 'Dripper, beans and a cup for one', null, null, null, 'Ceramic dripper, 250 g Atok Highland, stoneware cup', false,
                'A hand-thrown dripper, a bag of Atok Highland and the cup we pour into at the bar. The first breeze ritual, at home.',
                [['Complete kit', 2450, 3]]],
            ['ritual-kits', 'Coast-to-Crest Discovery Box', 'Four origins, sea level to summit', null, null, null, 'Four 60 g pouches: Amadeo, Sagada, Atok, Mt. Apo', true,
                'A tasting flight in a box, ordered by altitude. Brew them in order and taste the mountain change.',
                [['Box of 4 × 60 g', 1480, 14]]],
            ['gifts-tins', 'Brass Gift Tin · Atok', 'Our highland lot, in a tin that stays', 'Atok, Benguet', 1650, 'Washed', 'Mountain honey, red apple, cacao nib', false,
                'A brushed brass tin holding 200 g of Atok Highland, with a handwritten note card.',
                [['200 g tin', 1150, 20]]],
            ['gifts-tins', 'Coffee Passport Gift Card', 'For the slow traveller', null, null, null, 'Redeemable on the Pantry or at the bar', false,
                'A printed passport card delivered with your order. Stamped at the bar, or redeemed online.',
                [['PHP 1,000', 1000, 99], ['PHP 2,500', 2500, 99]]],
            ['hearth-bakes', 'Cast-Iron Bibingka Box', 'Four soufflé bibingka, banana leaf', null, null, null, 'Salted egg, kesong puti, coconut', false,
                'Baked in cast iron over the hearth each morning and boxed for Metro Manila delivery the same day.',
                [['Box of 4', 540, 18]]],
            ['hearth-bakes', 'Tablea Sablés', 'Butter cookies with Batangas tablea', null, null, null, 'Cacao, sea salt, butter', false,
                'Short, crumbly and not too sweet. Made to sit beside a cortado.',
                [['Tin of 12', 380, 2]]],
        ];

        $variants = collect();
        foreach ($catalog as $i => [$cat, $name, $subtitle, $origin, $masl, $process, $notes, $featured, $story, $vars]) {
            $product = Product::create([
                'category_id' => $cats[$cat]->id, 'name' => $name, 'slug' => Str::slug($name), 'subtitle' => $subtitle,
                'origin' => $origin, 'elevation_masl' => $masl, 'process' => $process, 'tasting_notes' => $notes,
                'story' => $story, 'is_featured' => $featured, 'status' => 'active',
                'brew_guide' => $cat === 'whole-beans'
                    ? "Pour-over: 15 g coffee, 250 g water at 92°C, medium-fine grind. Bloom 40 seconds, then pour slowly in circles. Aim to finish at 3 minutes."
                    : 'Serve chilled. Shake gently before pouring.',
                'created_at' => now()->subDays(60 - $i),
            ]);

            foreach ($vars as $j => [$vname, $price, $stock]) {
                $v = $product->variants()->create([
                    'sku' => 'AMH-'.str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT).'-'.($j + 1),
                    'name' => $vname, 'price' => $price, 'stock_qty' => $stock, 'low_stock_threshold' => 5,
                ]);
                InventoryMovement::create(['product_variant_id' => $v->id, 'change' => $stock, 'reason' => 'restock', 'user_id' => $admin->id, 'note' => 'Opening stock', 'created_at' => now()->subDays(45)]);
                $variants->push($v);
            }
        }

        // Product photos: any file in public/images/products named <slug>.jpg|png|webp is attached.
        foreach (Product::all() as $p) {
            foreach (['jpg', 'jpeg', 'png', 'webp'] as $ext) {
                if (file_exists(public_path("images/products/{$p->slug}.{$ext}"))) {
                    $p->images()->create(['path' => "images/products/{$p->slug}.{$ext}", 'alt' => $p->name, 'sort' => 1]);
                    break;
                }
            }
        }

        // --- 30 days of synthetic order history ------------------------------
        $cities = [['Tagaytay', 'Cavite', '4120'], ['Quezon City', 'Metro Manila', '1100'], ['Makati', 'Metro Manila', '1200'], ['Baguio', 'Benguet', '2600'], ['Pasig', 'Metro Manila', '1600'], ['Dasmariñas', 'Cavite', '4114']];
        $windows = ['Morning Breeze (8 AM to 12 NN)', 'Afternoon Hearth (1 PM to 6 PM)'];
        $sellable = $variants->filter(fn ($v) => $v->price < 2000)->values();

        for ($n = 0; $n < 42; $n++) {
            $buyer = $customers->random();
            $placed = Carbon::now()->subDays(mt_rand(0, 29))->setTime(mt_rand(7, 21), mt_rand(0, 59));
            $ageDays = $placed->diffInDays(now());
            $status = match (true) {
                $ageDays <= 0 => Arr::random(['pending', 'pending', 'confirmed']),
                $ageDays <= 1 => Arr::random(['confirmed', 'packed', 'shipped']),
                $ageDays <= 3 => Arr::random(['shipped', 'delivered', 'delivered']),
                default => Arr::random(['delivered', 'delivered', 'delivered', 'delivered', 'delivered', 'cancelled']),
            };

            $lines = $sellable->random(mt_rand(1, 3));
            $items = $lines->map(fn ($v) => ['v' => $v, 'qty' => mt_rand(1, 2)]);
            $subtotal = $items->sum(fn ($l) => $l['v']->price * $l['qty']);
            $discount = $subtotal >= 1500 && mt_rand(0, 3) === 0 ? round($subtotal * 0.10, 2) : 0;
            $fee = ($subtotal - $discount) >= 2000 ? 0 : 150;
            [$city, $province, $zip] = Arr::random($cities);

            $order = Order::create([
                'order_no' => 'AMH-'.$placed->format('ymd').'-'.strtoupper(Str::random(4)),
                'user_id' => $buyer->id, 'status' => $status,
                'subtotal' => $subtotal, 'discount' => $discount, 'delivery_fee' => $fee, 'total' => $subtotal - $discount + $fee,
                'delivery_window' => Arr::random($windows), 'billing_name' => $buyer->name, 'billing_email' => $buyer->email,
                'billing_phone' => $buyer->phone ?? '09171234567', 'shipping_recipient' => $buyer->name, 'shipping_phone' => $buyer->phone ?? '09171234567',
                'shipping_line1' => mt_rand(3, 220).' Mabini Street', 'shipping_barangay' => 'Poblacion', 'shipping_city' => $city,
                'shipping_province' => $province, 'shipping_postal_code' => $zip, 'placed_at' => $placed,
                'created_at' => $placed, 'updated_at' => $placed,
            ]);

            foreach ($items as $l) {
                $order->items()->create([
                    'product_variant_id' => $l['v']->id, 'product_name' => $l['v']->product->name, 'variant_name' => $l['v']->name,
                    'unit_price' => $l['v']->price, 'qty' => $l['qty'], 'line_total' => $l['v']->price * $l['qty'],
                ]);
                InventoryMovement::create(['product_variant_id' => $l['v']->id, 'change' => -$l['qty'], 'reason' => 'sale', 'order_id' => $order->id, 'created_at' => $placed]);
            }

            $method = Arr::random(['card', 'card', 'gcash', 'cod']);
            $paid = $method !== 'cod' || $status === 'delivered';
            $order->payment()->create([
                'method' => $method, 'amount' => $order->total,
                'status' => $status === 'cancelled' && $paid ? 'refunded' : ($paid ? 'paid' : 'pending'),
                'gateway_ref' => $paid ? strtoupper(Str::random(12)) : null, 'card_last4' => $method === 'card' ? '4242' : null,
            ]);

            // Status history along the path the order travelled.
            $path = $status === 'cancelled' ? ['pending', 'cancelled'] : array_slice(Order::FLOW, 0, array_search($status, Order::FLOW) + 1);
            foreach ($path as $k => $s) {
                $at = $placed->copy()->addHours($k * 9);
                $order->history()->create(['status' => $s, 'note' => $k === 0 ? 'Order placed' : null, 'created_at' => $at, 'updated_at' => $at]);
            }

            if (in_array($status, ['shipped', 'delivered'])) {
                $order->shipment()->create([
                    'courier_id' => $courier->id, 'tracking_no' => 'AMH-'.strtoupper(Str::random(8)),
                    'status' => $status === 'delivered' ? 'delivered' : 'in_transit',
                    'shipped_at' => $placed->copy()->addHours(27), 'delivered_at' => $status === 'delivered' ? $placed->copy()->addHours(45) : null,
                ]);
            }

            // The cart this order came from (for conversion figures).
            Cart::create(['user_id' => $buyer->id, 'session_id' => Str::random(40), 'status' => 'converted', 'created_at' => $placed->copy()->subMinutes(20), 'updated_at' => $placed]);
        }

        // Abandoned carts: items added, never checked out.
        for ($n = 0; $n < 16; $n++) {
            $at = Carbon::now()->subDays(mt_rand(1, 28))->subHours(mt_rand(1, 10));
            $cart = Cart::create(['session_id' => Str::random(40), 'status' => 'active', 'created_at' => $at, 'updated_at' => $at]);
            $cart->items()->create(['product_variant_id' => $sellable->random()->id, 'qty' => mt_rand(1, 2), 'created_at' => $at, 'updated_at' => $at]);
        }

        // One delivered order for the demo customer, still inside the 7-day return window.
        $recent = Order::where('user_id', $customer->id)->where('status', 'delivered')->latest('placed_at')->first();
        if (! $recent) {
            $recent = Order::where('status', 'delivered')->latest('placed_at')->first();
            $recent?->update(['user_id' => $customer->id, 'billing_name' => $customer->name, 'billing_email' => $customer->email]);
        }
        $recent?->shipment?->update(['delivered_at' => now()->subDays(2)]);
    }
}
