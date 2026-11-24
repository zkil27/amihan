import { cn } from '@/lib/utils';
import { dur, ease, exit } from '@/motion/tokens';
import { AnimatePresence, motion } from 'motion/react';
import { ButtonHTMLAttributes, forwardRef, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, useEffect, useId, useState } from 'react';

/* ------------------------------------------------------------------ */
/* NumberFade: numbers change by a soft crossfade, never a slot roll. */
/* ------------------------------------------------------------------ */
export function NumberFade({ value, className }: { value: string | number; className?: string }) {
    return (
        <span className={cn('relative inline-grid', className)} aria-live="polite">
            <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                    key={String(value)}
                    className="col-start-1 row-start-1"
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: dur.quick, ease: ease.mist } }}
                    exit={{ opacity: 0, y: -3, transition: { duration: exit(dur.quick) } }}
                >
                    {value}
                </motion.span>
            </AnimatePresence>
        </span>
    );
}

/* ------------------------------------------------------------------ */
/* ContourLoader: one thin contour line tracing slowly.               */
/* ------------------------------------------------------------------ */
export function ContourLoader({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 64 12" fill="none" className={cn('h-3 w-14', className)} aria-hidden>
            <path d="M1 10 C10 9 16 3 24 3 C31 3 34 8 40 8 C47 8 52 2 63 2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" pathLength={1} className="contour-trace" />
            <style>{`
                .contour-trace { stroke-dasharray: 0.35 0.65; animation: contour 1.6s var(--ease-mist) infinite; }
                @keyframes contour { from { stroke-dashoffset: 1 } to { stroke-dashoffset: 0 } }
                @media (prefers-reduced-motion: reduce) { .contour-trace { animation: none; stroke-dasharray: none; opacity: .6 } }
            `}</style>
        </svg>
    );
}

/* ------------------------------------------------------------------ */
/* ActionButton: idle → loading (contour) → done (label crossfade).    */
/* Width stays locked so the layout never jumps.                       */
/* ------------------------------------------------------------------ */
type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    loading?: boolean;
    done?: boolean;
    doneLabel?: string;
    variant?: 'solid' | 'line' | 'on-pine';
    arrow?: boolean;
    full?: boolean;
};

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(function ActionButton(
    { loading, done, doneLabel = 'Done', variant = 'solid', arrow = false, full = false, className, children, disabled, ...rest },
    ref,
) {
    const state = loading ? 'loading' : done ? 'done' : 'idle';
    return (
        <button
            ref={ref}
            className={cn('btn', `btn-${variant}`, full && 'w-full', className)}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            {...rest}
        >
            <span className="invisible inline-flex items-center gap-3" aria-hidden>
                {children}
                {arrow && <span>→</span>}
            </span>
            <AnimatePresence initial={false} mode="wait">
                <motion.span
                    key={state}
                    className="absolute inset-0 flex items-center justify-center gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: dur.quick, ease: ease.mist } }}
                    exit={{ opacity: 0, transition: { duration: exit(dur.quick) } }}
                >
                    {state === 'loading' && (
                        <>
                            <ContourLoader />
                            <span className="sr-only">Working</span>
                        </>
                    )}
                    {state === 'done' && <span>{doneLabel}</span>}
                    {state === 'idle' && (
                        <>
                            {children}
                            {arrow && <span className="btn-arrow" aria-hidden>→</span>}
                        </>
                    )}
                </motion.span>
            </AnimatePresence>
        </button>
    );
});

/** True for `ms` after `trigger` changes to a truthy value. */
export function useBriefly(trigger: unknown, ms = 1400) {
    const [on, setOn] = useState(false);
    useEffect(() => {
        if (!trigger) return;
        setOn(true);
        const t = window.setTimeout(() => setOn(false), ms);
        return () => window.clearTimeout(t);
    }, [trigger, ms]);
    return on;
}

/* ------------------------------------------------------------------ */
/* Plate: an image that fades in from a mist block. Until a photo     */
/* exists it shows a quiet labelled placeholder.                       */
/* ------------------------------------------------------------------ */
export function Plate({
    src,
    alt,
    label,
    className,
    ratio = '4 / 5',
    priority = false,
    tone = 'mist',
    style,
}: {
    src?: string | null;
    alt: string;
    label?: string;
    className?: string;
    ratio?: string;
    priority?: boolean;
    tone?: 'mist' | 'pine';
    style?: React.CSSProperties;
}) {
    const [loaded, setLoaded] = useState(false);
    return (
        <div className={cn('plate', tone === 'pine' && 'bg-pine-soft', className)} style={{ aspectRatio: ratio, ...style }}>
            {src ? (
                <img
                    src={src}
                    alt={alt}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding="async"
                    className="img-fade"
                    data-loaded={loaded}
                    onLoad={() => setLoaded(true)}
                    ref={(img) => {
                        if (img?.complete && img.naturalWidth) setLoaded(true);
                    }}
                />
            ) : (
                <div className={cn('absolute inset-0 flex items-end p-4', tone === 'pine' ? 'text-mist/45' : 'text-pine/35')} role="img" aria-label={alt}>
                    <PlateContours />
                    {label && <span className="relative text-[0.75rem] leading-snug">{label}</span>}
                </div>
            )}
        </div>
    );
}

