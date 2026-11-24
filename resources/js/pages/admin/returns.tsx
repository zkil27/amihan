import { StatusPill } from '@/components/feedback';
import AdminLayout, { AdminButton, inputCls } from '@/layouts/admin-layout';
import { dateTime, php, statusLabel } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface Req {
    id: number;
    type: 'cancellation' | 'return';
    reason: string;
    details: string | null;
    status: string;
    admin_note: string | null;
    created_at: string;
    order_no: string;
    order_status: string;
    total: number;
    customer: string;
    payment: string | null;
    refund: { amount: number; ref: string } | null;
}

/** Refund and return processing: approve (restock + refund) or decline with a reason. */
export default function Returns({ requests, status }: { requests: Req[]; status: string }) {
    return (
        <AdminLayout title="Returns & cancellations">
            <div className="mb-5 flex flex-wrap gap-1 text-[0.8125rem]">
                {['requested', 'completed', 'rejected', 'all'].map((s) => (
                    <button key={s} onClick={() => router.get('/admin/returns', { status: s }, { preserveState: true })} className={cn('h-8 rounded-[2px] px-3', status === s ? 'bg-pine text-mist' : 'hover:bg-paper')}>
                        {s === 'all' ? 'All' : statusLabel(s)}
                    </button>
                ))}
            </div>
            {requests.length === 0 ? (
                <p className="text-ink-soft bg-paper border-hair border p-10 text-center text-[0.875rem]">Nothing waiting. All quiet on the ridge.</p>
            ) : (
                <div className="grid gap-4">
                    {requests.map((r) => (
                        <RequestCard key={r.id} r={r} />
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}

function RequestCard({ r }: { r: Req }) {
    const [note, setNote] = useState('');
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState<string | undefined>();

    const act = (kind: 'approve' | 'reject') => {
        setBusy(true);
        setErr(undefined);
        router.post(`/admin/returns/${r.id}/${kind}`, { note }, { preserveScroll: true, onError: (e) => setErr(e.note), onFinish: () => setBusy(false) });
    };

    return (
        <article className="bg-paper border-hair grid gap-5 border p-5 md:grid-cols-[1fr_320px]">
            <div>
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[0.9375rem] font-medium">{r.type === 'cancellation' ? 'Cancellation' : 'Return'}</span>
                    <StatusPill status={r.status} label={statusLabel(r.status)} />
                    <Link href={`/admin/orders/${r.order_no}`} className="t-num link-line text-[0.8125rem]">
                        {r.order_no}
                    </Link>
                </div>
                <p className="mt-3 text-[0.875rem]">
                    <span className="text-ink-soft">Reason:</span> {r.reason}
                </p>
                {r.details && <p className="text-ink-soft mt-1 text-[0.875rem]">“{r.details}”</p>}
                <p className="text-ink-soft mt-3 text-[0.8125rem]">
                    {r.customer} · {dateTime(r.created_at)} · order {statusLabel(r.order_status).toLowerCase()} · {php(r.total)} · {r.payment}
                </p>
                {r.refund && (
                    <p className="mt-2 text-[0.8125rem]">
                        Refunded {php(r.refund.amount)} · <span className="t-num">{r.refund.ref}</span>
                    </p>
                )}
                {r.admin_note && <p className="mt-2 text-[0.8125rem] italic">Note: {r.admin_note}</p>}
            </div>
            {r.status === 'requested' && (
                <div className="grid content-start gap-2">
                    <input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note to customer (required to decline)" aria-invalid={!!err} />
                    {err && <p className="field-error">{err}</p>}
                    <div className="flex gap-2">
                        <AdminButton disabled={busy} onClick={() => act('approve')} className="flex-1">
                            Approve, restock & refund
                        </AdminButton>
                        <AdminButton variant="line" disabled={busy} onClick={() => act('reject')}>
                            Decline
                        </AdminButton>
                    </div>
                </div>
            )}
        </article>
    );
}
