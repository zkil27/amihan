<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\ProductVariant;
use App\Services\CartService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Add, adjust and remove cart lines, and apply coupons. */
class CartController extends Controller
{
    public function __construct(private CartService $carts) {}

    public function show(): Response
    {
        return Inertia::render('store/cart');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'variant_id' => 'required|integer|exists:product_variants,id',
            'qty' => 'required|integer|min:1|max:20',
        ]);

        $variant = ProductVariant::with('product')->findOrFail($data['variant_id']);
        $this->carts->add($variant, $data['qty']);

        return back()->with('added', ['variant_id' => $variant->id, 'name' => $variant->product->name, 'at' => now()->timestamp]);
    }

    public function update(Request $request, CartItem $item): RedirectResponse
    {
        abort_unless($this->carts->ownsLine($item), 404);
        $data = $request->validate(['qty' => 'required|integer|min:1|max:20']);
        $this->carts->update($item->load('variant.product'), $data['qty']);

        return back();
    }

    public function destroy(CartItem $item): RedirectResponse
    {
        abort_unless($this->carts->ownsLine($item), 404);
        $this->carts->remove($item);

        return back();
    }

    /** Undo a removal: put the same variant back with its previous quantity. */
    public function restore(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'variant_id' => 'required|integer|exists:product_variants,id',
            'qty' => 'required|integer|min:1|max:20',
        ]);
        $this->carts->add(ProductVariant::with('product')->findOrFail($data['variant_id']), $data['qty']);

        return back();
    }

    public function applyCoupon(Request $request): RedirectResponse
    {
        $data = $request->validate(['code' => 'required|string|max:40']);
        $this->carts->applyCoupon($data['code']);

        return back();
    }

    public function removeCoupon(): RedirectResponse
    {
        $this->carts->removeCoupon();

        return back();
    }
}
