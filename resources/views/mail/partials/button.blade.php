{{-- Pine button, 52px tall, 2px radius, matching .btn-solid. Bulletproof: the whole cell is the link. --}}
<table role="presentation" class="btn" cellpadding="0" cellspacing="0" border="0" style="margin-top:{{ $top ?? 48 }}px;">
    <tr>
        <td bgcolor="#1E2D24" style="background-color:#1E2D24;border-radius:2px;">
            <a href="{{ $url }}" style="display:inline-block;padding:17px 32px;font-family:'Hanken Grotesk','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:18px;font-weight:500;letter-spacing:0.04em;color:#EAE7E1;text-decoration:none;border-radius:2px;">{{ $label }}&nbsp;&nbsp;&rarr;</a>
        </td>
    </tr>
</table>
