'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useT } from '@/lib/i18n/localization-context';
import { createCategoryApi, updateCategoryApi, type AdminCategory } from '@/lib/admin-api';

interface Props {
  category: AdminCategory | null;
  categories: AdminCategory[];
  onClose: () => void;
  onSaved: (saved: AdminCategory) => void;
}

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function CategoryFormModal({ category, categories, onClose, onSaved }: Props) {
  const t = useT();
  const isEdit = !!category;
  const [name, setName] = useState(category?.name ?? '');
  const [slug, setSlug] = useState(category?.slug ?? '');
  const [icon, setIcon] = useState(category?.icon ?? '');
  const [description, setDescription] = useState(category?.description ?? '');
  const [parentId, setParentId] = useState(category?.parent_id ?? '');
  const [status, setStatus] = useState<'active' | 'inactive'>(category?.status ?? 'active');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parentOptions = categories.filter(c => !c.parent_id && c.id !== category?.id);

  async function handleSubmit() {
    if (!name.trim() || !slug.trim()) {
      setError(t('categories.nameSlugRequired'));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        icon: icon.trim() || null,
        description: description.trim() || null,
        parent_id: parentId || null,
        status,
      };
      const saved = isEdit
        ? await updateCategoryApi(category!.id, payload)
        : await createCategoryApi(payload);
      onSaved(saved as AdminCategory);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('categories.saveFailed'));
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-surface border border-neutral-border rounded-xl p-5 shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-neutral-primary">
            {isEdit ? t('categories.editTitle') : t('categories.addNew')}
          </h2>
          <button onClick={onClose} className="text-neutral-secondary hover:text-neutral-primary">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[12px] font-medium text-neutral-secondary mb-1.5">{t('categories.fieldName')}</label>
            <input
              value={name}
              onChange={e => {
                const v = e.target.value;
                setName(v);
                if (!isEdit) setSlug(slugify(v));
              }}
              className="w-full border border-neutral-border rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 bg-surface text-neutral-primary focus:border-brand-red/50 focus:ring-brand-red/20"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-neutral-secondary mb-1.5">{t('categories.fieldSlug')}</label>
            <input
              value={slug}
              onChange={e => setSlug(e.target.value)}
              className="w-full border border-neutral-border rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 bg-surface text-neutral-primary focus:border-brand-red/50 focus:ring-brand-red/20"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-neutral-secondary mb-1.5">{t('categories.fieldIcon')}</label>
            <input
              value={icon}
              onChange={e => setIcon(e.target.value)}
              placeholder="🎯"
              className="w-full border border-neutral-border rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 bg-surface text-neutral-primary focus:border-brand-red/50 focus:ring-brand-red/20"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-neutral-secondary mb-1.5">{t('categories.fieldDescription')}</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="w-full border border-neutral-border rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 bg-surface text-neutral-primary focus:border-brand-red/50 focus:ring-brand-red/20 resize-none"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-neutral-secondary mb-1.5">{t('categories.fieldParent')}</label>
            <select
              value={parentId}
              onChange={e => setParentId(e.target.value)}
              className="w-full border border-neutral-border rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 bg-surface text-neutral-primary focus:border-brand-red/50 focus:ring-brand-red/20"
            >
              <option value="">{t('categories.noParent')}</option>
              {parentOptions.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          {isEdit && (
            <div>
              <label className="block text-[12px] font-medium text-neutral-secondary mb-1.5">{t('categories.colStatus')}</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as 'active' | 'inactive')}
                className="w-full border border-neutral-border rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 bg-surface text-neutral-primary focus:border-brand-red/50 focus:ring-brand-red/20"
              >
                <option value="active">{t('categories.statusActive')}</option>
                <option value="inactive">{t('categories.statusInactive')}</option>
              </select>
            </div>
          )}
        </div>

        {error && <p className="text-[12px] text-danger mt-3">{error}</p>}

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-lg text-[13px] font-medium border border-neutral-border text-neutral-secondary hover:text-neutral-primary hover:bg-surface-2 transition-colors disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 rounded-lg text-[13px] font-medium bg-brand-red text-white hover:bg-brand-red/90 transition-colors disabled:opacity-50"
          >
            {submitting ? t('common.loading') : t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
