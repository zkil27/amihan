import AdminLayout, { inputCls, td, th } from '@/layouts/admin-layout';
import { date, php } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type Row = { id: number; name: string; email: string; phone: string | null; orders: number; spent: number; joined: string };

export default function Customers({ customers, filters }: { customers: { data: Row[]; total: number; current_page: number; last_page: number }; filters: { q: string } }) {
    const [q, setQ] = useState(filters.q);
    useEffect(() => {
        const t = window.setTimeout(() => q !== filters.q && router.get('/admin/customers', { q }, { preserveState: true, replace: true }), 300);
        return () => window.clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q]);

    return (
        <AdminLayout title="Customers" actions={<input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or email" className={cn(inputCls, 'w-64')} aria-label="Search customers" />}>
            <div className="bg-paper border-hair overflow-x-auto border">
                <table className="w-full min-w-[640px]">
                    <thead>
                        <tr>
                            <th className={th}>Customer</th>
                            <th className={th}>Phone</th>
                            <th className={th}>Joined</th>
                            <th className={cn(th, 'text-right')}>Orders</th>
                            <th className={cn(th, 'text-right')}>Lifetime</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.data.map((c) => (
                            <tr key={c.id} className="hover:bg-mist/60 cursor-pointer" onClick={() => router.visit(`/admin/customers/${c.id}`)}>
                                <td className={td}>
                                    <Link href={`/admin/customers/${c.id}`} className="link-line" onClick={(e) => e.stopPropagation()}>
                                        {c.name}
                                    </Link>
                                    <span className="text-ink-soft block text-[0.75rem]">{c.email}</span>
                                </td>
                                <td className={cn(td, 't-num')}>{c.phone}</td>
                                <td className={cn(td, 'text-ink-soft')}>{date(c.joined)}</td>
                                <td className={cn(td, 't-num text-right')}>{c.orders}</td>
                                <td className={cn(td, 't-num text-right')}>{php(c.spent)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="text-ink-soft mt-4 text-[0.8125rem]">{customers.total} customers</p>
        </AdminLayout>
    );
}
