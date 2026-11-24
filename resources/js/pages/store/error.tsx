import { RidgeMark } from '@/components/brand/logo';
import { storeLayout } from '@/layouts/store-layout';
import { Head, Link } from '@inertiajs/react';

const COPY: Record<number, [string, string]> = {
    403: ['This path is closed.', "You don't have access to this part of the sanctuary."],
    404: ['Lost in the fog.', "We couldn't find that page. It may have moved down the mountain."],
    500: ['Something slipped.', 'Our end had a problem. Please try again in a moment.'],
    503: ['Back soon.', "We're tending the hearth. Please check back shortly."],
};

export default function ErrorPage({ status }: { status: number }) {
    const [title, body] = COPY[status] ?? COPY[500];
    return (
        <>
            <Head title={title} />
            <section className="flex min-h-[80svh] items-center pt-[var(--header-h)]">
                <div className="wrap">
                    <RidgeMark className="text-pine/60 h-10 w-auto" />
                    <p className="t-num text-ink-soft mt-10">{status}</p>
                    <h1 className="t-display t-h1 mt-4">{title}</h1>
                    <p className="t-lede mt-6">{body}</p>
                    <Link href="/" className="link-line mt-10 inline-block">
                        Return to the start <span aria-hidden>→</span>
                    </Link>
                </div>
            </section>
        </>
    );
}

ErrorPage.layout = storeLayout;
