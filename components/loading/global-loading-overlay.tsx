'use client';

import { useSyncExternalStore } from 'react';
import { subscribe, getSnapshot } from '@/lib/loading-store';
import Logo from '@/components/brand/logo';

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
      <Logo variant="mark" aria-label="Loading" className="w-12 h-12 animate-spin drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]" />
    </div>
  );
}
