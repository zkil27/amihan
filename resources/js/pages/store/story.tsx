import { Plate } from '@/components/feedback';
import { storeLayout } from '@/layouts/store-layout';
import { useReveal } from '@/motion/use-reveal';
import { Head, Link } from '@inertiajs/react';
import { useRef } from 'react';

const PILLARS = [
    {
        n: '01',
        title: 'Coast to crest',
        body: 'Cafe-Isla taught us to slow down by the sea. AMIHAN carries that calm up the mountain, to where the coffee grows.',
        img: 'coast',
    },
    {
        n: '02',
        title: 'Crafted by altitude',
        body: 'Terroir over syrups. Every metre of elevation changes the cup, so we list it on every bag, and let it lead.',
        img: 'crest',
    },
    {
        n: '03',
        title: 'The hands behind the harvest',
        body: 'We buy directly from growers in Amadeo, Sagada, Atok and Mt. Apo, and we pay for the patience high farms demand.',
        img: 'origin-atok',
    },
    {
        n: '04',
        title: 'The architecture of slowness',
        body: 'No blenders and no screens at the bar. A warm oshibori towel on arrival, and the first pour at six, when the breeze comes down.',
        img: 'sanctuary',
    },
];

const FOUNDERS = [
    { n: '01', given: 'John Ezekiel', family: 'Escueta' },
    { n: '02', given: 'Elijah Job', family: 'Tamayo' },
];

export default function Story({ media }: { media: Record<string, string> }) {
    const root = useRef<HTMLDivElement>(null);
    useReveal(root);

    return (
        <div ref={root}>
            <Head title="Our story" />
            <section className="pt-[calc(var(--header-h)+clamp(64px,16vh,200px))] pb-[var(--section-y)]">
                <div className="wrap grid gap-10 md:grid-cols-12">
                    <p className="t-label md:col-span-2" data-reveal="fade">
                        Our story
                    </p>
                    <div className="md:col-span-8">
                        <h1 className="t-display t-h1" data-reveal="lines">
                            Amihan is the cool wind that comes down from the mountains.
                        </h1>
                        <p className="t-lede mt-10" data-reveal="fade">
                            Every November the northeast monsoon arrives in the Philippines, cold and dry, carrying highland air to the lowlands. We named our sanctuary after it, because that is what we hope a cup can do: bring a little of the mountain down to you.
                        </p>
                    </div>
                </div>
            </section>

            {PILLARS.map((p, i) => (
                <section key={p.n} className="section hair">
                    <div className="wrap grid items-center gap-12 md:grid-cols-12 md:gap-8">
                        <div className={i % 2 ? 'md:col-span-5 md:col-start-7 md:row-start-1' : 'md:col-span-5 md:col-start-2'}>
                            <Plate src={media[p.img]} alt={p.title} label={p.title} />
                        </div>
                        <div className={i % 2 ? 'md:col-span-4 md:col-start-2 md:row-start-1' : 'md:col-span-4 md:col-start-8'}>
                            <p className="t-num text-ink-soft" data-reveal="fade">
                                {p.n}
                            </p>
                            <h2 className="t-display t-h2 mt-6" data-reveal="lines">
                                {p.title}
                            </h2>
                            <p className="t-lede mt-6" data-reveal="fade">
                                {p.body}
                            </p>
                        </div>
                    </div>
                </section>
            ))}

            <section className="section hair" aria-labelledby="founders">
                <div className="wrap grid gap-10 md:grid-cols-12">
                    <p className="t-label md:col-span-2" data-reveal="fade">
                        The founders
                    </p>
                    <div className="md:col-span-9">
                        <h2 id="founders" className="t-display t-h2 max-w-[16ch]" data-reveal="lines">
                            Two founders, one unhurried cup.
                        </h2>
                        <p className="t-lede mt-8" data-reveal="fade">
                            AMIHAN began with a simple wish: to carry the calm of the coast up to where the coffee grows, and let the altitude speak for itself.
                        </p>
                        <ul className="mt-16 grid gap-12 md:mt-24 md:grid-cols-2 md:gap-8">
                            {FOUNDERS.map((f) => (
                                <li key={f.n} className="hair pt-8" data-reveal="fade">
                                    <p className="t-num text-ink-soft">
                                        {f.n} · Co-founder
                                    </p>
                                    <p className="t-display t-h3 mt-6">
                                        {f.given} <span className="italic">{f.family}</span>
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            <section className="bg-pine text-mist section">
                <div className="wrap flex flex-col items-start gap-10 md:flex-row md:items-end md:justify-between">
                    <h2 className="t-display t-h2 max-w-[14ch]" data-reveal="lines">
                        Meet the four origins.
                    </h2>
                    <Link href="/origins" className="btn btn-on-pine">
                        Follow the altitude <span className="btn-arrow">→</span>
                    </Link>
                </div>
            </section>
        </div>
    );
}

Story.layout = storeLayout;
