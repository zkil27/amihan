import { StatusPill } from '@/components/feedback';
import { date, php, statusLabel } from '@/lib/format';
import { storeLayout } from '@/layouts/store-layout';
import { OrderSummary, SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';

interface Props {
    orders: OrderSummary[];
    address: { recipient: string; line1: string; barangay: string; city: string; province: string; postal_code: string } | null;
}

/** Customer dashboard: past orders with status and purchase dates. */
export default function Account({ orders, address }: Props) {
    const { props } = usePage<SharedData>();
    const user = props.auth.user!;

    return (
        <>
            <Head title="Your account" />
            <section className="pt-[calc(var(--header-h)+clamp(48px,10vh,120px))] pb-[var(--section-y)]">
                <div className="wrap max-w-[880px]">
                    <p className="t-label">Signed in as {user.email}</p>
                    <h1 className="t-display t-h1 mt-4">Hello, {user.name.split(' ')[0]}.</h1>

                    <div className="mt-20 flex items-baseline justify-between">
                        <h2 className="font-display text-2xl font-light">Your orders</h2>
                        <span className="t-num text-ink-soft">{orders.length}</span>
                    </div>

                    {orders.length === 0 ? (
                        <div className="hair mt-6 py-16">
                            <p className="t-lede">No orders yet. The ridge is waiting.</p>
                            <Link href="/pantry" className="btn btn-line mt-8">
                                Browse the Pantry <span className="btn-arrow">→</span>
                            </Link>
                        </div>
                    ) : (
                        <ul className="mt-6">
                            {orders.map((o) => (
                                <li key={o.order_no} className="hair">
                                    <Link href={route('account.orders.show', o.order_no)} className="group grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-2 py-6 md:grid-cols-[1.2fr_1fr_auto_auto]">
                                        <span>
                                            <span className="t-num block">{o.order_no}</span>
                                            <span className="t-label mt-1 block">
                                                {o.first_item}
                                                {o.item_count > 1 && ` and ${o.item_count - 1} more`}
                                            </span>
                                        </span>
                                        <span className="t-label max-md:order-3">Purchased {date(o.placed_at)}</span>
                                        <StatusPill status={o.status} label={statusLabel(o.status)} className="max-md:order-4 max-md:justify-self-start" />
                                        <span className="t-num text-right max-md:row-start-1 max-md:col-start-2">{php(o.total)}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="hair mt-20 grid gap-10 pt-10 md:grid-cols-2">
                        <div>
                            <h2 className="t-label">Saved address</h2>
                            {address ? (
                                <p className="mt-3 leading-relaxed">
                                    {address.recipient}
                                    <br />
                                    {address.line1}, {address.barangay}
                                    <br />
                                    {address.city}, {address.province} {address.postal_code}
                                </p>
                            ) : (
                                <p className="text-ink-soft mt-3">Saved at your first checkout.</p>
                            )}
                        </div>
                        <div className="flex flex-col items-start gap-3">
                            <h2 className="t-label">Account</h2>
                            <Link href={route('profile.edit')} className="link-line">
                                Profile & password
                            </Link>
                            <button onClick={() => router.post(route('logout'))} className="link-line">
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

Account.layout = storeLayout;
