<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderService;
use App\Support\Present;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Customer dashboard: order history, order tracking, returns. */
class AccountController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $orders = $user->orders()->with('items')->latest('placed_at')->get();

        return Inertia::render('store/account/index', [
            'orders' => $orders->map(fn ($o) => Present::orderSummary($o)),
            'address' => $user->addresses()->orderByDesc('is_default')->first(),
        ]);
    }

    public function show(Request $request, Order $order): Response
    {
        abort_unless($order->user_id === $request->user()->id, 404);

        return Inertia::render('store/account/order', ['order' => Present::orderDetail($order)]);
    }

    public function requestReturn(Request $request, Order $order, OrderService $orders): RedirectResponse
    {
        abort_unless($order->user_id === $request->user()->id, 404);

        $data = $request->validate([
            'type' => 'required|in:cancellation,return',
            'reason' => 'required|string|max:120',
            'details' => 'nullable|string|max:1000',
        ]);

        $orders->requestReturn($order, $request->user(), $data['type'], $data['reason'], $data['details'] ?? null);

        return back()->with('toast', [
            'type' => 'success',
            'message' => $data['type'] === 'cancellation' ? 'Cancellation requested. We emailed you a copy.' : 'Return requested. We emailed you a copy.',
        ]);
    }
}
