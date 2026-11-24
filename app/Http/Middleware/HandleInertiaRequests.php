<?php

namespace App\Http\Middleware;

use App\Services\CartService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Props every page receives. The cart summary is shared here, so the
     * cart count and drawer stay correct on every page navigation.
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user ? $user->only('id', 'name', 'email', 'phone', 'role') : null,
                'can' => $user ? [
                    'catalog' => Gate::allows('manage-catalog'),
                    'orders' => Gate::allows('manage-orders'),
                    'returns' => Gate::allows('handle-returns'),
                    'reports' => Gate::allows('view-reports'),
                    'customers' => Gate::allows('view-customers'),
                    'employees' => Gate::allows('manage-employees'),
                ] : null,
            ],
            'cart' => fn () => $request->is('admin*', 'courier*') ? null : app(CartService::class)->summary(),
            'flash' => [
                'toast' => fn () => $request->session()->get('toast'),
                'added' => fn () => $request->session()->get('added'),
            ],
        ];
    }
}
