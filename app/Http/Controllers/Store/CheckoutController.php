<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\CartService;
use App\Services\OrderService;
use App\Support\Present;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/** Structured checkout: details -> delivery -> payment. */
class CheckoutController extends Controller
{
    public function __construct(private CartService $carts, private OrderService $orders) {}

    public function show(Request $request): Response|RedirectResponse
    {
        if (($this->carts->summary()['count'] ?? 0) === 0) {
            return to_route('pantry.index')->with('toast', ['type' => 'info', 'message' => 'Your cart is empty.']);
        }

        $user = $request->user();
        $address = $user->addresses()->orderByDesc('is_default')->latest()->first();

        return Inertia::render('store/checkout', [
            'defaults' => [
                'billing_name' => $user->name,
                'billing_email' => $user->email,
                'billing_phone' => $user->phone ?? '',
                'shipping_recipient' => $address->recipient ?? $user->name,
                'shipping_phone' => $address->phone ?? ($user->phone ?? ''),
                'shipping_line1' => $address->line1 ?? '',
                'shipping_barangay' => $address->barangay ?? '',
                'shipping_city' => $address->city ?? '',
                'shipping_province' => $address->province ?? '',
                'shipping_postal_code' => $address->postal_code ?? '',
            ],
            'windows' => ['Morning Breeze (8 AM to 12 NN)', 'Afternoon Hearth (1 PM to 6 PM)'],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        // Include: Validate address (and billing, and payment fields).
        $phone = ['required', 'string', 'regex:/^(09\d{9}|\+639\d{9})$/'];
        $data = $request->validate([
            'billing_name' => 'required|string|max:120',
            'billing_email' => 'required|email|max:160',
            'billing_phone' => $phone,
            'shipping_recipient' => 'required|string|max:120',
            'shipping_phone' => $phone,
            'shipping_line1' => 'required|string|max:200',
            'shipping_barangay' => 'required|string|max:120',
            'shipping_city' => 'required|string|max:120',
            'shipping_province' => 'required|string|max:120',
            'shipping_postal_code' => 'required|digits:4',
            'delivery_window' => 'required|string|max:60',
            'gift_note' => 'nullable|string|max:300',
            'save_address' => 'boolean',
            'payment_method' => ['required', Rule::in(['card', 'gcash', 'cod'])],
            'card_name' => 'required_if:payment_method,card|nullable|string|max:120',
            'card_number' => 'required_if:payment_method,card|nullable|string|max:23',
            'card_expiry' => ['required_if:payment_method,card', 'nullable', 'regex:/^(0[1-9]|1[0-2])\/\d{2}$/'],
            'card_cvc' => 'required_if:payment_method,card|nullable|digits_between:3,4',
        ], [
            'billing_phone.regex' => 'Use a PH mobile number like 0917 123 4567.',
            'shipping_phone.regex' => 'Use a PH mobile number like 0917 123 4567.',
            'shipping_postal_code.digits' => 'PH postal codes have 4 digits.',
            'card_expiry.regex' => 'Use MM/YY.',
        ]);

        if (($data['payment_method'] === 'card') && $this->cardExpired($data['card_expiry'])) {
            return back()->withErrors(['card_expiry' => 'This card has expired.']);
        }

        $cart = $this->carts->current();
        abort_unless($cart, 404);

        $user = $request->user();
        $order = $this->orders->place($user, $cart, $data);

        if (! empty($data['save_address'])) {
            $user->addresses()->updateOrCreate(['label' => 'Home'], [
                'recipient' => $data['shipping_recipient'], 'phone' => $data['shipping_phone'],
                'line1' => $data['shipping_line1'], 'barangay' => $data['shipping_barangay'], 'city' => $data['shipping_city'],
                'province' => $data['shipping_province'], 'postal_code' => $data['shipping_postal_code'], 'is_default' => true,
            ]);
        }
        if (! $user->phone) {
            $user->update(['phone' => $data['billing_phone']]);
        }

        return to_route('checkout.thanks', $order);
    }

    public function thanks(Request $request, Order $order): Response
    {
        abort_unless($order->user_id === $request->user()->id, 404);

        return Inertia::render('store/thanks', ['order' => Present::orderDetail($order)]);
    }

    private function cardExpired(string $mmYY): bool
    {
        [$m, $y] = array_map('intval', explode('/', $mmYY));

        return now()->startOfMonth()->gt(now()->setDate(2000 + $y, $m, 1)->startOfMonth());
    }
}
