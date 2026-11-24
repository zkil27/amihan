import { Logo } from '@/components/brand/logo';
import { StatusPill } from '@/components/feedback';
import { ToastHost } from '@/components/feedback/toasts';
import { dateTime, php, statusLabel } from '@/lib/format';
import { dur, ease } from '@/motion/tokens';
import { SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

interface Shipment {
    id: number;
    tracking_no: string;
    status: 'assigned' | 'in_transit' | 'delivered';
    order_no: string;
    recipient: string;
    phone: string;
    address: string;
    window: string | null;
    items: number;
    cod: number | null;
    delivered_at: string | null;
}

/** The courier's phone view: picked up → on the way → delivered. */
export default function Courier({ shipments }: { shipments: Shipment[] }) {
    const { props } = usePage<SharedData>();
    const active = shipments.filter((s) => s.status !== 'delivered');
    const done = shipments.filter((s) => s.status === 'delivered');

    return (
        <ToastHost>
            <Head title="Deliveries" />
            <div className="bg-mist text-pine min-h-screen">
                <header className="border-hair bg-mist sticky top-0 z-10 flex h-14 items-center justify-between border-b px-5">
                    <Logo />
                    <button onClick={() => router.post(route('courier.logout'))} className="text-[0.875rem]">
                        Sign out
                    </button>
                </header>
                <main className="mx-auto max-w-[560px] px-5 py-8">
                    <p className="t-label">{props.auth.user?.name}</p>
                    <h1 className="font-display mt-1 text-[2rem] font-light">Today's deliveries</h1>

                    <ul className="mt-8 grid gap-4">
                        <AnimatePresence initial={false}>
                            {active.map((s) => (
                                <motion.li key={s.id} layout exit={{ opacity: 0, height: 0, marginTop: 0, transition: { duration: dur.base, ease: ease.mist } }} className="overflow-hidden">
                                    <DeliveryCard s={s} />
                                </motion.li>
                            ))}
                        </AnimatePresence>
                        {active.length === 0 && <li className="text-ink-soft py-10 text-center">No deliveries waiting.</li>}
                    </ul>

                    {done.length > 0 && (
                        <>
                            <h2 className="t-label mt-12 mb-3">Delivered</h2>
                            <ul className="grid gap-2 text-[0.875rem]">
                                {done.slice(0, 8).map((s) => (
                                    <li key={s.id} className="hair flex justify-between py-3">
                                        <span>
                                            {s.recipient} <span className="t-num text-ink-soft">{s.tracking_no}</span>
                                        </span>
                                        <span className="text-ink-soft">{dateTime(s.delivered_at)}</span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </main>
            </div>
        </ToastHost>
    );
}

function DeliveryCard({ s }: { s: Shipment }) {
    const [busy, setBusy] = useState(false);
    const go = (action: 'transit' | 'delivered') => {
        setBusy(true);
        router.post(`/courier/shipments/${s.id}/${action}`, {}, { preserveScroll: true, onFinish: () => setBusy(false) });
    };

    return (
        <article className="bg-paper border-hair border p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[1.0625rem]">{s.recipient}</p>
                    <p className="text-ink-soft mt-1 text-[0.875rem]">{s.address}</p>
                </div>
                <StatusPill status={s.status} label={statusLabel(s.status)} />
            </div>
            <p className="text-ink-soft mt-3 text-[0.8125rem]">
                <span className="t-num">{s.tracking_no}</span> · {s.items} items · {s.window?.split(' (')[0]}
            </p>
            <p className="mt-2 text-[0.875rem]">
                <a href={`tel:${s.phone}`} className="link-line t-num">
                    {s.phone}
                </a>
                {s.cod != null && <span className="text-brass-deep ml-3">Collect {php(s.cod)} cash</span>}
            </p>
            <div className="mt-5">
                {s.status === 'assigned' ? (
                    <button onClick={() => go('transit')} disabled={busy} className="btn btn-line w-full">
                        Picked up · on the way
                    </button>
                ) : (
                    <HoldToConfirm onConfirm={() => go('delivered')} disabled={busy} />
                )}
            </div>
        </article>
    );
}

/** Hold for 800 ms to confirm delivery, so a stray tap can't do it. */
function HoldToConfirm({ onConfirm, disabled }: { onConfirm: () => void; disabled?: boolean }) {
    const [holding, setHolding] = useState(false);
    const timer = useRef<number | null>(null);

    const start = () => {
        if (disabled) return;
        setHolding(true);
        timer.current = window.setTimeout(() => {
            setHolding(false);
            onConfirm();
        }, 800);
    };
    const stop = () => {
        setHolding(false);
        if (timer.current) window.clearTimeout(timer.current);
    };
    useEffect(() => stop, []);

    return (
        <button
            onPointerDown={start}
            onPointerUp={stop}
            onPointerLeave={stop}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !holding && start()}
            onKeyUp={stop}
            disabled={disabled}
            className="btn btn-solid relative w-full overflow-hidden select-none"
            aria-label="Press and hold to confirm delivery"
        >
            <span className="bg-brass/35 absolute inset-y-0 left-0" style={{ width: holding ? '100%' : '0%', transition: holding ? 'width 800ms linear' : 'width 200ms ease-out' }} aria-hidden />
            <span className="relative">{holding ? 'Keep holding…' : 'Hold to confirm delivery'}</span>
        </button>
    );
}
