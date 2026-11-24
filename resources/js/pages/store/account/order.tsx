import { ActionButton, FieldMessage, StatusPill } from '@/components/feedback';
import { OrderTimeline } from '@/components/store/order-timeline';
import { date, dateTime, php, statusLabel } from '@/lib/format';
import { cn } from '@/lib/utils';
import { storeLayout } from '@/layouts/store-layout';
import { dur, ease } from '@/motion/tokens';
import { OrderDetail } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'motion/react';
import { FormEvent, useState } from 'react';

const REASONS = {
    cancellation: ['Ordered by mistake', 'Found a better delivery date', 'Need to change the address', 'Other'],
    return: ['Arrived damaged', 'Wrong item received', 'Not as described', 'Other'],
};

/** Order detail with tracking, and the way to request a cancellation or return. */
export default function AccountOrder({ order }: { order: OrderDetail }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard?.writeText(order.order_no);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
    };

    return (
        <>
            <Head title={`Order ${order.order_no}`} />
            <section className="pt-[calc(var(--header-h)+clamp(32px,8vh,96px))] pb-[var(--section-y)]">
                <div className="wrap max-w-[880px]">
                    <Link href="/account" className="link-line t-label">
                        ← Your orders
                    </Link>

                    <div className="mt-8 flex flex-wrap items-center gap-4">
                        <h1 className="t-display t-h2">Order</h1>
                        <button onClick={copy} className="t-num text-ink-soft hover:text-pine relative mt-2 inline-flex items-center gap-2" aria-label="Copy order number">
                            {order.order_no}
                            <span className="w-4 text-center" aria-hidden>
                                {copied ? '✓' : '⧉'}
                            </span>
                            <AnimatePresence>
                                {copied && (
                                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="t-label absolute -top-6 right-0" role="status">
                                        Copied
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>
                    </div>
                    <p className="t-label mt-3">
                        Purchased {date(order.placed_at)} · <StatusPill status={order.status} label={statusLabel(order.status)} className="ml-1 align-middle" />
                    </p>

                    <div className="mt-16 grid gap-16 md:grid-cols-[1fr_1.1fr] md:gap-20">
                        <div>
                            <h2 className="t-label mb-6">Tracking</h2>
                            <OrderTimeline order={order} />
                            {order.shipment && (
                                <p className="t-label mt-6">
                                    Tracking <span className="t-num text-pine">{order.shipment.tracking_no}</span>
                                    {order.shipment.courier && ` · ${order.shipment.courier}`}
                                </p>
                            )}
                        </div>

                        <div>
                            <h2 className="t-label mb-4">Items</h2>
                            <ul>
                                {order.items.map((i) => (
                                    <li key={i.id} className="hair flex justify-between gap-4 py-4 text-[0.9375rem]">
                                        <span>
                                            {i.product_name}
                                            <span className="text-ink-soft block text-[0.8125rem]">
                                                {i.variant_name} × {i.qty}
                                            </span>
                                        </span>
                                        <span className="t-num">{php(i.line_total)}</span>
                                    </li>
                                ))}
                            </ul>
                            <dl className="hair grid gap-1.5 pt-4 text-[0.9375rem]">
                                <Row label="Subtotal" value={php(order.subtotal)} />
                                {order.discount > 0 && <Row label="Discount" value={`−${php(order.discount)}`} />}
                                <Row label="Delivery" value={order.delivery_fee ? php(order.delivery_fee) : 'Free'} />
                                <div className="flex items-baseline justify-between pt-2">
                                    <dt>Total</dt>
                                    <dd className="font-display text-xl font-light">{php(order.total)}</dd>
                                </div>
                            </dl>

                            <div className="mt-10 grid gap-8 text-[0.9375rem] sm:grid-cols-2">
                                <div>
                                    <h3 className="t-label mb-2">Delivering to</h3>
                                    <p className="leading-relaxed">
                                        {order.shipping.recipient}
                                        <br />
                                        {order.shipping.line1}, {order.shipping.barangay}
                                        <br />
                                        {order.shipping.city}, {order.shipping.province} {order.shipping.postal_code}
                                    </p>
                                    <p className="t-label mt-2">{order.delivery_window?.split(' (')[0]}</p>
                                </div>
                                <div>
                                    <h3 className="t-label mb-2">Payment</h3>
                                    <p>{order.payment?.method === 'cod' ? 'Cash on delivery' : order.payment?.method === 'gcash' ? 'GCash' : `Card ending ${order.payment?.last4}`}</p>
                                    {order.payment && <StatusPill status={order.payment.status} label={statusLabel(order.payment.status)} className="mt-2" />}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Returns and cancellations */}
                    <div className="hair mt-20 pt-10">
                        <h2 className="font-display text-2xl font-light">Cancellations & returns</h2>
                        {order.requests.length > 0 && (
                            <ul className="mt-6 grid gap-4">
                                {order.requests.map((r) => (
                                    <li key={r.id} className="border-hair border p-5">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <p className="text-[0.9375rem]">
                                                {r.type === 'cancellation' ? 'Cancellation' : 'Return'} · {r.reason}
                                            </p>
                                            <StatusPill status={r.status} label={statusLabel(r.status)} />
                                        </div>
                                        <p className="t-label mt-2">Requested {dateTime(r.created_at)}</p>
                                        {r.admin_note && <p className="mt-3 text-[0.9375rem]">“{r.admin_note}”</p>}
                                        {r.refund && (
                                            <p className="mt-3 text-[0.9375rem]">
                                                Refunded {php(r.refund.amount)} · <span className="t-num">{r.refund.ref}</span>
                                            </p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="mt-8">
                            {order.can_cancel && <RequestDialog order={order} type="cancellation" />}
                            {order.can_return && <RequestDialog order={order} type="return" />}
                            {!order.can_cancel && !order.can_return && order.requests.length === 0 && (
                                <p className="text-ink-soft">
                                    {order.status === 'delivered' ? 'The 7-day return window has closed for this order.' : 'This order has left the pantry and can no longer be cancelled. Once delivered, you can request a return within 7 days.'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

AccountOrder.layout = storeLayout;

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-baseline justify-between">
            <dt className="text-ink-soft">{label}</dt>
            <dd className="t-num text-[0.8125rem]">{value}</dd>
        </div>
    );
}

function RequestDialog({ order, type }: { order: OrderDetail; type: 'cancellation' | 'return' }) {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({ type, reason: '', details: '' });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('account.orders.request', order.order_no), {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                reset();
            },
        });
    };

    const label = type === 'cancellation' ? 'Request a cancellation' : 'Request a return';

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger className="btn btn-line">{label}</Dialog.Trigger>
            <AnimatePresence>
                {open && (
                    <Dialog.Portal forceMount>
                        <Dialog.Overlay asChild forceMount>
                            <motion.div className="fixed inset-0 z-[70] bg-[rgb(234_231_225/0.78)]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
                        </Dialog.Overlay>
                        <Dialog.Content asChild forceMount aria-describedby={undefined}>
                            <motion.div
                                className="bg-mist fixed z-[71] w-full p-8 shadow-[0_30px_80px_-40px_rgb(30_45_36/0.5)] max-md:inset-x-0 max-md:bottom-0 max-md:pb-[calc(32px+env(safe-area-inset-bottom))] md:top-1/2 md:left-1/2 md:max-w-[520px] md:-translate-x-1/2 md:-translate-y-1/2 md:p-12"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0, transition: { duration: dur.base, ease: ease.mist } }}
                                exit={{ opacity: 0, y: 8, transition: { duration: dur.quick } }}
                                data-lenis-prevent
                            >
                                <Dialog.Title className="font-display text-2xl font-light">{label}</Dialog.Title>
                                <p className="t-label mt-2">
                                    Order <span className="t-num">{order.order_no}</span>
                                </p>
                                <form onSubmit={submit} className="mt-8 grid gap-6">
                                    <fieldset>
                                        <legend className="field-label mb-3">Reason</legend>
                                        <div className="grid gap-2">
                                            {REASONS[type].map((r) => (
                                                <label key={r} className={cn('flex min-h-[48px] cursor-pointer items-center gap-3 border px-4 text-[0.9375rem] transition-colors', data.reason === r ? 'border-pine' : 'border-hair')}>
                                                    <input type="radio" name="reason" checked={data.reason === r} onChange={() => setData('reason', r)} className="accent-pine" />
                                                    {r}
                                                </label>
                                            ))}
                                        </div>
                                        <FieldMessage error={errors.reason} />
                                    </fieldset>
                                    <AnimatePresence initial={false}>
                                        {data.reason && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="field overflow-hidden">
                                                <label htmlFor="details" className="field-label">
                                                    Anything we should know? <span className="opacity-70">(optional)</span>
                                                </label>
                                                <textarea id="details" rows={3} value={data.details} onChange={(e) => setData('details', e.target.value)} className="field-input resize-none" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <FieldMessage error={errors.type} />
                                    <div className="mt-2 flex items-center justify-between gap-6">
                                        <Dialog.Close className="link-line text-[0.9375rem]">Keep my order</Dialog.Close>
                                        <ActionButton type="submit" loading={processing} disabled={!data.reason}>
                                            Send request
                                        </ActionButton>
                                    </div>
                                </form>
                            </motion.div>
                        </Dialog.Content>
                    </Dialog.Portal>
                )}
            </AnimatePresence>
        </Dialog.Root>
    );
}
