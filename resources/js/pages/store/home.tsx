import { Plate } from '@/components/feedback';
import { ProductCard } from '@/components/store/product-card';
import { masl } from '@/lib/format';
import { storeLayout, useHeaderTone } from '@/layouts/store-layout';
import { gsap, ScrollTrigger, useGSAP } from '@/motion/gsap';
import { prefersReducedMotion } from '@/motion/use-reduced-motion';
import { useReveal } from '@/motion/use-reveal';
import { ProductCard as Card } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

type Origin = { name: string; slug: string; origin: string; elevation_masl: number; tasting_notes: string; process: string };

interface Props {
    featured: Card[];
    origins: Origin[];
    media: Record<string, string>;
}

/**
 * Home: "The Ascent". Scrolling climbs from the coast to the crest, and
 * the altitude rail (left margin) reads the elevation of each chapter.
 * One idea per viewport; motion stays quiet.
 */
export default function Home({ featured, origins, media }: Props) {
    const root = useRef<HTMLDivElement>(null);
    useReveal(root);

    return (
        <div ref={root}>
            <Head title="" />
            <Arrival media={media} />
            <Philosophy media={media} />
            <Ascent origins={origins} />
            <Hearth media={media} />
            <CoastToCrest media={media} />
            <BringHome featured={featured} />
        </div>
    );
}

Home.layout = storeLayout;

/* 1 · Arrival ----------------------------------------------------------- */
function Arrival({ media }: { media: Record<string, string> }) {
    const ref = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            if (prefersReducedMotion()) return;
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
            tl.from('[data-hero-plate]', { opacity: 0, duration: 1.4 })
                .from('[data-hero-line]', { y: 12, opacity: 0, duration: 1, stagger: 0.12 }, 0.25)
                .from('[data-hero-meta]', { opacity: 0, duration: 0.9 }, 0.8);
            // The hero image drifts a few percent slower than the page.
            gsap.to('[data-hero-plate] img, [data-hero-plate] video', {
                yPercent: 6,
                ease: 'none',
                scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: true },
            });
        },
        { scope: ref },
    );

    const video = media['video:hero.webm'] || media['video:hero.mp4'];

    return (
        <section ref={ref} data-masl="0" className="relative flex min-h-[100svh] items-end overflow-hidden pt-[var(--header-h)]">
            <div data-hero-plate className="absolute top-[var(--header-h)] right-0 bottom-[46svh] w-[86%] md:bottom-[14svh] md:w-[58%]">
                {video ? (
                    <div className="plate h-full w-full">
                        <video autoPlay muted loop playsInline poster={media['hero']} className="opacity-90">
                            {media['video:hero.webm'] && <source src={media['video:hero.webm']} type="video/webm" />}
                            {media['video:hero.mp4'] && <source src={media['video:hero.mp4']} type="video/mp4" />}
                        </video>
                    </div>
                ) : (
                    <Plate src={media['hero']} alt="Morning fog over pine ridges in the Cordillera" label="Hero photograph · fog over the ridge" ratio="auto" className="h-full w-full" priority />
                )}
            </div>

            <div className="wrap relative pb-[10svh] md:pb-[12svh]">
                <p data-hero-meta className="t-label mb-6 md:mb-8">
                    A highland coffee sanctuary by the Cafe-Isla Group
                </p>
                <h1 className="t-display t-hero max-w-[9ch]">
                    <span data-hero-line className="block">
                        Steeped in
                    </span>
                    <span data-hero-line className="block italic">
                        Altitude.
                    </span>
                </h1>
                <div data-hero-meta className="mt-10 flex items-center gap-8 md:mt-12">
                    <Link href="/pantry" className="link-line text-[1.0625rem]">
                        Bring the ridge home <span aria-hidden>→</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}

