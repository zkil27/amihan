import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches;

/** True when the visitor has asked their device for less motion. */
export function useReducedMotion(): boolean {
    const [reduced, setReduced] = useState(prefersReducedMotion);

    useEffect(() => {
        const mq = window.matchMedia(QUERY);
        const onChange = () => setReduced(mq.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    return reduced;
}
