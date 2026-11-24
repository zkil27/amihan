import { router } from '@inertiajs/react';
import Lenis from 'lenis';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { gsap, ScrollTrigger } from './gsap';
import { prefersReducedMotion } from './use-reduced-motion';

const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

/**
 * Smooth scrolling for pointer devices only. Touch devices keep native
 * scrolling (it already feels right and is cheaper). Lenis is driven by
 * GSAP's ticker so ScrollTrigger scenes stay perfectly in sync.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
    const [lenis, setLenis] = useState<Lenis | null>(null);

    useEffect(() => {
        const coarse = window.matchMedia('(pointer: coarse)').matches;
        if (coarse || prefersReducedMotion()) return;

        const instance = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 3), smoothWheel: true });
        setLenis(instance);

        instance.on('scroll', ScrollTrigger.update);
        const tick = (time: number) => instance.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        const off = router.on('navigate', () => {
            // Inertia has just reset (or, on back/forward, restored) the window
            // scroll natively. If Lenis is still gliding from a recent wheel
            // flick, it ignores that native scroll and its next frame drags the
            // new page back to the old offset, which on a shorter page means the
            // bottom. Drop the glide and adopt the position Inertia set.
            if (Math.abs(instance.actualScroll - instance.animatedScroll) > 2) {
                instance.dimensions.resize();
                instance.scrollTo(instance.actualScroll, { immediate: true, force: true });
            }
            instance.resize();
            requestAnimationFrame(() => ScrollTrigger.refresh());
        });

        return () => {
            off();
            gsap.ticker.remove(tick);
            instance.destroy();
            setLenis(null);
        };
    }, []);

    return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
