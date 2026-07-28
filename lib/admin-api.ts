import { API_BASE } from './api-base';
import { apiFetch } from './api-client';

const BASE_URL = API_BASE;

export interface AdminMetric {
  value: number;
  current_month?: number;
  prior_month?: number;
}

export interface AdminSummary {
  total_bookings: AdminMetric;
  total_revenue: AdminMetric;
  active_users: AdminMetric;
  active_vendors: AdminMetric;
}

export interface CategoryPerformance {
  id: string;
  name: string;
  bookings: number;
  revenue: number;
}

export async function getAdminSummaryApi(): Promise<AdminSummary> {
  const res = await apiFetch(`${BASE_URL}/admin/stats/summary`, { credentials: 'include' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to load dashboard summary');
  return data;
}

export async function getCategoryPerformanceApi(): Promise<CategoryPerformance[]> {
  const res = await apiFetch(`${BASE_URL}/admin/stats/category-performance`, { credentials: 'include' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to load category performance');
  return data.categories ?? [];
}
