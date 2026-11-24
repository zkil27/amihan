<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Restricted portal login. Credentials are checked against the bcrypt
 * hash (Auth::attempt), then the role must be an employee role.
 * Customers and couriers are refused even with a correct password.
 */
class AuthController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('admin/login');
    }

    public function store(Request $request): RedirectResponse
    {
        $credentials = $request->validate(['email' => 'required|email', 'password' => 'required|string']);
        $key = 'admin-login|'.Str::lower($credentials['email']).'|'.$request->ip();

        if (RateLimiter::tooManyAttempts($key, 5)) {
            throw ValidationException::withMessages(['email' => 'Too many attempts. Try again in '.RateLimiter::availableIn($key).' seconds.']);
        }

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            RateLimiter::hit($key);
            throw ValidationException::withMessages(['email' => 'These credentials do not match our records.']);
        }

        $user = $request->user();
        if (! $user->isEmployee() && $user->role !== 'courier') {
            Auth::logout();
            RateLimiter::hit($key);
            throw ValidationException::withMessages(['email' => 'This portal is for AMIHAN staff only.']);
        }

        RateLimiter::clear($key);
        $request->session()->regenerate();

        return $user->role === 'courier'
            ? redirect()->route('courier.index')
            : redirect()->intended(route('admin.dashboard'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login');
    }
}
