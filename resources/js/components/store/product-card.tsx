import { Plate } from '@/components/feedback';
import { masl, php } from '@/lib/format';
import { ProductCard as Card } from '@/types';
import { Link } from '@inertiajs/react';

/**
 * Restrained card: image, name, origin · altitude, price. Nothing else.
 * Adding to cart happens on the product page.
 */
export function ProductCard({ product, priority = false }: { product: Card; priority?: boolean }) {
    return (
        <Link href={route('pantry.show', product.slug)} className="group block focus-visible:outline-offset-8" prefetch>
            <Plate
                src={product.image}
                alt={product.name}
                label={product.category ?? undefined}
                priority={priority}
                className="transition-opacity duration-500 group-hover:opacity-[0.92]"
                style={{ viewTransitionName: `product-${product.id}` } as React.CSSProperties}
            />
            <div className="mt-5 flex items-baseline justify-between gap-4">
                <h3 className="font-display text-[1.375rem] leading-tight font-light">
                    <span className="link-line">{product.name}</span>
                </h3>
                <p className="t-num text-pine shrink-0">
                    {product.has_range && <span className="text-ink-soft font-sans text-[0.75rem]">from </span>}
                    {php(product.price_from)}
                </p>
            </div>
            <p className="t-label mt-1.5">
                {[product.origin, product.elevation_masl ? masl(product.elevation_masl) : null].filter(Boolean).join(' · ') || product.subtitle}
                {!product.in_stock && <span className="text-clay"> · Sold out</span>}
            </p>
        </Link>
    );
}
