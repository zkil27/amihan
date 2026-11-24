{{ $title }}.

{{ $body }}

Order: {{ $order->order_no }}
Status: {{ ucfirst($order->status) }}
@if ($order->shipment?->tracking_no)
Tracking: {{ $order->shipment->tracking_no }}
@endif
@if ($note)
Note: {{ $note }}
@endif

View your order: {{ $url }}

Steeped in altitude,
AMIHAN Highland Pantry
