import { php } from '@/lib/format';
import { storeLayout } from '@/layouts/store-layout';
import { gsap, useGSAP } from '@/motion/gsap';
import { prefersReducedMotion } from '@/motion/use-reduced-motion';
import { OrderDetail } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useRef } from 'react';

const maskEmail = (e: string) => {
    const [user, domain] = e.split('@');
    return `${user.slice(0, 1)}…@${domain}`;
};

/**
 * The "summit" moment: the only place motion is allowed to speak.
 * One contour line draws slowly up into a peak; the order number and
 * a single line of copy fade in after it.
 */
export default function Thanks({ order }: { order: OrderDetail }) {
    const ref = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            const paths = gsap.utils.toArray<SVGPathElement>('[data-summit] path');
            if (prefersReducedMotion()) return;
            paths.forEach((p) => {
                const len = p.getTotalLength();
                gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
            });
            const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
            tl.to(paths, { strokeDashoffset: 0, duration: 0.9, stagger: 0.12 })
                .from('[data-after]', { opacity: 0, y: 8, duration: 0.7, ease: 'power3.out', stagger: 0.12 }, '-=0.2');
        },
        { scope: ref },
    );

    return (
        <>
            <Head title="Thank you" />
            <section ref={ref} className="flex min-h-[100svh] items-center pt-[var(--header-h)] pb-24">
                <div className="wrap max-w-[620px]">
                    <svg data-summit viewBox="0 0 240 90" fill="none" stroke="currentColor" strokeLinecap="round" className="text-pine w-[200px]" aria-hidden>
                        <path d="M4 86 C40 80 70 40 104 22 C116 16 124 14 132 16 C160 24 190 66 236 86" strokeWidth="1.2" />
                        <path d="M40 86 C66 80 88 54 110 42 C120 37 128 37 136 40 C156 50 176 74 200 86" strokeWidth="1" opacity="0.6" />
                    </svg>

                    <p data-after className="t-num text-brass-deep mt-12">
                        {order.order_no}
                    </p>
                    <h1 data-after className="t-display t-h1 mt-4">
                        Your order is on its way down the mountain.
                    </h1>
                    <p data-after className="t-lede mt-6">
                        Confirmation sent to {maskEmail(order.billing.email)}.
                    </p>

                    <dl data-after className="hair mt-12 grid gap-2 pt-6 text-[0.9375rem]">
                        <div className="flex justify-between">
                            <dt className="text-ink-soft">Total</dt>
                            <dd className="t-num">{php(order.total)}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-ink-soft">Payment</dt>
                            <dd>
                                {order.payment?.method === 'cod' ? 'Cash on delivery' : order.payment?.method === 'gcash' ? 'GCash' : `Card ending ${order.payment?.last4}`}
                            </dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-ink-soft">Window</dt>
                            <dd>{order.delivery_window?.split(' (')[0]}</dd>
                        </div>
                    </dl>

                    <div data-after className="mt-12 flex flex-wrap items-center gap-8">
                        <Link href={route('account.orders.show', order.order_no)} className="btn btn-solid">
                            Track this order <span className="btn-arrow">→</span>
                        </Link>
                        <Link href="/pantry" className="link-line text-[0.9375rem]">
                            Keep browsing
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}

Thanks.layout = storeLayout;
