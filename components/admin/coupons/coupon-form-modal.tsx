'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useT } from '@/lib/i18n/localization-context';
import {
  createCouponApi, updateCouponApi, getAllCategoriesAdminApi,
  type Coupon, type AdminCategory,
} from '@/lib/admin-api';

interface Props {
  coupon: Coupon | null;
  onClose: () => void;
  onSaved: (saved: Coupon) => void;
}

// Every field is editable except `code`, which is the coupon's immutable
// identity (unique key) — on edit it's shown read-only. An empty category
// selection means the coupon applies to every category.
export default function CouponFormModal({ coupon, onClose, onSaved }: Props) {
  const t = useT();
  const isEdit = !!coupon;

  const [code, setCode] = useState(coupon?.code ?? '');
  const [description, setDescription] = useState(coupon?.description ?? '');
  const [discountType, setDiscountType] = useState<'percent' | 'flat'>(coupon?.discount_type ?? 'percent');
  const [discountValue, setDiscountValue] = useState(coupon ? String(coupon.discount_value) : '');
  const [minSubtotal, setMinSubtotal] = useState(coupon ? String(coupon.min_subtotal) : '0');
  const [maxDiscount, setMaxDiscount] = useState(coupon?.max_discount != null ? String(coupon.max_discount) : '');
  const [validUntil, setValidUntil] = useState(coupon?.valid_until ? coupon.valid_until.split('T')[0] : '');
  const [usageLimit, setUsageLimit] = useState(coupon?.usage_limit != null ? String(coupon.usage_limit) : '');
  const [status, setStatus] = useState<'active' | 'inactive'>(coupon?.status ?? 'active');
  const [categoryIds, setCategoryIds] = useState<string[]>(coupon?.applicable_categories.map(c => c.id) ?? []);

  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAllCategoriesAdminApi()
      .then(all => setCategories(all.filter(c => c.parent_id === null && c.status === 'active')))
      .catch(() => { /* leave picker empty — coupon still saves as "all categories" */ });
  }, []);

  function toggleCategory(id: string) {
    setCategoryIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  }

  async function handleSubmit() {
    if (!isEdit && (!code.trim() || !discountValue)) {
      setError(t('coupons.codeDiscountRequired'));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const common = {
        description: description.trim() || undefined,
        discount_type: discountType,
        discount_value: Number(discountValue),
        min_subtotal: Number(minSubtotal) || 0,
        max_discount: maxDiscount ? Number(maxDiscount) : null,
        valid_until: validUntil || null,
        usage_limit: usageLimit ? Number(usageLimit) : null,
        category_ids: categoryIds,
      };
      const saved = isEdit
        ? await updateCouponApi(coupon!.id, { ...common, status })
        : await createCouponApi({ code: code.trim(), ...common });
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('coupons.saveFailed'));
      setSubmitting(false);
    }
  }

  const inputCls =
    'w-full border border-neutral-border rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 bg-surface text-neutral-primary focus:border-brand-red/50 focus:ring-brand-red/20';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-surface border border-neutral-border rounded-xl p-5 shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-neutral-primary">
            {isEdit ? t('coupons.editTitle') : t('coupons.addNew')}
          </h2>
          <button onClick={onClose} className="text-neutral-secondary hover:text-neutral-primary">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[12px] font-medium text-neutral-secondary mb-1.5">{t('coupons.fieldCode')}</label>
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              disabled={isEdit}
              className={`${inputCls} font-mono disabled:opacity-60 disabled:cursor-not-allowed`}
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-neutral-secondary mb-1.5">{t('coupons.fieldDescription')}</label>
            <input value={description} onChange={e => setDescription(e.target.value)} className={inputCls} />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-[12px] font-medium text-neutral-secondary mb-1.5">{t('coupons.fieldDiscountType')}</label>
              <select
                value={discountType}
                onChange={e => setDiscountType(e.target.value as 'percent' | 'flat')}
                className={inputCls}
              >
                <option value="percent">{t('coupons.percentOff')}</option>
                <option value="flat">{t('coupons.flatOff')}</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-[12px] font-medium text-neutral-secondary mb-1.5">{t('coupons.fieldDiscountValue')}</label>
              <input type="number" value={discountValue} onChange={e => setDiscountValue(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-[12px] font-medium text-neutral-secondary mb-1.5">{t('coupons.fieldMinSubtotal')}</label>
              <input type="number" value={minSubtotal} onChange={e => setMinSubtotal(e.target.value)} className={inputCls} />
            </div>
            <div className="flex-1">
              <label className="block text-[12px] font-medium text-neutral-secondary mb-1.5">{t('coupons.fieldMaxDiscount')}</label>
              <input type="number" value={maxDiscount} onChange={e => setMaxDiscount(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-neutral-secondary mb-1.5">{t('coupons.fieldValidUntil')}</label>
            <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-neutral-secondary mb-1.5">{t('coupons.fieldUsageLimit')}</label>
            <input
              type="number"
              value={usageLimit}
              onChange={e => setUsageLimit(e.target.value)}
              placeholder={t('coupons.unlimited')}
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-neutral-secondary mb-1.5">{t('coupons.fieldCategories')}</label>
            <p className="text-[11px] text-neutral-secondary mb-2">{t('coupons.categoriesHint')}</p>
            {categories.length === 0 ? (
              <p className="text-[12px] text-neutral-secondary">{t('coupons.allCategories')}</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {categories.map(c => {
                  const active = categoryIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCategory(c.id)}
                      className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
                        active
                          ? 'bg-brand-red text-white border-brand-red'
                          : 'border-neutral-border text-neutral-secondary hover:text-neutral-primary hover:bg-surface-2'
                      }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {isEdit && (
            <div>
              <label className="block text-[12px] font-medium text-neutral-secondary mb-1.5">{t('bookings.colStatus')}</label>
              <select value={status} onChange={e => setStatus(e.target.value as 'active' | 'inactive')} className={inputCls}>
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
