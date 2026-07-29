'use client';

import { useEffect, useState } from 'react';
import { X, BookOpen } from 'lucide-react';
import { useT, useLocalization } from '@/lib/i18n/localization-context';
import { getAllBookingsAdminApi, type AdminBooking, type AdminUserRow } from '@/lib/admin-api';

interface Props {
  user: AdminUserRow;
  onClose: () => void;
}

export default function UserBookingHistoryDrawer({ user, onClose }: Props) {
  const t = useT();
  const { formatMoney } = useLocalization();
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllBookingsAdminApi()
      .then(all => setBookings(all.filter(b => b.customer_id === user.id)))
      .finally(() => setLoading(false));
  }, [user.id]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-surface border-l border-neutral-border h-full overflow-y-auto p-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[15px] font-semibold text-neutral-primary">{t('users.bookingHistory')}</h2>
          <button onClick={onClose} className="text-neutral-secondary hover:text-neutral-primary">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[13px] text-neutral-secondary mb-4">{user.name} — {user.email}</p>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 rounded-full border-2 border-brand-red border-t-transparent animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-10">
            <BookOpen className="w-7 h-7 text-neutral-secondary mx-auto mb-2" />
            <p className="text-[13px] text-neutral-secondary">{t('users.noBookings')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {bookings.map(b => (
              <div key={b.id} className="border border-neutral-border rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[13px] font-medium text-neutral-primary truncate">{b.listing_title}</p>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-surface-2 text-neutral-secondary shrink-0 ml-2">
                    {b.status}
                  </span>
                </div>
                <p className="text-[12px] text-neutral-secondary">{b.booking_code ?? b.id.slice(0, 8)} · {b.start_date}</p>
                <p className="text-[12px] text-neutral-secondary">{formatMoney(Number(b.total_price))}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
