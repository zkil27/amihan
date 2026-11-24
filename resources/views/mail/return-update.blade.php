@extends('mail.layouts.amihan')

@php
    $serif = "'Zodiak', Georgia, 'Times New Roman', serif";
    $mono = "'Martian Mono', 'SFMono-Regular', Menlo, Consolas, monospace";
    $label = 'font-size:12px;line-height:1.4;letter-spacing:0.08em;text-transform:uppercase;color:#55635A;';
    $kind = $request->type === 'cancellation' ? 'cancellation' : 'return';
    $orderNo = $request->order->order_no;
    $approved = in_array($request->status, ['approved', 'completed'], true);
    $declined = $request->status === 'rejected';

    [$title, $body] = match (true) {
        $approved => ["Your {$kind} is approved", "Order {$orderNo} has been ".($kind === 'cancellation' ? 'cancelled' : 'returned').', and the items are back in our pantry.'],
        $declined => ["About your {$kind} request", "We could not approve the {$kind} for order {$orderNo}."],
        default => ["We received your {$kind} request", "Our team will review your request for order {$orderNo} within one working day."],
    };
@endphp

@section('title', $title)
@section('preheader', $body)

@section('content')
    <h1 class="h1" style="margin:0;font-family:{{ $serif }};font-weight:300;font-size:42px;line-height:1.08;letter-spacing:-0.02em;color:#1E2D24;">{{ $title }}.</h1>
    <p style="margin:20px 0 0;max-width:440px;color:#55635A;">{{ $body }}</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:48px;border-top:1px solid #C9C9C3;">
        <tr>
            <td style="padding:18px 16px 18px 0;border-bottom:1px solid #C9C9C3;{{ $label }}">Order</td>
            <td align="right" style="padding:18px 0;border-bottom:1px solid #C9C9C3;font-family:{{ $mono }};font-weight:300;font-size:14px;color:#1E2D24;">{{ $orderNo }}</td>
        </tr>
        <tr>
            <td style="padding:18px 16px 18px 0;border-bottom:1px solid #C9C9C3;{{ $label }}">Request</td>
            <td align="right" style="padding:18px 0;border-bottom:1px solid #C9C9C3;font-size:15px;color:#1E2D24;">{{ ucfirst($kind) }}</td>
        </tr>
        @if ($request->reason)
            <tr>
                <td valign="top" style="padding:18px 16px 18px 0;border-bottom:1px solid #C9C9C3;{{ $label }}">Reason</td>
                <td align="right" style="padding:18px 0;border-bottom:1px solid #C9C9C3;font-size:15px;line-height:1.5;color:#1E2D24;">{{ $request->reason }}</td>
            </tr>
        @endif
        @if ($approved && $request->refund)
            <tr>
                <td style="padding:18px 16px 18px 0;border-bottom:1px solid #C9C9C3;{{ $label }}">Refund</td>
                <td align="right" style="padding:18px 0;border-bottom:1px solid #C9C9C3;font-family:{{ $mono }};font-weight:300;font-size:16px;color:#1E2D24;white-space:nowrap;">₱{{ number_format((float) $request->refund->amount, 2) }}</td>
            </tr>
            <tr>
                <td style="padding:18px 16px 18px 0;border-bottom:1px solid #C9C9C3;{{ $label }}">Reference</td>
                <td align="right" style="padding:18px 0;border-bottom:1px solid #C9C9C3;font-family:{{ $mono }};font-weight:300;font-size:13px;color:#1E2D24;">{{ $request->refund->gateway_ref }}</td>
            </tr>
        @endif
    </table>

    @if ($approved && $request->refund)
        <p style="margin:20px 0 0;font-size:14px;line-height:1.6;color:#55635A;">Refunds can take 3 to 5 banking days to appear.</p>
    @endif

    @if ($request->admin_note)
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;">
            <tr>
                <td style="padding:0 0 0 20px;border-left:1px solid {{ $declined ? '#9B4A37' : '#A9ABA4' }};font-family:{{ $serif }};font-style:italic;font-weight:300;font-size:18px;line-height:1.45;color:#1E2D24;">{{ $request->admin_note }}</td>
            </tr>
        </table>
    @endif

    @include('mail.partials.button', ['url' => $url, 'label' => 'View your order'])
@endsection
