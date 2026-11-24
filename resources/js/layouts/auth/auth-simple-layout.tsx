import StoreLayout from '@/layouts/store-layout';

interface AuthLayoutProps {
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
}

/** Sign-in, sign-up and password pages: a single quiet column inside the storefront shell. */
export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <StoreLayout>
            <section className="pt-[calc(var(--header-h)+clamp(48px,12vh,140px))] pb-[var(--section-y)]">
                <div className="wrap max-w-[480px]">
                    <h1 className="t-display t-h2">{title}</h1>
                    {description && <p className="t-lede mt-4">{description}</p>}
                    <div className="mt-12">{children}</div>
                </div>
            </section>
        </StoreLayout>
    );
}
