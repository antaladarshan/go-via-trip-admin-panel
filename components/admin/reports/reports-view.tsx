'use client';

import { useEffect, useState } from 'react';
import { Download, BarChart2 } from 'lucide-react';
import {
  ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { useT, useLocalization } from '@/lib/i18n/localization-context';
import {
  getRevenueReportApi, getCategoryPerformanceApi,
  type RevenueReport, type CategoryPerformance,
} from '@/lib/admin-api';
import { CategoryBarChart } from '@/components/dashboard/admin-dashboard-view';

function isoDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

const REVENUE_HUE = 'rgb(var(--color-brand))';
const BOOKINGS_HUE = '#006DC4';

export default function ReportsView() {
  const t = useT();
  const { formatMoney } = useLocalization();

  const today = isoDate(new Date());
  const monthAgo = isoDate(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000));

  const [from, setFrom] = useState(monthAgo);
  const [to, setTo] = useState(today);
  const [report, setReport] = useState<RevenueReport | null>(null);
  const [categories, setCategories] = useState<CategoryPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [rev, cats] = await Promise.all([
        getRevenueReportApi(from, to),
        getCategoryPerformanceApi(),
      ]);
      setReport(rev);
      setCategories(cats);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('reports.loadError'));
    } finally {
      setLoading(false);
    }
  }

  function exportCsv() {
    if (!report) return;
    const headers = ['Date', 'Bookings', 'Revenue'];
    const rows = report.points.map(p => [p.date, String(p.bookings), String(p.revenue)]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-report-${from}-to-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const hasCategoryActivity = categories.some(c => c.revenue > 0 || c.bookings > 0);

  return (
    <div className="p-6 max-w-[1280px] mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-semibold text-neutral-primary">{t('reports.title')}</h1>
          <p className="text-[13px] text-neutral-secondary mt-0.5">{t('reports.subtitle')}</p>
        </div>
        <button
          onClick={exportCsv}
          disabled={!report}
          className="flex items-center gap-2 border border-neutral-border text-neutral-secondary hover:text-neutral-primary hover:bg-surface-2 text-[13px] font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {t('bookings.exportCsv')}
        </button>
      </div>

      <div className="bg-surface border border-neutral-border rounded-xl p-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-[12px] font-medium text-neutral-secondary mb-1.5">{t('reports.fieldFrom')}</label>
          <input
            type="date"
            value={from}
            max={to}
            onChange={e => setFrom(e.target.value)}
            className="border border-neutral-border rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 bg-surface text-neutral-primary focus:border-brand-red/50 focus:ring-brand-red/20"
          />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-neutral-secondary mb-1.5">{t('reports.fieldTo')}</label>
          <input
            type="date"
            value={to}
            min={from}
            max={today}
            onChange={e => setTo(e.target.value)}
            className="border border-neutral-border rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 bg-surface text-neutral-primary focus:border-brand-red/50 focus:ring-brand-red/20"
          />
        </div>
        <button
          onClick={load}
          className="px-4 py-2 rounded-lg text-[13px] font-medium bg-brand-red text-white hover:bg-brand-red/90 transition-colors"
        >
          {t('reports.apply')}
        </button>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger text-[13px] rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 rounded-full border-2 border-brand-red border-t-transparent animate-spin" />
        </div>
      ) : report && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-surface border border-neutral-border rounded-xl p-5">
              <p className="text-[12px] text-neutral-secondary font-medium mb-1">{t('reports.totalRevenue')}</p>
              <p className="text-[26px] font-semibold text-neutral-primary">{formatMoney(report.totals.revenue)}</p>
            </div>
            <div className="bg-surface border border-neutral-border rounded-xl p-5">
              <p className="text-[12px] text-neutral-secondary font-medium mb-1">{t('reports.totalBookings')}</p>
              <p className="text-[26px] font-semibold text-neutral-primary">{report.totals.bookings}</p>
            </div>
          </div>

          <div className="bg-surface border border-neutral-border rounded-xl p-5">
            <h2 className="text-[15px] font-semibold text-neutral-primary flex items-center gap-2 mb-4">
              <BarChart2 className="w-4 h-4" />
              {t('reports.trendTitle')}
            </h2>
            {report.points.every(p => p.bookings === 0 && p.revenue === 0) ? (
              <p className="text-[13px] text-neutral-secondary text-center py-10">{t('reports.trendEmpty')}</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={report.points} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                  <CartesianGrid vertical={false} stroke="rgb(var(--color-border))" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: 'rgb(var(--color-text-secondary))', fontSize: 11 }}
                    tickFormatter={d => d.slice(5)}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis yAxisId="revenue" tick={{ fill: 'rgb(var(--color-text-secondary))', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="bookings" orientation="right" tick={{ fill: 'rgb(var(--color-text-secondary))', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))', borderRadius: 8, fontSize: 12 }}
                    formatter={(value: number, name: string) => (name === t('reports.revenue') ? formatMoney(value) : value)}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar yAxisId="revenue" dataKey="revenue" name={t('reports.revenue')} fill={REVENUE_HUE} radius={[4, 4, 0, 0]} maxBarSize={24} />
                  <Line yAxisId="bookings" type="monotone" dataKey="bookings" name={t('reports.bookings')} stroke={BOOKINGS_HUE} strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-surface border border-neutral-border rounded-xl p-5">
            <h2 className="text-[15px] font-semibold text-neutral-primary mb-4">{t('dashboard.categoryChartTitle')}</h2>
            {!hasCategoryActivity ? (
              <p className="text-[13px] text-neutral-secondary text-center py-10">{t('dashboard.categoryChartEmpty')}</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="overflow-x-auto">
                  <p className="text-[12px] font-medium text-neutral-secondary mb-2">{t('dashboard.categoryRevenue')}</p>
                  <CategoryBarChart data={categories} dataKey="revenue" hue={REVENUE_HUE} valueFormatter={formatMoney} barLabel={t('dashboard.categoryRevenue')} />
                </div>
                <div className="overflow-x-auto">
                  <p className="text-[12px] font-medium text-neutral-secondary mb-2">{t('dashboard.categoryBookings')}</p>
                  <CategoryBarChart data={categories} dataKey="bookings" hue={BOOKINGS_HUE} valueFormatter={n => String(n)} barLabel={t('dashboard.categoryBookings')} />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
