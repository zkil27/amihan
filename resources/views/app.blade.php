<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
        <meta name="theme-color" content="#EAE7E1">
        <meta name="description" content="AMIHAN, a highland coffee sanctuary by the Cafe-Isla Group. Single-origin Philippine coffee from coast to crest, delivered from our Highland Pantry.">

        <title inertia>{{ config('app.name', 'AMIHAN') }}</title>

        <link rel="icon" href="/favicon.svg?v=2" type="image/svg+xml">
        <link rel="preload" href="/fonts/zodiak-300-normal.woff2" as="font" type="font/woff2" crossorigin>
        <link rel="preload" href="/fonts/hanken-grotesk-var.woff2" as="font" type="font/woff2" crossorigin>

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body>
        @inertia
    </body>
</html>
