import { Logo } from '@/components/brand/logo';
import { ActionButton, Field } from '@/components/feedback';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

/** Restricted staff portal sign-in. Customers are refused here. */
export default function AdminLogin() {
    const { data, setData, post, processing, errors, reset } = useForm<{ email: string; password: string; remember: boolean }>({ email: '', password: '', remember: false });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('admin.login'), { onFinish: () => reset('password') });
    };

    return (
        <div className="bg-pine text-mist flex min-h-screen items-center justify-center px-5">
            <Head title="Staff portal" />
            <div className="bg-mist text-pine w-full max-w-[440px] px-8 py-12 md:px-12">
                <Link href="/">
                    <Logo />
                </Link>
                <h1 className="t-display mt-12 text-[2.25rem]">Staff portal</h1>
                <p className="t-label mt-2">For AMIHAN employees and couriers.</p>
                <form onSubmit={submit} className="mt-10 grid gap-8">
                    <Field label="Work email" type="email" autoFocus autoComplete="username" value={data.email} onChange={(e) => setData('email', e.target.value)} error={errors.email} />
                    <Field label="Password" type="password" autoComplete="current-password" value={data.password} onChange={(e) => setData('password', e.target.value)} error={errors.password} />
                    <label className="flex items-center gap-3 text-[0.9375rem]">
                        <input type="checkbox" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)} className="accent-pine h-4 w-4" />
                        Keep me signed in
                    </label>
                    <ActionButton type="submit" loading={processing} full arrow>
                        Sign in
                    </ActionButton>
                </form>
            </div>
        </div>
    );
}
