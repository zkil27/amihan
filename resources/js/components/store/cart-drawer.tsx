import { dur, ease, exit } from '@/motion/tokens';
import { useLenis } from '@/motion/smooth-scroll';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'motion/react';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { CartPanel } from './cart-panel';

const CartDrawerContext = createContext<{ open: boolean; setOpen: (v: boolean) => void }>({ open: false, setOpen: () => {} });
export const useCartDrawer = () => useContext(CartDrawerContext);

/** Glides in from the right on desktop, up from the bottom on mobile; the page dims to mist. */
export function CartDrawerProvider({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false);
    const lenis = useLenis();
    const { props } = usePage<SharedData>();

    useEffect(() => {
        if (open) lenis?.stop();
        else lenis?.start();
    }, [open, lenis]);

    const [isDesktop, setDesktop] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches);
    useEffect(() => {
        const mq = window.matchMedia('(min-width: 768px)');
        const on = () => setDesktop(mq.matches);
        mq.addEventListener('change', on);
        return () => mq.removeEventListener('change', on);
    }, []);

    const from = isDesktop ? { x: '100%' } : { y: '100%' };

    return (
        <CartDrawerContext.Provider value={{ open, setOpen }}>
            {children}
            <Dialog.Root open={open} onOpenChange={setOpen}>
                <AnimatePresence>
                    {open && (
                        <Dialog.Portal forceMount>
                            <Dialog.Overlay asChild forceMount>
                                <motion.div
                                    className="fixed inset-0 z-[70] bg-[rgb(234_231_225/0.72)]"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1, transition: { duration: dur.base, ease: ease.mist } }}
                                    exit={{ opacity: 0, transition: { duration: exit(dur.base) } }}
                                />
                            </Dialog.Overlay>
                            <Dialog.Content asChild forceMount aria-describedby={undefined}>
                                <motion.div
                                    className="bg-mist text-pine fixed z-[71] flex flex-col shadow-[0_0_60px_-30px_rgb(30_45_36/0.5)] max-md:inset-x-0 max-md:bottom-0 max-md:max-h-[88dvh] max-md:pb-[env(safe-area-inset-bottom)] md:inset-y-0 md:right-0 md:w-[460px]"
                                    initial={{ ...from, opacity: 0.6 }}
                                    animate={{ x: 0, y: 0, opacity: 1, transition: { duration: dur.base, ease: ease.mist } }}
                                    exit={{ ...from, opacity: 0.6, transition: { duration: exit(dur.base), ease: ease.out } }}
                                >
                                    <div className="flex items-center justify-between px-6 pt-6 pb-2 md:px-10 md:pt-10">
                                        <Dialog.Title className="font-display text-2xl font-light">
                                            Your cart <span className="t-num text-ink-soft ml-1 align-middle">{props.cart?.count ?? 0}</span>
                                        </Dialog.Title>
                                        <Dialog.Close className="link-line t-label hover:text-pine">Close</Dialog.Close>
                                    </div>
                                    <div className="flex min-h-0 flex-1 flex-col px-6 pb-6 md:px-10 md:pb-10">
                                        <CartPanel onNavigate={() => setOpen(false)} />
                                    </div>
                                </motion.div>
                            </Dialog.Content>
                        </Dialog.Portal>
                    )}
                </AnimatePresence>
            </Dialog.Root>
        </CartDrawerContext.Provider>
    );
}
