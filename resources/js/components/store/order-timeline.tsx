import { dateTime, statusLabel } from '@/lib/format';
import { cn } from '@/lib/utils';
import { dur, ease } from '@/motion/tokens';
import { OrderDetail } from '@/types';
import { motion } from 'motion/react';

const FLOW = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];

/**
 * Track order: completed steps are Pine dots, the current step has a
 * static brass ring, and the hairline draws up to it once on open.
 */
export function OrderTimeline({ order }: { order: OrderDetail }) {
    const branched = order.status === 'cancelled' || order.status === 'returned';
    const reached = branched
        ? Math.max(0, ...order.history.map((h) => FLOW.indexOf(h.status)).filter((i) => i >= 0))
        : FLOW.indexOf(order.status);
    const steps = branched ? [...FLOW.slice(0, reached + 1), order.status] : FLOW;
    const current = branched ? steps.length - 1 : reached;
    const at = (s: string) => [...order.history].reverse().find((h) => h.status === s)?.at;

    return (
        <ol className="relative grid gap-0" aria-label="Order progress">
            <div className="bg-hair absolute top-2 bottom-2 left-[5px] w-px" aria-hidden>
                <motion.div
                    className="bg-pine w-px origin-top"
                    style={{ height: '100%' }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: steps.length > 1 ? current / (steps.length - 1) : 0 }}
                    transition={{ duration: dur.focal, ease: ease.mist, delay: 0.15 }}
                />
            </div>
            {steps.map((s, i) => {
                const done = i < current;
                const now = i === current;
                return (
                    <li key={s} className="relative flex min-h-[64px] items-start gap-5 pb-6 last:pb-0">
                        <span
                            className={cn(
                                'relative z-[1] mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full border',
                                done && 'bg-pine border-pine',
                                now && (branched ? 'border-clay bg-mist ring-clay/30 ring-4' : 'border-brass bg-mist ring-brass/30 ring-4'),
                                !done && !now && 'bg-mist border-hair-strong',
                            )}
                            aria-hidden
                        />
                        <div>
                            <p className={cn('text-[0.9375rem]', !done && !now && 'text-ink-soft')}>
                                {statusLabel(s)}
                                {now && <span className="sr-only"> (current)</span>}
                            </p>
                            {at(s) && <p className="t-label mt-0.5">{dateTime(at(s))}</p>}
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}
