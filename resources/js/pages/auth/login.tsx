import { ActionButton, Field } from '@/components/feedback';
import AuthLayout from '@/layouts/auth-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

/** Customer sign-in. The password is checked against its bcrypt hash on the server. */
export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<{ email: string; password: string; remember: boolean }>({ email: '', password: '', remember: false });
    const [show, setShow] = useState(false);
    const passwordRef = useRef<HTMLInputElement>(null);

    // A wrong login clears and refocuses the password field.
    useEffect(() => {
        if (errors.email || errors.password) passwordRef.current?.focus();
    }, [errors]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <AuthLayout title="Welcome back." description="Sign in to check out, track orders and request returns.">
            <Head title="Sign in" />
            {status && <p className="text-pine mb-8 text-[0.9375rem]">{status}</p>}
            <form className="grid gap-8" onSubmit={submit}>
                <Field label="Email" type="email" required autoFocus autoComplete="email" inputMode="email" value={data.email} onChange={(e) => setData('email', e.target.value)} error={errors.email} />
                <div className="relative">
                    <Field
                        ref={passwordRef}
                        label="Password"
                        type={show ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        error={errors.password}
                    />
                    <button type="button" onClick={() => setShow((s) => !s)} className="t-label hover:text-pine absolute top-0 right-0" aria-pressed={show}>
                        {show ? 'Hide' : 'Show'}
                    </button>
                </div>
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-3 text-[0.9375rem]">
                        <input type="checkbox" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)} className="accent-pine h-4 w-4" />
                        Keep me signed in
                    </label>
                    {canResetPassword && (
                        <Link href={route('password.request')} className="link-line t-label">
                            Forgot password?
                        </Link>
                    )}
                </div>
                <ActionButton type="submit" loading={processing} full arrow>
                    Sign in
                </ActionButton>
            </form>
            <p className="t-label mt-10">
                New here?{' '}
                <Link href={route('register')} className="link-line text-pine">
                    Create an account
                </Link>
            </p>
        </AuthLayout>
    );
}
