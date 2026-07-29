'use client';

import { useEffect, useState } from 'react';
import { Plus, Tag, Pencil, Trash2 } from 'lucide-react';
import { useT, useLocalization } from '@/lib/i18n/localization-context';
import { getAllCouponsApi, deleteCouponApi, type Coupon } from '@/lib/admin-api';
import CouponFormModal from './coupon-form-modal';
import DeleteConfirmModal from '../shared/delete-confirm-modal';

export default function CouponsView() {
  const t = useT();
  const { formatMoney } = useLocalization();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Coupon | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Coupon | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      setCoupons(await getAllCouponsApi());
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteCouponApi(deleting.id);
      setCoupons(prev => prev.filter(c => c.id !== deleting.id));
      setDeleting(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('coupons.deleteFailed'));
    }
  }

  function formatDiscount(c: Coupon): string {
    return c.discount_type === 'percent' ? `${c.discount_value}%` : formatMoney(Number(c.discount_value));
  }

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-semibold text-neutral-primary">{t('coupons.title')}</h1>
          <p className="text-[13px] text-neutral-secondary mt-0.5">{t('coupons.subtitle')}</p>
        </div>
        <button
          onClick={() => setEditing('new')}
          className="flex items-center gap-2 bg-brand-red text-white text-[13px] font-medium px-4 py-2 rounded-lg hover:bg-brand-red/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('coupons.addNew')}
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
        ) : coupons.length === 0 ? (
          <div className="text-center py-16">
            <Tag className="w-8 h-8 text-neutral-secondary mx-auto mb-2" />
            <p className="text-[15px] font-semibold text-neutral-primary">{t('coupons.emptyTitle')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-2 border-b border-neutral-border text-[11px] font-semibold text-neutral-secondary uppercase tracking-wide">
                  <th className="p-4">{t('coupons.colCode')}</th>
                  <th className="p-4">{t('coupons.colDiscount')}</th>
                  <th className="p-4">{t('coupons.colCategories')}</th>
                  <th className="p-4">{t('coupons.colUsage')}</th>
                  <th className="p-4">{t('coupons.colValidUntil')}</th>
                  <th className="p-4">{t('bookings.colStatus')}</th>
                  <th className="p-4">{t('listings.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border">
                {coupons.map(c => (
                  <tr key={c.id} className="text-[13px] text-neutral-primary hover:bg-surface-2 transition-colors">
                    <td className="p-4">
                      <p className="font-medium font-mono">{c.code}</p>
                      {c.description && <p className="text-[12px] text-neutral-secondary">{c.description}</p>}
                    </td>
                    <td className="p-4">{formatDiscount(c)}</td>
                    <td className="p-4">
                      {c.applicable_categories.length === 0 ? (
                        <span className="text-neutral-secondary">{t('coupons.allCategories')}</span>
                      ) : (
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {c.applicable_categories.map(cat => (
                            <span
                              key={cat.id}
                              className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-surface-2 text-neutral-secondary"
                            >
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-neutral-secondary">
                      {c.used_count}{c.usage_limit != null ? ` / ${c.usage_limit}` : ''}
                    </td>
                    <td className="p-4 text-neutral-secondary">
                      {c.valid_until ? new Date(c.valid_until).toLocaleDateString() : t('coupons.noExpiry')}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        c.status === 'active' ? 'bg-success/10 text-success' : 'bg-neutral-secondary/10 text-neutral-secondary'
                      }`}>
                        {c.status === 'active' ? t('categories.statusActive') : t('categories.statusInactive')}
                      </span>
                    </td>
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
        <CouponFormModal
          coupon={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={saved => {
            setCoupons(prev => {
              const exists = prev.some(c => c.id === saved.id);
              return exists ? prev.map(c => (c.id === saved.id ? saved : c)) : [saved, ...prev];
            });
            setEditing(null);
          }}
        />
      )}

      {deleting && (
        <DeleteConfirmModal
          title={t('coupons.deleteTitle')}
          body={t('coupons.deleteBody').replace('{code}', deleting.code)}
          onCancel={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
