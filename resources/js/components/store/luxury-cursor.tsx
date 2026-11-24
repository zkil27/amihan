import { prefersReducedMotion } from '@/motion/use-reduced-motion';
import { useEffect, useRef } from 'react';

const INTERACTIVE = 'a, button, [role="button"], label, select, summary, [data-cursor="hover"]';
const TEXT_FIELD = 'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]), textarea, [contenteditable="true"]';
const DARK_GROUND = '.bg-pine, .bg-pine-soft, .bg-basalt, [data-cursor-tone="light"]';

/**
 * A quiet cursor for the storefront: a small Pine dot that follows the
 * pointer exactly, and a 1px hairline ring that trails a moment behind.
 *  - links and buttons: the ring opens a little, the dot fades
 *  - [data-cursor="view"] (product cards): the ring becomes a small Pine disc reading "View"
 *  - text fields: the native I-beam returns and this cursor steps aside
 *  - Pine / Basalt sections: it turns mist-coloured
 * Mouse and trackpad only; touch screens keep their own behaviour.
 * Positions are written straight to the DOM each frame, with no React re-renders.
 */
export function LuxuryCursor() {
    const dot = useRef<HTMLDivElement>(null);
    const ring = useRef<HTMLDivElement>(null);
    const label = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

        const root = document.documentElement;
        root.classList.add('has-lux-cursor');
        const reduce = prefersReducedMotion();
        const follow = reduce ? 1 : 0.18; // how quickly the ring catches up each frame

        let x = -100;
        let y = -100;
        let rx = x;
        let ry = y;
        let frame = 0;
        let visible = false;

        const setState = (state: string) => {
            if (ring.current && ring.current.dataset.state !== state) {
                ring.current.dataset.state = state;
                if (dot.current) dot.current.dataset.state = state;
            }
        };

        const tick = () => {
            rx += (x - rx) * follow;
            ry += (y - ry) * follow;
            if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
            frame = Math.abs(x - rx) > 0.1 || Math.abs(y - ry) > 0.1 ? requestAnimationFrame(tick) : 0;
        };

        const onMove = (e: PointerEvent) => {
            if (e.pointerType !== 'mouse') return;
            x = e.clientX;
            y = e.clientY;
            if (!visible) {
                visible = true;
                rx = x;
                ry = y;
                root.classList.add('lux-cursor-on');
            }
            if (!frame) frame = requestAnimationFrame(tick);

            const target = e.target as Element | null;
            if (!target?.closest) return;

            const view = target.closest<HTMLElement>('[data-cursor="view"]');
            if (target.closest(TEXT_FIELD)) setState('text');
            else if (view) {
                if (label.current) label.current.textContent = view.dataset.cursorLabel ?? 'View';
                setState('view');
            } else if (target.closest(INTERACTIVE)) setState('hover');
            else setState('idle');

            const tone = target.closest(DARK_GROUND) ? 'light' : 'dark';
            if (ring.current) ring.current.dataset.tone = tone;
            if (dot.current) dot.current.dataset.tone = tone;
        };

        const onDown = (e: PointerEvent) => e.pointerType === 'mouse' && ring.current?.classList.add('is-pressed');
        const onUp = () => ring.current?.classList.remove('is-pressed');
        const onLeave = () => {
            visible = false;
            root.classList.remove('lux-cursor-on');
        };

        window.addEventListener('pointermove', onMove, { passive: true });
        window.addEventListener('pointerdown', onDown, { passive: true });
        window.addEventListener('pointerup', onUp, { passive: true });
        document.addEventListener('pointerleave', onLeave);
        window.addEventListener('blur', onLeave);

        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerdown', onDown);
            window.removeEventListener('pointerup', onUp);
            document.removeEventListener('pointerleave', onLeave);
            window.removeEventListener('blur', onLeave);
            cancelAnimationFrame(frame);
            root.classList.remove('has-lux-cursor', 'lux-cursor-on');
        };
    }, []);

    // Outer layer = position (transform), inner layer = look (scale, colour).
    // Keeping them apart matters: CSS `scale` on the same element would also
    // multiply the translate offset and fling the ring across the screen.
    return (
        <div aria-hidden className="lux-cursor">
            <div ref={ring} className="lux-cursor-follow lux-cursor-ring" data-state="idle" data-tone="dark">
                <div className="lux-cursor-ring-shape">
                    <span ref={label} className="lux-cursor-label">
                        View
                    </span>
                </div>
            </div>
            <div ref={dot} className="lux-cursor-follow lux-cursor-dot" data-state="idle" data-tone="dark">
                <div className="lux-cursor-dot-shape" />
            </div>
        </div>
    );
}
