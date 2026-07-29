'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Download, CreditCard } from 'lucide-react';
import { useT, useLocalization } from '@/lib/i18n/localization-context';
import { getAllPaymentsApi, type AdminPayment, type PaymentStatus } from '@/lib/admin-api';

type StatusFilter = 'all' | PaymentStatus;
const STATUS_FILTERS: StatusFilter[] = ['all', 'pending', 'completed', 'failed', 'refunded'];
const PAGE_SIZE = 15;

const STATUS_STYLES: Record<PaymentStatus, string> = {
  pending:   'bg-warning/10 text-warning',
  completed: 'bg-success/10 text-success',
  failed:    'bg-danger/10 text-danger',
  refunded:  'bg-neutral-secondary/10 text-neutral-secondary',
};

export default function PaymentsView() {
  const t = useT();
  const { formatMoney } = useLocalization();

  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [gatewayFilter, setGatewayFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      setPayments(await getAllPaymentsApi());
    } finally {
      setLoading(false);
    }
  }

  const gatewayOptions = useMemo(() => {
    const seen = new Set<string>();
    for (const p of payments) if (p.payment_method) seen.add(p.payment_method);
    return Array.from(seen);
  }, [payments]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return payments.filter(p => {
      if (q && !p.booking_code?.toLowerCase().includes(q) && !p.customer_name.toLowerCase().includes(q) && !p.transaction_id?.toLowerCase().includes(q)) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (gatewayFilter && p.payment_method !== gatewayFilter) return false;
      return true;
    });
  }, [payments, search, statusFilter, gatewayFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function exportCsv() {
    const headers = ['Booking', 'Customer', 'Experience', 'Amount', 'Currency', 'Gateway', 'Status', 'Transaction ID', 'Date'];
    const rows = filtered.map(p => [
      p.booking_code ?? p.booking_id, p.customer_name, p.listing_title,
      formatMoney(Number(p.amount)), p.currency, p.payment_method ?? '', p.status,
      p.transaction_id ?? '', new Date(p.created_at).toISOString().split('T')[0],
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 max-w-[1280px] mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-semibold text-neutral-primary">{t('payments.title')}</h1>
          <p className="text-[13px] text-neutral-secondary mt-0.5">{t('payments.subtitle')}</p>
        </div>
        <button
          onClick={exportCsv}
          className="flex items-center gap-2 border border-neutral-border text-neutral-secondary hover:text-neutral-primary hover:bg-surface-2 text-[13px] font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          {t('bookings.exportCsv')}
        </button>
      </div>

      <div className="bg-surface border border-neutral-border rounded-xl p-4 mb-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-secondary pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder={t('payments.searchPlaceholder')}
              className="w-full pl-9 pr-4 py-2 border border-neutral-border rounded-lg text-[13px] outline-none focus:ring-2 bg-surface text-neutral-primary focus:border-brand-red/50 focus:ring-brand-red/20"
            />
          </div>
          {gatewayOptions.length > 1 && (
            <select
              value={gatewayFilter}
              onChange={e => { setGatewayFilter(e.target.value); setPage(1); }}
              className="border border-neutral-border rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 bg-surface text-neutral-primary focus:border-brand-red/50 focus:ring-brand-red/20"
            >
              <option value="">{t('payments.allGateways')}</option>
              {gatewayOptions.map(g => <option key={g} value={g}>{g}</option>)}
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
              {t(`payments.filter${s.charAt(0).toUpperCase() + s.slice(1)}`)}
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
            <CreditCard className="w-8 h-8 text-neutral-secondary mx-auto mb-2" />
            <p className="text-[15px] font-semibold text-neutral-primary">{t('payments.emptyTitle')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-2 border-b border-neutral-border text-[11px] font-semibold text-neutral-secondary uppercase tracking-wide">
                  <th className="p-4">{t('bookings.colId')}</th>
                  <th className="p-4">{t('bookings.colCustomer')}</th>
                  <th className="p-4">{t('bookings.colExperience')}</th>
                  <th className="p-4">{t('bookings.colAmount')}</th>
                  <th className="p-4">{t('payments.colGateway')}</th>
                  <th className="p-4">{t('bookings.colStatus')}</th>
                  <th className="p-4">{t('payments.colTransactionId')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border">
                {pageItems.map(p => (
                  <tr key={p.id} className="text-[13px] text-neutral-primary hover:bg-surface-2 transition-colors">
                    <td className="p-4 font-medium">{p.booking_code ?? p.booking_id.slice(0, 8)}</td>
                    <td className="p-4">{p.customer_name}</td>
                    <td className="p-4 max-w-[220px] truncate">{p.listing_title}</td>
                    <td className="p-4">{formatMoney(Number(p.amount))}</td>
                    <td className="p-4 text-neutral-secondary capitalize">{p.payment_method ?? '—'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_STYLES[p.status]}`}>
                        {t(`payments.filter${p.status.charAt(0).toUpperCase() + p.status.slice(1)}`)}
                      </span>
                      {p.status === 'refunded' && p.refunded_amount != null && (
                        <p className="text-[11px] text-neutral-secondary mt-1">{formatMoney(Number(p.refunded_amount))}</p>
                      )}
                    </td>
                    <td className="p-4 text-neutral-secondary font-mono text-[12px] max-w-[160px] truncate">{p.transaction_id ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length > 0 && totalPages > 1 && (
          <div className="px-4 py-3 border-t border-neutral-border bg-surface flex items-center justify-between">
            <span className="text-[13px] text-neutral-secondary">
              {t('listings.showingEntries')
                .replace('{from}', String((safePage - 1) * PAGE_SIZE + 1))
                .replace('{to}', String(Math.min(safePage * PAGE_SIZE, filtered.length)))
                .replace('{total}', String(filtered.length))}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
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
            </div>
          </div>
        )}
      </div>

      <p className="text-[12px] text-neutral-secondary mt-3">{t('payments.refundHint')}</p>
    </div>
  );
}
