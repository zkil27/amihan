import { ActionButton, FieldMessage, NumberFade, Plate } from '@/components/feedback';
import { useCartDrawer } from '@/components/store/cart-drawer';
import { ProductCard } from '@/components/store/product-card';
import { masl, php } from '@/lib/format';
import { cn } from '@/lib/utils';
import { storeLayout } from '@/layouts/store-layout';
import { dur, ease } from '@/motion/tokens';
import { useReveal } from '@/motion/use-reveal';
import { ProductCard as Card, ProductDetail } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

interface Props {
    product: ProductDetail;
    related: Card[];
}

export default function Show({ product, related }: Props) {
    const root = useRef<HTMLDivElement>(null);
    useReveal(root, [product.id]);
    const { setOpen } = useCartDrawer();

    const firstAvailable = product.variants.find((v) => v.stock > 0) ?? product.variants[0];
    const [variantId, setVariantId] = useState(firstAvailable?.id);
    const variant = product.variants.find((v) => v.id === variantId) ?? firstAvailable;
    const [image, setImage] = useState(0);

    const { data, setData, post, processing, errors, clearErrors } = useForm({ variant_id: variant?.id ?? 0, qty: 1 });
    const [added, setAdded] = useState(0);
    const [showNote, setShowNote] = useState(false);

    useEffect(() => {
        setData((d) => ({ ...d, variant_id: variant?.id ?? 0, qty: 1 }));
        clearErrors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [variant?.id]);

    // "Added" shows for 1.4 s; the quiet "In your cart · View" line for 4 s.
    useEffect(() => {
        if (!added) return;
        setShowNote(true);
        const a = window.setTimeout(() => setAdded(0), 1400);
        const b = window.setTimeout(() => setShowNote(false), 4000);
        return () => {
            window.clearTimeout(a);
            window.clearTimeout(b);
        };
    }, [added]);

    const add = () =>
        post(route('cart.items.store'), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => setAdded(Date.now()),
        });

    const soldOut = !variant || variant.stock === 0;
    const maxQty = Math.min(20, variant?.stock ?? 0);

    return (
        <div ref={root}>
            <Head title={product.name} />
            {product.elevation_masl != null && (
                <>
                    <span data-masl="0" className="absolute top-0" />
                    <span data-masl={product.elevation_masl} className="absolute top-[60vh]" />
                </>
            )}

            <section className="pt-[calc(var(--header-h)+clamp(24px,6vh,72px))] pb-[var(--section-y)]">
                <div className="wrap">
                    <nav className="t-label mb-10" aria-label="Breadcrumb">
                        <Link href="/pantry" className="link-line">
                            Pantry
                        </Link>
                        {product.category && <span> / {product.category}</span>}
                    </nav>

                    <div className="grid gap-12 md:grid-cols-12 md:gap-8">
                        {/* Images */}
                        <div className="md:col-span-6">
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.div key={image} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: dur.slow, ease: ease.mist } }} exit={{ opacity: 0, transition: { duration: dur.quick } }}>
                                    <Plate
                                        src={product.images[image]?.url ?? product.image}
                                        alt={product.images[image]?.alt ?? product.name}
                                        label={product.category ?? undefined}
                                        priority
                                        style={{ viewTransitionName: `product-${product.id}` } as React.CSSProperties}
                                    />
                                </motion.div>
                            </AnimatePresence>
                            {product.images.length > 1 && (
                                <div className="mt-4 flex gap-3">
                                    {product.images.map((img, i) => (
                                        <button key={img.id} onClick={() => setImage(i)} className={cn('w-16 transition-opacity', i === image ? 'opacity-100' : 'opacity-50 hover:opacity-80')} aria-label={`Image ${i + 1}`} aria-pressed={i === image}>
                                            <Plate src={img.url} alt="" ratio="1 / 1" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Buy box */}
                        <div className="md:col-span-5 md:col-start-8 md:pt-8">
                            {product.elevation_masl != null && <p className="t-num text-brass-deep">{masl(product.elevation_masl)}</p>}
                            <h1 className="t-display t-h1 mt-4">{product.name}</h1>
                            <p className="t-lede mt-4">{product.subtitle}</p>
                            {product.origin && <p className="t-label mt-2">{product.origin}</p>}

                            <p className="font-display mt-10 text-3xl font-light">
                                <NumberFade value={php(variant?.price)} />
                            </p>

                            {/* Variant picker: the underline glides to the choice */}
                            {product.variants.length > 1 && (
                                <fieldset className="mt-10">
                                    <legend className="t-label mb-3">Size</legend>
                                    <div className="flex flex-wrap gap-x-8 gap-y-3">
                                        {product.variants.map((v) => (
                                            <button
                                                key={v.id}
                                                onClick={() => setVariantId(v.id)}
                                                aria-pressed={v.id === variant?.id}
                                                disabled={v.stock === 0}
                                                className={cn('relative min-h-[40px] text-[0.9375rem] transition-colors disabled:line-through disabled:opacity-40', v.id === variant?.id ? 'text-pine' : 'text-ink-soft hover:text-pine')}
                                            >
                                                {v.name}
                                                {v.id === variant?.id && <motion.span layoutId="variant-line" className="bg-pine absolute inset-x-0 bottom-1 h-px" transition={{ duration: dur.base, ease: ease.mist }} />}
                                            </button>
                                        ))}
                                    </div>
                                </fieldset>
                            )}

                            <AnimatePresence initial={false}>
                                {variant?.low && (
                                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="t-label mt-4">
                                        Only {variant.stock} left.
                                    </motion.p>
                                )}
                            </AnimatePresence>

                            {/* Quantity + add */}
                            <div className="mt-10 flex items-stretch gap-4">
                                <div className="border-hair-strong inline-flex items-center border">
                                    <button className="flex h-full w-12 items-center justify-center disabled:opacity-30" onClick={() => setData('qty', Math.max(1, data.qty - 1))} disabled={data.qty <= 1 || soldOut} aria-label="One fewer">
                                        −
                                    </button>
                                    <span className="t-num w-8 text-center">
                                        <NumberFade value={data.qty} />
                                    </span>
                                    <button className="flex h-full w-12 items-center justify-center disabled:opacity-30" onClick={() => setData('qty', Math.min(maxQty, data.qty + 1))} disabled={data.qty >= maxQty || soldOut} aria-label="One more">
                                        +
                                    </button>
                                </div>
                                <ActionButton onClick={add} loading={processing} done={!!added} doneLabel="Added" disabled={soldOut} className="flex-1">
                                    {soldOut ? 'Sold out' : 'Add to cart'}
                                </ActionButton>
                            </div>
                            {data.qty >= maxQty && !soldOut && <p className="t-label mt-3">That's all we have.</p>}
                            <FieldMessage error={errors.qty ?? errors.variant_id} />

                            <div className="h-6">
                                <AnimatePresence>
                                    {showNote && (
                                        <motion.p className="t-label mt-3" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: dur.quick } }} exit={{ opacity: 0, transition: { duration: dur.base } }}>
                                            In your cart ·{' '}
                                            <button className="link-line text-pine" onClick={() => setOpen(true)}>
                                                View
                                            </button>
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>

                            {product.story && <p className="mt-10 text-[1.0625rem] leading-relaxed">{product.story}</p>}

                            {/* Details behind hairline accordions */}
                            <div className="mt-12">
                                {product.tasting_notes && <Accordion title="Tasting notes">{product.tasting_notes}{product.process ? `. ${product.process} process.` : ''}</Accordion>}
                                {product.brew_guide && <Accordion title="Brew guide">{product.brew_guide}</Accordion>}
                                <Accordion title="Delivery & returns">
                                    ₱150 delivery nationwide, free over ₱2,000. Choose a Morning Breeze or Afternoon Hearth window at checkout. Unopened items can be returned within 7 days of delivery from your account.
                                </Accordion>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {related.length > 0 && (
                <section className="hair pb-[var(--section-y)]">
                    <div className="wrap pt-[clamp(64px,10vh,120px)]">
                        <h2 className="t-display t-h3" data-reveal="lines">
                            From the same shelf
                        </h2>
                        <div className="mt-14 grid gap-x-[clamp(24px,4vw,64px)] gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
                            {related.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}

Show.layout = storeLayout;

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="hair">
            <button onClick={() => setOpen((o) => !o)} className="flex min-h-[56px] w-full items-center justify-between text-left text-[0.9375rem]" aria-expanded={open}>
                {title}
                <span className={cn('text-ink-soft transition-transform duration-300', open && 'rotate-45')} aria-hidden>
                    +
                </span>
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1, transition: { duration: dur.base, ease: ease.mist } }} exit={{ height: 0, opacity: 0, transition: { duration: dur.quick } }} className="overflow-hidden">
                        <p className="text-ink-soft pb-6 leading-relaxed">{children}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
