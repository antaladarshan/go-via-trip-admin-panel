'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import AdminDashboardShell from './admin-dashboard-shell';

export default function AdminGate() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'admin') router.replace('/auth/login');
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-red border-t-transparent animate-spin" />
      </div>
    );
  }

  return <AdminDashboardShell />;
}
