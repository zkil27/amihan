<?php

namespace App\Support;

use App\Models\Order;
use App\Models\Product;

/** Shapes models into the plain arrays the React pages receive. */
class Present
{
    public static function productCard(Product $p): array
    {
        $prices = $p->variants->where('is_active', true)->pluck('price')->map(fn ($v) => (float) $v);

        return [
            'id' => $p->id,
            'name' => $p->name,
            'slug' => $p->slug,
            'subtitle' => $p->subtitle,
            'origin' => $p->origin,
            'elevation_masl' => $p->elevation_masl,
            'category' => $p->category?->name,
            'image' => $p->images->first()?->url,
            'price_from' => $prices->min(),
            'has_range' => $prices->unique()->count() > 1,
            'in_stock' => $p->variants->sum('stock_qty') > 0,
        ];
    }

    public static function productDetail(Product $p): array
    {
        return [
            ...self::productCard($p),
            'process' => $p->process,
            'tasting_notes' => $p->tasting_notes,
            'story' => $p->story,
            'brew_guide' => $p->brew_guide,
            'images' => $p->images->map(fn ($i) => ['id' => $i->id, 'url' => $i->url, 'alt' => $i->alt])->values(),
            'variants' => $p->variants->where('is_active', true)->map(fn ($v) => [
                'id' => $v->id,
                'name' => $v->name,
                'price' => (float) $v->price,
                'stock' => $v->stock_qty,
                'low' => $v->stock_qty > 0 && $v->isLowStock(),
            ])->values(),
        ];
    }

    public static function orderSummary(Order $o): array
    {
        return [
            'order_no' => $o->order_no,
            'status' => $o->status,
            'total' => (float) $o->total,
            'placed_at' => $o->placed_at?->toIso8601String(),
            'item_count' => (int) $o->items->sum('qty'),
            'first_item' => $o->items->first()?->product_name,
        ];
    }

    public static function orderDetail(Order $o): array
    {
        $o->loadMissing(['items', 'history.changer', 'payment', 'shipment.courier', 'returnRequests.refund', 'user']);

        return [
            ...self::orderSummary($o),
            'subtotal' => (float) $o->subtotal,
            'discount' => (float) $o->discount,
            'delivery_fee' => (float) $o->delivery_fee,
            'delivery_window' => $o->delivery_window,
            'gift_note' => $o->gift_note,
            'billing' => ['name' => $o->billing_name, 'email' => $o->billing_email, 'phone' => $o->billing_phone],
            'shipping' => [
                'recipient' => $o->shipping_recipient, 'phone' => $o->shipping_phone, 'line1' => $o->shipping_line1,
                'barangay' => $o->shipping_barangay, 'city' => $o->shipping_city, 'province' => $o->shipping_province,
                'postal_code' => $o->shipping_postal_code,
            ],
            'customer' => $o->user ? ['id' => $o->user->id, 'name' => $o->user->name, 'email' => $o->user->email] : null,
            'items' => $o->items->map(fn ($i) => [
                'id' => $i->id, 'product_name' => $i->product_name, 'variant_name' => $i->variant_name,
                'unit_price' => (float) $i->unit_price, 'qty' => $i->qty, 'line_total' => (float) $i->line_total,
            ])->values(),
            'history' => $o->history->map(fn ($h) => [
                'id' => $h->id, 'status' => $h->status, 'note' => $h->note,
                'at' => $h->created_at->toIso8601String(), 'by' => $h->changer?->name,
            ])->values(),
            'payment' => $o->payment ? [
                'method' => $o->payment->method, 'status' => $o->payment->status,
                'ref' => $o->payment->gateway_ref, 'last4' => $o->payment->card_last4, 'amount' => (float) $o->payment->amount,
            ] : null,
            'shipment' => $o->shipment ? [
                'id' => $o->shipment->id, 'tracking_no' => $o->shipment->tracking_no, 'status' => $o->shipment->status,
                'courier' => $o->shipment->courier?->name,
                'shipped_at' => $o->shipment->shipped_at?->toIso8601String(),
                'delivered_at' => $o->shipment->delivered_at?->toIso8601String(),
            ] : null,
            'requests' => $o->returnRequests->map(fn ($r) => [
                'id' => $r->id, 'type' => $r->type, 'reason' => $r->reason, 'details' => $r->details,
                'status' => $r->status, 'admin_note' => $r->admin_note,
                'created_at' => $r->created_at->toIso8601String(),
                'refund' => $r->refund ? ['amount' => (float) $r->refund->amount, 'ref' => $r->refund->gateway_ref] : null,
            ])->values(),
            'can_cancel' => $o->canBeCancelled() && ! $o->hasOpenRequest(),
            'can_return' => $o->canBeReturned() && ! $o->hasOpenRequest(),
        ];
    }
}