function PlateContours() {
    return (
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" fill="none" stroke="currentColor" strokeWidth="0.6" aria-hidden>
            {[0, 1, 2, 3, 4, 5].map((i) => (
                <path key={i} d={`M-20 ${420 - i * 34} C 80 ${380 - i * 40}, 150 ${250 - i * 22}, 220 ${240 - i * 26} S 360 ${330 - i * 30}, 430 ${300 - i * 36}`} opacity={0.5 - i * 0.05} />
            ))}
        </svg>
    );
}

/* ------------------------------------------------------------------ */
/* Form fields: bottom hairline, label above, error slides in below.   */
/* ------------------------------------------------------------------ */
type FieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string; valid?: boolean };

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field({ label, error, hint, valid, className, id, ...rest }, ref) {
    const auto = useId();
    const fid = id ?? auto;
    return (
        <div className={cn('field', className)}>
            <label htmlFor={fid} className="field-label">
                {label}
            </label>
            <div className="relative">
                <input
                    ref={ref}
                    id={fid}
                    className="field-input pr-6"
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? `${fid}-err` : hint ? `${fid}-hint` : undefined}
                    {...rest}
                />
                <AnimatePresence>
                    {valid && !error && (
                        <motion.span
                            className="text-moss absolute top-1/2 right-0 -translate-y-1/2 text-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            aria-hidden
                        >
                            ✓
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>
            <FieldMessage id={`${fid}-err`} error={error} />
            {hint && !error && (
                <p id={`${fid}-hint`} className="t-label">
                    {hint}
                </p>
            )}
        </div>
    );
});

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string; children: ReactNode };

export function SelectField({ label, error, className, id, children, ...rest }: SelectProps) {
    const auto = useId();
    const fid = id ?? auto;
    return (
        <div className={cn('field', className)}>
            <label htmlFor={fid} className="field-label">
                {label}
            </label>
            <select id={fid} className="field-input" aria-invalid={error ? true : undefined} {...rest}>
                {children}
            </select>
            <FieldMessage id={`${fid}-err`} error={error} />
        </div>
    );
}

export function FieldMessage({ error, id }: { error?: string; id?: string }) {
    return (
        <AnimatePresence initial={false}>
            {error && (
                <motion.p
                    id={id}
                    role="alert"
                    className="field-error overflow-hidden"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto', transition: { duration: dur.quick, ease: ease.mist } }}
                    exit={{ opacity: 0, height: 0, transition: { duration: exit(dur.quick) } }}
                >
                    {error}
                </motion.p>
            )}
        </AnimatePresence>
    );
}

/* ------------------------------------------------------------------ */
/* StatusPill: colour crossfades when the status changes.              */
/* ------------------------------------------------------------------ */
const PILL: Record<string, string> = {
    pending: 'text-pine border-hair-strong',
    confirmed: 'text-pine border-pine/50',
    packed: 'text-pine border-pine/50',
    shipped: 'text-brass-deep border-brass/60',
    in_transit: 'text-brass-deep border-brass/60',
    assigned: 'text-pine border-hair-strong',
    delivered: 'text-mist bg-pine border-pine',
    completed: 'text-mist bg-pine border-pine',
    paid: 'text-pine border-pine/50',
    active: 'text-pine border-pine/50',
    cancelled: 'text-clay border-clay/50',
    returned: 'text-clay border-clay/50',
    rejected: 'text-clay border-clay/50',
    failed: 'text-clay border-clay/50',
    deleted: 'text-clay border-clay/50',
    refunded: 'text-ink-soft border-hair-strong',
    requested: 'text-brass-deep border-brass/60',
    approved: 'text-pine border-pine/50',
    archived: 'text-ink-soft border-hair-strong',
    draft: 'text-ink-soft border-hair-strong',
};

export function StatusPill({ status, label, className }: { status: string; label?: string; className?: string }) {
    return (
        <span
            className={cn(
                'inline-flex h-6 items-center rounded-full border px-2.5 text-[0.75rem] leading-none whitespace-nowrap transition-colors duration-300',
                PILL[status] ?? 'text-pine border-hair-strong',
                className,
            )}
        >
            {label ?? status.replace('_', ' ').replace(/^./, (c) => c.toUpperCase())}
        </span>
    );
}
