<?php

use App\Http\Middleware\EnsureRole;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias(['role' => EnsureRole::class]);

        // Employees who are already signed in skip the guest pages.
        $middleware->redirectUsersTo(fn (Request $request) => $request->user()?->isEmployee()
            ? route('admin.dashboard')
            : ($request->user()?->role === 'courier' ? route('courier.index') : route('account.index')));
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Branded error pages in production (no stack traces).
        $exceptions->respond(function (Response $response, Throwable $e, Request $request) {
            if (! app()->environment(['local', 'testing']) && in_array($response->getStatusCode(), [403, 404, 500, 503])) {
                return Inertia::render('store/error', ['status' => $response->getStatusCode()])
                    ->toResponse($request)
                    ->setStatusCode($response->getStatusCode());
            }
            if ($response->getStatusCode() === 419) {
                return back()->with('toast', ['type' => 'info', 'message' => 'The page expired. Please try again.']);
            }

            return $response;
        });
    })->create();
