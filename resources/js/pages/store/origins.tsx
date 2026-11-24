import { Plate } from '@/components/feedback';
import { masl, php } from '@/lib/format';
import { storeLayout } from '@/layouts/store-layout';
import { useReveal } from '@/motion/use-reveal';
import { ProductCard } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useRef } from 'react';

type Origin = ProductCard & { story: string | null; tasting_notes: string | null; process: string | null };

const IMG: Record<string, string> = {
    'Amadeo, Cavite': 'origin-amadeo',
    'Sagada, Mountain Province': 'origin-sagada',
    'Atok, Benguet': 'origin-atok',
    'Mt. Apo, Davao': 'origin-apo',
};

/** Origins & farmers, ordered from lowest to highest, read by the altitude rail. */
export default function Origins({ origins, media }: { origins: Origin[]; media: Record<string, string> }) {
    const root = useRef<HTMLDivElement>(null);
    useReveal(root);

    return (
        <div ref={root}>
            <Head title="Origins" />
            <section data-masl="0" className="pt-[calc(var(--header-h)+clamp(64px,16vh,200px))] pb-[var(--section-y)]">
                <div className="wrap md:grid md:grid-cols-12">
                    <div className="md:col-span-8 md:col-start-2">
                        <h1 className="t-display t-h1" data-reveal="lines">
                            Four farms, from the foothills to the summit.
                        </h1>
                        <p className="t-lede mt-8" data-reveal="fade">
                            Scroll to climb. Each origin sits higher than the last, and the cup changes with it.
                        </p>
                    </div>
                </div>
            </section>

            {origins.map((o, i) => (
                <section key={o.id} data-masl={o.elevation_masl ?? 0} className="section hair">
                    <div className="wrap grid items-center gap-12 md:grid-cols-12 md:gap-8">
                        <div className={i % 2 ? 'md:col-span-6 md:col-start-6' : 'md:col-span-6 md:col-start-1'}>
                            <Plate src={media[IMG[o.origin ?? ''] ?? ''] ?? o.image} alt={`Coffee farm in ${o.origin}`} label={`${o.origin} · illustrative`} ratio="3 / 2" />
                        </div>
                        <div className={i % 2 ? 'md:col-span-4 md:col-start-1 md:row-start-1' : 'md:col-span-4 md:col-start-8'}>
                            <p className="t-num text-brass-deep" data-reveal="fade">
                                {masl(o.elevation_masl)}
                            </p>
                            <h2 className="t-display t-h2 mt-5" data-reveal="lines">
                                {o.origin}
                            </h2>
                            <p className="t-lede mt-6" data-reveal="fade">
                                {o.story}
                            </p>
                            <p className="t-label mt-6">
                                {o.tasting_notes} · {o.process}
                            </p>
                            <Link href={route('pantry.show', o.slug)} className="link-line mt-8 inline-block text-[1.0625rem]">
                                {o.name}, from {php(o.price_from)} <span aria-hidden>→</span>
                            </Link>
                        </div>
                    </div>
                </section>
            ))}
        </div>
    );
}

Origins.layout = storeLayout;
