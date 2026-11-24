import { Logo } from '@/components/brand/logo';
import { ToastHost } from '@/components/feedback/toasts';
import { cn } from '@/lib/utils';
import { SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ReactNode, useState } from 'react';

type NavEntry = { label: string; href: string; match: string; can?: keyof NonNullable<SharedData['auth']['can']> };

const NAV: NavEntry[] = [
    { label: 'Overview', href: '/admin', match: '/admin' },
    { label: 'Orders', href: '/admin/orders', match: '/admin/orders', can: 'orders' },
    { label: 'Returns', href: '/admin/returns', match: '/admin/returns', can: 'returns' },
    { label: 'Products', href: '/admin/products', match: '/admin/products', can: 'catalog' },
    { label: 'Categories', href: '/admin/categories', match: '/admin/categories', can: 'catalog' },
    { label: 'Customers', href: '/admin/customers', match: '/admin/customers', can: 'customers' },
    { label: 'Employees', href: '/admin/employees', match: '/admin/employees', can: 'employees' },
];

const ROLE_LABEL: Record<string, string> = { admin: 'Admin', staff: 'Staff', fulfillment: 'Fulfillment', courier: 'Courier' };

/**
 * The admin portal is an Operate surface: calm, fast, scannable.
 * The nav only shows what the signed-in role is allowed to use.
 */
export default function AdminLayout({ title, actions, children }: { title: string; actions?: ReactNode; children: ReactNode }) {
    const { props, url } = usePage<SharedData>();
    const { user, can } = props.auth;
    const [open, setOpen] = useState(false);
    const path = url.split('?')[0];
    const items = NAV.filter((n) => !n.can || can?.[n.can]);
    const isActive = (n: NavEntry) => (n.match === '/admin' ? path === '/admin' : path.startsWith(n.match));

    return (
        <ToastHost placement="admin">
            <Head title={`${title} · Admin`} />
            <div className="bg-mist text-pine min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
                <aside className={cn('border-hair bg-[#e3dfd7] lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-r', open ? 'block' : 'hidden lg:flex')}>
                    <div className="hidden h-16 items-center px-6 lg:flex">
                        <Link href="/admin">
                            <Logo />
                        </Link>
                    </div>
                    <nav className="flex flex-col gap-0.5 px-3 py-4 lg:py-2" aria-label="Admin">
                        {items.map((n) => (
                            <Link
                                key={n.href}
                                href={n.href}
                                onClick={() => setOpen(false)}
                                className={cn('flex h-10 items-center rounded-[2px] px-3 text-[0.9375rem] transition-colors duration-200', isActive(n) ? 'bg-pine text-mist' : 'hover:bg-mist/70')}
                                aria-current={isActive(n) ? 'page' : undefined}
                            >
                                {n.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="border-hair mt-auto border-t px-6 py-5 text-[0.8125rem]">
                        <p className="truncate">{user?.name}</p>
                        <p className="text-ink-soft">{ROLE_LABEL[user?.role ?? ''] ?? user?.role}</p>
                        <div className="mt-3 flex gap-4">
                            <Link href="/" className="link-line text-ink-soft">
                                Storefront
                            </Link>
                            <button onClick={() => router.post(route('admin.logout'))} className="link-line text-ink-soft">
                                Sign out
                            </button>
                        </div>
                    </div>
                </aside>

                <div className="min-w-0">
                    <div className="border-hair bg-mist sticky top-0 z-30 flex h-14 items-center justify-between border-b px-5 lg:hidden">
                        <Link href="/admin">
                            <Logo />
                        </Link>
                        <button onClick={() => setOpen((o) => !o)} className="text-[0.9375rem]" aria-expanded={open}>
                            {open ? 'Close' : 'Menu'}
                        </button>
                    </div>
                    <main className="px-5 py-8 md:px-10 md:py-10">
                        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                            <h1 className="font-display text-[2rem] leading-tight font-light">{title}</h1>
                            {actions}
                        </div>
                        {children}
                    </main>
                </div>
            </div>
        </ToastHost>
    );
}

/** A raised panel for admin content. */
export function Panel({ title, children, className, aside }: { title?: string; children: ReactNode; className?: string; aside?: ReactNode }) {
    return (
        <section className={cn('bg-paper border-hair border', className)}>
            {title && (
                <div className="border-hair flex items-center justify-between border-b px-5 py-3.5">
                    <h2 className="text-[0.9375rem] font-medium">{title}</h2>
                    {aside}
                </div>
            )}
            <div className="p-5">{children}</div>
        </section>
    );
}

/** Admin tables: plain, scannable, hairline rows. */
export const th = 'text-ink-soft border-hair border-b px-4 py-3 text-left text-[0.75rem] font-normal whitespace-nowrap';
export const td = 'border-hair border-b px-4 py-3 align-middle text-[0.875rem]';

export function AdminButton({ variant = 'solid', className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'solid' | 'line' | 'danger' }) {
    return (
        <button
            className={cn(
                'inline-flex h-9 items-center justify-center gap-2 rounded-[2px] px-4 text-[0.8125rem] font-medium transition-colors duration-200 disabled:pointer-events-none disabled:opacity-40',
                variant === 'solid' && 'bg-pine text-mist hover:bg-pine-soft',
                variant === 'line' && 'border-hair-strong hover:border-pine border',
                variant === 'danger' && 'text-clay border-clay/50 hover:border-clay border',
                className,
            )}
            {...props}
        />
    );
}

export const inputCls = 'border-hair-strong bg-mist focus:border-pine h-9 w-full rounded-[2px] border px-3 text-[0.875rem] outline-none transition-colors';
