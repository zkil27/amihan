<x-mail::message>
@php($kind = $request->type === 'cancellation' ? 'cancellation' : 'return')
@if ($request->status === 'requested')
# We received your {{ $kind }} request

We have your request for order **{{ $request->order->order_no }}** ({{ $request->reason }}). Our team will review it within one working day.
@elseif ($request->status === 'completed' || $request->status === 'approved')
# Your {{ $kind }} is approved

Order **{{ $request->order->order_no }}** has been {{ $kind === 'cancellation' ? 'cancelled' : 'returned' }} and the items are back in our pantry.
@if ($request->refund)

A refund of **PHP {{ number_format($request->refund->amount, 2) }}** has been issued (reference {{ $request->refund->gateway_ref }}). It may take 3 to 5 banking days to appear.
@endif
@else
# About your {{ $kind }} request

We could not approve the {{ $kind }} for order **{{ $request->order->order_no }}**.
@if ($request->admin_note)

{{ $request->admin_note }}
@endif
@endif

<x-mail::button :url="$url" color="primary">
View your order
</x-mail::button>

Steeped in altitude,<br>
AMIHAN Highland Pantry
</x-mail::message>
