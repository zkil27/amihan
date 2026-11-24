<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\InventoryMovement;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Inventory management: create, read, update, archive and delete
 * products, with image upload, variants (price + stock) and categories.
 */
class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $q = $request->string('q')->toString();
        $status = $request->string('status')->toString();

        $products = Product::withTrashed()->with(['category', 'variants', 'images'])
            ->when($q, fn ($w) => $w->where('name', 'like', "%{$q}%"))
            ->when($status === 'deleted', fn ($w) => $w->onlyTrashed())
            ->when($status && $status !== 'deleted', fn ($w) => $w->where('status', $status)->whereNull('deleted_at'))
            ->when(! $status, fn ($w) => $w->whereNull('deleted_at'))
            ->orderBy('category_id')->orderBy('name')->get();

        return Inertia::render('admin/products/index', [
            'filters' => ['q' => $q, 'status' => $status],
            'products' => $products->map(fn (Product $p) => [
                'id' => $p->id, 'name' => $p->name, 'slug' => $p->slug, 'status' => $p->trashed() ? 'deleted' : $p->status,
                'category' => $p->category?->name, 'image' => $p->images->first()?->url,
                'stock' => (int) $p->variants->sum('stock_qty'),
                'low' => $p->variants->contains(fn ($v) => $v->isLowStock()),
                'price_from' => (float) $p->variants->min('price'),
                'variant_count' => $p->variants->count(),
            ]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/products/form', ['product' => null, 'categories' => $this->categories()]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);

        $product = DB::transaction(function () use ($data, $request) {
            $product = Product::create($this->productFields($data) + ['slug' => $this->uniqueSlug($data['name'])]);
            $this->syncVariants($product, $data['variants'], $request);
            $this->storeImages($product, $request->file('images', []));

            return $product;
        });

        return to_route('admin.products.edit', $product)->with('toast', ['type' => 'success', 'message' => 'Product created.']);
    }

    public function edit(Product $product): Response
    {
        $product->load(['variants', 'images']);

        return Inertia::render('admin/products/form', [
            'product' => [
                ...$product->only('id', 'name', 'slug', 'category_id', 'subtitle', 'origin', 'elevation_masl', 'process', 'tasting_notes', 'story', 'brew_guide', 'status', 'is_featured'),
                'variants' => $product->variants->map(fn ($v) => [
                    'id' => $v->id, 'sku' => $v->sku, 'name' => $v->name, 'price' => (float) $v->price,
                    'stock_qty' => $v->stock_qty, 'low_stock_threshold' => $v->low_stock_threshold, 'is_active' => $v->is_active,
                ]),
                'images' => $product->images->map(fn ($i) => ['id' => $i->id, 'url' => $i->url, 'alt' => $i->alt]),
                'movements' => InventoryMovement::with('variant:id,name')->whereIn('product_variant_id', $product->variants->pluck('id'))
                    ->latest()->take(10)->get()->map(fn ($m) => [
                        'id' => $m->id, 'variant' => $m->variant?->name, 'change' => $m->change, 'reason' => $m->reason,
                        'note' => $m->note, 'at' => $m->created_at->toIso8601String(),
                    ]),
            ],
            'categories' => $this->categories(),
        ]);
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $data = $this->validated($request, $product);

        DB::transaction(function () use ($product, $data, $request) {
            $product->update($this->productFields($data));
            $this->syncVariants($product, $data['variants'], $request);
            $this->storeImages($product, $request->file('images', []));
        });

        return back()->with('toast', ['type' => 'success', 'message' => 'Changes saved.']);
    }

    /** Archive hides a product from the shop but keeps it for order history. */
    public function archive(Product $product): RedirectResponse
    {
        $product->update(['status' => $product->status === 'archived' ? 'active' : 'archived']);

        return back()->with('toast', ['type' => 'success', 'message' => $product->status === 'archived' ? 'Product archived.' : 'Product restored to the shop.']);
    }

    /** Delete is a soft delete, so past orders keep their records. */
    public function destroy(Product $product): RedirectResponse
    {
        $product->update(['status' => 'archived']);
        $product->delete();

        return to_route('admin.products.index')->with('toast', ['type' => 'success', 'message' => 'Product deleted.']);
    }

    public function restore(int $id): RedirectResponse
    {
        $product = Product::onlyTrashed()->findOrFail($id);
        $product->restore();

        return back()->with('toast', ['type' => 'success', 'message' => 'Product restored as archived.']);
    }

    public function destroyImage(ProductImage $image): RedirectResponse
    {
        if (! str_starts_with($image->path, 'images/')) {
            Storage::disk('public')->delete($image->path);
        }
        $image->delete();

        return back()->with('toast', ['type' => 'success', 'message' => 'Image removed.']);
    }

    /** Stock quantity adjustment, recorded in the inventory ledger. */
    public function adjustStock(Request $request, ProductVariant $variant): RedirectResponse
    {
        $data = $request->validate([
            'change' => 'required|integer|not_in:0|min:-9999|max:9999',
            'note' => 'nullable|string|max:120',
        ]);

        if ($variant->stock_qty + $data['change'] < 0) {
            return back()->withErrors(['change' => "Stock can't go below zero (currently {$variant->stock_qty})."]);
        }

        DB::transaction(function () use ($variant, $data, $request) {
            $variant->increment('stock_qty', $data['change']);
            InventoryMovement::create([
                'product_variant_id' => $variant->id, 'change' => $data['change'],
                'reason' => $data['change'] > 0 ? 'restock' : 'adjustment', 'user_id' => $request->user()->id, 'note' => $data['note'] ?? null,
            ]);
        });

        return back()->with('toast', ['type' => 'success', 'message' => "Stock updated: {$variant->name} now has {$variant->fresh()->stock_qty}."]);
    }

    private function validated(Request $request, ?Product $product = null): array
    {
        return $request->validate([
            'name' => 'required|string|max:120',
            'category_id' => 'required|exists:categories,id',
            'subtitle' => 'nullable|string|max:160',
            'origin' => 'nullable|string|max:120',
            'elevation_masl' => 'nullable|integer|min:0|max:3000',
            'process' => 'nullable|string|max:60',
            'tasting_notes' => 'nullable|string|max:200',
            'story' => 'nullable|string|max:3000',
            'brew_guide' => 'nullable|string|max:3000',
            'status' => ['required', Rule::in(['draft', 'active', 'archived'])],
            'is_featured' => 'boolean',
            'images' => 'array|max:6',
            'images.*' => 'image|mimes:jpg,jpeg,png,webp|max:4096',
            'variants' => 'required|array|min:1',
            'variants.*.id' => 'nullable|integer',
            'variants.*.sku' => 'required|string|max:40|distinct',
            'variants.*.name' => 'required|string|max:80',
            'variants.*.price' => 'required|numeric|min:1|max:99999',
            'variants.*.stock_qty' => 'required|integer|min:0|max:99999',
            'variants.*.low_stock_threshold' => 'required|integer|min:0|max:999',
            'variants.*.is_active' => 'boolean',
        ], [
            'images.*.max' => 'Each image must be 4 MB or smaller.',
            'images.*.image' => 'Upload JPG, PNG or WebP images only.',
            'variants.required' => 'Add at least one size or option.',
        ]);
    }

    private function productFields(array $data): array
    {
        return collect($data)->only(['name', 'category_id', 'subtitle', 'origin', 'elevation_masl', 'process', 'tasting_notes', 'story', 'brew_guide', 'status', 'is_featured'])->all();
    }

    private function syncVariants(Product $product, array $variants, Request $request): void
    {
        $keep = [];
        foreach ($variants as $v) {
            $existing = isset($v['id']) ? $product->variants()->find($v['id']) : null;
            $fields = [
                'sku' => $v['sku'], 'name' => $v['name'], 'price' => $v['price'],
                'low_stock_threshold' => $v['low_stock_threshold'], 'is_active' => $v['is_active'] ?? true,
            ];

            if ($existing) {
                $diff = (int) $v['stock_qty'] - $existing->stock_qty;
                $existing->update($fields + ['stock_qty' => $v['stock_qty']]);
                if ($diff !== 0) {
                    InventoryMovement::create(['product_variant_id' => $existing->id, 'change' => $diff, 'reason' => $diff > 0 ? 'restock' : 'adjustment', 'user_id' => $request->user()->id, 'note' => 'Edited in product form']);
                }
                $keep[] = $existing->id;
            } else {
                $new = $product->variants()->create($fields + ['stock_qty' => $v['stock_qty']]);
                if ($new->stock_qty > 0) {
                    InventoryMovement::create(['product_variant_id' => $new->id, 'change' => $new->stock_qty, 'reason' => 'restock', 'user_id' => $request->user()->id, 'note' => 'Opening stock']);
                }
                $keep[] = $new->id;
            }
        }

        // Variants removed in the form are deactivated, not deleted, to keep order history intact.
        $product->variants()->whereNotIn('id', $keep)->update(['is_active' => false]);
    }

    /** @param UploadedFile[] $files */
    private function storeImages(Product $product, array $files): void
    {
        $sort = (int) $product->images()->max('sort');
        foreach ($files as $file) {
            $path = $file->store('products', 'public');
            $this->downscale(Storage::disk('public')->path($path));
            $product->images()->create(['path' => $path, 'alt' => $product->name, 'sort' => ++$sort]);
        }
    }

    /** Keep uploads light: anything wider than 1600px is resized with GD. */
    private function downscale(string $fullPath, int $max = 1600): void
    {
        if (! function_exists('imagecreatefromstring')) {
            return;
        }
        [$w, $h, $type] = @getimagesize($fullPath) ?: [0, 0, 0];
        if ($w <= $max || ! $w) {
            return;
        }
        $src = @imagecreatefromstring(file_get_contents($fullPath));
        if (! $src) {
            return;
        }
        $nh = (int) round($h * $max / $w);
        $dst = imagecreatetruecolor($max, $nh);
        imagealphablending($dst, false);
        imagesavealpha($dst, true);
        imagecopyresampled($dst, $src, 0, 0, 0, 0, $max, $nh, $w, $h);
        match ($type) {
            IMAGETYPE_PNG => imagepng($dst, $fullPath, 8),
            IMAGETYPE_WEBP => imagewebp($dst, $fullPath, 82),
            default => imagejpeg($dst, $fullPath, 84),
        };
        imagedestroy($src);
        imagedestroy($dst);
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i = 2;
        while (Product::withTrashed()->where('slug', $slug)->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }

    private function categories()
    {
        return Category::orderBy('sort')->get(['id', 'name', 'is_archived']);
    }
}
