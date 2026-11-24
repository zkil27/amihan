import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

/**
 * The altitude rail, AMIHAN's signature.
 * Any element on the page with data-masl="1650" is a waypoint. As the
 * visitor scrolls, the rail reads the altitude between the waypoints
 * that straddle the middle of the screen, like an altimeter on a climb.
 * Desktop: a vertical meter in the left margin. Phones: a hairline at the top.
 * It updates the DOM directly (no React re-render per frame).
 */
export function AltitudeRail() {
    const readout = useRef<HTMLSpanElement>(null);
    const fill = useRef<HTMLDivElement>(null);
    const bar = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        let points: { el: HTMLElement; masl: number }[] = [];
        let max = 1800;
        let frame = 0;
        let last = -1;

        const scan = () => {
            points = Array.from(document.querySelectorAll<HTMLElement>('main [data-masl]')).map((el) => ({ el, masl: Number(el.dataset.masl) }));
            max = Math.max(1800, ...points.map((p) => p.masl));
            setVisible(points.length > 1);
            update();
        };

        const update = () => {
            frame = 0;
            if (points.length < 2) return;
            // The reading line starts at the top of the page (so the rail reads the
            // first waypoint exactly) and settles at 55% of the screen once scrolling begins.
            const mid = Math.min(window.innerHeight * 0.55, window.scrollY);
            const tops = points.map((p) => p.el.getBoundingClientRect().top);
            let value = points[0].masl;
            for (let i = 0; i < points.length; i++) {
                if (tops[i] <= mid) {
                    const next = points[i + 1];
                    if (next && tops[i + 1] > mid) {
                        const t = (mid - tops[i]) / Math.max(1, tops[i + 1] - tops[i]);
                        value = points[i].masl + (next.masl - points[i].masl) * Math.min(1, Math.max(0, t));
                    } else {
                        value = points[i].masl;
                    }
                }
            }
            const rounded = Math.round(value / 10) * 10;
            if (rounded !== last && readout.current) {
                readout.current.textContent = rounded.toLocaleString('en-PH');
                last = rounded;
            }
            const ratio = Math.min(1, value / max);
            if (fill.current) fill.current.style.transform = `scaleY(${ratio})`;
            const docProgress = window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
            if (bar.current) bar.current.style.transform = `scaleX(${Math.min(1, docProgress)})`;
        };

        const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };

        scan();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        const off = router.on('navigate', () => requestAnimationFrame(scan));

        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            off();
            cancelAnimationFrame(frame);
        };
    }, []);

    return (
        <div aria-hidden className="transition-opacity duration-700" style={{ opacity: visible ? 1 : 0 }}>
            {/* Desktop meter */}
            <div className="text-pine pointer-events-none fixed top-1/2 left-[max(12px,calc(var(--gutter)/2-14px))] z-30 hidden -translate-y-1/2 flex-col items-center gap-4 mix-blend-multiply lg:flex">
                <div className="bg-hair relative h-[34vh] w-px overflow-hidden">
                    <div ref={fill} className="bg-pine absolute inset-x-0 bottom-0 h-full origin-bottom" style={{ transform: 'scaleY(0)', transition: 'transform 180ms linear' }} />
                </div>
                <p className="t-num text-[0.6875rem] leading-none [writing-mode:vertical-rl] rotate-180">
                    <span ref={readout}>0</span> MASL
                </p>
            </div>
            {/* Phone hairline */}
            <div className="bg-hair fixed inset-x-0 top-0 z-[60] h-px lg:hidden">
                <div ref={bar} className="bg-pine h-px origin-left" style={{ transform: 'scaleX(0)' }} />
            </div>
        </div>
    );
}
