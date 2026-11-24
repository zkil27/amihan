<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ProductImage extends Model
{
    protected $fillable = ['product_id', 'path', 'alt', 'sort'];

    protected $appends = ['url'];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /** Seeded images live in /public/images; uploaded ones on the public disk. */
    public function getUrlAttribute(): string
    {
        return str_starts_with($this->path, 'images/') ? asset($this->path) : Storage::disk('public')->url($this->path);
    }
}
