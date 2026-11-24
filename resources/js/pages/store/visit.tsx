import { Plate } from '@/components/feedback';
import { storeLayout } from '@/layouts/store-layout';
import { useReveal } from '@/motion/use-reveal';
import { Head, Link } from '@inertiajs/react';
import { useRef } from 'react';

const HOURS = [
    ['First Breeze', '6:00 to 8:00 AM', 'Sunrise pour-overs, by the window'],
    ['The Bar', '8:00 AM to 6:00 PM', 'Elevation Flight, cortados, bakes'],
    ['Afternoon Hearth', '2:00 to 5:00 PM', 'Bibingka from the cast iron'],
];

/** The Sanctuary: visiting the slow bar. Address is fictional (student project). */
export default function Visit({ media }: { media: Record<string, string> }) {
    const root = useRef<HTMLDivElement>(null);
    useReveal(root);

    return (
        <div ref={root}>
            <Head title="Visit" />
            <section className="pt-[calc(var(--header-h)+clamp(64px,14vh,180px))] pb-[var(--section-y)]">
                <div className="wrap grid gap-12 md:grid-cols-12 md:gap-8">
                    <div className="md:col-span-5">
                        <p className="t-label mb-6" data-reveal="fade">
                            The sanctuary · 1,500 MASL
                        </p>
                        <h1 className="t-display t-h1" data-reveal="lines">
                            Come up for air.
                        </h1>
                        <p className="t-lede mt-8" data-reveal="fade">
                            A long pale-wood bar, one kettle at a time, and a window full of pines. Phones rest in a linen pouch at the door if you'd like them to.
                        </p>
                    </div>
                    <div className="md:col-span-6 md:col-start-7">
                        <Plate src={media['sanctuary']} alt="The slow bar interior with pine trees in fog beyond the window" label="The slow bar" ratio="3 / 2" priority />
                    </div>
                </div>
            </section>

            <section className="hair section">
                <div className="wrap grid gap-16 md:grid-cols-12 md:gap-8">
                    <div className="md:col-span-4">
                        <h2 className="t-display t-h3" data-reveal="lines">
                            Hours
                        </h2>
                        <p className="t-label mt-4">Wednesday to Monday. Closed Tuesdays for roasting.</p>
                    </div>
                    <dl className="md:col-span-7 md:col-start-6">
                        {HOURS.map(([name, time, note]) => (
                            <div key={name} className="hair grid gap-1 py-6 first:border-t-0 md:grid-cols-[1fr_auto] md:gap-8">
                                <dt>
                                    <span className="font-display text-xl font-light">{name}</span>
                                    <span className="t-label block">{note}</span>
                                </dt>
                                <dd className="t-num self-center">{time}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            <section className="bg-pine text-mist section">
                <div className="wrap grid gap-12 md:grid-cols-12 md:gap-8">
                    <div className="md:col-span-5">
                        <h2 className="t-display t-h2" data-reveal="lines">
                            Finding us
                        </h2>
                    </div>
                    <div className="md:col-span-5 md:col-start-8">
                        <p className="text-[1.125rem] leading-relaxed">
                            Km 6, Halsema Highway
                            <br />
                            La Trinidad, Benguet
                        </p>
                        <p className="text-mist/60 mt-3 text-[0.8125rem]">Fictional address for this student project.</p>
                        <p className="text-mist/70 mt-8 leading-relaxed">Walk-ins welcome at the bar. The First Breeze window seats eight; message us the day before.</p>
                        <Link href="/pantry" className="link-line mt-10 inline-block">
                            Can't make the climb? Order from the Pantry <span aria-hidden>→</span>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

Visit.layout = storeLayout;
