<x-mail::message>
# {{ $title }}

{{ $body }}

**Order:** {{ $order->order_no }}<br>
**Status:** {{ ucfirst($order->status) }}
@if ($order->shipment)
<br>**Tracking:** {{ $order->shipment->tracking_no }}
@endif
@if ($note)
<br>**Note:** {{ $note }}
@endif

<x-mail::button :url="$url" color="primary">
View your order
</x-mail::button>

Steeped in altitude,<br>
AMIHAN Highland Pantry
</x-mail::message>
