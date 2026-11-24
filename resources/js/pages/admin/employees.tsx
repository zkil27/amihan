import { FieldMessage } from '@/components/feedback';
import AdminLayout, { AdminButton, inputCls, Panel, td, th } from '@/layouts/admin-layout';
import { date } from '@/lib/format';
import { cn } from '@/lib/utils';
import { SharedData } from '@/types';
import { router, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';

type Emp = { id: number; name: string; email: string; role: string; created_at: string };
type Role = { value: string; label: string; can: string };

/** Role-based access control: admin, staff, fulfillment-only, courier. */
export default function Employees({ employees, roles }: { employees: Emp[]; roles: Role[] }) {
    const { props } = usePage<SharedData>();
    const { data, setData, post, processing, errors, reset } = useForm({ name: '', email: '', role: 'staff', password: '' });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/employees', { preserveScroll: true, onSuccess: () => reset() });
    };

    return (
        <AdminLayout title="Employees & roles">
            <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
                <div className="grid content-start gap-8">
                    <div className="bg-paper border-hair overflow-x-auto border">
                        <table className="w-full min-w-[560px]">
                            <thead>
                                <tr>
                                    <th className={th}>Name</th>
                                    <th className={th}>Since</th>
                                    <th className={th}>Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((e) => (
                                    <tr key={e.id}>
                                        <td className={td}>
                                            {e.name}
                                            <span className="text-ink-soft block text-[0.75rem]">{e.email}</span>
                                        </td>
                                        <td className={cn(td, 'text-ink-soft')}>{date(e.created_at)}</td>
                                        <td className={td}>
                                            <select
                                                className={cn(inputCls, 'w-44')}
                                                value={e.role}
                                                disabled={e.id === props.auth.user?.id}
                                                onChange={(ev) => router.patch(`/admin/employees/${e.id}`, { role: ev.target.value }, { preserveScroll: true })}
                                                aria-label={`Role for ${e.name}`}
                                            >
                                                {roles.map((r) => (
                                                    <option key={r.value} value={r.value}>
                                                        {r.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Panel title="What each role can do">
                        <dl className="grid gap-3 text-[0.875rem]">
                            {roles.map((r) => (
                                <div key={r.value} className="grid grid-cols-[140px_1fr] gap-4">
                                    <dt className="font-medium">{r.label}</dt>
                                    <dd className="text-ink-soft">{r.can}</dd>
                                </div>
                            ))}
                        </dl>
                    </Panel>
                </div>
                <Panel title="Add an employee">
                    <form onSubmit={submit} className="grid gap-4">
                        {(['name', 'email'] as const).map((k) => (
                            <label key={k} className="grid gap-1.5">
                                <span className="text-ink-soft text-[0.75rem] capitalize">{k}</span>
                                <input className={inputCls} type={k === 'email' ? 'email' : 'text'} value={data[k]} onChange={(e) => setData(k, e.target.value)} />
                                <FieldMessage error={errors[k]} />
                            </label>
                        ))}
                        <label className="grid gap-1.5">
                            <span className="text-ink-soft text-[0.75rem]">Role</span>
                            <select className={inputCls} value={data.role} onChange={(e) => setData('role', e.target.value)}>
                                {roles.map((r) => (
                                    <option key={r.value} value={r.value}>
                                        {r.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="grid gap-1.5">
                            <span className="text-ink-soft text-[0.75rem]">Temporary password</span>
                            <input className={inputCls} type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} />
                            <FieldMessage error={errors.password} />
                        </label>
                        <AdminButton disabled={processing}>Create account</AdminButton>
                    </form>
                </Panel>
            </div>
        </AdminLayout>
    );
}
