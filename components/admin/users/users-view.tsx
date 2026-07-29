'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Users as UsersIcon } from 'lucide-react';
import { useT } from '@/lib/i18n/localization-context';
import { getAllUsersApi, banUserApi, unbanUserApi, type AdminUserRow } from '@/lib/admin-api';
import UserBookingHistoryDrawer from './user-booking-history-drawer';

type RoleFilter = 'customer' | 'vendor' | 'admin' | 'all';
const PAGE_SIZE = 15;

export default function UsersView() {
  const t = useT();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('customer');
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drawerUser, setDrawerUser] = useState<AdminUserRow | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      setUsers(await getAllUsersApi());
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return users.filter(u => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [users, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  async function toggleBan(u: AdminUserRow) {
    setBusyId(u.id);
    setError(null);
    try {
      if (u.deleted_at) {
        await unbanUserApi(u.id);
        setUsers(prev => prev.map(x => (x.id === u.id ? { ...x, deleted_at: null } : x)));
      } else {
        await banUserApi(u.id);
        setUsers(prev => prev.map(x => (x.id === u.id ? { ...x, deleted_at: new Date().toISOString() } : x)));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('users.actionFailed'));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-neutral-primary">{t('users.title')}</h1>
        <p className="text-[13px] text-neutral-secondary mt-0.5">{t('users.subtitle')}</p>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger text-[13px] rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <div className="bg-surface border border-neutral-border rounded-xl p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-secondary pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder={t('users.searchPlaceholder')}
            className="w-full pl-9 pr-4 py-2 border border-neutral-border rounded-lg text-[13px] outline-none focus:ring-2 bg-surface text-neutral-primary focus:border-brand-red/50 focus:ring-brand-red/20"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value as RoleFilter); setPage(1); }}
          className="border border-neutral-border rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 bg-surface text-neutral-primary focus:border-brand-red/50 focus:ring-brand-red/20"
        >
          <option value="customer">{t('users.roleCustomer')}</option>
          <option value="vendor">{t('users.roleVendor')}</option>
          <option value="admin">{t('users.roleAdmin')}</option>
          <option value="all">{t('users.roleAll')}</option>
        </select>
      </div>

      <div className="bg-surface border border-neutral-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 rounded-full border-2 border-brand-red border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <UsersIcon className="w-8 h-8 text-neutral-secondary mx-auto mb-2" />
            <p className="text-[15px] font-semibold text-neutral-primary">{t('users.emptyTitle')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-2 border-b border-neutral-border text-[11px] font-semibold text-neutral-secondary uppercase tracking-wide">
                  <th className="p-4">{t('users.colName')}</th>
                  <th className="p-4">{t('users.colPhone')}</th>
                  <th className="p-4">{t('users.colJoined')}</th>
                  <th className="p-4">{t('bookings.colStatus')}</th>
                  <th className="p-4">{t('listings.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border">
                {pageItems.map(u => (
                  <tr key={u.id} className="text-[13px] text-neutral-primary hover:bg-surface-2 transition-colors">
                    <td className="p-4">
                      <button onClick={() => setDrawerUser(u)} className="text-left hover:text-brand-red transition-colors">
                        <p className="font-medium">{u.name}</p>
                        <p className="text-[12px] text-neutral-secondary">{u.email}</p>
                      </button>
                    </td>
                    <td className="p-4 text-neutral-secondary">{u.phone ?? '—'}</td>
                    <td className="p-4 text-neutral-secondary">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        u.deleted_at ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'
                      }`}>
                        {u.deleted_at ? t('users.statusBanned') : t('users.statusActive')}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleBan(u)}
                        disabled={busyId === u.id || u.role === 'admin'}
                        className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors disabled:opacity-40 ${
                          u.deleted_at ? 'bg-success/10 text-success hover:bg-success/20' : 'bg-danger/10 text-danger hover:bg-danger/20'
                        }`}
                      >
                        {u.deleted_at ? t('users.actionUnban') : t('users.actionBan')}
                      </button>
                    </td>
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

      {drawerUser && (
        <UserBookingHistoryDrawer user={drawerUser} onClose={() => setDrawerUser(null)} />
      )}
    </div>
  );
}
