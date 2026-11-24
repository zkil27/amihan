import { cn } from '@/lib/utils';

/**
 * "Ridge Wind" mark: three rounded contour lines form a double peak, and
 * the outer line rolls on past the summit as a breeze and curls once,
 * like the amihan wind coming off the mountain. Redrawn by hand from the
 * chosen Gemini variation; sizes and colours stay driven by CSS.
 */
export function RidgeMark({ className, title }: { className?: string; title?: string }) {
    return (
        <svg viewBox="-1 -1 74 42" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}>
            {title && <title>{title}</title>}
            <path d="M1 39 L19.6 5.6 C21.5 2.2 23.5 0.8 25 0.8 C27 0.8 28.6 2.4 30.5 5.5 C32.6 9 34 11.5 37.5 11.5 C40.5 11.5 42.5 7.4 46.5 7.4 C51 7.4 54 10.5 57.5 12.6 C60.3 14.3 62.5 15 65 15 C68.5 15 71 12 71 8.8 C71 5.4 68.5 3 65.5 3 C62.5 3 60.3 5.2 59.8 8" />
            <path d="M8 39 L20.5 16.5 C22 14 23.5 12.5 25.5 12.5 C27.5 12.5 28.6 14 30.4 17 C32.5 20.5 34 23.3 37 23.3 C40 23.3 41 20.5 42.8 18.2 C44 16.6 45.2 15 46.8 15 C48.5 15 49.6 16.4 50.8 18.5 L62.5 39" />
            <path d="M15.5 39 L22.6 26.5 C23.6 24.7 24.7 23.4 26 23.4 C27.4 23.4 28.3 24.6 29.4 26.6 C31.2 29.8 33 33.3 36.5 33.3 C39.5 33.3 40.8 31.5 42.3 29.5 C43.4 28 44.5 25.7 46.2 25.7 C47.6 25.7 48.4 26.8 49.3 28.4 L55.5 39" />
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
