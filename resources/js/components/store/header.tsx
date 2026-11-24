import { Logo } from '@/components/brand/logo';
import { NumberFade } from '@/components/feedback';
import { cn } from '@/lib/utils';
import { dur, ease } from '@/motion/tokens';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useCartDrawer } from './cart-drawer';

const NAV = [
    { label: 'Story', href: '/story', match: ['/story', '/origins'] },
    { label: 'Pantry', href: '/pantry', match: ['/pantry'] },
    { label: 'Visit', href: '/visit', match: ['/visit'] },
];

/**
 * A quiet header: logo, three links, account, cart. On pine chapters
 * (tone="pine") it inverts. A hairline appears only once you scroll.
 */
export function StoreHeader({ tone = 'mist' }: { tone?: 'mist' | 'pine' }) {
    const { url, props } = usePage<SharedData>();
    const { setOpen } = useCartDrawer();
    const [scrolled, setScrolled] = useState(false);
    const [menu, setMenu] = useState(false);
    const count = props.cart?.count ?? 0;

    useEffect(() => {
        const on = () => setScrolled(window.scrollY > 24);
        on();
        window.addEventListener('scroll', on, { passive: true });
        return () => window.removeEventListener('scroll', on);
    }, []);

    // A brass hairline draws under the cart when the count goes up, then fades.
    const prev = useRef(count);
    const [pulse, setPulse] = useState(0);
    useEffect(() => {
        if (count > prev.current) setPulse((p) => p + 1);
        prev.current = count;
    }, [count]);

    const onPine = tone === 'pine' && !scrolled;
    const active = NAV.find((n) => n.match.some((m) => url.startsWith(m)))?.label;
    const account = props.auth.user ? { label: 'Account', href: '/account' } : { label: 'Sign in', href: '/login' };

    return (
        <header
            className={cn(
                'fixed inset-x-0 top-0 z-50 transition-[background-color,color,border-color] duration-500',
                onPine ? 'text-mist border-b border-transparent bg-transparent' : 'text-pine',
                !onPine && scrolled ? 'border-hair bg-mist border-b' : 'border-b border-transparent',
                !onPine && !scrolled && 'bg-transparent',
            )}
        >
            <div className="wrap flex h-[var(--header-h)] items-center justify-between">
                <Link href="/" className="-m-2 p-2" aria-label="AMIHAN home">
                    <Logo />
                </Link>

                <nav className="hidden items-center gap-10 md:flex" aria-label="Main">
                    {NAV.map((item) => (
                        <Link key={item.label} href={item.href} className="relative py-2 text-[0.9375rem]" aria-current={active === item.label ? 'page' : undefined}>
                            {item.label}
                            {active === item.label && (
                                <motion.span
                                    layoutId="nav-dot"
                                    className="bg-brass absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full"
                                    transition={{ duration: dur.base, ease: ease.mist }}
                                />
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-8">
                    <Link href={account.href} className="link-line hidden text-[0.9375rem] md:inline">
                        {account.label}
                    </Link>
                    <button onClick={() => setOpen(true)} className="relative hidden items-center gap-2 py-2 text-[0.9375rem] md:inline-flex" aria-label={`Cart, ${count} items`}>
                        Cart <span className="t-num">({<NumberFade value={count} />})</span>
                        <AnimatePresence>
                            {pulse > 0 && (
                                <motion.span
                                    key={pulse}
                                    className="bg-brass absolute right-0 -bottom-0.5 left-0 h-px origin-left"
                                    initial={{ scaleX: 0, opacity: 1 }}
                                    animate={{ scaleX: 1, opacity: [1, 1, 0], transition: { scaleX: { duration: 0.5, ease: ease.mist }, opacity: { duration: 1.8, times: [0, 0.6, 1] } } }}
                                />
                            )}
                        </AnimatePresence>
                    </button>
                    <MobileMenu open={menu} setOpen={setMenu} active={active} account={account} />
                </div>
            </div>
        </header>
    );
}

function MobileMenu({ open, setOpen, active, account }: { open: boolean; setOpen: (v: boolean) => void; active?: string; account: { label: string; href: string } }) {
    const links = [...NAV, { label: 'Origins', href: '/origins', match: [] }, { ...account, match: [] }];
    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger className="-mr-2 p-2 text-[0.9375rem] md:hidden">Menu</Dialog.Trigger>
            <AnimatePresence>
                {open && (
                    <Dialog.Portal forceMount>
                        <Dialog.Content asChild forceMount aria-describedby={undefined}>
                            <motion.div
                                className="bg-mist text-pine fixed inset-0 z-[75] flex flex-col"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, transition: { duration: dur.base, ease: ease.mist } }}
                                exit={{ opacity: 0, transition: { duration: dur.quick } }}
                            >
                                <div className="wrap flex h-[var(--header-h)] items-center justify-between">
                                    <Dialog.Title asChild>
                                        <span>
                                            <Logo />
                                        </span>
                                    </Dialog.Title>
                                    <Dialog.Close className="-mr-2 p-2 text-[0.9375rem]">Close</Dialog.Close>
                                </div>
                                <nav className="wrap mt-12 flex flex-col gap-2" aria-label="Mobile">
                                    {links.map((l, i) => (
                                        <motion.div key={l.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.05 + i * 0.04, duration: dur.base, ease: ease.mist } }}>
                                            <Link href={l.href} onClick={() => setOpen(false)} className={cn('t-display block py-2 text-[2.75rem]', active === l.label && 'italic')}>
                                                {l.label}
                                            </Link>
                                        </motion.div>
                                    ))}
                                </nav>
                                <p className="wrap t-label mt-auto pb-10">A highland coffee sanctuary by the Cafe-Isla Group.</p>
                            </motion.div>
                        </Dialog.Content>
                    </Dialog.Portal>
                )}
            </AnimatePresence>
        </Dialog.Root>
    );
}

/** Thumb-reach bar on phones: Pantry and Cart. */
export function MobileBar() {
    const { props, url } = usePage<SharedData>();
    const { setOpen } = useCartDrawer();
    const count = props.cart?.count ?? 0;
    if (url.startsWith('/checkout')) return null;
    return (
        <div className="border-hair bg-mist/95 fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] md:hidden">
            <div className="grid h-[60px] grid-cols-2">
                <Link href="/pantry" className="flex items-center justify-center text-[0.9375rem]">
                    Pantry
                </Link>
                <button onClick={() => setOpen(true)} className="border-hair flex items-center justify-center gap-2 border-l text-[0.9375rem]" aria-label={`Cart, ${count} items`}>
                    Cart <span className="t-num">({<NumberFade value={count} />})</span>
                </button>
            </div>
        </div>
    );
}
