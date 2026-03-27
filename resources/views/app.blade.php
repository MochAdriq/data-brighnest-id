<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        @php
            $metaDefaults = [
                'title' => config('app.name', 'Brightnest Institute'),
                'description' => 'Platform data dan riset Brightnest Institute.',
                'url' => url()->current(),
                'type' => 'website',
                'image' => asset('images/og-templates/og-fallback-1200x630.png'),
                'image_alt' => config('app.name', 'Brightnest Institute'),
                'image_width' => 1200,
                'image_height' => 630,
                'site_name' => config('app.name', 'Brightnest Institute'),
                'locale' => 'id_ID',
                'robots' => 'index,follow,max-image-preview:large',
                'twitter_card' => 'summary_large_image',
                'article_section' => null,
                'article_published_time' => null,
                'article_modified_time' => null,
                'article_tags' => [],
            ];
            $meta = array_merge($metaDefaults, $openGraphMeta ?? []);
        @endphp

        <title inertia>{{ $meta['title'] }}</title>
        <meta name="description" content="{{ $meta['description'] }}">
        <link rel="canonical" href="{{ $meta['url'] }}">
        <meta name="robots" content="{{ $meta['robots'] }}">

        <meta property="og:locale" content="{{ $meta['locale'] }}">
        <meta property="og:type" content="{{ $meta['type'] }}">
        <meta property="og:title" content="{{ $meta['title'] }}">
        <meta property="og:description" content="{{ $meta['description'] }}">
        <meta property="og:url" content="{{ $meta['url'] }}">
        <meta property="og:site_name" content="{{ $meta['site_name'] }}">
        <meta property="og:image" content="{{ $meta['image'] }}">
        <meta property="og:image:secure_url" content="{{ $meta['image'] }}">
        <meta property="og:image:width" content="{{ $meta['image_width'] }}">
        <meta property="og:image:height" content="{{ $meta['image_height'] }}">
        <meta property="og:image:alt" content="{{ $meta['image_alt'] }}">

        @if (!empty($meta['article_section']))
            <meta property="article:section" content="{{ $meta['article_section'] }}">
        @endif
        @if (!empty($meta['article_published_time']))
            <meta property="article:published_time" content="{{ $meta['article_published_time'] }}">
        @endif
        @if (!empty($meta['article_modified_time']))
            <meta property="article:modified_time" content="{{ $meta['article_modified_time'] }}">
        @endif
        @if (!empty($meta['article:premium']))
            <meta property="article:premium" content="{{ $meta['article:premium'] }}">
        @endif
        @if (is_array($meta['article_tags']))
            @foreach ($meta['article_tags'] as $tag)
                <meta property="article:tag" content="{{ $tag }}">
            @endforeach
        @endif

        <meta name="twitter:card" content="{{ $meta['twitter_card'] }}">
        <meta name="twitter:title" content="{{ $meta['title'] }}">
        <meta name="twitter:description" content="{{ $meta['description'] }}">
        <meta name="twitter:image" content="{{ $meta['image'] }}">
        <meta name="twitter:url" content="{{ $meta['url'] }}">

        <link rel="icon" type="image/x-icon" href="/favicon.ico">

        <!-- Fonts
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" /> -->

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