/* 2 · Philosophy -------------------------------------------------------- */
function Philosophy({ media }: { media: Record<string, string> }) {
    return (
        <section data-masl="300" className="section">
            <div className="wrap grid items-end gap-14 md:grid-cols-12 md:gap-8">
                <div className="md:col-span-5 md:col-start-2">
                    <Plate src={media['philosophy']} alt="Hands holding a stoneware cup beside a folded oshibori towel" label="Hands, cup and oshibori" />
                </div>
                <div className="md:col-span-5 md:col-start-8 md:pb-16">
                    <p className="t-label mb-6" data-reveal="fade">
                        Crafted by altitude
                    </p>
                    <h2 className="t-display t-h2" data-reveal="lines">
                        Terroir over syrups.
                    </h2>
                    <p className="t-lede mt-8" data-reveal="fade">
                        No blenders and no shortcuts. Coffee that tastes of the mountain it grew on, poured slowly by people who know the farmers by name.
                    </p>
                </div>
            </div>
        </section>
    );
}

/* 3 · The Ascent: four origins, sea level to summit ---------------------- */
function Ascent({ origins }: { origins: Origin[] }) {
    const ref = useRef<HTMLElement>(null);
    const big = useRef<HTMLSpanElement>(null);

    useGSAP(
        () => {
            const reduce = prefersReducedMotion();
            // Contour lines draw themselves across the whole climb.
            gsap.utils.toArray<SVGPathElement>('[data-contour] path').forEach((path, i) => {
                const len = path.getTotalLength();
                gsap.set(path, { strokeDasharray: len, strokeDashoffset: reduce ? 0 : len });
                if (!reduce) {
                    gsap.to(path, {
                        strokeDashoffset: 0,
                        ease: 'none',
                        scrollTrigger: { trigger: ref.current, start: `top ${70 - i * 6}%`, end: 'bottom 80%', scrub: 0.6 },
                    });
                }
            });

            // Ridge layers drift at different speeds (6-10% of the viewport).
            if (!reduce) {
                gsap.utils.toArray<HTMLElement>('[data-depth]').forEach((layer) => {
                    gsap.to(layer, { yPercent: -Number(layer.dataset.depth), ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true } });
                });
            }

            // The large altitude figure follows the origin in view.
            gsap.utils.toArray<HTMLElement>('[data-origin]').forEach((el) => {
                ScrollTrigger.create({
                    trigger: el,
                    start: 'top 60%',
                    end: 'bottom 40%',
                    onToggle: (self) => {
                        el.classList.toggle('is-active', self.isActive);
                        if (self.isActive && big.current) {
                            const to = Number(el.dataset.masl);
                            if (reduce) {
                                big.current.textContent = to.toLocaleString('en-PH');
                                return;
                            }
                            gsap.to(big.current, { opacity: 0, duration: 0.18, onComplete: () => {
                                if (!big.current) return;
                                big.current.textContent = to.toLocaleString('en-PH');
                                gsap.to(big.current, { opacity: 1, duration: 0.38, ease: 'power3.out' });
                            } });
                        }
                    },
                });
            });
        },
        { scope: ref, dependencies: [origins.length] },
    );

    return (
        <section ref={ref} className="bg-mist relative overflow-hidden">
            {/* Ridge silhouettes, three depths */}
            {/* Ridge contours at three depths, drifting at different speeds */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
                <Ridge depth={10} className="text-pine/[0.14] top-[6%]" d="M0 180 C160 120 260 60 420 70 C560 80 640 150 800 130 C940 110 1060 30 1200 40" />
                <Ridge depth={7} className="text-pine/[0.12] top-[36%]" d="M0 220 C140 170 300 90 460 110 C620 130 700 200 860 170 C1000 140 1100 80 1200 90" />
                <Ridge depth={4} className="text-pine/[0.10] top-[66%]" d="M0 160 C200 130 320 60 520 80 C700 100 820 180 980 150 C1080 130 1140 110 1200 100" />
            </div>

            <div className="wrap relative section">
                <div className="grid gap-12 md:grid-cols-12">
                    <div className="md:col-span-5 md:col-start-2">
                        <div className="md:sticky md:top-[calc(var(--header-h)+8vh)]">
                            <p className="t-label mb-6" data-reveal="fade">
                                The ascent
                            </p>
                            <h2 className="t-display t-h2" data-reveal="lines">
                                Four origins, one climb.
                            </h2>
                            <p className="t-lede mt-6" data-reveal="fade">
                                Higher farms mean colder nights, slower cherries and sweeter cups. Follow the altitude.
                            </p>
                            <p className="mt-14 hidden md:block" aria-hidden>
                                <span ref={big} className="font-display text-[clamp(4rem,8vw,7.5rem)] leading-none font-light">
                                    {origins[0]?.elevation_masl.toLocaleString('en-PH') ?? '0'}
                                </span>
                                <span className="t-num text-ink-soft ml-3">MASL</span>
                            </p>
                            <svg data-contour viewBox="0 0 420 120" className="text-pine/50 mt-10 hidden w-full max-w-[420px] md:block" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden>
                                <path d="M2 112 C70 104 120 70 170 58 C220 46 250 60 290 40 C330 20 370 14 418 8" />
                                <path d="M2 116 C80 110 130 84 180 74 C230 64 262 76 300 58 C338 40 376 34 418 28" />
                                <path d="M2 119 C90 116 140 98 190 90 C240 82 274 92 310 76 C346 60 382 54 418 48" />
                            </svg>
                        </div>
                    </div>

                    <ol className="md:col-span-5 md:col-start-8">
                        {origins.map((o) => (
                            <li
                                key={o.slug}
                                data-origin
                                data-masl={o.elevation_masl}
                                className="group hair flex min-h-[46vh] flex-col justify-center py-14 transition-opacity duration-500 md:min-h-[62vh] md:opacity-40 md:[&.is-active]:opacity-100"
                            >
                                <p className="t-num text-brass-deep">{masl(o.elevation_masl)}</p>
                                <h3 className="t-display t-h3 mt-4" data-reveal="lines">
                                    {o.origin}
                                </h3>
                                <p className="text-ink-soft mt-4 max-w-[34ch]">
                                    {o.tasting_notes}. {o.process}.
                                </p>
                                <Link href={route('pantry.show', o.slug)} className="link-line mt-8 self-start text-[0.9375rem]">
                                    {o.name} <span aria-hidden>→</span>
                                </Link>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </section>
    );
}

function Ridge({ d, depth, className }: { d: string; depth: number; className: string }) {
    return (
        <div data-depth={depth} className={`absolute inset-x-0 h-[40%] ${className}`}>
            <svg viewBox="0 0 1200 400" preserveAspectRatio="none" className="h-full w-full" fill="none" stroke="currentColor">
                {[0, 14, 28].map((dy) => (
                    <path key={dy} d={d} transform={`translate(0 ${dy})`} strokeWidth={1} vectorEffect="non-scaling-stroke" />
                ))}
            </svg>
        </div>
    );
}

/* 4 · Hearth (a pine chapter) ------------------------------------------- */
function Hearth({ media }: { media: Record<string, string> }) {
    const ref = useRef<HTMLElement>(null);
    const setTone = useHeaderTone();
    const video = media['video:hearth.webm'] || media['video:hearth.mp4'];

    // While this chapter sits under the header, the header turns light.
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(([e]) => setTone(e.isIntersecting ? 'pine' : 'mist'), { rootMargin: '0px 0px -92% 0px' });
        io.observe(el);
        return () => {
            io.disconnect();
            setTone('mist');
        };
    }, [setTone]);

    // Pause video when offscreen.
    useEffect(() => {
        const v = ref.current?.querySelector('video');
        if (!v) return;
        const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()));
        io.observe(v);
        return () => io.disconnect();
    }, [video]);

    return (
        <section ref={ref} data-masl="1500" className="bg-pine text-mist section">
            <div className="wrap grid items-center gap-14 md:grid-cols-12 md:gap-8">
                <div className="md:col-span-5 md:col-start-2">
                    <p className="text-mist/60 mb-6 text-[0.8125rem]" data-reveal="fade">
                        The sanctuary · 1,500 MASL
                    </p>
                    <h2 className="t-display t-h2" data-reveal="lines">
                        The hearth keeps the slowest hours.
                    </h2>
                    <p className="text-mist/70 mt-8 max-w-[34em] text-[1.125rem] leading-relaxed" data-reveal="fade">
                        Cast-iron bibingka soufflé, the Elevation Flight, and a tablea cortado. Served from six in the morning, when the first breeze comes down the ridge.
                    </p>
                    <Link href="/visit" className="link-line mt-10 inline-block text-[1.0625rem]" data-reveal="fade">
                        Plan a visit <span aria-hidden>→</span>
                    </Link>
                </div>
                <div className="md:col-span-5 md:col-start-8">
                    {video ? (
                        <div className="plate bg-pine-soft" style={{ aspectRatio: '4 / 5' }}>
                            <video muted loop playsInline poster={media['hearth']} className="opacity-85">
                                {media['video:hearth.webm'] && <source src={media['video:hearth.webm']} type="video/webm" />}
                                {media['video:hearth.mp4'] && <source src={media['video:hearth.mp4']} type="video/mp4" />}
                            </video>
                        </div>
                    ) : (
                        <Plate src={media['hearth']} alt="Cast-iron bibingka soufflé by the hearth" label="Hearth · bibingka in cast iron" tone="pine" />
                    )}
                </div>
            </div>
        </section>
    );
}

