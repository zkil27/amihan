import { cn } from '@/lib/utils';
import { dur, ease, exit } from '@/motion/tokens';
import { SharedData, Toast } from '@/types';
import { usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';

type Item = Toast & { id: number };
const ToastContext = createContext<(t: Toast) => void>(() => {});

/** Push a toast from anywhere: const toast = useToast(); toast({ type, message }) */
export const useToast = () => useContext(ToastContext);

/**
 * Toasts are used sparingly: only for outcomes that happen away from
 * where the visitor is looking. Slim card, hairline top edge, rises 8px,
 * leaves after 4 s (paused while hovered).
 */
export function ToastHost({ children, placement = 'store' }: { children: ReactNode; placement?: 'store' | 'admin' }) {
    const [items, setItems] = useState<Item[]>([]);
    const seq = useRef(0);
    const { props } = usePage<SharedData>();

    const push = useCallback((t: Toast) => {
        const id = ++seq.current;
        setItems((list) => [...list.slice(-2), { ...t, id }]);
    }, []);

    const flash = props.flash?.toast;
    useEffect(() => {
        if (flash) push(flash);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flash]);

    const remove = (id: number) => setItems((list) => list.filter((i) => i.id !== id));

    return (
        <ToastContext.Provider value={push}>
            {children}
            <div
                className={cn(
                    'pointer-events-none fixed z-[90] flex flex-col gap-2',
                    placement === 'store' ? 'inset-x-4 bottom-[calc(76px+env(safe-area-inset-bottom))] md:inset-x-auto md:right-8 md:bottom-8 md:w-[360px]' : 'right-6 bottom-6 w-[340px]',
                )}
                role="status"
                aria-live="polite"
            >
                <AnimatePresence initial={false}>
                    {items.map((t) => (
                        <ToastCard key={t.id} toast={t} onDone={() => remove(t.id)} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

function ToastCard({ toast, onDone }: { toast: Item; onDone: () => void }) {
    const [hover, setHover] = useState(false);

    useEffect(() => {
        if (hover) return;
        const t = window.setTimeout(onDone, 4000);
        return () => window.clearTimeout(t);
    }, [hover, onDone]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: dur.base, ease: ease.mist } }}
            exit={{ opacity: 0, transition: { duration: exit(dur.base) } }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className="bg-paper text-pine pointer-events-auto relative border-t px-5 py-4 text-[0.9375rem] shadow-[0_18px_40px_-24px_rgb(30_45_36/0.35)]"
            style={{ borderTopColor: toast.type === 'error' ? 'var(--color-clay)' : toast.type === 'success' ? 'var(--color-brass)' : 'var(--color-moss)' }}
        >
            <div className="flex items-start justify-between gap-4">
                <p>{toast.message}</p>
                <button onClick={onDone} className="text-ink-soft hover:text-pine -mr-1 px-1 text-sm" aria-label="Dismiss">
                    ✕
                </button>
            </div>
        </motion.div>
    );
}
