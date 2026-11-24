<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ReturnRequest;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Refund and return processing: approve (restock + refund) or reject. */
class ReturnController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->string('status', 'requested')->toString();

        $requests = ReturnRequest::with(['order.payment', 'user', 'refund'])
            ->when($status !== 'all', fn ($q) => $q->where('status', $status))
            ->latest()->take(100)->get();

        return Inertia::render('admin/returns', [
            'status' => $status,
            'requests' => $requests->map(fn (ReturnRequest $r) => [
                'id' => $r->id, 'type' => $r->type, 'reason' => $r->reason, 'details' => $r->details, 'status' => $r->status,
                'admin_note' => $r->admin_note, 'created_at' => $r->created_at->toIso8601String(),
                'order_no' => $r->order->order_no, 'order_status' => $r->order->status, 'total' => (float) $r->order->total,
                'customer' => $r->user->name,
                'payment' => $r->order->payment ? "{$r->order->payment->method} · {$r->order->payment->status}" : null,
                'refund' => $r->refund ? ['amount' => (float) $r->refund->amount, 'ref' => $r->refund->gateway_ref] : null,
            ]),
        ]);
    }

    public function approve(Request $request, ReturnRequest $returnRequest, OrderService $orders): RedirectResponse
    {
        abort_unless($returnRequest->status === 'requested', 422);
        $orders->approveRequest($returnRequest, $request->user(), $request->input('note'));

        return back()->with('toast', ['type' => 'success', 'message' => 'Approved. Items restocked and refund issued.']);
    }

    public function reject(Request $request, ReturnRequest $returnRequest, OrderService $orders): RedirectResponse
    {
        abort_unless($returnRequest->status === 'requested', 422);
        $data = $request->validate(['note' => 'required|string|max:200'], ['note.required' => 'Tell the customer why.']);
        $orders->rejectRequest($returnRequest, $request->user(), $data['note']);

        return back()->with('toast', ['type' => 'success', 'message' => 'Request declined. The customer was emailed.']);
    }
}
