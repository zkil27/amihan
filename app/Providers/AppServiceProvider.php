<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // App\Listeners\MergeGuestCart is auto-discovered and runs on every Login event.

        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }

        // Permission levels used to show / hide admin features.
        Gate::define('manage-catalog', fn (User $u) => $u->hasRole('admin', 'staff'));
        Gate::define('manage-orders', fn (User $u) => $u->hasRole('admin', 'staff', 'fulfillment'));
        Gate::define('handle-returns', fn (User $u) => $u->hasRole('admin', 'staff'));
        Gate::define('view-reports', fn (User $u) => $u->hasRole('admin', 'staff'));
        Gate::define('view-customers', fn (User $u) => $u->hasRole('admin', 'staff'));
        Gate::define('manage-employees', fn (User $u) => $u->hasRole('admin'));
    }
}
