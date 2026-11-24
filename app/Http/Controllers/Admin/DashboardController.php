<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use App\Models\ReturnRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

/** Reporting and analytics: sales, revenue, top products, low stock, conversion, abandonment. */
class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $canReports = Gate::allows('view-reports');
        $days = (int) $request->integer('days', 30) ?: 30;
        $since = now()->subDays($days - 1)->startOfDay();

        $counted = Order::whereNotIn('status', ['cancelled', 'returned'])->where('placed_at', '>=', $since);

        $daily = (clone $counted)->get(['placed_at', 'total'])
            ->groupBy(fn ($o) => $o->placed_at->toDateString())
            ->map(fn ($g) => ['orders' => $g->count(), 'revenue' => round((float) $g->sum('total'), 2)]);

        $series = collect(range($days - 1, 0))->map(function ($ago) use ($daily) {
            $d = now()->subDays($ago)->toDateString();

            return ['date' => $d, 'orders' => $daily[$d]['orders'] ?? 0, 'revenue' => $daily[$d]['revenue'] ?? 0];
        })->values();

        $topProducts = OrderItem::query()
            ->whereHas('order', fn ($q) => $q->whereNotIn('status', ['cancelled', 'returned'])->where('placed_at', '>=', $since))
            ->selectRaw('product_name, sum(qty) as units, sum(line_total) as revenue')
            ->groupBy('product_name')->orderByDesc('units')->take(5)->get()
            ->map(fn ($r) => ['name' => $r->product_name, 'units' => (int) $r->units, 'revenue' => (float) $r->revenue]);

        $lowStock = ProductVariant::with('product:id,name,slug')
            ->whereColumn('stock_qty', '<=', 'low_stock_threshold')->where('is_active', true)
            ->orderBy('stock_qty')->take(8)->get()
            ->map(fn ($v) => ['id' => $v->id, 'product_id' => $v->product_id, 'product' => $v->product?->name, 'variant' => $v->name, 'stock' => $v->stock_qty, 'threshold' => $v->low_stock_threshold]);

        // Conversion: carts that had items and became orders. Abandonment: carts with items idle > 1 hour.
        $cartsWithItems = Cart::where('created_at', '>=', $since)->has('items');
        $totalCarts = (clone $cartsWithItems)->count() + Cart::where('created_at', '>=', $since)->where('status', 'converted')->doesntHave('items')->count();
        $converted = Cart::where('created_at', '>=', $since)->where('status', 'converted')->count();
        $abandoned = (clone $cartsWithItems)->where('status', 'active')->where('updated_at', '<', now()->subHour())->count();

        $revenue = (float) (clone $counted)->sum('total');
        $orderCount = (clone $counted)->count();

        return Inertia::render('admin/dashboard', [
            'canReports' => $canReports,
            'days' => $days,
            'kpis' => $canReports ? [
                'revenue' => $revenue,
                'orders' => $orderCount,
                'aov' => $orderCount ? round($revenue / $orderCount, 2) : 0,
                'conversion' => $totalCarts ? round($converted / $totalCarts * 100, 1) : 0,
                'abandonment' => $totalCarts ? round($abandoned / $totalCarts * 100, 1) : 0,
                'abandoned_carts' => $abandoned,
                'carts' => $totalCarts,
            ] : null,
            'series' => $canReports ? $series : [],
            'topProducts' => $canReports ? $topProducts : [],
            'lowStock' => $lowStock,
            'queue' => [
                'pending' => Order::where('status', 'pending')->count(),
                'confirmed' => Order::where('status', 'confirmed')->count(),
                'packed' => Order::where('status', 'packed')->count(),
                'returns' => ReturnRequest::where('status', 'requested')->count(),
            ],
        ]);
    }
}
