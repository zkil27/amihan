import { ActionButton, Field } from '@/components/feedback';
import { cn } from '@/lib/utils';
import AuthLayout from '@/layouts/auth-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useMemo, useState } from 'react';

/** Strength hairline: length plus variety of characters, 0 to 4. */
function strength(pw: string) {
    let s = 0;
    if (pw.length >= 8) s++;
    if (pw.length >= 12) s++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
    if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
    return s;
}

/** Secure registration: the server stores only a bcrypt hash of the password. */
export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({ name: '', email: '', phone: '', password: '', password_confirmation: '' });
    const [show, setShow] = useState(false);
    const score = useMemo(() => strength(data.password), [data.password]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    return (
        <AuthLayout title="Create your account." description="Track orders, save your address and request returns.">
            <Head title="Create account" />
            <form className="grid gap-8" onSubmit={submit}>
                <Field label="Full name" required autoFocus autoComplete="name" value={data.name} onChange={(e) => setData('name', e.target.value)} error={errors.name} />
                <Field label="Email" type="email" required autoComplete="email" inputMode="email" value={data.email} onChange={(e) => setData('email', e.target.value)} error={errors.email} hint="Order confirmations and shipping updates go here." />
                <Field label="Mobile number (optional)" type="tel" inputMode="tel" autoComplete="tel" placeholder="09171234567" value={data.phone} onChange={(e) => setData('phone', e.target.value.replace(/\s/g, ''))} error={errors.phone} />
                <div>
                    <div className="relative">
                        <Field label="Password" type={show ? 'text' : 'password'} required autoComplete="new-password" value={data.password} onChange={(e) => setData('password', e.target.value)} error={errors.password} />
                        <button type="button" onClick={() => setShow((s) => !s)} className="t-label hover:text-pine absolute top-0 right-0" aria-pressed={show}>
                            {show ? 'Hide' : 'Show'}
                        </button>
                    </div>
                    <div className="bg-hair mt-2 h-px" aria-hidden>
                        <div className={cn('h-px transition-[width,background-color] duration-700 ease-[var(--ease-mist)]', score >= 3 ? 'bg-pine' : score === 2 ? 'bg-brass' : 'bg-moss')} style={{ width: `${(score / 4) * 100}%` }} />
                    </div>
                    <p className="t-label mt-2">At least 8 characters. Longer is stronger.</p>
                </div>
                <Field label="Confirm password" type={show ? 'text' : 'password'} required autoComplete="new-password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} error={errors.password_confirmation} />
                <ActionButton type="submit" loading={processing} full arrow>
                    Create account
                </ActionButton>
            </form>
            <p className="t-label mt-10">
                Already have an account?{' '}
                <Link href={route('login')} className="link-line text-pine">
                    Sign in
                </Link>
            </p>
        </AuthLayout>
    );
}
