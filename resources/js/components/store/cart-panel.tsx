import { ActionButton, ContourLoader, FieldMessage, NumberFade, Plate } from '@/components/feedback';
import { php } from '@/lib/format';
import { cn } from '@/lib/utils';
import { dur, ease, exit } from '@/motion/tokens';
import { CartLine, CartSummary, SharedData } from '@/types';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import { FormEvent, useEffect, useState } from 'react';

type Removed = { line: CartLine; until: number };

/**
 * The cart, used in the drawer and on /cart. Every change is a small
 * server request; the shared `cart` prop comes back updated, so the
 * header count and totals stay in sync on every page.
 */
export function CartPanel({ onNavigate, variant = 'drawer' }: { onNavigate?: () => void; variant?: 'drawer' | 'page' }) {
    const { props } = usePage<SharedData>();
    const cart = props.cart as CartSummary;
    const [removed, setRemoved] = useState<Removed[]>([]);
    const [busyLine, setBusyLine] = useState<number | null>(null);
    const [lineError, setLineError] = useState<{ id: number; msg: string } | null>(null);

    // Undo links expire after 5 s.
    useEffect(() => {
        if (!removed.length) return;
        const t = window.setInterval(() => setRemoved((r) => r.filter((x) => x.until > Date.now())), 500);
        return () => window.clearInterval(t);
    }, [removed.length]);

    const setQty = (line: CartLine, qty: number) => {
        if (qty < 1 || qty > line.stock) return;
        setBusyLine(line.id);
        setLineError(null);
        router.patch(
            route('cart.items.update', line.id),
            { qty },
            {
                preserveScroll: true,
                preserveState: true,
                onError: (e) => setLineError({ id: line.id, msg: e.qty ?? 'Could not update.' }),
                onFinish: () => setBusyLine(null),
            },
        );
    };

    const remove = (line: CartLine) => {
        router.delete(route('cart.items.destroy', line.id), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => setRemoved((r) => [...r, { line, until: Date.now() + 5000 }]),
        });
    };

    const undo = (r: Removed) => {
        router.post(
            route('cart.items.restore'),
            { variant_id: r.line.variant_id, qty: r.line.qty },
            { preserveScroll: true, preserveState: true, onSuccess: () => setRemoved((list) => list.filter((x) => x !== r)) },
        );
    };

    const empty = cart.lines.length === 0 && removed.length === 0;

    if (empty) {
        return (
            <div className="flex flex-1 flex-col items-start justify-center py-16">
                <p className="font-display t-h3 font-light">Your cart is quiet.</p>
                <p className="t-lede mt-4">Start with a bag from the ridge.</p>
                <Link href={route('pantry.index')} onClick={onNavigate} className="btn btn-line mt-10">
                    Browse the Pantry <span className="btn-arrow">→</span>
                </Link>
            </div>
        );
    }

    const progress = Math.min(1, (cart.subtotal - cart.discount) / cart.free_delivery_over);
    const freeReached = cart.subtotal > 0 && cart.delivery_fee === 0;

    return (
        <div className="flex flex-1 flex-col">
            <ul className={cn('flex-1', variant === 'drawer' && 'overflow-y-auto overscroll-contain')} data-lenis-prevent>
                <AnimatePresence initial={false}>
                    {cart.lines.map((line) => (
                        <motion.li
                            key={line.id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { duration: dur.base, ease: ease.mist } }}
                            exit={{ opacity: 0, height: 0, transition: { duration: exit(dur.base), ease: ease.mist } }}
                            className="hair overflow-hidden first:border-t-0"
                        >
                            <div className="flex gap-5 py-6">
                                <Link href={route('pantry.show', line.product_slug)} onClick={onNavigate} className="w-20 shrink-0">
                                    <Plate src={line.image} alt={line.product_name} ratio="4 / 5" />
                                </Link>
                                <div className="flex min-w-0 flex-1 flex-col">
                                    <div className="flex items-baseline justify-between gap-3">
                                        <Link href={route('pantry.show', line.product_slug)} onClick={onNavigate} className="font-display text-lg leading-snug font-light">
                                            {line.product_name}
                                        </Link>
                                        <span className="t-num shrink-0">
                                            <NumberFade value={php(line.line_total)} />
                                        </span>
                                    </div>
                                    <p className="t-label mt-1">{line.variant_name}</p>
                                    <div className="mt-auto flex items-center justify-between pt-4">
                                        <div className="border-hair-strong inline-flex h-10 items-center border">
                                            <button
                                                className="text-pine flex h-full w-10 items-center justify-center disabled:opacity-30"
                                                onClick={() => setQty(line, line.qty - 1)}
                                                disabled={line.qty <= 1 || busyLine === line.id}
                                                aria-label={`One fewer ${line.product_name}`}
                                            >
                                                −
                                            </button>
                                            <span className="t-num w-8 text-center text-[0.8125rem]">
                                                {busyLine === line.id ? <ContourLoader className="mx-auto h-2 w-6" /> : <NumberFade value={line.qty} />}
                                            </span>
                                            <button
                                                className="text-pine flex h-full w-10 items-center justify-center disabled:opacity-30"
                                                onClick={() => setQty(line, line.qty + 1)}
                                                disabled={line.qty >= line.stock || busyLine === line.id}
                                                aria-label={`One more ${line.product_name}`}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button onClick={() => remove(line)} className="link-line t-label hover:text-pine">
                                            Remove
                                        </button>
                                    </div>
                                    {line.qty >= line.stock && <p className="t-label mt-2">That's all we have.</p>}
                                    <FieldMessage error={lineError?.id === line.id ? lineError.msg : undefined} />
                                </div>
                            </div>
                        </motion.li>
                    ))}
                    {removed.map((r) => (
                        <motion.li
                            key={`removed-${r.line.id}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="hair t-label flex items-center justify-between py-4"
                        >
                            <span>{r.line.product_name} removed.</span>
                            <button className="link-line text-pine" onClick={() => undo(r)}>
                                Undo
                            </button>
                        </motion.li>
                    ))}
                </AnimatePresence>
            </ul>

            <div className="hair pt-6">
                {/* Free-delivery progress: a hairline filling toward ₱2,000. */}
                <div className="mb-6">
                    <p className="t-label">
                        {freeReached ? "Delivery's on us." : <>Add {php(cart.free_delivery_over - (cart.subtotal - cart.discount))} more for free delivery.</>}
                    </p>
                    <div className="bg-hair mt-2 h-px w-full">
                        <div
                            className="h-px transition-[width,background-color] duration-700 ease-[var(--ease-mist)]"
                            style={{ width: `${progress * 100}%`, backgroundColor: freeReached ? 'var(--color-brass)' : 'var(--color-pine)' }}
                        />
                    </div>
                </div>

                <CouponForm applied={cart.coupon} />

                <dl className="mt-6 grid gap-2 text-[0.9375rem]">
                    <Row label="Subtotal" value={php(cart.subtotal)} />
                    <AnimatePresence initial={false}>
                        {cart.discount > 0 && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                <Row label={`${cart.coupon?.code} · ${cart.coupon?.label}`} value={`−${php(cart.discount)}`} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <Row label="Delivery" value={cart.delivery_fee > 0 ? php(cart.delivery_fee) : 'Free'} />
                    <div className="hair mt-2 flex items-baseline justify-between pt-4">
                        <dt>Total</dt>
                        <dd className="font-display text-2xl font-light">
                            <NumberFade value={php(cart.total)} />
                        </dd>
                    </div>
                </dl>

                <Link href={route('checkout.show')} onClick={onNavigate} className="btn btn-solid mt-6 w-full">
                    Checkout <span className="btn-arrow">→</span>
                </Link>
                {!props.auth.user && <p className="t-label mt-3 text-center">You'll sign in or create an account at checkout.</p>}
            </div>
        </div>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-baseline justify-between">
            <dt className="text-ink-soft">{label}</dt>
            <dd className="t-num text-pine text-[0.8125rem]">
                <NumberFade value={value} />
            </dd>
        </div>
    );
}

function CouponForm({ applied }: { applied: CartSummary['coupon'] }) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({ code: '' });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('cart.coupon.apply'), { preserveScroll: true, preserveState: true, onSuccess: () => reset() });
    };

    if (applied) {
        return (
            <div className="flex items-center justify-between text-[0.9375rem]">
                <span>
                    <span className="t-num">{applied.code}</span> <span className="text-ink-soft">applied</span>
                </span>
                <button
                    className="link-line t-label hover:text-pine"
                    onClick={() => router.delete(route('cart.coupon.remove'), { preserveScroll: true, preserveState: true })}
                    aria-label={`Remove code ${applied.code}`}
                >
                    Remove
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={submit} className="grid gap-1">
            <label htmlFor="coupon" className="field-label">
                Promo code
            </label>
            <div className="flex items-end gap-4">
                <input
                    id="coupon"
                    value={data.code}
                    onChange={(e) => {
                        setData('code', e.target.value.toUpperCase());
                        if (errors.code) clearErrors('code');
                    }}
                    placeholder="AMIHAN10"
                    className="field-input t-num flex-1 text-[0.875rem]"
                    aria-invalid={errors.code ? true : undefined}
                    autoComplete="off"
                />
                <ActionButton type="submit" variant="line" loading={processing} disabled={!data.code} className="min-h-[44px] px-4 text-sm">
                    Apply
                </ActionButton>
            </div>
            <FieldMessage error={errors.code} />
        </form>
    );
}
