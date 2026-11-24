<?php

use App\Models\Product;
use Illuminate\Support\Facades\Artisan;

/*
 * Link product photos dropped into public/images/products/<slug>.jpg|png|webp
 * to their products, without touching any other data.
 * Usage: php artisan amihan:attach-images
 */
Artisan::command('amihan:attach-images', function () {
    $linked = 0;
    foreach (Product::withTrashed()->with('images')->get() as $product) {
        foreach (['jpg', 'jpeg', 'png', 'webp'] as $ext) {
            $path = "images/products/{$product->slug}.{$ext}";
            if (! file_exists(public_path($path))) {
                continue;
            }
            if ($product->images->contains('path', $path)) {
                break;
            }
            // Put the photo first, ahead of any admin uploads.
            $product->images()->increment('sort');
            $product->images()->create(['path' => $path, 'alt' => $product->name, 'sort' => 0]);
            $this->line("Linked {$path}");
            $linked++;
            break;
        }
    }
    $this->info("{$linked} product photo(s) linked.");
})->purpose('Link photos in public/images/products to their products');