/* 5 · Coast to crest ------------------------------------------------------ */
function CoastToCrest({ media }: { media: Record<string, string> }) {
    const ref = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            if (prefersReducedMotion()) return;
            // The crest rises over the coast like mist lifting, tied to scroll.
            gsap.fromTo(
                '[data-crest]',
                { clipPath: 'inset(100% 0% 0% 0%)' },
                { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom bottom', scrub: 0.4 } },
            );
            gsap.fromTo('[data-coast-label]', { opacity: 1 }, { opacity: 0, ease: 'none', scrollTrigger: { trigger: ref.current, start: '35% top', end: '55% top', scrub: true } });
            gsap.fromTo('[data-crest-label]', { opacity: 0 }, { opacity: 1, ease: 'none', scrollTrigger: { trigger: ref.current, start: '45% top', end: '65% top', scrub: true } });
        },
        { scope: ref },
    );

    return (
        <section ref={ref} className="relative h-[200svh]">
            <span data-masl="0" className="absolute top-0" />
            <span data-masl="1800" className="absolute bottom-[30%]" />
            <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
                <div className="wrap grid w-full items-center gap-10 md:grid-cols-12 md:gap-8">
                    <div className="relative md:col-span-6 md:col-start-2">
                        <div className="relative" style={{ aspectRatio: '4 / 5', maxHeight: '72svh' }}>
                            <Plate src={media['coast']} alt="A calm grey sea at first light" label="Coast · Cafe-Isla, sea level" ratio="auto" className="absolute inset-0" />
                            <div data-crest className="absolute inset-0" style={{ clipPath: 'inset(0% 0% 0% 0%)' }}>
                                <Plate src={media['crest']} alt="A mountain ridge above a sea of clouds" label="Crest · AMIHAN, above the clouds" ratio="auto" className="absolute inset-0" />
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-4 md:col-start-8">
                        <h2 className="t-display t-h2">From coast to crest.</h2>
                        <div className="relative mt-8 min-h-[8.5em]">
                            <p data-coast-label className="t-lede absolute inset-0">
                                Cafe-Isla pours by the sea. Its sister, AMIHAN, pours above the clouds.
                            </p>
                            <p data-crest-label className="t-lede absolute inset-0 opacity-0 motion-reduce:static motion-reduce:mt-4 motion-reduce:opacity-100">
                                One wind connects them: the amihan, the cool northeast breeze that comes down from the mountains every November.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* 6 · Bring the ridge home ---------------------------------------------- */
function BringHome({ featured }: { featured: Card[] }) {
    return (
        <section data-masl="1800" className="section">
            <div className="wrap">
                <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
                    <div>
                        <p className="t-label mb-6" data-reveal="fade">
                            The Highland Pantry
                        </p>
                        <h2 className="t-display t-h2" data-reveal="lines">
                            Bring the ridge home.
                        </h2>
                    </div>
                    <Link href="/pantry" className="link-line self-start text-[1.0625rem] md:self-auto">
                        Browse the Pantry <span aria-hidden>→</span>
                    </Link>
                </div>
                <div className="mt-16 grid gap-x-[clamp(24px,4vw,64px)] gap-y-16 sm:grid-cols-2 lg:grid-cols-3 md:mt-24">
                    {featured.map((p) => (
                        <div key={p.id} data-reveal="fade">
                            <ProductCard product={p} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
