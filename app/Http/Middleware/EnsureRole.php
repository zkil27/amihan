<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Role-based access control.
 * Usage on a route: ->middleware('role:admin,staff')
 */
class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->guest(route($request->is('admin*', 'courier*') ? 'admin.login' : 'login'));
        }

        abort_unless($user->hasRole(...$roles), 403, 'You do not have access to this area.');

        return $next($request);
    }
}
