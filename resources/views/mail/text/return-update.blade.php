@php($kind = $request->type === 'cancellation' ? 'cancellation' : 'return')
@if (in_array($request->status, ['approved', 'completed'], true))
Your {{ $kind }} is approved.

Order {{ $request->order->order_no }} has been {{ $kind === 'cancellation' ? 'cancelled' : 'returned' }}, and the items are back in our pantry.
@if ($request->refund)

Refund: PHP {{ number_format((float) $request->refund->amount, 2) }} (reference {{ $request->refund->gateway_ref }}). Refunds can take 3 to 5 banking days to appear.
@endif
@elseif ($request->status === 'rejected')
About your {{ $kind }} request.

We could not approve the {{ $kind }} for order {{ $request->order->order_no }}.
@else
We received your {{ $kind }} request.

Our team will review your request for order {{ $request->order->order_no }} within one working day.
@endif
@if ($request->admin_note)

{{ $request->admin_note }}
@endif

View your order: {{ $url }}

Steeped in altitude,
AMIHAN Highland Pantry
