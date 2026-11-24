Thank you, {{ strtok($order->billing_name, ' ') }}.

Your order is confirmed. We will roast, pack and send it down the mountain with care.

Order {{ $order->order_no }}, placed {{ $order->placed_at?->format('j M Y') }}

@foreach ($order->items as $item)
- {{ $item->product_name }}, {{ $item->variant_name }} x{{ $item->qty }}  PHP {{ number_format((float) $item->line_total, 2) }}
@endforeach

Subtotal  PHP {{ number_format((float) $order->subtotal, 2) }}
@if ($order->discount > 0)
Discount  -PHP {{ number_format((float) $order->discount, 2) }}
@endif
Delivery  {{ $order->delivery_fee > 0 ? 'PHP '.number_format((float) $order->delivery_fee, 2) : 'Free' }}
Total     PHP {{ number_format((float) $order->total, 2) }}

Delivering to
{{ $order->shipping_recipient }}
{{ $order->shipping_line1 }}, {{ $order->shipping_barangay }}
{{ $order->shipping_city }}, {{ $order->shipping_province }} {{ $order->shipping_postal_code }}
@if ($order->delivery_window)
{{ $order->delivery_window }} window
@endif

Track your order: {{ $url }}

Steeped in altitude,
AMIHAN Highland Pantry
