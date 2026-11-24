<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = ['code', 'type', 'value', 'min_subtotal', 'expires_at', 'is_active'];

    protected $casts = ['value' => 'decimal:2', 'min_subtotal' => 'decimal:2', 'expires_at' => 'datetime', 'is_active' => 'boolean'];

    /** Returns a reason when the coupon can't be used, or null when it can. */
    public function problemFor(float $subtotal): ?string
    {
        if (! $this->is_active) {
            return 'This code is no longer active.';
        }
        if ($this->expires_at && $this->expires_at->isPast()) {
            return 'This code has expired.';
        }
        if ($subtotal < (float) $this->min_subtotal) {
            return 'This code needs a subtotal of at least PHP '.number_format((float) $this->min_subtotal).'.';
        }

        return null;
    }

    public function discountFor(float $subtotal): float
    {
        $amount = $this->type === 'percent' ? $subtotal * ((float) $this->value / 100) : (float) $this->value;

        return round(min($amount, $subtotal), 2);
    }
}
