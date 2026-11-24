import { NumberFade } from '@/components/feedback';
import { ProductCard } from '@/components/store/product-card';
import { cn } from '@/lib/utils';
import { storeLayout } from '@/layouts/store-layout';
import { dur, ease } from '@/motion/tokens';
import { ProductCard as Card } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'motion/react';
import { FormEvent, useEffect, useRef, useState } from 'react';

interface Filters {
    q: string;
    category: string;
    origin: string;
    altitude: string;
    sort: string;
}

interface Props {
    products: { data: Card[]; total: number; current_page: number; last_page: number };
    filters: Filters;
    options: { categories: { name: string; slug: string }[]; origins: string[] };
}

const ALTITUDE = [
    { value: 'low', label: 'Below 1,000 m' },
    { value: 'mid', label: '1,000 to 1,499 m' },
    { value: 'high', label: '1,500 m and above' },
];

const SORT = [
    { value: 'featured', label: 'Featured' },
    { value: 'altitude', label: 'Highest first' },
    { value: 'price_asc', label: 'Price, low to high' },
    { value: 'price_desc', label: 'Price, high to low' },
    { value: 'newest', label: 'Newest' },
];

/**
 * The catalog: browse, search, filter, sort. Filters live in the URL
 * (shareable, back-button friendly) and are applied on the server.
 */
