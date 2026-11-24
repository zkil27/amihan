<?php

namespace App\Http\Controllers\Courier;

use App\Http\Controllers\Controller;
use App\Models\Shipment;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Delivery personnel: see assigned parcels, mark them in transit and delivered. */
class DeliveryController extends Controller
{
    public function index(Request $request): Response
    {
        $shipments = Shipment::with('order.items')->where('courier_id', $request->user()->id)
            ->orderByRaw("case status when 'in_transit' then 0 when 'assigned' then 1 else 2 end")
            ->latest('updated_at')->take(50)->get();

        return Inertia::render('courier/index', [
            'shipments' => $shipments->map(fn (Shipment $s) => [
                'id' => $s->id, 'tracking_no' => $s->tracking_no, 'status' => $s->status,
                'order_no' => $s->order->order_no, 'recipient' => $s->order->shipping_recipient, 'phone' => $s->order->shipping_phone,
                'address' => "{$s->order->shipping_line1}, {$s->order->shipping_barangay}, {$s->order->shipping_city}",
                'window' => $s->order->delivery_window, 'items' => (int) $s->order->items->sum('qty'),
                'cod' => $s->order->payment?->method === 'cod' ? (float) $s->order->total : null,
                'delivered_at' => $s->delivered_at?->toIso8601String(),
            ]),
        ]);
    }

    public function transit(Request $request, Shipment $shipment, OrderService $orders): RedirectResponse
    {
        $this->authorizeCourier($request, $shipment, 'assigned');
        $orders->markInTransit($shipment, $request->user());

        return back()->with('toast', ['type' => 'success', 'message' => 'Marked as on the way. The customer was emailed.']);
    }

    public function delivered(Request $request, Shipment $shipment, OrderService $orders): RedirectResponse
    {
        $this->authorizeCourier($request, $shipment, 'in_transit');
        $orders->markDelivered($shipment, $request->user());

        return back()->with('toast', ['type' => 'success', 'message' => 'Delivery confirmed.']);
    }

    private function authorizeCourier(Request $request, Shipment $shipment, string $from): void
    {
        abort_unless($shipment->courier_id === $request->user()->id, 403);
        abort_unless($shipment->status === $from, 422, 'This delivery has already moved on.');
    }
}
