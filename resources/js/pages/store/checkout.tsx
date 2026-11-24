import { ActionButton, Field, FieldMessage, NumberFade } from '@/components/feedback';
import { php } from '@/lib/format';
import { cn } from '@/lib/utils';
import { storeLayout } from '@/layouts/store-layout';
import { dur, ease, exit } from '@/motion/tokens';
import { CartSummary, SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import { FormEvent, useEffect, useMemo, useState } from 'react';

type Defaults = Record<string, string>;

type CheckoutForm = {
    billing_name: string;
    billing_email: string;
    billing_phone: string;
    shipping_recipient: string;
    shipping_phone: string;
    shipping_line1: string;
    shipping_barangay: string;
    shipping_city: string;
    shipping_province: string;
    shipping_postal_code: string;
    delivery_window: string;
    gift_note: string;
    save_address: boolean;
    payment_method: 'card' | 'gcash' | 'cod';
    card_name: string;
    card_number: string;
    card_expiry: string;
    card_cvc: string;
};

const STEPS = ['Details', 'Delivery', 'Payment'] as const;

const STEP_FIELDS: string[][] = [
    ['billing_name', 'billing_email', 'billing_phone'],
    ['shipping_recipient', 'shipping_phone', 'shipping_line1', 'shipping_barangay', 'shipping_city', 'shipping_province', 'shipping_postal_code', 'delivery_window', 'gift_note'],
    ['payment_method', 'card_name', 'card_number', 'card_expiry', 'card_cvc', 'cart'],
];

const PH_PHONE = /^(09\d{9}|\+639\d{9})$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Structured checkout: one question group at a time. */
export default function Checkout({ defaults, windows }: { defaults: Defaults; windows: string[] }) {
    const { props } = usePage<SharedData>();
    const cart = props.cart as CartSummary;
    const [step, setStep] = useState(0);
    const [summaryOpen, setSummaryOpen] = useState(false);
    const [local, setLocal] = useState<Record<string, string>>({});

    const { data, setData, post, processing, errors, clearErrors, transform } = useForm<CheckoutForm>({
        billing_name: defaults.billing_name ?? '',
        billing_email: defaults.billing_email ?? '',
        billing_phone: defaults.billing_phone ?? '',
        shipping_recipient: defaults.shipping_recipient ?? '',
        shipping_phone: defaults.shipping_phone ?? '',
        shipping_line1: defaults.shipping_line1 ?? '',
        shipping_barangay: defaults.shipping_barangay ?? '',
        shipping_city: defaults.shipping_city ?? '',
        shipping_province: defaults.shipping_province ?? '',
        shipping_postal_code: defaults.shipping_postal_code ?? '',
        delivery_window: windows[0],
        gift_note: '',
        save_address: true,
        payment_method: 'card',
        card_name: defaults.billing_name ?? '',
        card_number: '',
        card_expiry: '',
        card_cvc: '',
    });

    const allErrors = { ...local, ...errors } as Record<string, string>;

    // Server errors send the visitor back to the step that holds them.
    useEffect(() => {
        const keys = Object.keys(errors);
        if (!keys.length) return;
        const target = STEP_FIELDS.findIndex((f) => f.some((k) => keys.includes(k)));
        if (target >= 0) setStep(target);
        window.setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 60);
    }, [errors]);

    const set = (key: string, value: string) => {
        setData(key as keyof typeof data, value as never);
        if (allErrors[key]) {
            clearErrors(key as keyof typeof data);
            setLocal((l) => ({ ...l, [key]: '' }));
        }
    };

    // Light client checks on blur; the server re-validates everything.
    const check = (key: string): string => {
        if (!(key in data)) return ''; // server-only keys such as "cart"
        const v = String(data[key as keyof typeof data] ?? '').trim();
        if (!v && !['gift_note', 'card_name', 'card_number', 'card_expiry', 'card_cvc'].includes(key)) return 'Required.';
        if (key.endsWith('_phone') && !PH_PHONE.test(v.replace(/\s/g, ''))) return 'Use a PH mobile number like 0917 123 4567.';
        if (key === 'billing_email' && !EMAIL.test(v)) return 'Enter a valid email.';
        if (key === 'shipping_postal_code' && !/^\d{4}$/.test(v)) return 'PH postal codes have 4 digits.';
        if (data.payment_method === 'card') {
            if (key === 'card_name' && !v) return 'Required.';
            if (key === 'card_number' && v.replace(/\D/g, '').length < 13) return 'Enter the full card number.';
            if (key === 'card_expiry' && !/^(0[1-9]|1[0-2])\/\d{2}$/.test(v)) return 'Use MM/YY.';
            if (key === 'card_cvc' && !/^\d{3,4}$/.test(v)) return '3 or 4 digits.';
        }
        return '';
    };

    const blur = (key: string) => setLocal((l) => ({ ...l, [key]: check(key) }));

    const validateStep = (i: number) => {
        const found: Record<string, string> = {};
        STEP_FIELDS[i].forEach((k) => {
            const e = check(k);
            if (e) found[k] = e;
        });
        setLocal((l) => ({ ...l, ...found }));
        if (Object.keys(found).length) {
            window.setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 30);
            return false;
        }
        return true;
    };

    const next = () => {
        if (validateStep(step)) setStep((s) => Math.min(2, s + 1));
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (step < 2) return next();
        if (!validateStep(2)) return;
        transform((d) => ({ ...d, billing_phone: d.billing_phone.replace(/\s/g, ''), shipping_phone: d.shipping_phone.replace(/\s/g, ''), card_number: d.card_number.replace(/\s/g, '') }));
        // Keep the scroll position only when errors come back; success opens the summit page at the top.
        post(route('checkout.store'), { preserveScroll: (page) => Object.keys(page.props.errors ?? {}).length > 0 });
    };

    const field = (key: string, label: string, extra: Partial<React.InputHTMLAttributes<HTMLInputElement>> = {}) => (
        <Field
            label={label}
            name={key}
            value={String(data[key as keyof typeof data] ?? '')}
            onChange={(e) => set(key, e.target.value)}
            onBlur={() => blur(key)}
            error={allErrors[key]}
            valid={local[key] === '' && !!data[key as keyof typeof data]}
            {...extra}
        />
    );

    return (
        <>
            <Head title="Checkout" />
            <section className="pt-[calc(var(--header-h)+clamp(32px,8vh,96px))] pb-[var(--section-y)]">
                <div className="wrap max-w-[620px]">
                    <h1 className="t-display t-h1">Checkout</h1>

                    {/* Summary toggle */}
                    <div className="hair mt-10 pt-5">
                        <button onClick={() => setSummaryOpen((o) => !o)} className="flex w-full items-baseline justify-between text-left" aria-expanded={summaryOpen}>
                            <span className="link-line text-[0.9375rem]">{summaryOpen ? 'Hide summary' : 'Show summary'}</span>
                            <span className="font-display text-xl font-light">
                                <NumberFade value={php(cart.total)} />
                            </span>
                        </button>
                        <AnimatePresence initial={false}>
                            {summaryOpen && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1, transition: { duration: dur.base, ease: ease.mist } }} exit={{ height: 0, opacity: 0, transition: { duration: exit(dur.base) } }} className="overflow-hidden">
                                    <ul className="mt-6 grid gap-3 text-[0.9375rem]">
                                        {cart.lines.map((l) => (
                                            <li key={l.id} className="flex justify-between gap-4">
                                                <span>
                                                    {l.product_name} <span className="text-ink-soft">· {l.variant_name} × {l.qty}</span>
                                                </span>
                                                <span className="t-num">{php(l.line_total)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <dl className="hair mt-5 grid gap-1.5 pt-4 text-[0.9375rem]">
                                        <SumRow label="Subtotal" value={php(cart.subtotal)} />
                                        {cart.discount > 0 && <SumRow label={`Code ${cart.coupon?.code}`} value={`−${php(cart.discount)}`} />}
                                        <SumRow label="Delivery" value={cart.delivery_fee ? php(cart.delivery_fee) : 'Free'} />
                                    </dl>
                                    <Link href="/cart" className="link-line t-label mt-4 inline-block">
                                        Edit cart
                                    </Link>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Step markers joined by a hairline that draws as steps complete */}
                    <ol className="relative mt-14 grid grid-cols-3" aria-label="Checkout steps">
                        <div className="bg-hair absolute top-[5px] right-[16.6%] left-[16.6%] h-px" aria-hidden>
                            <motion.div className="bg-pine h-px origin-left" animate={{ scaleX: step / 2 }} transition={{ duration: dur.slow, ease: ease.mist }} />
                        </div>
                        {STEPS.map((s, i) => (
                            <li key={s} className="relative flex flex-col items-center gap-3">
                                <span className={cn('h-[11px] w-[11px] rounded-full border transition-colors duration-500', i <= step ? 'bg-pine border-pine' : 'bg-mist border-hair-strong')} />
                                <button type="button" onClick={() => i < step && setStep(i)} disabled={i >= step} className={cn('text-[0.8125rem]', i === step ? 'text-pine' : 'text-ink-soft', i < step && 'link-line')} aria-current={i === step ? 'step' : undefined}>
                                    {s}
                                </button>
                            </li>
                        ))}
                    </ol>

                    <form onSubmit={submit} className="mt-14" noValidate>
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { duration: dur.base, ease: ease.mist } }} exit={{ opacity: 0, transition: { duration: exit(dur.quick) } }} className="grid gap-8">
                                {step === 0 && (
                                    <>
                                        <h2 className="font-display text-2xl font-light">Who's this for?</h2>
                                        {field('billing_name', 'Full name', { autoComplete: 'name' })}
                                        {field('billing_email', 'Email for your receipt', { type: 'email', autoComplete: 'email', inputMode: 'email' })}
                                        {field('billing_phone', 'Mobile number', { type: 'tel', autoComplete: 'tel', inputMode: 'tel', placeholder: '0917 123 4567' })}
                                    </>
                                )}

                                {step === 1 && (
                                    <>
                                        <h2 className="font-display text-2xl font-light">Where should it go?</h2>
                                        <div className="grid gap-8 sm:grid-cols-2">
                                            {field('shipping_recipient', 'Recipient', { autoComplete: 'shipping name' })}
                                            {field('shipping_phone', 'Recipient mobile', { type: 'tel', inputMode: 'tel', placeholder: '0917 123 4567' })}
                                        </div>
                                        {field('shipping_line1', 'House no., street, building', { autoComplete: 'shipping address-line1' })}
                                        <div className="grid gap-8 sm:grid-cols-2">
                                            {field('shipping_barangay', 'Barangay')}
                                            {field('shipping_city', 'City / municipality', { autoComplete: 'shipping address-level2' })}
                                        </div>
                                        <div className="grid gap-8 sm:grid-cols-2">
                                            {field('shipping_province', 'Province', { autoComplete: 'shipping address-level1' })}
                                            {field('shipping_postal_code', 'Postal code', { inputMode: 'numeric', maxLength: 4, autoComplete: 'shipping postal-code' })}
                                        </div>

                                        <fieldset>
                                            <legend className="field-label mb-3">Delivery window</legend>
                                            <div className="grid gap-3">
                                                {windows.map((w) => (
                                                    <Option key={w} name="delivery_window" checked={data.delivery_window === w} onChange={() => set('delivery_window', w)} label={w.split(' (')[0]} hint={w.match(/\((.*)\)/)?.[1]} />
                                                ))}
                                            </div>
                                        </fieldset>

                                        <div className="field">
                                            <label htmlFor="gift_note" className="field-label">
                                                Gift note <span className="text-ink-soft/70">(optional)</span>
                                            </label>
                                            <textarea id="gift_note" rows={2} maxLength={300} value={data.gift_note} onChange={(e) => set('gift_note', e.target.value)} className="field-input resize-none" placeholder="Handwritten on a card, tucked into the box." />
                                        </div>

                                        <label className="flex items-center gap-3 text-[0.9375rem]">
                                            <input type="checkbox" checked={data.save_address} onChange={(e) => setData('save_address', e.target.checked)} className="accent-pine h-4 w-4" />
                                            Save this address for next time
                                        </label>
                                    </>
                                )}

                                {step === 2 && (
                                    <>
                                        <h2 className="font-display text-2xl font-light">How would you like to pay?</h2>
                                        <div className="grid gap-3">
                                            <Option name="payment_method" checked={data.payment_method === 'card'} onChange={() => set('payment_method', 'card')} label="Card" hint="Visa or Mastercard" />
                                            <Option name="payment_method" checked={data.payment_method === 'gcash'} onChange={() => set('payment_method', 'gcash')} label="GCash" hint="Approved instantly in this demo" />
                                            <Option name="payment_method" checked={data.payment_method === 'cod'} onChange={() => set('payment_method', 'cod')} label="Cash on delivery" hint="Pay the courier" />
                                        </div>

                                        <AnimatePresence initial={false}>
                                            {data.payment_method === 'card' && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1, transition: { duration: dur.base, ease: ease.mist } }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                    <div className="grid gap-8 pt-2">
                                                        {field('card_name', 'Name on card', { autoComplete: 'cc-name' })}
                                                        <Field
                                                            label="Card number"
                                                            value={data.card_number}
                                                            onChange={(e) => set('card_number', e.target.value.replace(/\D/g, '').slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 '))}
                                                            onBlur={() => blur('card_number')}
                                                            error={allErrors.card_number}
                                                            inputMode="numeric"
                                                            autoComplete="cc-number"
                                                            placeholder="4242 4242 4242 4242"
                                                            className="[&_input]:font-mono [&_input]:text-[0.9375rem]"
                                                        />
                                                        <div className="grid grid-cols-2 gap-8">
                                                            <Field
                                                                label="Expiry"
                                                                value={data.card_expiry}
                                                                onChange={(e) => {
                                                                    const d = e.target.value.replace(/\D/g, '').slice(0, 4);
                                                                    set('card_expiry', d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
                                                                }}
                                                                onBlur={() => blur('card_expiry')}
                                                                error={allErrors.card_expiry}
                                                                inputMode="numeric"
                                                                autoComplete="cc-exp"
                                                                placeholder="MM/YY"
                                                            />
                                                            <Field label="CVC" value={data.card_cvc} onChange={(e) => set('card_cvc', e.target.value.replace(/\D/g, '').slice(0, 4))} onBlur={() => blur('card_cvc')} error={allErrors.card_cvc} inputMode="numeric" autoComplete="cc-csc" placeholder="123" />
                                                        </div>
                                                        <p className="t-label">Payments are simulated for this demo. Use 4242 4242 4242 4242 to approve, or 4000 0000 0000 0002 to see a decline.</p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <FieldMessage error={allErrors.cart} />

                                        <dl className="hair grid gap-1.5 pt-5 text-[0.9375rem]">
                                            <SumRow label="Subtotal" value={php(cart.subtotal)} />
                                            {cart.discount > 0 && <SumRow label={`Code ${cart.coupon?.code}`} value={`−${php(cart.discount)}`} />}
                                            <SumRow label="Delivery" value={cart.delivery_fee ? php(cart.delivery_fee) : 'Free'} />
                                            <div className="flex items-baseline justify-between pt-3">
                                                <dt>Total</dt>
                                                <dd className="font-display text-2xl font-light">{php(cart.total)}</dd>
                                            </div>
                                        </dl>
                                    </>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        <div className="mt-12 flex items-center justify-between gap-6">
                            {step > 0 ? (
                                <button type="button" onClick={() => setStep((s) => s - 1)} className="link-line text-[0.9375rem]">
                                    ← Back
                                </button>
                            ) : (
                                <Link href="/cart" className="link-line text-[0.9375rem]">
                                    ← Cart
                                </Link>
                            )}
                            {step < 2 ? (
                                <ActionButton type="submit" arrow>
                                    Continue
                                </ActionButton>
                            ) : (
                                <ActionButton type="submit" loading={processing}>
                                    {processing ? 'Processing…' : `Place order · ${php(cart.total)}`}
                                </ActionButton>
                            )}
                        </div>
                    </form>
                </div>
            </section>
        </>
    );
}

Checkout.layout = storeLayout;

function SumRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-baseline justify-between">
            <dt className="text-ink-soft">{label}</dt>
            <dd className="t-num text-[0.8125rem]">{value}</dd>
        </div>
    );
}

function Option({ name, checked, onChange, label, hint }: { name: string; checked: boolean; onChange: () => void; label: string; hint?: string }) {
    const id = useMemo(() => `${name}-${label.replace(/\W/g, '')}`, [name, label]);
    return (
        <label htmlFor={id} className={cn('flex min-h-[56px] cursor-pointer items-center justify-between gap-4 border px-5 transition-colors duration-300', checked ? 'border-pine' : 'border-hair hover:border-hair-strong')}>
            <span className="flex items-center gap-4">
                <input id={id} type="radio" name={name} checked={checked} onChange={onChange} className="accent-pine h-4 w-4" />
                <span className="text-[0.9375rem]">{label}</span>
            </span>
            {hint && <span className="t-label text-right">{hint}</span>}
        </label>
    );
}
