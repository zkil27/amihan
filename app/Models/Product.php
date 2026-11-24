<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'category_id', 'name', 'slug', 'subtitle', 'origin', 'elevation_masl', 'process',
        'tasting_notes', 'story', 'brew_guide', 'status', 'is_featured',
    ];

    protected $casts = ['is_featured' => 'boolean', 'elevation_masl' => 'integer'];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class)->orderBy('price');
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort');
    }

    /** Only products a customer may see. */
    public function scopeVisible(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }
}