export default function Pantry({ products, filters, options }: Props) {
    const [loading, setLoading] = useState(false);
    const [q, setQ] = useState(filters.q);
    const [sheet, setSheet] = useState(false);

    const apply = (next: Partial<Filters>) => {
        const merged = { ...filters, ...next };
        const query = Object.fromEntries(Object.entries(merged).filter(([k, v]) => v && !(k === 'sort' && v === 'featured')));
        router.get(route('pantry.index'), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => setLoading(true),
            onFinish: () => setLoading(false),
        });
    };

    // Search as you type, gently debounced.
    const first = useRef(true);
    useEffect(() => {
        if (first.current) {
            first.current = false;
            return;
        }
        const t = window.setTimeout(() => q !== filters.q && apply({ q }), 350);
        return () => window.clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q]);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        apply({ q });
    };

    const active = [
        filters.category && { key: 'category', label: options.categories.find((c) => c.slug === filters.category)?.name ?? filters.category },
        filters.origin && { key: 'origin', label: filters.origin },
        filters.altitude && { key: 'altitude', label: ALTITUDE.find((a) => a.value === filters.altitude)?.label ?? filters.altitude },
        filters.q && { key: 'q', label: `“${filters.q}”` },
    ].filter(Boolean) as { key: keyof Filters; label: string }[];

    const Refine = (
        <div className="grid gap-10 md:grid-cols-4 md:gap-8">
            <Group title="Category">
                <Choice label="All" on={!filters.category} onClick={() => apply({ category: '' })} />
                {options.categories.map((c) => (
                    <Choice key={c.slug} label={c.name} on={filters.category === c.slug} onClick={() => apply({ category: c.slug })} />
                ))}
            </Group>
            <Group title="Origin">
                <Choice label="Anywhere" on={!filters.origin} onClick={() => apply({ origin: '' })} />
                {options.origins.map((o) => (
                    <Choice key={o} label={o} on={filters.origin === o} onClick={() => apply({ origin: o })} />
                ))}
            </Group>
            <Group title="Altitude">
                <Choice label="Any height" on={!filters.altitude} onClick={() => apply({ altitude: '' })} />
                {ALTITUDE.map((a) => (
                    <Choice key={a.value} label={a.label} on={filters.altitude === a.value} onClick={() => apply({ altitude: a.value })} />
                ))}
            </Group>
            <Group title="Sort">
                {SORT.map((s) => (
                    <Choice key={s.value} label={s.label} on={filters.sort === s.value} onClick={() => apply({ sort: s.value })} />
                ))}
            </Group>
        </div>
    );

    return (
        <>
            <Head title="Highland Pantry" />
            <section className="pt-[calc(var(--header-h)+clamp(48px,10vh,120px))]">
                <div className="wrap">
                    <h1 className="t-display t-h1">Highland Pantry</h1>
                    <p className="t-lede mt-6">Whole beans by altitude, bottled slow drip, ritual kits and bakes from the hearth. Delivered nationwide.</p>

                    {/* Search + refine */}
                    <div className="hair mt-16 flex flex-col gap-6 pt-8 md:flex-row md:items-end md:justify-between">
                        <form onSubmit={submit} className="w-full md:max-w-md" role="search">
                            <label htmlFor="search" className="field-label">
                                Search the pantry
                            </label>
                            <input id="search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Atok, honey process, bibingka…" className="field-input" />
                        </form>
                        <div className="flex items-baseline justify-between gap-8 md:justify-end">
                            <p className="t-label" aria-live="polite">
                                <span className="t-num text-pine">
                                    <NumberFade value={products.total} />
                                </span>{' '}
                                {products.total === 1 ? 'item' : 'items'}
                            </p>
                            <button onClick={() => setSheet((s) => !s)} className="link-line text-[0.9375rem] max-md:hidden" aria-expanded={sheet}>
                                {sheet ? 'Close' : 'Refine'}
                            </button>
                            <MobileRefine>{Refine}</MobileRefine>
                        </div>
                    </div>

                    {/* Desktop refine row */}
                    <AnimatePresence initial={false}>
                        {sheet && (
                            <motion.div
                                className="hidden overflow-hidden md:block"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1, transition: { duration: dur.base, ease: ease.mist } }}
                                exit={{ height: 0, opacity: 0, transition: { duration: dur.quick } }}
                            >
                                <div className="pt-10 pb-4">{Refine}</div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Active filters */}
                    <AnimatePresence initial={false}>
                        {active.length > 0 && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-6 text-[0.9375rem]">
                                    {active.map((a) => (
                                        <button key={a.key} onClick={() => (a.key === 'q' ? (setQ(''), apply({ q: '' })) : apply({ [a.key]: '' }))} className="text-pine inline-flex items-center gap-2" aria-label={`Remove filter ${a.label}`}>
                                            {a.label} <span className="text-ink-soft">✕</span>
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => {
                                            setQ('');
                                            apply({ q: '', category: '', origin: '', altitude: '' });
                                        }}
                                        className="link-line t-label"
                                    >
                                        Clear all
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            <section className="pb-[var(--section-y)]">
                <div className="wrap">
                    <div className={cn('mt-14 transition-opacity duration-300 md:mt-20', loading && 'opacity-40')}>
                        {products.data.length === 0 ? (
                            <p className="font-display t-h3 py-24 font-light">Nothing at this altitude. Try fewer filters.</p>
                        ) : (
                            <div className="grid gap-x-[clamp(24px,4vw,64px)] gap-y-16 sm:grid-cols-2 lg:grid-cols-3 md:gap-y-24">
                                {products.data.map((p, i) => (
                                    <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: dur.slow, ease: ease.mist } }}>
                                        <ProductCard product={p} priority={i < 3} />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {products.last_page > 1 && (
                        <nav className="hair mt-24 flex items-center justify-between pt-8" aria-label="Pages">
                            <PageLink page={products.current_page - 1} disabled={products.current_page <= 1} label="← Previous" />
                            <span className="t-num text-ink-soft">
                                {products.current_page} / {products.last_page}
                            </span>
                            <PageLink page={products.current_page + 1} disabled={products.current_page >= products.last_page} label="Next →" />
                        </nav>
                    )}
                </div>
            </section>
        </>
    );
}

Pantry.layout = storeLayout;

function PageLink({ page, disabled, label }: { page: number; disabled: boolean; label: string }) {
    if (disabled) return <span className="t-label opacity-40">{label}</span>;
    const url = new URL(window.location.href);
    url.searchParams.set('page', String(page));
    return (
        <Link href={url.pathname + url.search} className="link-line text-[0.9375rem]" preserveScroll={false}>
            {label}
        </Link>
    );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <fieldset>
            <legend className="t-label mb-4">{title}</legend>
            <div className="flex flex-col items-start gap-2.5">{children}</div>
        </fieldset>
    );
}

function Choice({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
    return (
        <button onClick={onClick} aria-pressed={on} className={cn('relative min-h-[32px] text-left text-[0.9375rem] transition-colors', on ? 'text-pine' : 'text-ink-soft hover:text-pine')}>
            {on && <span className="bg-brass absolute top-1/2 -left-3.5 h-1 w-1 -translate-y-1/2 rounded-full" aria-hidden />}
            {label}
        </button>
    );
}

/** Phones: filters in a bottom sheet. */
function MobileRefine({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger className="link-line text-[0.9375rem] md:hidden">Refine</Dialog.Trigger>
            <AnimatePresence>
                {open && (
                    <Dialog.Portal forceMount>
                        <Dialog.Overlay asChild forceMount>
                            <motion.div className="fixed inset-0 z-[70] bg-[rgb(234_231_225/0.72)]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
                        </Dialog.Overlay>
                        <Dialog.Content asChild forceMount aria-describedby={undefined}>
                            <motion.div
                                className="bg-mist fixed inset-x-0 bottom-0 z-[71] max-h-[86dvh] overflow-y-auto px-6 pt-6 pb-[calc(24px+env(safe-area-inset-bottom))]"
                                initial={{ y: '100%' }}
                                animate={{ y: 0, transition: { duration: dur.base, ease: ease.mist } }}
                                exit={{ y: '100%', transition: { duration: dur.quick } }}
                                data-lenis-prevent
                            >
                                <div className="mb-8 flex items-center justify-between">
                                    <Dialog.Title className="font-display text-2xl font-light">Refine</Dialog.Title>
                                    <Dialog.Close className="link-line t-label">Done</Dialog.Close>
                                </div>
                                {children}
                            </motion.div>
                        </Dialog.Content>
                    </Dialog.Portal>
                )}
            </AnimatePresence>
        </Dialog.Root>
    );
}
