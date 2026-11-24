{{--
    AMIHAN email shell. Table layout with inline styles so it holds up in
    Gmail, Apple Mail and Outlook. The <style> block only adds web fonts
    (Apple Mail / iOS), the phone breakpoint, and dark-mode guards; every
    client that strips it still gets the full design from inline styles.

    Tokens (DESIGN.md): mist #EAE7E1, pine #1E2D24, ink-soft #55635A,
    brass #B08D57 (once per email), clay #9B4A37, hair = pine 16% on mist.
--}}
@php
    $serif = "'Zodiak', Georgia, 'Times New Roman', serif";
    $sans = "'Hanken Grotesk', 'Helvetica Neue', Helvetica, Arial, sans-serif";
@endphp
<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>@yield('title', 'AMIHAN')</title>
<style>
    @font-face { font-family: 'Zodiak'; font-weight: 300; font-style: normal; src: url('{{ asset('fonts/zodiak-300-normal.woff2') }}') format('woff2'); }
    @font-face { font-family: 'Zodiak'; font-weight: 300; font-style: italic; src: url('{{ asset('fonts/zodiak-300-italic.woff2') }}') format('woff2'); }
    @font-face { font-family: 'Hanken Grotesk'; font-weight: 100 900; src: url('{{ asset('fonts/hanken-grotesk-var.woff2') }}') format('woff2'); }
    @font-face { font-family: 'Martian Mono'; font-weight: 300; src: url('{{ asset('fonts/martian-mono-300.woff2') }}') format('woff2'); }
    :root { color-scheme: light only; }
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; }
    a { text-decoration: none; }
    ::selection { background: #1E2D24; color: #EAE7E1; }
    @media only screen and (max-width: 620px) {
        .wrap { width: 100% !important; }
        .px { padding-left: 24px !important; padding-right: 24px !important; }
        .hero-pad { padding-top: 44px !important; padding-bottom: 40px !important; }
        .body-pad { padding-top: 48px !important; padding-bottom: 48px !important; }
        .h1 { font-size: 34px !important; }
        .stack { display: block !important; width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; }
        .stack-gap { padding-top: 28px !important; }
        .btn a { display: block !important; text-align: center !important; }
    }
</style>
</head>
<body style="margin:0;padding:0;background-color:#EAE7E1;">
{{-- Inbox preview line, padded so the client doesn't pull body text after it. --}}
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#EAE7E1;opacity:0;">
    @yield('preheader')&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#EAE7E1" style="background-color:#EAE7E1;">
<tr><td align="center" style="padding:0;">

<table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">

    {{-- Crest: the pine band, the mark, the wordmark. --}}
    <tr>
        <td class="px hero-pad" align="center" bgcolor="#1E2D24" style="background-color:#1E2D24;padding:56px 56px 48px;">
            <a href="{{ url('/') }}" style="text-decoration:none;">
                <img src="{{ asset('images/email/amihan-mark-mist.png') }}" width="72" height="42" alt="" style="display:block;width:72px;height:42px;border:0;margin:0 auto;">
            </a>
            <div style="margin-top:20px;font-family:{{ $serif }};font-size:13px;line-height:1;letter-spacing:0.42em;color:#EAE7E1;padding-left:0.42em;">AMIHAN</div>
        </td>
    </tr>

    {{-- The letter. --}}
    <tr>
        <td class="px body-pad" style="padding:64px 56px 56px;font-family:{{ $sans }};font-size:16px;line-height:1.65;color:#1E2D24;">
            @yield('content')

            {{-- Sign-off. --}}
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:56px;">
                <tr><td style="font-family:{{ $serif }};font-style:italic;font-weight:300;font-size:20px;line-height:1.3;color:#1E2D24;">Steeped in altitude,</td></tr>
                <tr><td style="padding-top:6px;font-family:{{ $sans }};font-size:13px;line-height:1.5;color:#55635A;">AMIHAN Highland Pantry</td></tr>
            </table>
        </td>
    </tr>

    {{-- Footer band. --}}
    <tr>
        <td class="px" bgcolor="#1E2D24" style="background-color:#1E2D24;padding:40px 56px 44px;">
            <div style="font-family:{{ $serif }};font-style:italic;font-weight:300;font-size:18px;line-height:1.3;color:#EAE7E1;">From coast to crest.</div>
            <div style="margin-top:20px;font-family:{{ $sans }};font-size:13px;line-height:1.6;">
                <a href="{{ route('pantry.index') }}" style="color:#EAE7E1;text-decoration:none;border-bottom:1px solid #4E5B52;">Highland Pantry</a>
                <span style="color:#4E5B52;">&nbsp;&nbsp;/&nbsp;&nbsp;</span>
                <a href="{{ route('account.index') }}" style="color:#EAE7E1;text-decoration:none;border-bottom:1px solid #4E5B52;">Your orders</a>
                <span style="color:#4E5B52;">&nbsp;&nbsp;/&nbsp;&nbsp;</span>
                <a href="mailto:{{ config('mail.reply_to.address') ?: config('mail.from.address') }}" style="color:#EAE7E1;text-decoration:none;border-bottom:1px solid #4E5B52;">Write to us</a>
            </div>
            <div style="margin-top:24px;font-family:{{ $sans }};font-size:12px;line-height:1.6;color:#A1A49D;">
                @yield('footnote', 'You are receiving this because you placed an order with AMIHAN Highland Pantry. Reply to this email and a person will answer.')
            </div>
        </td>
    </tr>

</table>

</td></tr>
</table>
</body>
</html>
