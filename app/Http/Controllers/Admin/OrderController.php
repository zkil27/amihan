<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use App\Services\OrderService;
use App\Support\Present;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/** Order fulfillment: review incoming orders, inspect shipping details, update status. */
class OrderController extends Controller
{
    /** Allowed next steps from each status. Shipping/delivery go through the courier. */
    private const NEXT = [
        'pending' => ['confirmed', 'cancelled'],
        'confirmed' => ['packed', 'cancelled'],
        'packed' => [],
        'shipped' => [],
    ];

    public function index(Request $request): Response
    {
        $status = $request->string('status')->toString();
        $q = $request->string('q')->toString();

        $orders = Order::with(['items', 'user', 'shipment.courier', 'payment'])
            ->when($status, fn ($w) => $w->where('status', $status))
            ->when($q, fn ($w) => $w->where(fn ($x) => $x->where('order_no', 'like', "%{$q}%")->orWhere('billing_name', 'like', "%{$q}%")->orWhere('billing_email', 'like', "%{$q}%")))
            ->latest('placed_at')->paginate(20)->withQueryString();

        return Inertia::render('admin/orders/index', [
            'filters' => ['status' => $status, 'q' => $q],
            'counts' => Order::selectRaw('status, count(*) as c')->groupBy('status')->pluck('c', 'status'),
            'orders' => [
                'data' => collect($orders->items())->map(fn (Order $o) => [
                    ...Present::orderSummary($o),
                    'customer' => $o->billing_name,
                    'city' => $o->shipping_city,
                    'payment' => $o->payment ? "{$o->payment->method} · {$o->payment->status}" : null,
                    'courier' => $o->shipment?->courier?->name,
                ]),
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    public function show(Order $order): Response
    {
        return Inertia::render('admin/orders/show', [
            'order' => Present::orderDetail($order),
            'next' => self::NEXT[$order->status] ?? [],
            'couriers' => User::where('role', 'courier')->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function updateStatus(Request $request, Order $order, OrderService $orders): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(self::NEXT[$order->status] ?? [])],
            'note' => 'nullable|string|max:200',
        ], ['status.in' => 'That status change is not allowed from '.$order->status.'.']);

        if ($data['status'] === 'cancelled') {
            // Admin-initiated cancellation goes through the same restock + refund path.
            $req = $order->returnRequests()->create([
                'user_id' => $order->user_id, 'type' => 'cancellation', 'reason' => 'Cancelled by AMIHAN',
                'details' => $data['note'] ?? null, 'status' => 'approved',
            ]);
            // Restocks, refunds, marks the order cancelled and emails the customer.
            $orders->approveRequest($req, $request->user(), $data['note'] ?? null);
        } else {
            $orders->transition($order, $data['status'], $request->user(), $data['note'] ?? null);
        }

        return back()->with('toast', ['type' => 'success', 'message' => 'Order marked '.$data['status'].'.']);
    }

    public function assignCourier(Request $request, Order $order, OrderService $orders): RedirectResponse
    {
        abort_unless(in_array($order->status, ['packed', 'confirmed'], true), 422, 'Pack the order before assigning a courier.');
        $data = $request->validate(['courier_id' => ['required', Rule::exists('users', 'id')->where('role', 'courier')]]);

        $orders->assignCourier($order, User::findOrFail($data['courier_id']), $request->user());

        return back()->with('toast', ['type' => 'success', 'message' => 'Courier assigned.']);
    }
}
