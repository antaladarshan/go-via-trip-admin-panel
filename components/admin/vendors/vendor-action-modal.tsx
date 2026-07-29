'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useT } from '@/lib/i18n/localization-context';
import type { AdminVendor } from '@/lib/admin-api';

interface Props {
  vendor: AdminVendor;
  type: 'reject' | 'suspend';
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
}

export default function VendorActionModal({ vendor, type, onClose, onSubmit }: Props) {
  const t = useT();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requireReason = type === 'reject';

  async function handleSubmit() {
    if (requireReason && !reason.trim()) {
      setError(t('vendors.reasonRequired'));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(reason.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : t('vendors.actionFailed'));
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-surface border border-neutral-border rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-neutral-primary">
            {type === 'reject' ? t('vendors.rejectTitle') : t('vendors.suspendTitle')}
          </h2>
          <button onClick={onClose} className="text-neutral-secondary hover:text-neutral-primary">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[13px] text-neutral-secondary mb-3">{vendor.business_name}</p>

        <label className="block text-[12px] font-medium text-neutral-secondary mb-1.5">
          {requireReason ? t('vendors.reasonLabelRequired') : t('vendors.reasonLabelOptional')}
        </label>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          rows={3}
          className="w-full border border-neutral-border rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 bg-surface text-neutral-primary focus:border-brand-red/50 focus:ring-brand-red/20 resize-none"
          placeholder={t('vendors.reasonPlaceholder')}
        />

        {error && <p className="text-[12px] text-danger mt-2">{error}</p>}

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
            {submitting ? t('common.loading') : type === 'reject' ? t('vendors.actionReject') : t('vendors.actionSuspend')}
          </button>
        </div>
      </div>
    </div>
  );
}
