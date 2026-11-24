<?php

namespace App\Services;

use App\Mail\OrderPlaced;
use App\Mail\OrderStatusChanged;
use App\Mail\ReturnRequestUpdated;
use App\Models\Cart;
use App\Models\InventoryMovement;
use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\Refund;
use App\Models\ReturnRequest;
use App\Models\Shipment;
use App\Models\User;
use Illuminate\Contracts\Mail\Mailable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * The order lifecycle in one place:
 * place -> confirm -> pack -> assign courier -> ship -> deliver,
 * plus cancellations, returns, restocking and refunds.
 * Every change writes an order_status_histories row, and the customer
 * is emailed at the moments that matter.
 */
class OrderService
{
    public function __construct(
        private CartService $carts,
        private MockPaymentGateway $gateway,
    ) {}

    /**
     * Checkout. Runs in one database transaction:
     * validate stock (rows locked) -> charge payment -> create order ->
     * deduct stock. If anything fails, nothing is saved.
     */
    public function place(User $user, Cart $cart, array $data): Order
    {
        $order = DB::transaction(function () use ($user, $cart, $data) {
            $cart->load('items', 'coupon');

            if ($cart->items->isEmpty()) {
                throw ValidationException::withMessages(['cart' => 'Your cart is empty.']);
            }

            // Include: Validate stock. Lock the variant rows so two customers can't buy the last bag.
            $variants = ProductVariant::with('product')
                ->whereIn('id', $cart->items->pluck('product_variant_id'))
                ->lockForUpdate()->get()->keyBy('id');

            foreach ($cart->items as $line) {
                $variant = $variants[$line->product_variant_id] ?? null;
                if (! $variant || $variant->product->status !== 'active' || $line->qty > $variant->stock_qty) {
                    $name = $variant ? "{$variant->product->name} ({$variant->name})" : 'An item';
                    $left = $variant?->stock_qty ?? 0;
                    throw ValidationException::withMessages(['cart' => "{$name} has only {$left} left. Please adjust your cart."]);
                }
            }

            $summary = $this->carts->summary($cart);

            // Make payment through the gateway.
            $charge = $this->gateway->charge($data['payment_method'], $summary['total'], $data['card_number'] ?? null);
            if ($charge['status'] === 'failed') {
                throw ValidationException::withMessages(['card_number' => $charge['message']]);
            }

            $order = Order::create([
                'order_no' => $this->nextOrderNumber(),
                'user_id' => $user->id,
                'coupon_id' => $summary['coupon_id'],
                'status' => 'pending',
                'subtotal' => $summary['subtotal'],
                'discount' => $summary['discount'],
                'delivery_fee' => $summary['delivery_fee'],
                'total' => $summary['total'],
                'delivery_window' => $data['delivery_window'],
                'gift_note' => $data['gift_note'] ?? null,
                'billing_name' => $data['billing_name'],
                'billing_email' => $data['billing_email'],
                'billing_phone' => $data['billing_phone'],
                'shipping_recipient' => $data['shipping_recipient'],
                'shipping_phone' => $data['shipping_phone'],
                'shipping_line1' => $data['shipping_line1'],
                'shipping_barangay' => $data['shipping_barangay'],
                'shipping_city' => $data['shipping_city'],
                'shipping_province' => $data['shipping_province'],
                'shipping_postal_code' => $data['shipping_postal_code'],
                'placed_at' => now(),
            ]);

            foreach ($cart->items as $line) {
                $variant = $variants[$line->product_variant_id];
                $order->items()->create([
                    'product_variant_id' => $variant->id,
                    'product_name' => $variant->product->name,
                    'variant_name' => $variant->name,
                    'unit_price' => $variant->price,
                    'qty' => $line->qty,
                    'line_total' => round((float) $variant->price * $line->qty, 2),
                ]);

                // Update inventory.
                $variant->decrement('stock_qty', $line->qty);
                InventoryMovement::create([
                    'product_variant_id' => $variant->id, 'change' => -$line->qty, 'reason' => 'sale',
                    'order_id' => $order->id, 'user_id' => $user->id,
                ]);
            }

            $order->payment()->create([
                'method' => $data['payment_method'],
                'amount' => $summary['total'],
                'status' => $charge['status'],
                'gateway_ref' => $charge['ref'],
                'card_last4' => $charge['last4'],
            ]);

            $order->history()->create(['status' => 'pending', 'note' => 'Order placed', 'changed_by' => $user->id]);

            $cart->update(['status' => 'converted', 'user_id' => $user->id]);

            return $order;
        });

        $this->notify($order->billing_email, new OrderPlaced($order->fresh(['items', 'payment'])));

        return $order;
    }

    /** Move an order forward (or cancel it) and record who did it. */
    public function transition(Order $order, string $status, ?User $by = null, ?string $note = null): void
    {
        DB::transaction(function () use ($order, $status, $by, $note) {
            $order->update(['status' => $status]);
            $order->history()->create(['status' => $status, 'note' => $note, 'changed_by' => $by?->id]);

            if ($status === 'delivered' && $order->payment?->method === 'cod') {
                $order->payment->update(['status' => 'paid', 'gateway_ref' => 'COD-'.strtoupper(Str::random(8))]);
            }
        });

        // Shipping updates and cancellations are emailed.
        if (in_array($status, ['confirmed', 'shipped', 'delivered', 'cancelled'], true)) {
            $this->notify($order->billing_email, new OrderStatusChanged($order->fresh(['items', 'shipment', 'payment']), $note));
        }
    }

