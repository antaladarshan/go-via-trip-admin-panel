'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Download, ChevronLeft, ChevronRight, Calendar, BookOpen } from 'lucide-react';
import { useT, useLocalization } from '@/lib/i18n/localization-context';
import {
  getAllBookingsAdminApi, updateBookingStatusAdminApi, cancelBookingAdminApi,
  type AdminBooking, type AdminBookingStatus,
} from '@/lib/admin-api';
import CancelBookingModal from './cancel-booking-modal';

type StatusFilter = 'all' | AdminBookingStatus;
const STATUS_FILTERS: StatusFilter[] = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];
const PAGE_SIZE = 15;

const STATUS_STYLES: Record<AdminBookingStatus, string> = {
  pending:   'bg-warning/10 text-warning',
  confirmed: 'bg-success/10 text-success',
  completed: 'bg-brand-red/10 text-brand-red',
  cancelled: 'bg-neutral-secondary/10 text-neutral-secondary',
};

export default function BookingsView() {
  const t = useT();
  const { formatMoney } = useLocalization();

  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [vendorFilter, setVendorFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<AdminBooking | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      setBookings(await getAllBookingsAdminApi());
    } finally {
      setLoading(false);
    }
  }

  const vendorOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const b of bookings) if (!seen.has(b.vendor_id)) seen.set(b.vendor_id, b.vendor_name);
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [bookings]);

  const categoryOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const b of bookings) if (b.category_id && !seen.has(b.category_id)) seen.set(b.category_id, b.category_name ?? '');
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [bookings]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return bookings.filter(b => {
      if (q && !b.booking_code?.toLowerCase().includes(q) && !b.customer_name.toLowerCase().includes(q) && !b.listing_title.toLowerCase().includes(q)) return false;
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (vendorFilter && b.vendor_id !== vendorFilter) return false;
      if (categoryFilter && b.category_id !== categoryFilter) return false;
      if (dateFrom && b.start_date < dateFrom) return false;
      if (dateTo && b.start_date > dateTo) return false;
      return true;
    });
  }, [bookings, search, statusFilter, vendorFilter, categoryFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  async function advanceStatus(b: AdminBooking) {
    const next: AdminBookingStatus = b.status === 'pending' ? 'confirmed' : 'completed';
    setBusyId(b.id);
    try {
      const updated = await updateBookingStatusAdminApi(b.id, next);
      setBookings(prev => prev.map(x => (x.id === b.id ? { ...x, status: updated.status } : x)));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('bookings.updateFailed'));
    } finally {
      setBusyId(null);
    }
  }

  async function handleCancel(reason: string) {
    if (!cancelling) return;
    const updated = await cancelBookingAdminApi(cancelling.id, reason);
    setBookings(prev => prev.map(b => (b.id === cancelling.id ? { ...b, status: updated.status, refund_status: updated.refund_status } : b)));
    setCancelling(null);
  }

  function exportCsv() {
    const headers = ['Booking ID', 'Customer', 'Vendor', 'Experience', 'Category', 'Date', 'Pax', 'Amount', 'Status', 'Refund Status'];
    const rows = filtered.map(b => [
      b.booking_code ?? b.id, b.customer_name, b.vendor_name, b.listing_title,
      b.category_name ?? '', b.start_date, String(b.pax_count),
      formatMoney(Number(b.total_price)), b.status, b.refund_status,
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 max-w-[1280px] mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-semibold text-neutral-primary">{t('bookings.adminTitle')}</h1>
          <p className="text-[13px] text-neutral-secondary mt-0.5">{t('bookings.adminSubtitle')}</p>
        </div>
        <button
          onClick={exportCsv}
          className="flex items-center gap-2 border border-neutral-border text-neutral-secondary hover:text-neutral-primary hover:bg-surface-2 text-[13px] font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          {t('bookings.exportCsv')}
        </button>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger text-[13px] rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <div className="bg-surface border border-neutral-border rounded-xl p-4 mb-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-secondary pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder={t('bookings.searchPlaceholder')}
              className="w-full pl-9 pr-4 py-2 border border-neutral-border rounded-lg text-[13px] outline-none focus:ring-2 bg-surface text-neutral-primary focus:border-brand-red/50 focus:ring-brand-red/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-neutral-secondary shrink-0" />
            <input
              type="date"
              value={dateFrom}
              onChange={e => { setDateFrom(e.target.value); setPage(1); }}
              className="border border-neutral-border rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 bg-surface text-neutral-primary focus:border-brand-red/50 focus:ring-brand-red/20"
            />
            <span className="text-neutral-secondary text-[13px]">–</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => { setDateTo(e.target.value); setPage(1); }}
              className="border border-neutral-border rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 bg-surface text-neutral-primary focus:border-brand-red/50 focus:ring-brand-red/20"
            />
          </div>
          {vendorOptions.length > 1 && (
            <select
              value={vendorFilter}
              onChange={e => { setVendorFilter(e.target.value); setPage(1); }}
              className="border border-neutral-border rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 bg-surface text-neutral-primary focus:border-brand-red/50 focus:ring-brand-red/20"
            >
              <option value="">{t('bookings.allVendors')}</option>
              {vendorOptions.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          )}
          {categoryOptions.length > 1 && (
            <select
              value={categoryFilter}
              onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
              className="border border-neutral-border rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 bg-surface text-neutral-primary focus:border-brand-red/50 focus:ring-brand-red/20"
            >
              <option value="">{t('bookings.allCategories')}</option>
              {categoryOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-neutral-border">
          <span className="text-[11px] font-semibold text-neutral-secondary uppercase tracking-wider mr-1">
            {t('bookings.statusLabel')}:
          </span>
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1 rounded-full text-[12px] font-medium transition-colors border ${
                statusFilter === s ? 'bg-brand-red text-white border-brand-red' : 'border-neutral-border text-neutral-secondary hover:text-neutral-primary hover:border-neutral-primary'
              }`}
            >
              {t(`bookings.filter${s.charAt(0).toUpperCase() + s.slice(1)}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-neutral-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 rounded-full border-2 border-brand-red border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-8 h-8 text-neutral-secondary mx-auto mb-2" />
            <p className="text-[15px] font-semibold text-neutral-primary">{t('bookings.emptyTitle')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-2 border-b border-neutral-border text-[11px] font-semibold text-neutral-secondary uppercase tracking-wide">
                  <th className="p-4">{t('bookings.colId')}</th>
                  <th className="p-4">{t('bookings.colCustomer')}</th>
                  <th className="p-4">{t('bookings.colExperience')}</th>
                  <th className="p-4">{t('vendors.title')}</th>
                  <th className="p-4">{t('bookings.colDate')}</th>
                  <th className="p-4">{t('bookings.colAmount')}</th>
                  <th className="p-4">{t('bookings.colStatus')}</th>
                  <th className="p-4">{t('bookings.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border">
                {pageItems.map(b => (
                  <tr key={b.id} className="text-[13px] text-neutral-primary hover:bg-surface-2 transition-colors">
                    <td className="p-4 font-medium">{b.booking_code ?? b.id.slice(0, 8)}</td>
                    <td className="p-4">
                      <p>{b.customer_name}</p>
                      <p className="text-[12px] text-neutral-secondary">{b.customer_email}</p>
                    </td>
                    <td className="p-4 max-w-[220px] truncate">{b.listing_title}</td>
                    <td className="p-4 text-neutral-secondary">{b.vendor_name}</td>
                    <td className="p-4 text-neutral-secondary">{b.start_date}</td>
                    <td className="p-4">{formatMoney(Number(b.total_price))}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_STYLES[b.status]}`}>
                        {t(`bookings.filter${b.status.charAt(0).toUpperCase() + b.status.slice(1)}`)}
                      </span>
                      {b.refund_status !== 'none' && (
                        <p className="text-[11px] text-neutral-secondary mt-1">{t('bookings.refund')}: {b.refund_status}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {(b.status === 'pending' || b.status === 'confirmed') && (
                          <button
                            onClick={() => advanceStatus(b)}
                            disabled={busyId === b.id}
                            className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-success/10 text-success hover:bg-success/20 transition-colors disabled:opacity-50"
                          >
                            {b.status === 'pending' ? t('bookings.actionConfirm') : t('bookings.actionComplete')}
                          </button>
                        )}
                        {(b.status === 'pending' || b.status === 'confirmed') && (
                          <button
                            onClick={() => setCancelling(b)}
                            className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
                          >
                            {t('bookings.actionCancel')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-neutral-border bg-surface flex items-center justify-between flex-wrap gap-2">
            <span className="text-[13px] text-neutral-secondary">
              {t('bookings.showingEntries')
                .replace('{from}', String((safePage - 1) * PAGE_SIZE + 1))
                .replace('{to}', String(Math.min(safePage * PAGE_SIZE, filtered.length)))
                .replace('{total}', String(filtered.length))}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-2 rounded-lg border border-neutral-border text-neutral-secondary hover:text-neutral-primary hover:bg-surface-2 transition-colors disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(n => Math.abs(n - safePage) <= 2)
                .map(n => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-9 h-9 rounded-lg text-[13px] font-medium transition-colors border ${
                      n === safePage ? 'bg-brand-red text-white border-brand-red' : 'border-neutral-border text-neutral-secondary hover:bg-surface-2'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="p-2 rounded-lg border border-neutral-border text-neutral-secondary hover:text-neutral-primary hover:bg-surface-2 transition-colors disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {cancelling && (
        <CancelBookingModal
          booking={cancelling}
          onClose={() => setCancelling(null)}
          onConfirm={handleCancel}
        />
      )}
    </div>
  );
}
