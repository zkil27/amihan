<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductVariant extends Model
{
    protected $fillable = ['product_id', 'sku', 'name', 'price', 'stock_qty', 'low_stock_threshold', 'is_active'];

    protected $casts = ['price' => 'decimal:2', 'stock_qty' => 'integer', 'low_stock_threshold' => 'integer', 'is_active' => 'boolean'];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }

    public function isLowStock(): bool
    {
        return $this->stock_qty <= $this->low_stock_threshold;
    }
}
