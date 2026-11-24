import { ToastHost } from '@/components/feedback/toasts';
import { AltitudeRail } from '@/components/store/altitude-rail';
import { CartDrawerProvider } from '@/components/store/cart-drawer';
import { StoreFooter } from '@/components/store/footer';
import { LuxuryCursor } from '@/components/store/luxury-cursor';
import { MobileBar, StoreHeader } from '@/components/store/header';
import { MistPass } from '@/motion/mist-pass';
import { SmoothScroll } from '@/motion/smooth-scroll';
import { createContext, ReactNode, useContext, useState } from 'react';

/** Pages can flip the header to light-on-pine while a pine chapter sits under it. */
const HeaderToneContext = createContext<(t: 'mist' | 'pine') => void>(() => {});
export const useHeaderTone = () => useContext(HeaderToneContext);

/**
 * The storefront shell. Used as an Inertia *persistent* layout, so the
 * smooth scroller, cart drawer and toasts survive page changes.
 */
export default function StoreLayout({ children }: { children: ReactNode }) {
    const [tone, setTone] = useState<'mist' | 'pine'>('mist');
    return (
        <SmoothScroll>
            <ToastHost>
                <CartDrawerProvider>
                    <HeaderToneContext.Provider value={setTone}>
                        <a href="#main" className="bg-pine text-mist sr-only z-[100] px-4 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
                            Skip to content
                        </a>
                        <StoreHeader tone={tone} />
                        <AltitudeRail />
                        <main id="main">{children}</main>
                        <StoreFooter />
                        <MobileBar />
                        <MistPass />
                        <LuxuryCursor />
                    </HeaderToneContext.Provider>
                </CartDrawerProvider>
            </ToastHost>
        </SmoothScroll>
    );
}

export const storeLayout = (page: ReactNode) => <StoreLayout>{page}</StoreLayout>;
