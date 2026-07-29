'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useT } from '@/lib/i18n/localization-context';
import {
  getAllCategoriesAdminApi, updateListingAdminApi,
  type AdminListing, type AdminCategory,
} from '@/lib/admin-api';

interface Props {
  listing: AdminListing;
  onClose: () => void;
  onSaved: (updated: AdminListing) => void;
}

export default function ListingEditModal({ listing, onClose, onSaved }: Props) {
  const t = useT();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [price, setPrice] = useState(String(listing.price));
  const [categoryId, setCategoryId] = useState(listing.category_id ?? '');
  const [status, setStatus] = useState<'active' | 'inactive'>(listing.status);
  const [featured, setFeatured] = useState(listing.featured);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAllCategoriesAdminApi().then(setCategories).catch(() => setCategories([]));
  }, []);

  async function handleSubmit() {
    const numPrice = Number(price);
    if (!price || Number.isNaN(numPrice) || numPrice <= 0) {
      setError(t('listings.invalidPrice'));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const updated = await updateListingAdminApi(listing.id, {
        price: numPrice,
        category_id: categoryId || null,
        status,
        featured,
      });
      onSaved({ ...listing, ...updated, category_name: categories.find(c => c.id === categoryId)?.name ?? listing.category_name });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('listings.updateFailed'));
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-surface border border-neutral-border rounded-xl p-5 shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-neutral-primary">{t('listings.editTitle')}</h2>
          <button onClick={onClose} className="text-neutral-secondary hover:text-neutral-primary">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[13px] text-neutral-secondary mb-4 truncate">{listing.title}</p>

        <div className="space-y-3">
          <div>
            <label className="block text-[12px] font-medium text-neutral-secondary mb-1.5">{t('listings.colPrice')}</label>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="w-full border border-neutral-border rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 bg-surface text-neutral-primary focus:border-brand-red/50 focus:ring-brand-red/20"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-neutral-secondary mb-1.5">{t('listings.colCategory')}</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full border border-neutral-border rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 bg-surface text-neutral-primary focus:border-brand-red/50 focus:ring-brand-red/20"
            >
              <option value="">{t('categories.noParent')}</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.parent_id ? `— ${c.name}` : c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-neutral-secondary mb-1.5">{t('listings.colStatus')}</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as 'active' | 'inactive')}
              className="w-full border border-neutral-border rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 bg-surface text-neutral-primary focus:border-brand-red/50 focus:ring-brand-red/20"
            >
              <option value="active">{t('listings.statusActive')}</option>
              <option value="inactive">{t('listings.statusInactive')}</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-[13px] text-neutral-primary cursor-pointer">
            <input
              type="checkbox"
              checked={featured}
              onChange={e => setFeatured(e.target.checked)}
              className="rounded border-neutral-border text-brand-red focus:ring-brand-red/30 cursor-pointer"
            />
            {t('listings.toggleFeatured')}
          </label>
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
