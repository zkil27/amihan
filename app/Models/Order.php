<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    /** The forward path an order travels. Cancelled / returned branch off it. */
    public const FLOW = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];

    protected $guarded = ['id'];

    protected $casts = [
        'subtotal' => 'decimal:2', 'discount' => 'decimal:2', 'delivery_fee' => 'decimal:2', 'total' => 'decimal:2',
        'placed_at' => 'datetime',
    ];

    public function getRouteKeyName(): string
    {
        return 'order_no';
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function history(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class)->orderBy('created_at')->orderBy('id');
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class)->latestOfMany();
    }

    public function shipment(): HasOne
    {
        return $this->hasOne(Shipment::class);
    }

    public function returnRequests(): HasMany
    {
        return $this->hasMany(ReturnRequest::class)->latest();
    }

    public function canBeCancelled(): bool
    {
        return in_array($this->status, ['pending', 'confirmed'], true);
    }

    public function canBeReturned(): bool
    {
        $deliveredAt = $this->shipment?->delivered_at;

        return $this->status === 'delivered' && $deliveredAt && $deliveredAt->gt(now()->subDays(7));
    }

    public function hasOpenRequest(): bool
    {
        return $this->returnRequests()->whereIn('status', ['requested', 'approved'])->exists();
    }
}
