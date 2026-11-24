<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\Present;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

/** Customer / employee management with role-based access control. */
class PeopleController extends Controller
{
    public function customers(Request $request): Response
    {
        $q = $request->string('q')->toString();

        $customers = User::where('role', 'customer')
            ->when($q, fn ($w) => $w->where(fn ($x) => $x->where('name', 'like', "%{$q}%")->orWhere('email', 'like', "%{$q}%")))
            ->withCount('orders')->withSum(['orders as spent' => fn ($o) => $o->whereNotIn('status', ['cancelled', 'returned'])], 'total')
            ->latest()->paginate(25)->withQueryString();

        return Inertia::render('admin/customers/index', [
            'filters' => ['q' => $q],
            'customers' => [
                'data' => collect($customers->items())->map(fn ($u) => [
                    'id' => $u->id, 'name' => $u->name, 'email' => $u->email, 'phone' => $u->phone,
                    'orders' => $u->orders_count, 'spent' => (float) $u->spent, 'joined' => $u->created_at->toIso8601String(),
                ]),
                'current_page' => $customers->currentPage(), 'last_page' => $customers->lastPage(), 'total' => $customers->total(),
            ],
        ]);
    }

    public function customer(User $user): Response
    {
        abort_unless($user->role === 'customer', 404);
        $user->load(['orders.items', 'addresses', 'returnRequests.order']);

        return Inertia::render('admin/customers/show', [
            'customer' => [
                'id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'phone' => $user->phone,
                'joined' => $user->created_at->toIso8601String(),
                'addresses' => $user->addresses,
                'orders' => $user->orders->sortByDesc('placed_at')->values()->map(fn ($o) => Present::orderSummary($o)),
                'requests' => $user->returnRequests->map(fn ($r) => [
                    'id' => $r->id, 'type' => $r->type, 'reason' => $r->reason, 'status' => $r->status,
                    'order_no' => $r->order->order_no, 'created_at' => $r->created_at->toIso8601String(),
                ]),
                'lifetime' => (float) $user->orders->whereNotIn('status', ['cancelled', 'returned'])->sum('total'),
            ],
        ]);
    }

    public function employees(): Response
    {
        return Inertia::render('admin/employees', [
            'employees' => User::where('role', '!=', 'customer')->orderBy('role')->orderBy('name')->get(['id', 'name', 'email', 'role', 'created_at']),
            'roles' => [
                ['value' => 'admin', 'label' => 'Admin', 'can' => 'Everything, including employees and roles'],
                ['value' => 'staff', 'label' => 'Staff', 'can' => 'Catalog, orders, returns, customers, reports'],
                ['value' => 'fulfillment', 'label' => 'Fulfillment only', 'can' => 'Review orders, update status, assign couriers'],
                ['value' => 'courier', 'label' => 'Courier', 'can' => 'Their own deliveries only'],
            ],
        ]);
    }

    public function storeEmployee(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'email' => 'required|email|max:160|unique:users,email',
            'role' => ['required', Rule::in(['admin', 'staff', 'fulfillment', 'courier'])],
            'password' => ['required', Password::min(8)],
        ]);

        User::create($data); // the 'hashed' cast bcrypts the password

        return back()->with('toast', ['type' => 'success', 'message' => "{$data['name']} can now sign in."]);
    }

    public function updateRole(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate(['role' => ['required', Rule::in(['admin', 'staff', 'fulfillment', 'courier'])]]);

        if ($user->id === $request->user()->id && $data['role'] !== 'admin') {
            return back()->withErrors(['role' => "You can't remove your own admin access."]);
        }

        $user->update($data);

        return back()->with('toast', ['type' => 'success', 'message' => "{$user->name} is now {$data['role']}."]);
    }
}
