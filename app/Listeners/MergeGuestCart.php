<?php

namespace App\Listeners;

use App\Services\CartService;
use Illuminate\Auth\Events\Login;

/**
 * When a guest logs in, the items they added before signing in move
 * into their account cart. The Login event fires before the session id
 * is regenerated, so session()->getId() is still the guest's id here.
 */
class MergeGuestCart
{
    public function __construct(private CartService $carts) {}

    public function handle(Login $event): void
    {
        $this->carts->mergeGuestCart($event->user, session()->getId());
    }
}
