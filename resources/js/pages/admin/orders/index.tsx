import { StatusPill } from '@/components/feedback';
import AdminLayout, { inputCls, td, th } from '@/layouts/admin-layout';
import { dateTime, php, statusLabel } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface Row {
    order_no: string;
    status: string;
    total: number;
    placed_at: string;
    item_count: number;
    customer: string;
    city: string;
    payment: string | null;
    courier: string | null;
}

const TABS = ['', 'pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'];

/** All incoming orders, filterable by status, searchable by number or customer. */
export default function Orders({ orders, filters, counts }: { orders: { data: Row[]; current_page: number; last_page: number; total: number }; filters: { status: string; q: string }; counts: Record<string, number> }) {
    const [q, setQ] = useState(filters.q);
    useEffect(() => {
        const t = window.setTimeout(() => q !== filters.q && router.get('/admin/orders', { ...filters, q }, { preserveState: true, replace: true }), 300);
        return () => window.clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q]);

    return (
        <AdminLayout title="Orders">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-1 text-[0.8125rem]">
                    {TABS.map((s) => (
                        <button key={s} onClick={() => router.get('/admin/orders', { ...filters, status: s }, { preserveState: true })} className={cn('h-8 rounded-[2px] px-3', filters.status === s ? 'bg-pine text-mist' : 'hover:bg-paper')}>
                            {s ? statusLabel(s) : 'All'}
                            {s && counts[s] ? <span className="t-num ml-1.5 opacity-60">{counts[s]}</span> : null}
                        </button>
                    ))}
                </div>
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Order no., name or email" className={cn(inputCls, 'max-w-xs')} aria-label="Search orders" />
            </div>

            <div className="bg-paper border-hair overflow-x-auto border">
                <table className="w-full min-w-[840px]">
                    <thead>
                        <tr>
                            <th className={th}>Order</th>
                            <th className={th}>Placed</th>
                            <th className={th}>Customer</th>
                            <th className={th}>Payment</th>
                            <th className={th}>Status</th>
                            <th className={cn(th, 'text-right')}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.data.map((o) => (
                            <tr key={o.order_no} className="hover:bg-mist/60 cursor-pointer transition-colors" onClick={() => router.visit(`/admin/orders/${o.order_no}`)}>
                                <td className={td}>
                                    <Link href={`/admin/orders/${o.order_no}`} className="t-num link-line" onClick={(e) => e.stopPropagation()}>
                                        {o.order_no}
                                    </Link>
                                    <span className="text-ink-soft block text-[0.75rem]">{o.item_count} items</span>
                                </td>
                                <td className={cn(td, 'text-ink-soft whitespace-nowrap')}>{dateTime(o.placed_at)}</td>
                                <td className={td}>
                                    {o.customer}
                                    <span className="text-ink-soft block text-[0.75rem]">{o.city}</span>
                                </td>
                                <td className={cn(td, 'text-ink-soft')}>{o.payment}</td>
                                <td className={td}>
                                    <StatusPill status={o.status} label={statusLabel(o.status)} />
                                    {o.courier && <span className="text-ink-soft mt-1 block text-[0.75rem]">{o.courier}</span>}
                                </td>
                                <td className={cn(td, 't-num text-right')}>{php(o.total)}</td>
                            </tr>
                        ))}
                        {orders.data.length === 0 && (
                            <tr>
                                <td colSpan={6} className={cn(td, 'text-ink-soft py-10 text-center')}>
                                    No orders match.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {orders.last_page > 1 && (
                <div className="mt-5 flex items-center justify-between text-[0.8125rem]">
                    <span className="text-ink-soft">
                        Page {orders.current_page} of {orders.last_page} · {orders.total} orders
                    </span>
                    <div className="flex gap-4">
                        {orders.current_page > 1 && (
                            <button className="link-line" onClick={() => router.get('/admin/orders', { ...filters, page: orders.current_page - 1 }, { preserveState: true })}>
                                Previous
                            </button>
                        )}
                        {orders.current_page < orders.last_page && (
                            <button className="link-line" onClick={() => router.get('/admin/orders', { ...filters, page: orders.current_page + 1 }, { preserveState: true })}>
                                Next
                            </button>
                        )}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
