import { FieldMessage } from '@/components/feedback';
import { useToast } from '@/components/feedback/toasts';
import AdminLayout, { AdminButton, inputCls, Panel, td, th } from '@/layouts/admin-layout';
import { dateTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Link, router, useForm } from '@inertiajs/react';
import { DragEvent, FormEvent, useMemo, useRef, useState } from 'react';

type Variant = { id?: number; sku: string; name: string; price: number | string; stock_qty: number | string; low_stock_threshold: number | string; is_active: boolean };

interface Product {
    id: number;
    name: string;
    slug: string;
    category_id: number;
    subtitle: string | null;
    origin: string | null;
    elevation_masl: number | null;
    process: string | null;
    tasting_notes: string | null;
    story: string | null;
    brew_guide: string | null;
    status: 'draft' | 'active' | 'archived';
    is_featured: boolean;
    variants: Variant[];
    images: { id: number; url: string; alt: string | null }[];
    movements: { id: number; variant: string | null; change: number; reason: string; note: string | null; at: string }[];
}

type FormShape = {
    name: string;
    category_id: number | string;
    subtitle: string;
    origin: string;
    elevation_masl: number | string;
    process: string;
    tasting_notes: string;
    story: string;
    brew_guide: string;
    status: 'draft' | 'active' | 'archived';
    is_featured: boolean;
    variants: Variant[];
    images: File[];
};

