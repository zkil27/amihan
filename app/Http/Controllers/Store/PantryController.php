<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Support\Present;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Product catalog: browse, search, filter, sort and view details. */
class PantryController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'q' => 'nullable|string|max:80',
            'category' => 'nullable|string|max:80',
            'origin' => 'nullable|string|max:80',
            'altitude' => 'nullable|in:low,mid,high',
            'sort' => 'nullable|in:featured,price_asc,price_desc,altitude,newest',
        ]);

        $query = Product::visible()->with(['variants', 'images', 'category']);

        if ($q = $filters['q'] ?? null) {
            $query->where(fn ($w) => $w->where('name', 'like', "%{$q}%")
                ->orWhere('origin', 'like', "%{$q}%")
                ->orWhere('tasting_notes', 'like', "%{$q}%")
                ->orWhere('subtitle', 'like', "%{$q}%"));
        }
        if ($slug = $filters['category'] ?? null) {
            $query->whereHas('category', fn ($c) => $c->where('slug', $slug));
        }
        if ($origin = $filters['origin'] ?? null) {
            $query->where('origin', $origin);
        }
        if ($band = $filters['altitude'] ?? null) {
            match ($band) {
                'low' => $query->where('elevation_masl', '<', 1000),
                'mid' => $query->whereBetween('elevation_masl', [1000, 1499]),
                'high' => $query->where('elevation_masl', '>=', 1500),
            };
        }

        $priceSub = '(select min(price) from product_variants where product_variants.product_id = products.id and is_active = 1)';
        match ($filters['sort'] ?? 'featured') {
            'price_asc' => $query->orderByRaw("{$priceSub} asc"),
            'price_desc' => $query->orderByRaw("{$priceSub} desc"),
            'altitude' => $query->orderByDesc('elevation_masl'),
            'newest' => $query->latest(),
            default => $query->orderByDesc('is_featured')->orderBy('category_id')->orderBy('name'),
        };

        $products = $query->paginate(12)->withQueryString();

        return Inertia::render('store/pantry/index', [
            'products' => [
                'data' => collect($products->items())->map(fn ($p) => Present::productCard($p)),
                'total' => $products->total(),
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
            ],
            'filters' => [
                'q' => $filters['q'] ?? '',
                'category' => $filters['category'] ?? '',
                'origin' => $filters['origin'] ?? '',
                'altitude' => $filters['altitude'] ?? '',
                'sort' => $filters['sort'] ?? 'featured',
            ],
            'options' => [
                'categories' => Category::where('is_archived', false)->orderBy('sort')->get(['name', 'slug']),
                'origins' => Product::visible()->whereNotNull('origin')->distinct()->orderBy('origin')->pluck('origin'),
            ],
        ]);
    }

    public function show(string $slug): Response
    {
        $product = Product::visible()->with(['variants', 'images', 'category'])->where('slug', $slug)->firstOrFail();

        $related = Product::visible()->with(['variants', 'images', 'category'])
            ->where('id', '!=', $product->id)->where('category_id', $product->category_id)->take(3)->get();

        return Inertia::render('store/pantry/show', [
            'product' => Present::productDetail($product),
            'related' => $related->map(fn ($p) => Present::productCard($p)),
        ]);
    }
}
