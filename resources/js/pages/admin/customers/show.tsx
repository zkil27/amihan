import { StatusPill } from '@/components/feedback';
import AdminLayout, { Panel, td, th } from '@/layouts/admin-layout';
import { date, php, statusLabel } from '@/lib/format';
import { cn } from '@/lib/utils';
import { OrderSummary } from '@/types';
import { Link } from '@inertiajs/react';

interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    joined: string;
    lifetime: number;
    addresses: { id: number; label: string; recipient: string; line1: string; barangay: string; city: string; province: string; postal_code: string }[];
    orders: OrderSummary[];
    requests: { id: number; type: string; reason: string; status: string; order_no: string; created_at: string }[];
}

/** Customer account: order history and support-related info. */
export default function CustomerShow({ customer }: { customer: Customer }) {
    return (
        <AdminLayout
            title={customer.name}
            actions={
                <Link href="/admin/customers" className="link-line text-[0.8125rem]">
                    All customers
                </Link>
            }
        >
            <div className="grid gap-8 xl:grid-cols-[1fr_340px]">
                <Panel title={`Orders (${customer.orders.length})`}>
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className={th}>Order</th>
                                <th className={th}>Date</th>
                                <th className={th}>Status</th>
                                <th className={cn(th, 'text-right')}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customer.orders.map((o) => (
                                <tr key={o.order_no}>
                                    <td className={td}>
                                        <Link href={`/admin/orders/${o.order_no}`} className="t-num link-line">
                                            {o.order_no}
                                        </Link>
                                    </td>
                                    <td className={cn(td, 'text-ink-soft')}>{date(o.placed_at)}</td>
                                    <td className={td}>
                                        <StatusPill status={o.status} label={statusLabel(o.status)} />
                                    </td>
                                    <td className={cn(td, 't-num text-right')}>{php(o.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Panel>
                <div className="grid content-start gap-8">
                    <Panel title="Contact">
                        <p className="text-[0.875rem] leading-relaxed">
                            {customer.email}
                            <br />
                            <span className="t-num">{customer.phone ?? 'No phone'}</span>
                        </p>
                        <p className="text-ink-soft mt-3 text-[0.8125rem]">Customer since {date(customer.joined)}</p>
                        <p className="mt-3 text-[0.875rem]">
                            Lifetime value <span className="t-num">{php(customer.lifetime)}</span>
                        </p>
                    </Panel>
                    <Panel title="Addresses">
                        {customer.addresses.length === 0 ? (
                            <p className="text-ink-soft text-[0.875rem]">None saved.</p>
                        ) : (
                            customer.addresses.map((a) => (
                                <p key={a.id} className="text-[0.875rem] leading-relaxed">
                                    {a.recipient}
                                    <br />
                                    {a.line1}, {a.barangay}, {a.city}, {a.province} {a.postal_code}
                                </p>
                            ))
                        )}
                    </Panel>
                    <Panel title="Support history">
                        {customer.requests.length === 0 ? (
                            <p className="text-ink-soft text-[0.875rem]">No cancellations or returns.</p>
                        ) : (
                            <ul className="grid gap-3 text-[0.8125rem]">
                                {customer.requests.map((r) => (
                                    <li key={r.id}>
                                        {r.type} · {r.reason} <StatusPill status={r.status} label={statusLabel(r.status)} className="ml-1" />
                                        <span className="text-ink-soft block">
                                            {r.order_no} · {date(r.created_at)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Panel>
                </div>
            </div>
        </AdminLayout>
    );
}
