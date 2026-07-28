import type { Messages } from '@/lib/localization-api';

export const FALLBACK_EN: Messages = {
  common: {
    loading: 'Loading…',
    signOut: 'Sign out',
    retry: 'Retry',
  },
  nav: {
    adminDashboard: 'Dashboard',
  },
  dashboard: {
    title: 'Admin Dashboard',
    subtitle: 'Platform-wide performance at a glance.',
    kpiTotalBookings: 'Total Bookings',
    kpiTotalRevenue: 'Total Revenue',
    kpiActiveUsers: 'Active Users',
    kpiActiveVendors: 'Active Vendors',
    trendVsPriorMonth: 'vs last month',
    categoryChartTitle: 'Category-wise performance',
    categoryChartSubtitle: 'Bookings and revenue by category',
    categoryChartEmpty: 'No booking activity yet.',
    categoryRevenue: 'Revenue',
    categoryBookings: 'Bookings',
    loadError: 'Could not load dashboard data.',
  },
};
