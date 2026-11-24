<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Support\Present;
use Inertia\Inertia;
use Inertia\Response;

/** The storytelling pages. Their copy lives in the React pages. */
class PageController extends Controller
{
    /**
     * Story photography and video, picked up by file name.
     * Drop e.g. public/images/story/hero.jpg or public/media/hero.mp4
     * and the page uses it; until then a quiet placeholder shows.
     *
     * @return array<string, string>
     */
    public static function media(): array
    {
        $found = [];
        foreach (glob(public_path('images/story/*.{jpg,jpeg,png,webp,avif}'), GLOB_BRACE) ?: [] as $file) {
            $found[pathinfo($file, PATHINFO_FILENAME)] = asset('images/story/'.basename($file));
        }
        foreach (glob(public_path('media/*.{mp4,webm}'), GLOB_BRACE) ?: [] as $file) {
            $found['video:'.pathinfo($file, PATHINFO_FILENAME).'.'.pathinfo($file, PATHINFO_EXTENSION)] = asset('media/'.basename($file));
        }

        return $found;
    }

    public function home(): Response
    {
        $featured = Product::visible()->with(['variants', 'images', 'category'])
            ->where('is_featured', true)->orderByDesc('elevation_masl')->take(3)->get();

        $origins = Product::visible()->where('category_id', fn ($q) => $q->select('id')->from('categories')->where('slug', 'whole-beans'))
            ->orderBy('elevation_masl')->get(['name', 'slug', 'origin', 'elevation_masl', 'tasting_notes', 'process']);

        return Inertia::render('store/home', [
            'featured' => $featured->map(fn ($p) => Present::productCard($p)),
            'origins' => $origins,
            'media' => self::media(),
        ]);
    }

    public function story(): Response
    {
        return Inertia::render('store/story', ['media' => self::media()]);
    }

    public function origins(): Response
    {
        $beans = Product::visible()->with(['variants', 'images', 'category'])
            ->whereHas('category', fn ($c) => $c->where('slug', 'whole-beans'))->orderBy('elevation_masl')->get();

        return Inertia::render('store/origins', [
            'media' => self::media(),
            'origins' => $beans->map(fn ($p) => [...Present::productCard($p), 'story' => $p->story, 'tasting_notes' => $p->tasting_notes, 'process' => $p->process]),
        ]);
    }

    public function visit(): Response
    {
        return Inertia::render('store/visit', ['media' => self::media()]);
    }
}
