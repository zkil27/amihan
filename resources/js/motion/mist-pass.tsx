import { router } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from './use-reduced-motion';

/**
 * Page transition: a soft band of mist rises over the page while the next
 * page loads, then lifts away (520 ms in, ~360 ms out). Only full page
 * visits trigger it; form posts and filter updates that preserve state do not.
 */
export function MistPass() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        let active = false;
        let shownAt = 0;

        const offStart = router.on('start', (event) => {
            const visit = event.detail.visit;
            const isPageChange = visit.method === 'get' && !visit.preserveState && !visit.only.length && !visit.prefetch;
            if (!isPageChange) return;
            active = true;
            shownAt = performance.now();
            el.dataset.state = prefersReducedMotion() ? 'fade-in' : 'in';
        });

        const offFinish = router.on('finish', () => {
            if (!active) return;
            active = false;
            // Hold briefly so a fast response doesn't flash.
            const wait = Math.max(0, 260 - (performance.now() - shownAt));
            window.setTimeout(() => {
                el.dataset.state = 'out';
                // Reset below the fold, without a transition, ready for the next visit.
                window.setTimeout(() => {
                    if (!active) el.dataset.state = 'idle';
                }, 400);
            }, wait);
        });

        return () => {
            offStart();
            offFinish();
        };
    }, []);

    return (
        <div ref={ref} aria-hidden data-state="idle" className="mist-pass pointer-events-none fixed inset-0 z-[80]">
            <style>{`
                .mist-pass { opacity: 0; transform: translateY(12%); background:
                    linear-gradient(to bottom, rgb(234 231 225 / 0) 0%, rgb(234 231 225 / 0.92) 18%, #EAE7E1 34%, #EAE7E1 100%); }
                .mist-pass[data-state='in'] { opacity: 1; transform: translateY(0); transition: opacity 520ms var(--ease-mist), transform 520ms var(--ease-mist); }
                .mist-pass[data-state='fade-in'] { opacity: 1; transform: none; transition: opacity 240ms linear; }
                .mist-pass[data-state='out'] { opacity: 0; transform: translateY(-6%); transition: opacity 360ms var(--ease-mist), transform 360ms var(--ease-mist); }
            `}</style>
        </div>
    );
}
