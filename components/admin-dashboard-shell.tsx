'use client';

import { useState } from 'react';
import {
  LogOut, LayoutDashboard, Menu, X, Store, FolderTree, LayoutList,
  BookOpen, CreditCard, Tag, BarChart2, Users,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useT } from '@/lib/i18n/localization-context';
import { BRAND } from '@/lib/brand';
import Logo from '@/components/brand/logo';
import AdminDashboardView from './dashboard/admin-dashboard-view';
import VendorsView from './admin/vendors/vendors-view';
import CategoriesView from './admin/categories/categories-view';
import ListingsView from './admin/listings/listings-view';
import BookingsView from './admin/bookings/bookings-view';
import PaymentsView from './admin/payments/payments-view';
import CouponsView from './admin/coupons/coupons-view';
import ReportsView from './admin/reports/reports-view';
import UsersView from './admin/users/users-view';

type Section =
  | 'dashboard' | 'vendors' | 'categories' | 'listings' | 'bookings'
  | 'payments' | 'coupons' | 'reports' | 'users';

export default function AdminDashboardShell() {
  const { logout, user } = useAuth();
  const t = useT();
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const NAV_ITEMS: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'dashboard',  label: t('nav.adminDashboard'), icon: LayoutDashboard },
    { id: 'vendors',    label: t('nav.vendors'),        icon: Store },
    { id: 'categories', label: t('nav.categories'),     icon: FolderTree },
    { id: 'listings',   label: t('nav.listings'),       icon: LayoutList },
    { id: 'bookings',   label: t('nav.bookings'),       icon: BookOpen },
    { id: 'payments',   label: t('nav.payments'),       icon: CreditCard },
    { id: 'coupons',    label: t('nav.coupons'),        icon: Tag },
    { id: 'reports',    label: t('nav.reports'),        icon: BarChart2 },
    { id: 'users',      label: t('nav.users'),          icon: Users },
  ];

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-neutral-border">
        <Logo variant="wordmark" animateOnFirstVisit className="h-5 w-auto" aria-label={BRAND.name} />
        <p className="text-[12px] text-neutral-secondary truncate mt-0.5">{user?.name ?? 'Admin'}</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setActiveSection(id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors
              ${activeSection === id ? 'bg-brand-red text-white' : 'text-neutral-secondary hover:text-neutral-primary hover:bg-neutral-muted'}`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </button>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-neutral-border space-y-0.5">
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-neutral-secondary hover:text-neutral-primary hover:bg-neutral-muted transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {t('common.signOut')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-surface border-r border-neutral-border">
        {sidebar}
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-10 flex flex-col w-72 bg-surface border-r border-neutral-border">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-neutral-secondary hover:text-neutral-primary"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-neutral-border bg-surface shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-neutral-secondary hover:text-neutral-primary"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-[14px] font-semibold text-neutral-primary">{BRAND.name} Admin</span>
        </div>

        <main className="flex-1 overflow-y-auto">
          {activeSection === 'dashboard'  && <AdminDashboardView />}
          {activeSection === 'vendors'    && <VendorsView />}
          {activeSection === 'categories' && <CategoriesView />}
          {activeSection === 'listings'   && <ListingsView />}
          {activeSection === 'bookings'   && <BookingsView />}
          {activeSection === 'payments'   && <PaymentsView />}
          {activeSection === 'coupons'    && <CouponsView />}
          {activeSection === 'reports'    && <ReportsView />}
          {activeSection === 'users'      && <UsersView />}
        </main>
      </div>
    </div>
  );
}
