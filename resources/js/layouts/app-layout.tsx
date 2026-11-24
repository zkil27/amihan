import StoreLayout from '@/layouts/store-layout';
import { type BreadcrumbItem } from '@/types';
import { Link } from '@inertiajs/react';

interface AppLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

/** Customer settings pages (profile, password) inside the storefront shell. */
export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <StoreLayout>
            <section className="pt-[calc(var(--header-h)+clamp(32px,8vh,96px))] pb-[var(--section-y)]">
                <div className="wrap max-w-[880px]">
                    <Link href="/account" className="link-line t-label">
                        ← Your account
                    </Link>
                    <div className="mt-8">{children}</div>
                </div>
            </section>
        </StoreLayout>
    );
}
