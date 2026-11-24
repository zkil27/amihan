import { RidgeMark } from '@/components/brand/logo';
import { Link } from '@inertiajs/react';

export function StoreFooter() {
    return (
        <footer className="bg-basalt text-mist pb-[calc(60px+env(safe-area-inset-bottom))] md:pb-0">
            <div className="wrap grid gap-16 py-20 md:grid-cols-12 md:py-28">
                <div className="md:col-span-5">
                    <RidgeMark className="text-mist/80 h-8 w-auto" />
                    <p className="font-display mt-8 text-[1.75rem] leading-tight font-light">
                        A highland coffee sanctuary
                        <br />
                        by the Cafe-Isla Group.
                    </p>
                    <p className="text-mist/60 mt-4 text-[0.9375rem]">From coast to crest.</p>
                    <p className="text-mist/55 mt-10 text-[0.8125rem] leading-relaxed">
                        Founded by John Ezekiel <span className="font-display italic">Escueta</span>
                        <span aria-hidden="true"> · </span>
                        <span className="sr-only"> and </span>
                        Elijah Job <span className="font-display italic">Tamayo</span>
                    </p>
                </div>
                <nav className="grid grid-cols-2 gap-8 text-[0.9375rem] md:col-span-5 md:col-start-8" aria-label="Footer">
                    <ul className="grid gap-3">
                        <li><Link className="link-line" href="/story">Our story</Link></li>
                        <li><Link className="link-line" href="/origins">Origins</Link></li>
                        <li><Link className="link-line" href="/visit">Visit the sanctuary</Link></li>
                    </ul>
                    <ul className="grid gap-3">
                        <li><Link className="link-line" href="/pantry">Highland Pantry</Link></li>
                        <li><Link className="link-line" href="/account">Your orders</Link></li>
                        <li><Link className="link-line" href="/admin/login">Staff portal</Link></li>
                    </ul>
                </nav>
            </div>
            <div className="wrap border-mist/15 text-mist/50 flex flex-col gap-2 border-t py-6 text-[0.8125rem] md:flex-row md:justify-between">
                <p>© {new Date().getFullYear()} AMIHAN. A student project for PCU Dasmariñas. Payments are simulated.</p>
                <p className="t-num">14.11° N · 120.93° E</p>
            </div>
        </footer>
    );
}
