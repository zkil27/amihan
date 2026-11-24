import { RefObject } from 'react';
import { gsap, ScrollTrigger, SplitText, useGSAP } from './gsap';
import { prefersReducedMotion } from './use-reduced-motion';

/**
 * Quiet entrances for a page, run once per element:
 *  data-reveal="lines"  headline lines rise 12px through a mask
 *  data-reveal="fade"   fade + rise 12px
 *  data-reveal="draw"   SVG paths draw themselves (stroke-dashoffset)
 * Content is visible by default; GSAP only sets the start state when it
 * runs, so a script failure never hides text. Reduced motion: no-op.
 */
export function useReveal(scope: RefObject<HTMLElement | null>, deps: unknown[] = []) {
    useGSAP(
        () => {
            if (prefersReducedMotion() || !scope.current) return;

            scope.current.querySelectorAll<HTMLElement>('[data-reveal="lines"]').forEach((el) => {
                const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'reveal-line' });
                gsap.from(split.lines, {
                    yPercent: 0,
                    y: 12,
                    opacity: 0,
                    duration: 0.9,
                    ease: 'power3.out',
                    stagger: 0.08,
                    scrollTrigger: { trigger: el, start: 'top 88%', once: true },
                });
            });

            scope.current.querySelectorAll<HTMLElement>('[data-reveal="fade"]').forEach((el) => {
                gsap.from(el, {
                    y: 12,
                    opacity: 0,
                    duration: 0.9,
                    ease: 'power3.out',
                    delay: Number(el.dataset.delay ?? 0),
                    scrollTrigger: { trigger: el, start: 'top 90%', once: true },
                });
            });

            scope.current.querySelectorAll<SVGPathElement>('[data-reveal="draw"] path').forEach((path) => {
                const len = path.getTotalLength();
                gsap.fromTo(
                    path,
                    { strokeDasharray: len, strokeDashoffset: len },
                    { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', scrollTrigger: { trigger: path, start: 'top 85%', once: true } },
                );
            });

            ScrollTrigger.refresh();
        },
        { scope, dependencies: deps },
    );
}
