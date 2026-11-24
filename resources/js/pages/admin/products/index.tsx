import { StatusPill } from '@/components/feedback';
import AdminLayout, { inputCls, td, th } from '@/layouts/admin-layout';
import { php, statusLabel } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface Row {
    id: number;
    name: string;
    slug: string;
    status: string;
    category: string | null;
    image: string | null;
    stock: number;
    low: boolean;
    price_from: number;
    variant_count: number;
}

export default function Products({ products, filters }: { products: Row[]; filters: { q: string; status: string } }) {
    const [q, setQ] = useState(filters.q);
    useEffect(() => {
        const t = window.setTimeout(() => q !== filters.q && router.get('/admin/products', { ...filters, q }, { preserveState: true, replace: true }), 300);
        return () => window.clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q]);

    const tabs = [
        ['', 'Live & drafts'],
        ['active', 'Active'],
        ['draft', 'Draft'],
        ['archived', 'Archived'],
        ['deleted', 'Deleted'],
    ];

    return (
        <AdminLayout
            title="Products"
            actions={
                <Link href="/admin/products/create" className="bg-pine text-mist hover:bg-pine-soft inline-flex h-9 items-center rounded-[2px] px-4 text-[0.8125rem] font-medium">
                    New product
                </Link>
            }
        >
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-1 text-[0.8125rem]">
                    {tabs.map(([v, l]) => (
                        <button key={v} onClick={() => router.get('/admin/products', { ...filters, status: v }, { preserveState: true })} className={cn('h-8 rounded-[2px] px-3', filters.status === v ? 'bg-pine text-mist' : 'hover:bg-paper')}>
                            {l}
                        </button>
                    ))}
                </div>
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" className={cn(inputCls, 'max-w-xs')} aria-label="Search products" />
            </div>

            <div className="bg-paper border-hair overflow-x-auto border">
                <table className="w-full min-w-[720px]">
                    <thead>
                        <tr>
                            <th className={th}>Product</th>
                            <th className={th}>Category</th>
                            <th className={th}>Status</th>
                            <th className={cn(th, 'text-right')}>Price from</th>
                            <th className={cn(th, 'text-right')}>Stock</th>
                            <th className={th}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((p) => (
                            <tr key={p.id} className="hover:bg-mist/60 transition-colors">
                                <td className={td}>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-mist-deep h-11 w-9 shrink-0 overflow-hidden">{p.image && <img src={p.image} alt="" className="h-full w-full object-cover" />}</div>
                                        <div>
                                            <p>{p.name}</p>
                                            <p className="text-ink-soft text-[0.75rem]">{p.variant_count} options</p>
                                        </div>
                                    </div>
                                </td>
                                <td className={td}>{p.category}</td>
                                <td className={td}>
                                    <StatusPill status={p.status} label={statusLabel(p.status)} />
                                </td>
                                <td className={cn(td, 't-num text-right')}>{php(p.price_from)}</td>
                                <td className={cn(td, 't-num text-right', p.low && 'text-clay')}>
                                    {p.stock}
                                    {p.low && <span className="ml-2 font-sans text-[0.75rem]">low</span>}
                                </td>
                                <td className={cn(td, 'text-right whitespace-nowrap')}>
                                    {p.status === 'deleted' ? (
                                        <button onClick={() => router.post(`/admin/products/${p.id}/restore`, {}, { preserveScroll: true })} className="link-line text-[0.8125rem]">
                                            Restore
                                        </button>
                                    ) : (
                                        <Link href={`/admin/products/${p.id}/edit`} className="link-line text-[0.8125rem]">
                                            Edit
                                        </Link>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {products.length === 0 && (
                            <tr>
                                <td colSpan={6} className={cn(td, 'text-ink-soft py-10 text-center')}>
                                    No products here.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
