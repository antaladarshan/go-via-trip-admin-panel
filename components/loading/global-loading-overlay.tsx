'use client';

import { useSyncExternalStore } from 'react';
import { subscribe, getSnapshot } from '@/lib/loading-store';

export default function GlobalLoadingOverlay() {
  const visible = useSyncExternalStore(subscribe, getSnapshot, () => false);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-auto"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="w-10 h-10 rounded-full border-2 border-brand-red border-t-transparent animate-spin" />
    </div>
  );
}
