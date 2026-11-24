@extends('mail.layouts.amihan')

@php
    $serif = "'Zodiak', Georgia, 'Times New Roman', serif";
    $mono = "'Martian Mono', 'SFMono-Regular', Menlo, Consolas, monospace";
    $label = 'font-size:12px;line-height:1.4;letter-spacing:0.08em;text-transform:uppercase;color:#55635A;';
    $peso = fn ($v) => '₱'.number_format((float) $v, 2);
    $first = strtok($order->billing_name, ' ');
    $method = ['card' => 'Card', 'gcash' => 'GCash', 'cod' => 'Cash on delivery'][$order->payment?->method] ?? ucfirst((string) $order->payment?->method);
@endphp

@section('title', "Order {$order->order_no} confirmed")
@section('preheader', "Order {$order->order_no} is confirmed. We will roast, pack and send it down the mountain with care.")

@section('content')
    <h1 class="h1" style="margin:0;font-family:{{ $serif }};font-weight:300;font-size:42px;line-height:1.08;letter-spacing:-0.02em;color:#1E2D24;">Thank you, <em style="font-style:italic;">{{ $first }}</em>.</h1>
    <p style="margin:20px 0 0;max-width:440px;color:#55635A;">Your order is confirmed. We will roast, pack and send it down the mountain with care.</p>

    {{-- Order reference. --}}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:48px;border-top:1px solid #C9C9C3;border-bottom:1px solid #C9C9C3;">
        <tr>
            <td class="stack" valign="top" width="50%" style="padding:20px 16px 20px 0;">
                <div style="{{ $label }}">Order</div>
                <div style="margin-top:6px;font-family:{{ $mono }};font-weight:300;font-size:14px;line-height:1.4;color:#1E2D24;">{{ $order->order_no }}</div>
            </td>
            <td class="stack" valign="top" width="50%" style="padding:20px 0 20px 16px;">
                <div style="{{ $label }}">Placed</div>
                <div style="margin-top:6px;font-family:{{ $mono }};font-weight:300;font-size:14px;line-height:1.4;color:#1E2D24;">{{ $order->placed_at?->format('j M Y') }}</div>
            </td>
        </tr>
    </table>

    {{-- Items. --}}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;">
        @foreach ($order->items as $item)
            <tr>
                <td valign="top" style="padding:22px 16px 22px 0;border-bottom:1px solid #C9C9C3;">
                    <div style="font-family:{{ $serif }};font-weight:300;font-size:19px;line-height:1.25;color:#1E2D24;">{{ $item->product_name }}</div>
                    <div style="margin-top:4px;font-size:13px;line-height:1.5;color:#55635A;">{{ $item->variant_name }}&nbsp;&nbsp;&middot;&nbsp;&nbsp;Qty {{ $item->qty }}</div>
                </td>
                <td valign="top" align="right" style="padding:24px 0 22px;border-bottom:1px solid #C9C9C3;white-space:nowrap;font-family:{{ $mono }};font-weight:300;font-size:14px;line-height:1.4;color:#1E2D24;">{{ $peso($item->line_total) }}</td>
            </tr>
        @endforeach
    </table>

    {{-- Totals. Brass appears once: the hairline over the total. --}}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;font-size:14px;line-height:1.5;color:#55635A;">
        <tr>
            <td style="padding:5px 0;">Subtotal</td>
            <td align="right" style="padding:5px 0;font-family:{{ $mono }};font-weight:300;font-size:13px;">{{ $peso($order->subtotal) }}</td>
        </tr>
        @if ($order->discount > 0)
            <tr>
                <td style="padding:5px 0;">Discount</td>
                <td align="right" style="padding:5px 0;font-family:{{ $mono }};font-weight:300;font-size:13px;">&minus;{{ $peso($order->discount) }}</td>
            </tr>
        @endif
        <tr>
            <td style="padding:5px 0;">Delivery</td>
            <td align="right" style="padding:5px 0;font-family:{{ $mono }};font-weight:300;font-size:13px;">{{ $order->delivery_fee > 0 ? $peso($order->delivery_fee) : 'Free' }}</td>
        </tr>
        <tr>
            <td style="padding:18px 0 0;"><div style="border-top:1px solid #B08D57;width:100%;font-size:0;line-height:0;">&nbsp;</div></td>
            <td style="padding:18px 0 0;"><div style="border-top:1px solid #B08D57;width:100%;font-size:0;line-height:0;">&nbsp;</div></td>
        </tr>
        <tr>
            <td style="padding:14px 0 0;font-family:{{ $serif }};font-weight:300;font-size:22px;line-height:1.2;color:#1E2D24;">Total</td>
            <td align="right" style="padding:14px 0 0;font-family:{{ $mono }};font-weight:300;font-size:17px;line-height:1.2;color:#1E2D24;white-space:nowrap;">{{ $peso($order->total) }}</td>
        </tr>
    </table>

    {{-- Where and how. --}}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:56px;">
        <tr>
            <td class="stack" valign="top" width="55%" style="padding-right:24px;">
                <div style="{{ $label }}">Delivering to</div>
                <div style="margin-top:10px;font-size:15px;line-height:1.6;color:#1E2D24;">
                    {{ $order->shipping_recipient }}<br>
                    {{ $order->shipping_line1 }}, {{ $order->shipping_barangay }}<br>
                    {{ $order->shipping_city }}, {{ $order->shipping_province }} {{ $order->shipping_postal_code }}
                </div>
                @if ($order->delivery_window)
                    <div style="margin-top:8px;font-size:13px;line-height:1.5;color:#55635A;">{{ $order->delivery_window }} window</div>
                @endif
            </td>
            <td class="stack stack-gap" valign="top" width="45%">
                <div style="{{ $label }}">Payment</div>
                <div style="margin-top:10px;font-size:15px;line-height:1.6;color:#1E2D24;">
                    {{ $method }}@if ($order->payment?->card_last4) ending {{ $order->payment->card_last4 }}@endif
                </div>
                @if ($order->payment?->status)
                    <div style="margin-top:2px;font-size:13px;line-height:1.5;color:#55635A;">{{ ucfirst($order->payment->status) }}</div>
                @endif
            </td>
        </tr>
    </table>

    @include('mail.partials.button', ['url' => $url, 'label' => 'Track your order'])
@endsection