    public function assignCourier(Order $order, User $courier, User $by): Shipment
    {
        $shipment = $order->shipment()->updateOrCreate([], [
            'courier_id' => $courier->id,
            'tracking_no' => $order->shipment?->tracking_no ?? 'AMH-'.strtoupper(Str::random(8)),
            'status' => 'assigned',
        ]);

        $order->history()->create(['status' => $order->status, 'note' => "Assigned to courier {$courier->name}", 'changed_by' => $by->id]);

        return $shipment;
    }

    /** Courier picked the parcel up. */
    public function markInTransit(Shipment $shipment, User $by): void
    {
        $shipment->update(['status' => 'in_transit', 'shipped_at' => now()]);
        $this->transition($shipment->order, 'shipped', $by, "On the way. Tracking {$shipment->tracking_no}");
    }

    /** Courier confirms delivery. */
    public function markDelivered(Shipment $shipment, User $by): void
    {
        $shipment->update(['status' => 'delivered', 'delivered_at' => now()]);
        $this->transition($shipment->order, 'delivered', $by, 'Delivered');
    }

    public function requestReturn(Order $order, User $user, string $type, string $reason, ?string $details): ReturnRequest
    {
        $allowed = $type === 'cancellation' ? $order->canBeCancelled() : $order->canBeReturned();
        if (! $allowed || $order->hasOpenRequest()) {
            throw ValidationException::withMessages(['type' => $type === 'cancellation'
                ? 'This order can no longer be cancelled.'
                : 'This order is not eligible for a return.']);
        }

        $request = $order->returnRequests()->create([
            'user_id' => $user->id, 'type' => $type, 'reason' => $reason, 'details' => $details, 'status' => 'requested',
        ]);

        $label = $type === 'cancellation' ? 'Cancellation requested' : 'Return requested';
        $order->history()->create(['status' => $order->status, 'note' => "{$label}: {$reason}", 'changed_by' => $user->id]);
        $this->notify($order->billing_email, new ReturnRequestUpdated($request->load('order')));

        return $request;
    }

    /**
     * Approve a cancellation or return: restock every item, refund the
     * payment through the gateway, and close the request.
     */
    public function approveRequest(ReturnRequest $request, User $by, ?string $note = null): void
    {
        DB::transaction(function () use ($request, $by, $note) {
            $order = $request->order()->with('items', 'payment')->first();
            $isCancel = $request->type === 'cancellation';

            // Restock item.
            foreach ($order->items as $item) {
                if ($item->product_variant_id) {
                    ProductVariant::whereKey($item->product_variant_id)->increment('stock_qty', $item->qty);
                    InventoryMovement::create([
                        'product_variant_id' => $item->product_variant_id, 'change' => $item->qty,
                        'reason' => $isCancel ? 'cancellation' : 'return', 'order_id' => $order->id, 'user_id' => $by->id,
                    ]);
                }
            }

            // Process refund (only money that was actually collected).
            $payment = $order->payment;
            if ($payment && $payment->status === 'paid') {
                $ref = $this->gateway->refund($payment, (float) $payment->amount);
                Refund::create([
                    'return_request_id' => $request->id, 'payment_id' => $payment->id,
                    'amount' => $payment->amount, 'gateway_ref' => $ref, 'processed_by' => $by->id,
                ]);
                $payment->update(['status' => 'refunded']);
            }

            $request->update(['status' => 'completed', 'admin_note' => $note, 'handled_by' => $by->id]);
            $order->update(['status' => $isCancel ? 'cancelled' : 'returned']);
            $order->history()->create([
                'status' => $order->status,
                'note' => ($isCancel ? 'Cancellation approved' : 'Return approved').', items restocked'.($payment?->status === 'refunded' ? ', refund issued' : ''),
                'changed_by' => $by->id,
            ]);
        });

        $this->notify($request->order->billing_email, new ReturnRequestUpdated($request->fresh(['order', 'refund'])));
    }

    public function rejectRequest(ReturnRequest $request, User $by, ?string $note = null): void
    {
        $request->update(['status' => 'rejected', 'admin_note' => $note, 'handled_by' => $by->id]);
        $request->order->history()->create([
            'status' => $request->order->status,
            'note' => ucfirst($request->type).' request declined'.($note ? ": {$note}" : ''),
            'changed_by' => $by->id,
        ]);

        $this->notify($request->order->billing_email, new ReturnRequestUpdated($request->fresh(['order'])));
    }

    /** A mail failure must never break checkout; it is logged instead. */
    private function notify(string $email, Mailable $mail): void
    {
        try {
            Mail::to($email)->send($mail);
        } catch (\Throwable $e) {
            Log::warning('Order email failed: '.$e->getMessage());
        }
    }

    private function nextOrderNumber(): string
    {
        do {
            $no = 'AMH-'.now()->format('ymd').'-'.strtoupper(Str::random(4));
        } while (Order::where('order_no', $no)->exists());

        return $no;
    }
}
