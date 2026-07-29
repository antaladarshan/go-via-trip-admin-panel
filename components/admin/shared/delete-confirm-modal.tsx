'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useT } from '@/lib/i18n/localization-context';

interface Props {
  title: string;
  body: string;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export default function DeleteConfirmModal({ title, body, onCancel, onConfirm }: Props) {
  const t = useT();
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    setSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm bg-surface border border-neutral-border rounded-xl p-5 shadow-lg">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-danger/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-danger" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-neutral-primary">{title}</h2>
            <p className="text-[13px] text-neutral-secondary mt-1">{body}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="px-4 py-2 rounded-lg text-[13px] font-medium border border-neutral-border text-neutral-secondary hover:text-neutral-primary hover:bg-surface-2 transition-colors disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="px-4 py-2 rounded-lg text-[13px] font-medium bg-danger text-white hover:bg-danger/90 transition-colors disabled:opacity-50"
          >
            {submitting ? t('common.loading') : t('common.delete')}
          </button>
        </div>
      </div>
    </div>
  );
}
