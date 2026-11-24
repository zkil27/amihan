import AdminLayout, { Panel, td, th } from '@/layouts/admin-layout';
import { num, php } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface Props {
    canReports: boolean;
    days: number;
    kpis: { revenue: number; orders: number; aov: number; conversion: number; abandonment: number; abandoned_carts: number; carts: number } | null;
    series: { date: string; orders: number; revenue: number }[];
    topProducts: { name: string; units: number; revenue: number }[];
    lowStock: { id: number; product_id: number; product: string; variant: string; stock: number; threshold: number }[];
    queue: { pending: number; confirmed: number; packed: number; returns: number };
}

/** Reporting and analytics. Fulfillment-only staff see the work queue, not the money. */
export default function Dashboard({ canReports, days, kpis, series, topProducts, lowStock, queue }: Props) {
    return (
        <AdminLayout
            title="Overview"
            actions={
                canReports && (
                    <div className="border-hair-strong inline-flex rounded-[2px] border text-[0.8125rem]">
                        {[7, 30].map((d) => (
                            <button key={d} onClick={() => router.get('/admin', { days: d }, { preserveScroll: true })} className={cn('h-8 px-3', days === d ? 'bg-pine text-mist' : 'hover:bg-paper')}>
                                {d} days
                            </button>
                        ))}
                    </div>
                )
            }
        >
            {/* Work queue */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <QueueTile label="New orders" value={queue.pending} href="/admin/orders?status=pending" />
                <QueueTile label="To pack" value={queue.confirmed} href="/admin/orders?status=confirmed" />
                <QueueTile label="Awaiting courier" value={queue.packed} href="/admin/orders?status=packed" />
                <QueueTile label="Return requests" value={queue.returns} href="/admin/returns" />
            </div>

            {canReports && kpis && (
                <>
                    <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-5">
                        <Kpi label="Revenue" value={php(kpis.revenue)} />
                        <Kpi label="Orders" value={num(kpis.orders)} />
                        <Kpi label="Average order" value={php(kpis.aov)} />
                        <Kpi label="Cart conversion" value={`${kpis.conversion}%`} hint={`${kpis.carts} carts with items`} />
                        <Kpi label="Cart abandonment" value={`${kpis.abandonment}%`} hint={`${kpis.abandoned_carts} idle over 1 hour`} />
                    </div>

                    <Panel title={`Sales, last ${days} days`} className="mt-8">
                        <SalesChart series={series} />
                    </Panel>
                </>
            )}

            <div className="mt-8 grid gap-8 xl:grid-cols-2">
                {canReports && (
                    <Panel title="Top products">
                        {topProducts.length === 0 ? (
                            <p className="text-ink-soft text-sm">No sales in this period yet.</p>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr>
                                        <th className={th}>Product</th>
                                        <th className={cn(th, 'text-right')}>Units</th>
                                        <th className={cn(th, 'text-right')}>Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topProducts.map((p) => (
                                        <tr key={p.name}>
                                            <td className={td}>{p.name}</td>
                                            <td className={cn(td, 't-num text-right')}>{p.units}</td>
                                            <td className={cn(td, 't-num text-right')}>{php(p.revenue)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </Panel>
                )}
                <Panel title="Low-stock alerts" aside={<span className="t-num text-clay text-[0.75rem]">{lowStock.length}</span>}>
                    {lowStock.length === 0 ? (
                        <p className="text-ink-soft text-sm">Everything is well stocked.</p>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className={th}>Item</th>
                                    <th className={cn(th, 'text-right')}>In stock</th>
                                    <th className={th}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {lowStock.map((v) => (
                                    <tr key={v.id}>
                                        <td className={td}>
                                            {v.product}
                                            <span className="text-ink-soft block text-[0.75rem]">{v.variant}</span>
                                        </td>
                                        <td className={cn(td, 't-num text-right', v.stock === 0 ? 'text-clay' : '')}>
                                            {v.stock} <span className="text-ink-soft">/ {v.threshold}</span>
                                        </td>
                                        <td className={cn(td, 'text-right')}>
                                            <Link href={`/admin/products/${v.product_id}/edit`} className="link-line text-[0.8125rem]">
                                                Restock
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </Panel>
            </div>
        </AdminLayout>
    );
}

function QueueTile({ label, value, href }: { label: string; value: number; href: string }) {
    return (
        <Link href={href} className="bg-paper border-hair hover:border-hair-strong block border p-4 transition-colors">
            <p className="text-ink-soft text-[0.8125rem]">{label}</p>
            <p className="font-display mt-2 text-[2rem] leading-none font-light">{value}</p>
        </Link>
    );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
    return (
        <div className="border-hair border-t pt-3">
            <p className="text-ink-soft text-[0.8125rem]">{label}</p>
            <p className="font-display mt-1 text-[1.625rem] leading-tight font-light">{value}</p>
            {hint && <p className="text-ink-soft mt-0.5 text-[0.75rem]">{hint}</p>}
        </div>
    );
}

/** Revenue per day as hairline-topped bars, drawn as inline SVG (no chart library). */
function SalesChart({ series }: { series: Props['series'] }) {
    const [hover, setHover] = useState<number | null>(null);
    const max = Math.max(1, ...series.map((s) => s.revenue));
    const W = 1000;
    const H = 220;
    const bw = W / series.length;
    const total = series.reduce((a, s) => a + s.revenue, 0);
    const h = hover != null ? series[hover] : null;

    return (
        <div>
            <div className="mb-4 flex h-10 items-baseline justify-between">
                <p className="text-[0.875rem]">
                    {h ? (
                        <>
                            {new Date(h.date).toLocaleDateString('en-PH', { weekday: 'short', day: 'numeric', month: 'short' })} · <span className="t-num">{php(h.revenue)}</span> · {h.orders} orders
                        </>
                    ) : (
                        <>
                            Total <span className="t-num">{php(total)}</span>
                        </>
                    )}
                </p>
                <p className="t-num text-ink-soft text-[0.75rem]">peak {php(max)}</p>
            </div>
            <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full" role="img" aria-label="Daily revenue chart" onMouseLeave={() => setHover(null)}>
                {[0.25, 0.5, 0.75, 1].map((f) => (
                    <line key={f} x1={0} x2={W} y1={H - H * f} y2={H - H * f} stroke="rgb(30 45 36 / 0.08)" />
                ))}
                {series.map((s, i) => {
                    const bh = (s.revenue / max) * (H - 8);
                    return (
                        <g key={s.date} onMouseEnter={() => setHover(i)}>
                            <rect x={i * bw} y={0} width={bw} height={H} fill="transparent" />
                            <rect x={i * bw + bw * 0.2} y={H - bh} width={bw * 0.6} height={bh} fill={hover === i ? '#B08D57' : '#1E2D24'} opacity={hover == null || hover === i ? 0.9 : 0.35} style={{ transition: 'opacity 200ms, fill 200ms' }} />
                        </g>
                    );
                })}
                <line x1={0} x2={W} y1={H} y2={H} stroke="rgb(30 45 36 / 0.3)" />
                {series.map((s, i) =>
                    i % Math.ceil(series.length / 6) === 0 ? (
                        <text key={s.date} x={i === 0 ? 0 : i * bw + bw / 2} y={H + 18} textAnchor={i === 0 ? 'start' : 'middle'} fontSize="12" fill="#55635a" fontFamily="Martian Mono, monospace">
                            {new Date(s.date).toLocaleDateString('en-PH', { day: 'numeric', month: 'short' })}
                        </text>
                    ) : null,
                )}
            </svg>
        </div>
    );
}
