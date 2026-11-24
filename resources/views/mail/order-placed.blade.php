<x-mail::message>
# Thank you, {{ strtok($order->billing_name, ' ') }}.

Your order **{{ $order->order_no }}** is confirmed. We will roast, pack and send it down the mountain with care.

<x-mail::table>
| Item | Qty | Price |
|:-----|:---:|------:|
@foreach ($order->items as $item)
| {{ $item->product_name }}, {{ $item->variant_name }} | {{ $item->qty }} | PHP {{ number_format($item->line_total, 2) }} |
@endforeach
| Subtotal | | PHP {{ number_format($order->subtotal, 2) }} |
@if ($order->discount > 0)
| Discount | | -PHP {{ number_format($order->discount, 2) }} |
@endif
| Delivery | | {{ $order->delivery_fee > 0 ? 'PHP '.number_format($order->delivery_fee, 2) : 'Free' }} |
| **Total** | | **PHP {{ number_format($order->total, 2) }}** |
</x-mail::table>

**Delivering to**<br>
{{ $order->shipping_recipient }}<br>
{{ $order->shipping_line1 }}, {{ $order->shipping_barangay }}<br>
{{ $order->shipping_city }}, {{ $order->shipping_province }} {{ $order->shipping_postal_code }}<br>
Window: {{ $order->delivery_window }}

**Payment:** {{ strtoupper($order->payment?->method ?? '') }}{{ $order->payment?->card_last4 ? ' ending '.$order->payment->card_last4 : '' }} ({{ $order->payment?->status }})

<x-mail::button :url="$url" color="primary">
Track your order
</x-mail::button>

Steeped in altitude,<br>
AMIHAN Highland Pantry
</x-mail::message>
