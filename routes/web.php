<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\Courier\DeliveryController;
use App\Http\Controllers\Store;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Storefront (customers)
|--------------------------------------------------------------------------
*/
Route::get('/', [Store\PageController::class, 'home'])->name('home');
Route::get('/story', [Store\PageController::class, 'story'])->name('story');
Route::get('/origins', [Store\PageController::class, 'origins'])->name('origins');
Route::get('/visit', [Store\PageController::class, 'visit'])->name('visit');

Route::get('/pantry', [Store\PantryController::class, 'index'])->name('pantry.index');
Route::get('/pantry/{slug}', [Store\PantryController::class, 'show'])->name('pantry.show');

Route::get('/cart', [Store\CartController::class, 'show'])->name('cart.show');
Route::post('/cart/items', [Store\CartController::class, 'store'])->name('cart.items.store');
Route::patch('/cart/items/{item}', [Store\CartController::class, 'update'])->name('cart.items.update');
Route::delete('/cart/items/{item}', [Store\CartController::class, 'destroy'])->name('cart.items.destroy');
Route::post('/cart/restore', [Store\CartController::class, 'restore'])->name('cart.items.restore');
Route::post('/cart/coupon', [Store\CartController::class, 'applyCoupon'])->name('cart.coupon.apply');
Route::delete('/cart/coupon', [Store\CartController::class, 'removeCoupon'])->name('cart.coupon.remove');

Route::middleware('auth')->group(function () {
    Route::get('/checkout', [Store\CheckoutController::class, 'show'])->name('checkout.show');
    Route::post('/checkout', [Store\CheckoutController::class, 'store'])->name('checkout.store');
    Route::get('/checkout/{order}/thanks', [Store\CheckoutController::class, 'thanks'])->name('checkout.thanks');

    Route::get('/account', [Store\AccountController::class, 'index'])->name('account.index');
    Route::get('/account/orders/{order}', [Store\AccountController::class, 'show'])->name('account.orders.show');
    Route::post('/account/orders/{order}/requests', [Store\AccountController::class, 'requestReturn'])->name('account.orders.request');

    // The starter kit's dashboard route now points at the customer account.
    Route::redirect('/dashboard', '/account')->name('dashboard');
});

/*
|--------------------------------------------------------------------------
| Admin portal (employees only, role-based)
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->name('admin.')->group(function () {
    Route::middleware('guest')->group(function () {
        Route::get('login', [Admin\AuthController::class, 'create'])->name('login');
        Route::post('login', [Admin\AuthController::class, 'store'])->middleware('throttle:10,1');
    });

    Route::middleware('role:admin,staff,fulfillment')->group(function () {
        Route::post('logout', [Admin\AuthController::class, 'destroy'])->name('logout');
        Route::get('/', Admin\DashboardController::class)->name('dashboard');

        // Orders: admin, staff and fulfillment.
        Route::get('orders', [Admin\OrderController::class, 'index'])->name('orders.index');
        Route::get('orders/{order}', [Admin\OrderController::class, 'show'])->name('orders.show');
        Route::post('orders/{order}/status', [Admin\OrderController::class, 'updateStatus'])->name('orders.status');
        Route::post('orders/{order}/courier', [Admin\OrderController::class, 'assignCourier'])->name('orders.courier');

        // Catalog, returns and customers: admin and staff.
        Route::middleware('role:admin,staff')->group(function () {
            Route::get('products', [Admin\ProductController::class, 'index'])->name('products.index');
            Route::get('products/create', [Admin\ProductController::class, 'create'])->name('products.create');
            Route::post('products', [Admin\ProductController::class, 'store'])->name('products.store');
            Route::get('products/{product}/edit', [Admin\ProductController::class, 'edit'])->name('products.edit');
            Route::post('products/{product}', [Admin\ProductController::class, 'update'])->name('products.update'); // POST for multipart uploads
            Route::post('products/{product}/archive', [Admin\ProductController::class, 'archive'])->name('products.archive');
            Route::delete('products/{product}', [Admin\ProductController::class, 'destroy'])->name('products.destroy');
            Route::post('products/{id}/restore', [Admin\ProductController::class, 'restore'])->name('products.restore');
            Route::delete('product-images/{image}', [Admin\ProductController::class, 'destroyImage'])->name('products.images.destroy');
            Route::post('variants/{variant}/stock', [Admin\ProductController::class, 'adjustStock'])->name('variants.stock');

            Route::get('categories', [Admin\CategoryController::class, 'index'])->name('categories.index');
            Route::post('categories', [Admin\CategoryController::class, 'store'])->name('categories.store');
            Route::patch('categories/{category}', [Admin\CategoryController::class, 'update'])->name('categories.update');

            Route::get('returns', [Admin\ReturnController::class, 'index'])->name('returns.index');
            Route::post('returns/{returnRequest}/approve', [Admin\ReturnController::class, 'approve'])->name('returns.approve');
            Route::post('returns/{returnRequest}/reject', [Admin\ReturnController::class, 'reject'])->name('returns.reject');

            Route::get('customers', [Admin\PeopleController::class, 'customers'])->name('customers.index');
            Route::get('customers/{user}', [Admin\PeopleController::class, 'customer'])->name('customers.show');
        });

        // Employees and roles: admin only.
        Route::middleware('role:admin')->group(function () {
            Route::get('employees', [Admin\PeopleController::class, 'employees'])->name('employees.index');
            Route::post('employees', [Admin\PeopleController::class, 'storeEmployee'])->name('employees.store');
            Route::patch('employees/{user}', [Admin\PeopleController::class, 'updateRole'])->name('employees.role');
        });
    });
});

/*
|--------------------------------------------------------------------------
| Courier (delivery personnel)
|--------------------------------------------------------------------------
*/
Route::prefix('courier')->name('courier.')->middleware('role:courier')->group(function () {
    Route::get('/', [DeliveryController::class, 'index'])->name('index');
    Route::post('shipments/{shipment}/transit', [DeliveryController::class, 'transit'])->name('transit');
    Route::post('shipments/{shipment}/delivered', [DeliveryController::class, 'delivered'])->name('delivered');
    Route::post('logout', [Admin\AuthController::class, 'destroy'])->name('logout');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
