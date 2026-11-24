import { FieldMessage, StatusPill } from '@/components/feedback';
import AdminLayout, { AdminButton, inputCls, Panel, td, th } from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';
import { router, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

type Category = { id: number; name: string; slug: string; description: string | null; is_archived: boolean; products_count: number };

export default function Categories({ categories }: { categories: Category[] }) {
    const { data, setData, post, processing, errors, reset } = useForm({ name: '', description: '' });
    const [editing, setEditing] = useState<number | null>(null);
    const [draft, setDraft] = useState({ name: '', description: '' });

    const add = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/categories', { preserveScroll: true, onSuccess: () => reset() });
    };

    const save = (c: Category, patch: Partial<Category>) => router.patch(`/admin/categories/${c.id}`, { name: c.name, description: c.description, is_archived: c.is_archived, ...patch }, { preserveScroll: true, onSuccess: () => setEditing(null) });

    return (
        <AdminLayout title="Categories">
            <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
                <div className="bg-paper border-hair overflow-x-auto border">
                    <table className="w-full min-w-[560px]">
                        <thead>
                            <tr>
                                <th className={th}>Category</th>
                                <th className={cn(th, 'text-right')}>Products</th>
                                <th className={th}>Status</th>
                                <th className={th}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((c) => (
                                <tr key={c.id}>
                                    <td className={td}>
                                        {editing === c.id ? (
                                            <div className="grid gap-2">
                                                <input className={inputCls} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                                                <input className={inputCls} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Description" />
                                            </div>
                                        ) : (
                                            <>
                                                {c.name}
                                                <span className="text-ink-soft block text-[0.75rem]">{c.description}</span>
                                            </>
                                        )}
                                    </td>
                                    <td className={cn(td, 't-num text-right')}>{c.products_count}</td>
                                    <td className={td}>
                                        <StatusPill status={c.is_archived ? 'archived' : 'active'} label={c.is_archived ? 'Archived' : 'Active'} />
                                    </td>
                                    <td className={cn(td, 'space-x-4 text-right whitespace-nowrap')}>
                                        {editing === c.id ? (
                                            <>
                                                <button className="link-line text-[0.8125rem]" onClick={() => save(c, draft)}>
                                                    Save
                                                </button>
                                                <button className="text-ink-soft text-[0.8125rem]" onClick={() => setEditing(null)}>
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    className="link-line text-[0.8125rem]"
                                                    onClick={() => {
                                                        setEditing(c.id);
                                                        setDraft({ name: c.name, description: c.description ?? '' });
                                                    }}
                                                >
                                                    Rename
                                                </button>
                                                <button className="link-line text-[0.8125rem]" onClick={() => save(c, { is_archived: !c.is_archived })}>
                                                    {c.is_archived ? 'Restore' : 'Archive'}
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Panel title="New category">
                    <form onSubmit={add} className="grid gap-4">
                        <label className="grid gap-1.5">
                            <span className="text-ink-soft text-[0.75rem]">Name</span>
                            <input className={inputCls} value={data.name} onChange={(e) => setData('name', e.target.value)} />
                            <FieldMessage error={errors.name} />
                        </label>
                        <label className="grid gap-1.5">
                            <span className="text-ink-soft text-[0.75rem]">Description</span>
                            <input className={inputCls} value={data.description} onChange={(e) => setData('description', e.target.value)} />
                        </label>
                        <AdminButton disabled={processing || !data.name}>Add category</AdminButton>
                    </form>
                </Panel>
            </div>
        </AdminLayout>
    );
}
