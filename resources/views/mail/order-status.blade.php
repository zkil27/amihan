@extends('mail.layouts.amihan')

@php
    $serif = "'Zodiak', Georgia, 'Times New Roman', serif";
    $mono = "'Martian Mono', 'SFMono-Regular', Menlo, Consolas, monospace";
    $label = 'font-size:12px;line-height:1.4;letter-spacing:0.08em;text-transform:uppercase;color:#55635A;';

    // The ascent: four stops a customer cares about. "Packed" folds into Confirmed.
    $stops = ['Placed' => 'pending', 'Confirmed' => 'confirmed', 'On the way' => 'shipped', 'Delivered' => 'delivered'];
    $flow = \App\Models\Order::FLOW;
    $reached = array_search($order->status, $flow, true);
    $cancelled = $order->status === 'cancelled';

    // System notes like "On the way. Tracking X" or "Delivered" repeat what the email already shows.
    $tracking = $order->shipment?->tracking_no;
    $showNote = $note && ! ($tracking && str_contains($note, $tracking)) && strcasecmp(trim($note, '. '), $order->status) !== 0;
@endphp

@section('title', $title)
@section('preheader', "{$title}. {$body}")

@section('content')
    <h1 class="h1" style="margin:0;font-family:{{ $serif }};font-weight:300;font-size:42px;line-height:1.08;letter-spacing:-0.02em;color:#1E2D24;">{{ $title }}.</h1>
    <p style="margin:20px 0 0;max-width:440px;color:#55635A;">{{ $body }}</p>

    @if (! $cancelled && $reached !== false)
        {{-- Ascent rail: pine for stops passed, brass for where the order is now, hairline for what's ahead. --}}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:52px;">
            <tr>
                @foreach ($stops as $name => $status)
                    @php
                        $i = array_search($status, $flow, true);
                        $isNow = $status === $order->status || ($order->status === 'packed' && $status === 'confirmed');
                        $done = $i <= $reached;
                        $dot = $isNow ? '#B08D57' : ($done ? '#1E2D24' : '#EAE7E1');
                        $ring = $isNow ? '#B08D57' : ($done ? '#1E2D24' : '#A9ABA4');
                        $nextDone = ! $loop->last && array_search(array_values($stops)[$loop->index + 1], $flow, true) <= $reached;
                    @endphp
                    <td width="25%" valign="top" style="padding:0;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                                <td width="10" style="padding:0;">
                                    <div style="width:8px;height:8px;border-radius:50%;background-color:{{ $dot }};border:1px solid {{ $ring }};font-size:0;line-height:0;">&nbsp;</div>
                                </td>
                                <td style="padding:0 0 0 0;">
                                    @unless ($loop->last)
                                        <div style="height:0;border-top:1px solid {{ $nextDone ? '#1E2D24' : '#C9C9C3' }};font-size:0;line-height:0;">&nbsp;</div>
                                    @endunless
                                </td>
                            </tr>
                        </table>
                        <div style="margin-top:12px;padding-right:8px;font-size:12px;line-height:1.35;color:{{ $isNow ? '#1E2D24' : '#55635A' }};{{ $isNow ? 'font-weight:600;' : '' }}">{{ $name }}</div>
                    </td>
                @endforeach
            </tr>
        </table>
    @endif

    {{-- Details. --}}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:48px;border-top:1px solid #C9C9C3;">
        <tr>
            <td style="padding:18px 16px 18px 0;border-bottom:1px solid #C9C9C3;{{ $label }}">Order</td>
            <td align="right" style="padding:18px 0;border-bottom:1px solid #C9C9C3;font-family:{{ $mono }};font-weight:300;font-size:14px;color:#1E2D24;">{{ $order->order_no }}</td>
        </tr>
        @if ($order->shipment?->tracking_no)
            <tr>
                <td style="padding:18px 16px 18px 0;border-bottom:1px solid #C9C9C3;{{ $label }}">Tracking</td>
                <td align="right" style="padding:18px 0;border-bottom:1px solid #C9C9C3;font-family:{{ $mono }};font-weight:300;font-size:14px;color:#1E2D24;">{{ $order->shipment->tracking_no }}</td>
            </tr>
        @endif
        @if ($order->delivery_window && ! $cancelled && $order->status !== 'delivered')
            <tr>
                <td style="padding:18px 16px 18px 0;border-bottom:1px solid #C9C9C3;{{ $label }}">Window</td>
                <td align="right" style="padding:18px 0;border-bottom:1px solid #C9C9C3;font-size:15px;color:#1E2D24;">{{ $order->delivery_window }}</td>
            </tr>
        @endif
    </table>

    @if ($showNote)
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;">
            <tr>
                <td style="padding:0 0 0 20px;border-left:1px solid {{ $cancelled ? '#9B4A37' : '#A9ABA4' }};font-family:{{ $serif }};font-style:italic;font-weight:300;font-size:18px;line-height:1.45;color:#1E2D24;">{{ $note }}</td>
            </tr>
        </table>
    @endif

    @include('mail.partials.button', ['url' => $url, 'label' => 'View your order'])
@endsection
