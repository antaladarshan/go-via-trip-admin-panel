'use client';

import { useState } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { useT, useLocalization } from '@/lib/i18n/localization-context';
import type { AdminBooking } from '@/lib/admin-api';

interface Props {
  booking: AdminBooking;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function RefundBookingModal({ booking, onClose, onConfirm }: Props) {
  const t = useT();
  const { formatMoney } = useLocalization();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('bookings.refundFailed'));
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-surface border border-neutral-border rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-neutral-primary">{t('bookings.refundTitle')}</h2>
          <button onClick={onClose} className="text-neutral-secondary hover:text-neutral-primary">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[13px] text-neutral-secondary mb-3">
          {booking.booking_code ?? booking.id} — {booking.listing_title}
        </p>

        <div className="flex items-center justify-between rounded-lg bg-surface-2 border border-neutral-border px-3 py-2.5 mb-3">
          <span className="text-[12px] font-medium text-neutral-secondary">{t('bookings.refundAmountLabel')}</span>
          <span className="text-[15px] font-semibold text-neutral-primary">{formatMoney(Number(booking.total_price))}</span>
        </div>

        <p className="text-[12px] text-neutral-secondary mb-1">{t('bookings.refundConfirmNote')}</p>

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
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium bg-brand-red text-white hover:bg-brand-red/90 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            {submitting ? t('common.loading') : t('bookings.refundTitle')}
          </button>
        </div>
      </div>
    </div>
  );
}
