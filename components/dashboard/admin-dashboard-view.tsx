'use client';

import { useEffect, useState } from 'react';
import {
  CalendarCheck, DollarSign, Users, Store, TrendingUp, TrendingDown, BarChart2,
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LabelList, CartesianGrid,
} from 'recharts';
import { useT, useLocalization } from '@/lib/i18n/localization-context';
import {
  getAdminSummaryApi, getCategoryPerformanceApi,
  type AdminSummary, type CategoryPerformance,
} from '@/lib/admin-api';

const REVENUE_HUE = 'rgb(var(--color-brand))';
const BOOKINGS_HUE = '#006DC4'; // brand.teal — matches the existing logo/tagline accent

function formatCount(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

interface TrendPillProps {
  current?: number;
  prior?: number;
  label: string;
}

function TrendPill({ current, prior, label }: TrendPillProps) {
  if (current == null || prior == null || prior <= 0) return null;
  const pct = Math.round(((current - prior) / prior) * 100);
  const up = pct >= 0;
  return (
    <span className={`flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${up ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {up ? '+' : ''}{pct}% {label}
    </span>
  );
}

interface KpiCardProps {
  icon: typeof CalendarCheck;
  label: string;
  value: string;
  loading: boolean;
  current?: number;
  prior?: number;
  trendLabel?: string;
}

function KpiCard({ icon: Icon, label, value, loading, current, prior, trendLabel }: KpiCardProps) {
  return (
    <div className="bg-surface border border-neutral-border rounded-xl p-5 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-brand-red/10 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-brand-red" />
        </div>
        <span className="text-[12px] text-neutral-secondary font-medium">{label}</span>
      </div>
      {loading ? (
        <div className="h-8 w-28 bg-surface-2 rounded animate-pulse mt-1" />
      ) : (
        <div className="flex items-end gap-2 flex-wrap">
          <span className="text-[26px] font-semibold text-neutral-primary">{value}</span>
          {trendLabel && <TrendPill current={current} prior={prior} label={trendLabel} />}
        </div>
      )}
    </div>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number; payload: CategoryPerformance }[];
  formatter: (n: number) => string;
}

function CustomTooltip({ active, payload, formatter }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="bg-surface border border-neutral-border rounded-lg shadow-sm px-3 py-2 text-[12px]">
      <p className="font-semibold text-neutral-primary">{row.name}</p>
      <p className="text-neutral-secondary">{formatter(payload[0].value)}</p>
    </div>
  );
}

export function CategoryBarChart({
  data, dataKey, hue, valueFormatter, barLabel,
}: {
  data: CategoryPerformance[];
  dataKey: 'revenue' | 'bookings';
  hue: string;
  valueFormatter: (n: number) => string;
  barLabel: string;
}) {
  const sorted = [...data].sort((a, b) => b[dataKey] - a[dataKey]);
  const height = Math.max(sorted.length * 40, 120);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 56, bottom: 4, left: 4 }}>
        <CartesianGrid horizontal={false} stroke="rgb(var(--color-border))" strokeDasharray="3 3" />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={110}
          tick={{ fill: 'rgb(var(--color-text-secondary))', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          content={<CustomTooltip formatter={valueFormatter} />}
          cursor={{ fill: 'rgb(var(--color-surface-2))' }}
        />
        <Bar dataKey={dataKey} fill={hue} radius={[0, 4, 4, 0]} maxBarSize={20} name={barLabel}>
          <LabelList
            dataKey={dataKey}
            position="right"
            formatter={(v: number) => valueFormatter(v)}
            fill="rgb(var(--color-text))"
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function AdminDashboardView() {
  const t = useT();
  const { formatMoney } = useLocalization();

  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [categories, setCategories] = useState<CategoryPerformance[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminSummaryApi()
      .then(setSummary)
      .catch(() => setError(t('dashboard.loadError')))
      .finally(() => setLoadingSummary(false));

    getCategoryPerformanceApi()
      .then(setCategories)
      .catch(() => setError(t('dashboard.loadError')))
      .finally(() => setLoadingCategories(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasActivity = categories.some(c => c.revenue > 0 || c.bookings > 0);

  return (
    <div className="p-6 max-w-[1280px] mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-[22px] font-semibold text-neutral-primary">{t('dashboard.title')}</h1>
        <p className="text-[13px] text-neutral-secondary mt-0.5">{t('dashboard.subtitle')}</p>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger text-[13px] rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={CalendarCheck}
          label={t('dashboard.kpiTotalBookings')}
          value={formatCount(summary?.total_bookings.value ?? 0)}
          loading={loadingSummary}
          current={summary?.total_bookings.current_month}
          prior={summary?.total_bookings.prior_month}
          trendLabel={t('dashboard.trendVsPriorMonth')}
        />
        <KpiCard
          icon={DollarSign}
          label={t('dashboard.kpiTotalRevenue')}
          value={formatMoney(summary?.total_revenue.value ?? 0)}
          loading={loadingSummary}
          current={summary?.total_revenue.current_month}
          prior={summary?.total_revenue.prior_month}
          trendLabel={t('dashboard.trendVsPriorMonth')}
        />
        <KpiCard
          icon={Users}
          label={t('dashboard.kpiActiveUsers')}
          value={formatCount(summary?.active_users.value ?? 0)}
          loading={loadingSummary}
        />
        <KpiCard
          icon={Store}
          label={t('dashboard.kpiActiveVendors')}
          value={formatCount(summary?.active_vendors.value ?? 0)}
          loading={loadingSummary}
        />
      </div>

      {/* Category performance */}
      <div className="bg-surface border border-neutral-border rounded-xl p-5">
        <div className="mb-4">
          <h2 className="text-[15px] font-semibold text-neutral-primary flex items-center gap-2">
            <BarChart2 className="w-4 h-4" />
            {t('dashboard.categoryChartTitle')}
          </h2>
          <p className="text-[12px] text-neutral-secondary mt-0.5">{t('dashboard.categoryChartSubtitle')}</p>
        </div>

        {loadingCategories ? (
          <div className="flex flex-col gap-2 py-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 bg-surface-2 rounded animate-pulse" style={{ width: `${40 + Math.random() * 50}%` }} />
            ))}
          </div>
        ) : !hasActivity ? (
          <p className="text-[13px] text-neutral-secondary text-center py-10">{t('dashboard.categoryChartEmpty')}</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="overflow-x-auto">
              <p className="text-[12px] font-medium text-neutral-secondary mb-2">{t('dashboard.categoryRevenue')}</p>
              <CategoryBarChart
                data={categories}
                dataKey="revenue"
                hue={REVENUE_HUE}
                valueFormatter={formatMoney}
                barLabel={t('dashboard.categoryRevenue')}
              />
            </div>
            <div className="overflow-x-auto">
              <p className="text-[12px] font-medium text-neutral-secondary mb-2">{t('dashboard.categoryBookings')}</p>
              <CategoryBarChart
                data={categories}
                dataKey="bookings"
                hue={BOOKINGS_HUE}
                valueFormatter={formatCount}
                barLabel={t('dashboard.categoryBookings')}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
