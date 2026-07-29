'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, FolderTree, Pencil, Trash2 } from 'lucide-react';
import { useT } from '@/lib/i18n/localization-context';
import {
  getAllCategoriesAdminApi, deleteCategoryApi,
  type AdminCategory,
} from '@/lib/admin-api';
import CategoryFormModal from './category-form-modal';
import DeleteConfirmModal from '../shared/delete-confirm-modal';

export default function CategoriesView() {
  const t = useT();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdminCategory | 'new' | null>(null);
  const [deleting, setDeleting] = useState<AdminCategory | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      setCategories(await getAllCategoriesAdminApi());
    } finally {
      setLoading(false);
    }
  }

  // Parents first, each followed by its subcategories.
  const grouped = useMemo(() => {
    const parents = categories.filter(c => !c.parent_id);
    const bySubOf = (id: string) => categories.filter(c => c.parent_id === id);
    return parents.flatMap(p => [p, ...bySubOf(p.id)]);
  }, [categories]);

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteCategoryApi(deleting.id);
      setCategories(prev => prev.filter(c => c.id !== deleting.id));
      setDeleting(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('categories.deleteFailed'));
    }
  }

  return (
    <div className="p-6 max-w-[1000px] mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-semibold text-neutral-primary">{t('categories.title')}</h1>
          <p className="text-[13px] text-neutral-secondary mt-0.5">{t('categories.subtitle')}</p>
        </div>
        <button
          onClick={() => setEditing('new')}
          className="flex items-center gap-2 bg-brand-red text-white text-[13px] font-medium px-4 py-2 rounded-lg hover:bg-brand-red/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('categories.addNew')}
        </button>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger text-[13px] rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <div className="bg-surface border border-neutral-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 rounded-full border-2 border-brand-red border-t-transparent animate-spin" />
          </div>
        ) : grouped.length === 0 ? (
          <div className="text-center py-16">
            <FolderTree className="w-8 h-8 text-neutral-secondary mx-auto mb-2" />
            <p className="text-[15px] font-semibold text-neutral-primary">{t('categories.emptyTitle')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-2 border-b border-neutral-border text-[11px] font-semibold text-neutral-secondary uppercase tracking-wide">
                  <th className="p-4">{t('categories.colName')}</th>
                  <th className="p-4">{t('categories.colSlug')}</th>
                  <th className="p-4">{t('categories.colStatus')}</th>
                  <th className="p-4">{t('categories.colSubcategories')}</th>
                  <th className="p-4">{t('categories.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border">
                {grouped.map(c => (
                  <tr key={c.id} className="text-[13px] text-neutral-primary hover:bg-surface-2 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2" style={{ paddingLeft: c.parent_id ? 20 : 0 }}>
                        {c.icon && <span>{c.icon}</span>}
                        <span className={c.parent_id ? 'text-neutral-secondary' : 'font-medium'}>{c.name}</span>
                        {c.is_exclusive && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-red/10 text-brand-red">
                            {t('categories.exclusiveBadge')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-neutral-secondary">{c.slug}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        c.status === 'active' ? 'bg-success/10 text-success' : 'bg-neutral-secondary/10 text-neutral-secondary'
                      }`}>
                        {c.status === 'active' ? t('categories.statusActive') : t('categories.statusInactive')}
                      </span>
                    </td>
                    <td className="p-4 text-neutral-secondary">{c.parent_id ? '—' : c.subcategory_count}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditing(c)}
                          className="p-2 rounded-lg text-neutral-secondary hover:text-neutral-primary hover:bg-surface-2 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleting(c)}
                          className="p-2 rounded-lg text-neutral-secondary hover:text-danger hover:bg-danger/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <CategoryFormModal
          category={editing === 'new' ? null : editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={saved => {
            setCategories(prev => {
              const exists = prev.some(c => c.id === saved.id);
              return exists ? prev.map(c => (c.id === saved.id ? { ...c, ...saved } : c)) : [...prev, { ...saved, subcategory_count: 0 }];
            });
            setEditing(null);
          }}
        />
      )}

      {deleting && (
        <DeleteConfirmModal
          title={t('categories.deleteTitle')}
          body={t('categories.deleteBody').replace('{name}', deleting.name)}
          onCancel={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
