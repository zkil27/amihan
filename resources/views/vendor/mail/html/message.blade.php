<x-mail::layout>
{{-- Header --}}
<x-slot:header>
<x-mail::header :url="config('app.url')">
<span style="letter-spacing: 0.4em; font-weight: 400; color: #1E2D24;">A M I H A N</span>
</x-mail::header>
</x-slot:header>

{{-- Body --}}
{!! $slot !!}

{{-- Subcopy --}}
@isset($subcopy)
<x-slot:subcopy>
<x-mail::subcopy>
{!! $subcopy !!}
</x-mail::subcopy>
</x-slot:subcopy>
@endisset

{{-- Footer --}}
<x-slot:footer>
<x-mail::footer>
A highland coffee sanctuary by the Cafe-Isla Group. From coast to crest.
</x-mail::footer>
</x-slot:footer>
</x-mail::layout>
