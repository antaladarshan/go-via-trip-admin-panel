'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useT } from '@/lib/i18n/localization-context';
import { createCouponApi, updateCouponApi, type Coupon } from '@/lib/admin-api';

interface Props {
  coupon: Coupon | null;
  onClose: () => void;
  onSaved: (saved: Coupon) => void;
}

// The backend's PATCH /coupons/:id only accepts status/valid_until/usage_limit
// (coupons.controller.js#updateCoupon) — code/discount are immutable once
// created, so the edit form only exposes what can actually change.
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      if (isEdit) {
        const saved = await updateCouponApi(coupon!.id, {
          status,
          valid_until: validUntil || null,
          usage_limit: usageLimit ? Number(usageLimit) : null,
        });
        onSaved(saved);
      } else {
        if (!code.trim() || !discountValue) {
          setError(t('coupons.codeDiscountRequired'));
          setSubmitting(false);
          return;
        }
        const saved = await createCouponApi({
          code: code.trim(),
          description: description.trim() || undefined,
          discount_type: discountType,
          discount_value: Number(discountValue),
          min_subtotal: Number(minSubtotal) || 0,
          max_discount: maxDiscount ? Number(maxDiscount) : null,
          valid_until: validUntil || null,
          usage_limit: usageLimit ? Number(usageLimit) : null,
        });
        onSaved(saved);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('coupons.saveFailed'));
      setSubmitting(false);
    }
  }

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
          {!isEdit && (
            <>
              <div>
                <label className="block text-[12px] font-medium text-neutral-secondary mb-1.5">{t('coupons.fieldCode')}</label>
                <input
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  className="w-full border border-neutral-border rounded-lg px-3 py-2 text-[13px] font-mono outline-none focus:ring-2 bg-surface text-neutral-primary focus:border-brand-red/50 focus:ring-brand-red/20"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-neutral-secondary mb-1.5">{t('coupons.fieldDescription')}</label>
                <input
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full border border-neutral-border rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 bg-surface text-neutral-primary focus:border-brand-red/50 focus:ring-brand-red/20"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-[12px] font-medium text-neutral-secondary mb-1.5">{t('coupons.fieldDiscountType')}</label>
                  <select
                    value={discountType}
                    onChange={e => setDiscountType(e.target.value as 'percent' | 'flat')}
                    className="w-full border border-neutral-border rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 bg-surface text-neutral-primary focus:border-brand-red/50 focus:ring-brand-red/20"
                  >
                    <option value="percent">{t('coupons.percentOff')}</option>
                    <option value="flat">{t('coupons.flatOff')}</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-[12px] font-medium text-neutral-secondary mb-1.5">{t('coupons.fieldDiscountValue')}</label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={e => setDiscountValue(e.target.value)}
                    className="w-full border border-neutral-border rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 bg-surface text-neutral-primary focus:border-brand-red/50 focus:ring-brand-red/20"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-[12px] font-medium text-neutral-secondary mb-1.5">{t('coupons.fieldMinSubtotal')}</label>
                  <input
                    type="number"
                    value={minSubtotal}
                    onChange={e => setMinSubtotal(e.target.value)}
                    className="w-full border border-neutral-border rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 bg-surface text-neutral-primary focus:border-brand-red/50 focus:ring-brand-red/20"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[12px] font-medium text-neutral-secondary mb-1.5">{t('coupons.fieldMaxDiscount')}</label>
                  <input
                    type="number"
                    value={maxDiscount}
                    onChange={e => setMaxDiscount(e.target.value)}
                    className="w-full border border-neutral-border rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 bg-surface text-neutral-primary focus:border-brand-red/50 focus:ring-brand-red/20"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[12px] font-medium text-neutral-secondary mb-1.5">{t('coupons.fieldValidUntil')}</label>
            <input
              type="date"
              value={validUntil}
              onChange={e => setValidUntil(e.target.value)}
              className="w-full border border-neutral-border rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 bg-surface text-neutral-primary focus:border-brand-red/50 focus:ring-brand-red/20"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-neutral-secondary mb-1.5">{t('coupons.fieldUsageLimit')}</label>
            <input
              type="number"
              value={usageLimit}
              onChange={e => setUsageLimit(e.target.value)}
              placeholder={t('coupons.unlimited')}
              className="w-full border border-neutral-border rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 bg-surface text-neutral-primary focus:border-brand-red/50 focus:ring-brand-red/20"
            />
          </div>
          {isEdit && (
            <div>
              <label className="block text-[12px] font-medium text-neutral-secondary mb-1.5">{t('bookings.colStatus')}</label>
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
