import { CartPanel } from '@/components/store/cart-panel';
import { storeLayout } from '@/layouts/store-layout';
import { Head } from '@inertiajs/react';

/** Full-page cart (the drawer shows the same panel). */
export default function Cart() {
    return (
        <>
            <Head title="Cart" />
            <section className="pt-[calc(var(--header-h)+clamp(48px,10vh,120px))] pb-[var(--section-y)]">
                <div className="wrap max-w-[640px]">
                    <h1 className="t-display t-h1">Your cart</h1>
                    <div className="mt-12 flex flex-col">
                        <CartPanel variant="page" />
                    </div>
                </div>
            </section>
        </>
    );
}

Cart.layout = storeLayout;
