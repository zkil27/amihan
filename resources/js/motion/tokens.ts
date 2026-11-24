/**
 * Motion tokens: quiet luxury.
 * Small amplitude, soft ease-out, one response per action.
 * Mirrors the CSS custom properties in resources/css/app.css.
 */
export const ease = {
    /** The default arrival curve, called "mist". */
    mist: [0.22, 1, 0.36, 1] as const,
    /** Exits: a touch quicker and plainer. */
    out: [0.4, 0, 1, 1] as const,
};

export const dur = {
    instant: 0.12,
    quick: 0.24,
    base: 0.38,
    slow: 0.52,
    focal: 0.9,
};

/** Exits run at ~70% of their entrance. */
export const exit = (d: number) => d * 0.7;

/** Movement limits (px). */
export const travel = {
    control: 4,
    entrance: 12,
};

export const gsapEase = 'power3.out';
