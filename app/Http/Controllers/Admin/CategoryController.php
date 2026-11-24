<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/** Catalog categorization: create, rename, archive. */
class CategoryController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/categories', [
            'categories' => Category::withCount('products')->orderBy('sort')->get()
                ->map(fn ($c) => $c->only('id', 'name', 'slug', 'description', 'is_archived', 'products_count', 'sort')),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate(['name' => 'required|string|max:60|unique:categories,name', 'description' => 'nullable|string|max:200']);
        Category::create($data + ['slug' => Str::slug($data['name']), 'sort' => (int) Category::max('sort') + 1]);

        return back()->with('toast', ['type' => 'success', 'message' => 'Category added.']);
    }

    public function update(Request $request, Category $category): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:60|unique:categories,name,'.$category->id,
            'description' => 'nullable|string|max:200',
            'is_archived' => 'boolean',
        ]);
        $category->update($data);

        return back()->with('toast', ['type' => 'success', 'message' => 'Category saved.']);
    }
}
