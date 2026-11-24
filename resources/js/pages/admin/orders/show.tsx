import { FieldMessage, StatusPill } from '@/components/feedback';
import { OrderTimeline } from '@/components/store/order-timeline';
import AdminLayout, { AdminButton, inputCls, Panel, td, th } from '@/layouts/admin-layout';
import { dateTime, php, statusLabel } from '@/lib/format';
import { cn } from '@/lib/utils';
import { OrderDetail, SharedData } from '@/types';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const ACTION: Record<string, string> = { confirmed: 'Confirm order', packed: 'Mark packed', cancelled: 'Cancel order' };

/** Inspect an order, its shipping details, and move it along. */
export default function AdminOrder({ order, next, couriers }: { order: OrderDetail; next: string[]; couriers: { id: number; name: string }[] }) {
    const { props } = usePage<SharedData>();
    const [note, setNote] = useState('');
    const [busy, setBusy] = useState<string | null>(null);
    const courierForm = useForm({ courier_id: couriers[0]?.id ?? '' });

    const move = (status: string) => {
        if (status === 'cancelled' && !confirm('Cancel this order? Stock is restocked and any payment refunded.')) return;
        setBusy(status);
        router.post(`/admin/orders/${order.order_no}/status`, { status, note }, { preserveScroll: true, onFinish: () => setBusy(null), onSuccess: () => setNote('') });
    };

    const canAssign = ['confirmed', 'packed'].includes(order.status) && (!order.shipment || order.shipment.status === 'assigned');

    return (
        <AdminLayout
            title={order.order_no}
            actions={
                <Link href="/admin/orders" className="link-line text-[0.8125rem]">
                    All orders
                </Link>
            }
        >
            <div className="mb-8 flex flex-wrap items-center gap-3 text-[0.875rem]">
                <StatusPill status={order.status} label={statusLabel(order.status)} />
                <span className="text-ink-soft">Placed {dateTime(order.placed_at)}</span>
                {order.payment && (
                    <span className="text-ink-soft">
                        · {order.payment.method.toUpperCase()} <StatusPill status={order.payment.status} label={statusLabel(order.payment.status)} className="ml-1" />
                    </span>
                )}
            </div>

            <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
                <div className="grid content-start gap-8">
                    <Panel title="Items">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className={th}>Item</th>
                                    <th className={cn(th, 'text-right')}>Qty</th>
                                    <th className={cn(th, 'text-right')}>Price</th>
                                    <th className={cn(th, 'text-right')}>Line</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((i) => (
                                    <tr key={i.id}>
                                        <td className={td}>
                                            {i.product_name}
                                            <span className="text-ink-soft block text-[0.75rem]">{i.variant_name}</span>
                                        </td>
                                        <td className={cn(td, 't-num text-right')}>{i.qty}</td>
                                        <td className={cn(td, 't-num text-right')}>{php(i.unit_price)}</td>
                                        <td className={cn(td, 't-num text-right')}>{php(i.line_total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <dl className="mt-4 ml-auto grid max-w-xs gap-1 text-[0.875rem]">
                            <Row label="Subtotal" value={php(order.subtotal)} />
                            {order.discount > 0 && <Row label="Discount" value={`−${php(order.discount)}`} />}
                            <Row label="Delivery" value={order.delivery_fee ? php(order.delivery_fee) : 'Free'} />
                            <Row label="Total" value={php(order.total)} strong />
                        </dl>
                    </Panel>

                    <div className="grid gap-8 md:grid-cols-2">
                        <Panel title="Ship to">
                            <p className="text-[0.875rem] leading-relaxed">
                                {order.shipping.recipient} · <span className="t-num">{order.shipping.phone}</span>
                                <br />
                                {order.shipping.line1}, {order.shipping.barangay}
                                <br />
                                {order.shipping.city}, {order.shipping.province} {order.shipping.postal_code}
                            </p>
                            <p className="text-ink-soft mt-3 text-[0.8125rem]">{order.delivery_window}</p>
                            {order.gift_note && <p className="border-hair mt-3 border-t pt-3 text-[0.8125rem] italic">“{order.gift_note}”</p>}
                        </Panel>
                        <Panel title="Customer">
                            <p className="text-[0.875rem] leading-relaxed">
                                {order.billing.name}
                                <br />
                                {order.billing.email}
                                <br />
                                <span className="t-num">{order.billing.phone}</span>
                            </p>
                            {order.customer && props.auth.can?.customers && (
                                <Link href={`/admin/customers/${order.customer.id}`} className="link-line mt-3 inline-block text-[0.8125rem]">
                                    Customer history
                                </Link>
                            )}
                        </Panel>
                    </div>

                    {order.requests.length > 0 && (
                        <Panel title="Cancellation & return requests">
                            <ul className="grid gap-3 text-[0.875rem]">
                                {order.requests.map((r) => (
                                    <li key={r.id} className="flex flex-wrap items-center justify-between gap-3">
                                        <span>
                                            {r.type === 'cancellation' ? 'Cancellation' : 'Return'} · {r.reason}
                                            {r.refund && <span className="text-ink-soft"> · refunded {php(r.refund.amount)}</span>}
                                        </span>
                                        <StatusPill status={r.status} label={statusLabel(r.status)} />
                                    </li>
                                ))}
                            </ul>
                            {props.auth.can?.returns && (
                                <Link href="/admin/returns" className="link-line mt-4 inline-block text-[0.8125rem]">
                                    Open returns queue
                                </Link>
                            )}
                        </Panel>
                    )}
                </div>

                <div className="grid content-start gap-8">
                    <Panel title="Next step">
                        {next.length === 0 && !canAssign ? (
                            <p className="text-ink-soft text-[0.875rem]">
                                {order.status === 'packed' || order.status === 'shipped' ? 'With the courier. They update the status from their app.' : 'No further actions for this order.'}
                            </p>
                        ) : (
                            <div className="grid gap-4">
                                {next.length > 0 && (
                                    <>
                                        <input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note for the customer (optional)" />
                                        <div className="flex flex-wrap gap-2">
                                            {next.map((s) => (
                                                <AdminButton key={s} variant={s === 'cancelled' ? 'danger' : 'solid'} disabled={!!busy} onClick={() => move(s)}>
                                                    {busy === s ? 'Saving…' : ACTION[s] ?? statusLabel(s)}
                                                </AdminButton>
                                            ))}
                                        </div>
                                    </>
                                )}
                                {canAssign && (
                                    <div className="border-hair grid gap-2 border-t pt-4">
                                        <span className="text-ink-soft text-[0.75rem]">{order.shipment ? `Assigned to ${order.shipment.courier}. Reassign:` : 'Assign a courier'}</span>
                                        <div className="flex gap-2">
                                            <select className={inputCls} value={courierForm.data.courier_id} onChange={(e) => courierForm.setData('courier_id', Number(e.target.value))}>
                                                {couriers.map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <AdminButton variant="line" disabled={courierForm.processing} onClick={() => courierForm.post(`/admin/orders/${order.order_no}/courier`, { preserveScroll: true })}>
                                                Assign
                                            </AdminButton>
                                        </div>
                                        <FieldMessage error={courierForm.errors.courier_id} />
                                    </div>
                                )}
                            </div>
                        )}
                    </Panel>

                    {order.shipment && (
                        <Panel title="Shipment">
                            <p className="t-num text-[0.8125rem]">{order.shipment.tracking_no}</p>
                            <p className="mt-2 text-[0.875rem]">
                                {order.shipment.courier} · <StatusPill status={order.shipment.status} label={statusLabel(order.shipment.status)} />
                            </p>
                        </Panel>
                    )}

                    <Panel title="Timeline">
                        <OrderTimeline order={order} />
                        <ul className="border-hair mt-6 grid gap-2 border-t pt-4 text-[0.8125rem]">
                            {[...order.history].reverse().map((h) => (
                                <li key={h.id}>
                                    <span className="text-ink-soft">{dateTime(h.at)}</span> · {statusLabel(h.status)}
                                    {h.note && <span className="text-ink-soft"> · {h.note}</span>}
                                    {h.by && <span className="text-ink-soft"> · {h.by}</span>}
                                </li>
                            ))}
                        </ul>
                    </Panel>
                </div>
            </div>
        </AdminLayout>
    );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
    return (
        <div className={cn('flex justify-between', strong && 'border-hair mt-1 border-t pt-2 font-medium')}>
            <dt className="text-ink-soft">{label}</dt>
            <dd className="t-num">{value}</dd>
        </div>
    );
}
