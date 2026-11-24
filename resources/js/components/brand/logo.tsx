import { cn } from '@/lib/utils';

/**
 * Interim "Ridge Wind" mark: three contour lines form a peak, and the
 * outer line carries on past the summit and curls once, like the amihan
 * wind coming off the mountain. Swap the paths for the final traced
 * Gemini symbol later; sizes and colours stay driven by CSS.
 */
export function RidgeMark({ className, title }: { className?: string; title?: string }) {
    return (
        <svg viewBox="0 0 48 32" fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}>
            {title && <title>{title}</title>}
            <path d="M2 29 C10 22 17 8 24 6 C30 4.4 37 3.6 41 5.4 C44 6.8 43 10 40.6 9.8 C39 9.6 38.8 8 40 7.6" />
            <path d="M10 29 C15 24 20 14 24 13 C28 14 33 24 38 29" />
            <path d="M17 29 C20 26 22 21 24 20.5 C26 21 28 26 31 29" />
        </svg>
    );
}

/** Horizontal lockup: mark + wordmark set in Zodiak, the site's display face. */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
    return (
        <span className={cn('inline-flex items-center gap-3 text-current', className)}>
            <RidgeMark className="h-[22px] w-auto" />
            {!compact && <span className="font-display text-[1.0625rem] font-normal tracking-[0.32em]">AMIHAN</span>}
            <span className="sr-only">AMIHAN, home</span>
        </span>
    );
}