/** Create / edit a product: details, images (upload), variants with price and stock, category. */
export default function ProductForm({ product, categories }: { product: Product | null; categories: { id: number; name: string; is_archived: boolean }[] }) {
    const editing = !!product;
    const toast = useToast();
    const { data, setData, post, processing, errors, progress, reset } = useForm<FormShape>({
        name: product?.name ?? '',
        category_id: product?.category_id ?? categories[0]?.id ?? '',
        subtitle: product?.subtitle ?? '',
        origin: product?.origin ?? '',
        elevation_masl: product?.elevation_masl ?? '',
        process: product?.process ?? '',
        tasting_notes: product?.tasting_notes ?? '',
        story: product?.story ?? '',
        brew_guide: product?.brew_guide ?? '',
        status: product?.status ?? 'active',
        is_featured: product?.is_featured ?? false,
        variants: product?.variants ?? [{ sku: '', name: '250 g · Whole bean', price: '', stock_qty: 0, low_stock_threshold: 5, is_active: true }],
        images: [],
    });
    const [saved, setSaved] = useState(false);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        const url = editing ? `/admin/products/${product!.id}` : '/admin/products';
        post(url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset('images');
                setSaved(true);
                window.setTimeout(() => setSaved(false), 900);
            },
            onError: () => toast({ type: 'error', message: 'Please check the highlighted fields.' }),
        });
    };

    const setVariant = (i: number, key: keyof Variant, value: string | boolean) => setData('variants', data.variants.map((v, j) => (j === i ? { ...v, [key]: value } : v)));
    const addVariant = () => setData('variants', [...data.variants, { sku: '', name: '', price: '', stock_qty: 0, low_stock_threshold: 5, is_active: true }]);
    const removeVariant = (i: number) => setData('variants', data.variants.filter((_, j) => j !== i));

    const err = (k: string) => (errors as Record<string, string>)[k];

    return (
        <AdminLayout
            title={editing ? product!.name : 'New product'}
            actions={
                <div className="flex items-center gap-3">
                    {editing && (
                        <a href={`/pantry/${product!.slug}`} target="_blank" className="link-line text-[0.8125rem]" rel="noreferrer">
                            View in shop
                        </a>
                    )}
                    <Link href="/admin/products" className="link-line text-[0.8125rem]">
                        All products
                    </Link>
                </div>
            }
        >
            <form onSubmit={submit} className={cn('grid gap-8 transition-colors duration-700 xl:grid-cols-[1fr_380px]', saved && '[&>div>section:first-child]:bg-mist')}>
                <div className="grid content-start gap-8">
                    <Panel title="Details">
                        <div className="grid gap-5 md:grid-cols-2">
                            <AField label="Name" error={err('name')} className="md:col-span-2">
                                <input className={inputCls} value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                            </AField>
                            <AField label="Subtitle" error={err('subtitle')} className="md:col-span-2">
                                <input className={inputCls} value={data.subtitle} onChange={(e) => setData('subtitle', e.target.value)} />
                            </AField>
                            <AField label="Origin" error={err('origin')}>
                                <input className={inputCls} value={data.origin} onChange={(e) => setData('origin', e.target.value)} placeholder="Atok, Benguet" />
                            </AField>
                            <AField label="Elevation (MASL)" error={err('elevation_masl')}>
                                <input className={inputCls} type="number" value={data.elevation_masl} onChange={(e) => setData('elevation_masl', e.target.value)} />
                            </AField>
                            <AField label="Process" error={err('process')}>
                                <input className={inputCls} value={data.process} onChange={(e) => setData('process', e.target.value)} placeholder="Washed, natural, honey" />
                            </AField>
                            <AField label="Tasting notes" error={err('tasting_notes')}>
                                <input className={inputCls} value={data.tasting_notes} onChange={(e) => setData('tasting_notes', e.target.value)} />
                            </AField>
                            <AField label="Story" error={err('story')} className="md:col-span-2">
                                <textarea className={cn(inputCls, 'h-24 py-2')} value={data.story} onChange={(e) => setData('story', e.target.value)} />
                            </AField>
                            <AField label="Brew guide" error={err('brew_guide')} className="md:col-span-2">
                                <textarea className={cn(inputCls, 'h-20 py-2')} value={data.brew_guide} onChange={(e) => setData('brew_guide', e.target.value)} />
                            </AField>
                        </div>
                    </Panel>

                    <Panel title="Options, price and stock" aside={<AdminButton type="button" variant="line" onClick={addVariant}>Add option</AdminButton>}>
                        <FieldMessage error={err('variants')} />
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px]">
                                <thead>
                                    <tr>
                                        <th className={th}>Option</th>
                                        <th className={th}>SKU</th>
                                        <th className={th}>Price (₱)</th>
                                        <th className={th}>Stock</th>
                                        <th className={th}>Alert at</th>
                                        <th className={th}>On sale</th>
                                        <th className={th}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.variants.map((v, i) => (
                                        <tr key={v.id ?? `new-${i}`}>
                                            <td className={td}>
                                                <input className={inputCls} value={v.name} onChange={(e) => setVariant(i, 'name', e.target.value)} placeholder="250 g · Whole bean" aria-invalid={!!err(`variants.${i}.name`)} />
                                            </td>
                                            <td className={td}>
                                                <input className={cn(inputCls, 'font-mono text-[0.75rem]')} value={v.sku} onChange={(e) => setVariant(i, 'sku', e.target.value.toUpperCase())} aria-invalid={!!err(`variants.${i}.sku`)} />
                                            </td>
                                            <td className={td}>
                                                <input className={cn(inputCls, 'w-24')} type="number" min={1} step="0.01" value={v.price} onChange={(e) => setVariant(i, 'price', e.target.value)} aria-invalid={!!err(`variants.${i}.price`)} />
                                            </td>
                                            <td className={td}>
                                                <input className={cn(inputCls, 'w-20')} type="number" min={0} value={v.stock_qty} onChange={(e) => setVariant(i, 'stock_qty', e.target.value)} />
                                            </td>
                                            <td className={td}>
                                                <input className={cn(inputCls, 'w-16')} type="number" min={0} value={v.low_stock_threshold} onChange={(e) => setVariant(i, 'low_stock_threshold', e.target.value)} />
                                            </td>
                                            <td className={cn(td, 'text-center')}>
                                                <input type="checkbox" className="accent-pine" checked={v.is_active} onChange={(e) => setVariant(i, 'is_active', e.target.checked)} aria-label="On sale" />
                                            </td>
                                            <td className={cn(td, 'text-right')}>
                                                {data.variants.length > 1 && (
                                                    <button type="button" onClick={() => removeVariant(i)} className="text-ink-soft hover:text-clay text-[0.8125rem]">
                                                        Remove
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {Object.keys(errors).filter((k) => k.startsWith('variants.')).length > 0 && (
                            <p className="field-error mt-3">{Object.entries(errors).filter(([k]) => k.startsWith('variants.')).map(([, v]) => v)[0]}</p>
                        )}
                        {editing && <StockAdjust variants={product!.variants} />}
                    </Panel>

                    {editing && product!.movements.length > 0 && (
                        <Panel title="Inventory ledger">
                            <table className="w-full">
                                <thead>
                                    <tr>
                                        <th className={th}>When</th>
                                        <th className={th}>Option</th>
                                        <th className={th}>Reason</th>
                                        <th className={cn(th, 'text-right')}>Change</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {product!.movements.map((m) => (
                                        <tr key={m.id}>
                                            <td className={cn(td, 'text-ink-soft')}>{dateTime(m.at)}</td>
                                            <td className={td}>{m.variant}</td>
                                            <td className={td}>
                                                {m.reason}
                                                {m.note && <span className="text-ink-soft"> · {m.note}</span>}
                                            </td>
                                            <td className={cn(td, 't-num text-right', m.change < 0 ? 'text-clay' : 'text-pine')}>{m.change > 0 ? `+${m.change}` : m.change}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Panel>
                    )}
                </div>

                <div className="grid content-start gap-8">
                    <Panel title="Publishing">
                        <div className="grid gap-5">
                            <AField label="Status" error={err('status')}>
                                <select className={inputCls} value={data.status} onChange={(e) => setData('status', e.target.value as FormShape['status'])}>
                                    <option value="active">Active (in the shop)</option>
                                    <option value="draft">Draft (hidden)</option>
                                    <option value="archived">Archived (hidden, kept for history)</option>
                                </select>
                            </AField>
                            <AField label="Category" error={err('category_id')}>
                                <select className={inputCls} value={data.category_id} onChange={(e) => setData('category_id', e.target.value)}>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                            {c.is_archived ? ' (archived)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </AField>
                            <label className="flex items-center gap-3 text-[0.875rem]">
                                <input type="checkbox" className="accent-pine" checked={data.is_featured} onChange={(e) => setData('is_featured', e.target.checked)} />
                                Feature on the home page
                            </label>
                            <AdminButton type="submit" disabled={processing} className="w-full">
                                {processing ? 'Saving…' : saved ? 'Saved' : editing ? 'Save changes' : 'Create product'}
                            </AdminButton>
                        </div>
                    </Panel>

                    <Panel title="Images">
                        {editing && product!.images.length > 0 && (
                            <div className="mb-4 grid grid-cols-3 gap-2">
                                {product!.images.map((img) => (
                                    <div key={img.id} className="group bg-mist-deep relative aspect-[4/5] overflow-hidden">
                                        <img src={img.url} alt={img.alt ?? ''} className="h-full w-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => confirm('Remove this image?') && router.delete(`/admin/product-images/${img.id}`, { preserveScroll: true })}
                                            className="bg-mist/90 text-clay absolute inset-x-0 bottom-0 py-1 text-[0.75rem] opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <Dropzone files={data.images} onChange={(f) => setData('images', f)} progress={progress?.percentage} />
                        <FieldMessage error={err('images') ?? Object.entries(errors).find(([k]) => k.startsWith('images.'))?.[1]} />
                    </Panel>

                    {editing && <DangerZone product={product!} />}
                </div>
            </form>
        </AdminLayout>
    );
}

function AField({ label, error, className, children }: { label: string; error?: string; className?: string; children: React.ReactNode }) {
    return (
        <label className={cn('grid gap-1.5', className)}>
            <span className="text-ink-soft text-[0.75rem]">{label}</span>
            {children}
            <FieldMessage error={error} />
        </label>
    );
}

/** File upload with drag & drop, previews and a progress hairline. */
function Dropzone({ files, onChange, progress }: { files: File[]; onChange: (f: File[]) => void; progress?: number }) {
    const input = useRef<HTMLInputElement>(null);
    const [over, setOver] = useState(false);
    const previews = useMemo(() => files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) })), [files]);

    const add = (list: FileList | null) => {
        if (!list) return;
        onChange([...files, ...Array.from(list).filter((f) => f.type.startsWith('image/'))].slice(0, 6));
    };

    const drop = (e: DragEvent) => {
        e.preventDefault();
        setOver(false);
        add(e.dataTransfer.files);
    };

    return (
        <div>
            <button
                type="button"
                onClick={() => input.current?.click()}
                onDragOver={(e) => {
                    e.preventDefault();
                    setOver(true);
                }}
                onDragLeave={() => setOver(false)}
                onDrop={drop}
                className={cn('flex h-28 w-full flex-col items-center justify-center gap-1 border border-dashed text-[0.8125rem] transition-colors duration-300', over ? 'border-pine bg-mist' : 'border-hair-strong')}
            >
                <span>Drop images here or click to upload</span>
                <span className="text-ink-soft text-[0.75rem]">JPG, PNG or WebP · up to 4 MB each</span>
            </button>
            <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => add(e.target.files)} />
            {previews.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                    {previews.map((p, i) => (
                        <div key={p.url} className="bg-mist-deep relative aspect-[4/5] overflow-hidden">
                            <img src={p.url} alt="" className="h-full w-full object-cover" />
                            <button type="button" onClick={() => onChange(files.filter((_, j) => j !== i))} className="bg-mist/90 absolute top-1 right-1 px-1.5 text-[0.75rem]" aria-label={`Remove ${p.name}`}>
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
            {progress != null && (
                <div className="bg-hair mt-3 h-px">
                    <div className="bg-pine h-px transition-[width] duration-200" style={{ width: `${progress}%` }} />
                </div>
            )}
            {files.length > 0 && <p className="text-ink-soft mt-2 text-[0.75rem]">{files.length} new image(s) will upload when you save.</p>}
        </div>
    );
}

/** Quick stock adjustment, logged in the inventory ledger. */
function StockAdjust({ variants }: { variants: Variant[] }) {
    const [variantId, setVariantId] = useState(variants[0]?.id);
    const { data, setData, post, processing, errors, reset } = useForm({ change: '', note: '' });
    return (
        <div className="border-hair mt-6 grid gap-3 border-t pt-5 md:grid-cols-[1.2fr_0.6fr_1fr_auto] md:items-end">
            <AField label="Adjust stock for">
                <select className={inputCls} value={variantId} onChange={(e) => setVariantId(Number(e.target.value))}>
                    {variants.map((v) => (
                        <option key={v.id} value={v.id}>
                            {v.name} ({v.stock_qty} in stock)
                        </option>
                    ))}
                </select>
            </AField>
            <AField label="+ / −" error={errors.change}>
                <input className={inputCls} type="number" value={data.change} onChange={(e) => setData('change', e.target.value)} placeholder="+12" />
            </AField>
            <AField label="Note">
                <input className={inputCls} value={data.note} onChange={(e) => setData('note', e.target.value)} placeholder="Roast delivered" />
            </AField>
            <AdminButton
                type="button"
                variant="line"
                disabled={processing || !data.change}
                onClick={() => post(`/admin/variants/${variantId}/stock`, { preserveScroll: true, onSuccess: () => reset() })}
            >
                Apply
            </AdminButton>
        </div>
    );
}

function DangerZone({ product }: { product: Product }) {
    return (
        <Panel title="Archive or delete">
            <p className="text-ink-soft mb-4 text-[0.8125rem]">Archiving hides the product but keeps it ready to return. Deleting removes it from the catalog; past orders keep their records.</p>
            <div className="flex flex-wrap gap-3">
                <AdminButton type="button" variant="line" onClick={() => router.post(`/admin/products/${product.id}/archive`, {}, { preserveScroll: true })}>
                    {product.status === 'archived' ? 'Restore to shop' : 'Archive'}
                </AdminButton>
                <AdminButton type="button" variant="danger" onClick={() => confirm(`Delete ${product.name}? Past orders are kept.`) && router.delete(`/admin/products/${product.id}`)}>
                    Delete
                </AdminButton>
            </div>
        </Panel>
    );
}
