'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Star, Pencil, Trash2, LayoutList } from 'lucide-react';
import { useT, useLocalization } from '@/lib/i18n/localization-context';
import {
  getAllListingsAdminApi, updateListingAdminApi, deleteListingAdminApi,
  type AdminListing,
} from '@/lib/admin-api';
import ListingEditModal from './listing-edit-modal';
import DeleteConfirmModal from '../shared/delete-confirm-modal';

type StatusFilter = 'all' | 'active' | 'inactive';
const PAGE_SIZE = 15;

export default function ListingsView() {
  const t = useT();
  const { formatMoney } = useLocalization();

  const [listings, setListings] = useState<AdminListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [vendorFilter, setVendorFilter] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<AdminListing | null>(null);
  const [deleting, setDeleting] = useState<AdminListing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      setListings(await getAllListingsAdminApi());
    } finally {
      setLoading(false);
    }
  }

  const vendorOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const l of listings) if (!seen.has(l.vendor_id)) seen.set(l.vendor_id, l.vendor_name);
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [listings]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return listings.filter(l => {
      if (q && !l.title.toLowerCase().includes(q) && !l.vendor_name.toLowerCase().includes(q)) return false;
      if (statusFilter !== 'all' && l.status !== statusFilter) return false;
      if (vendorFilter && l.vendor_id !== vendorFilter) return false;
      return true;
    });
  }, [listings, search, statusFilter, vendorFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  async function toggleFeatured(l: AdminListing) {
    setTogglingId(l.id);
    try {
      const updated = await updateListingAdminApi(l.id, { featured: !l.featured });
      setListings(prev => prev.map(x => (x.id === l.id ? { ...x, featured: updated.featured } : x)));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('listings.updateFailed'));
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteListingAdminApi(deleting.id);
      setListings(prev => prev.filter(l => l.id !== deleting.id));
      setDeleting(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('listings.deleteFailed'));
    }
  }

  return (
    <div className="p-6 max-w-[1280px] mx-auto">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-neutral-primary">{t('listings.adminTitle')}</h1>
        <p className="text-[13px] text-neutral-secondary mt-0.5">{t('listings.adminSubtitle')}</p>
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
            placeholder={t('listings.searchPlaceholder')}
            className="w-full pl-9 pr-4 py-2 border border-neutral-border rounded-lg text-[13px] outline-none focus:ring-2 bg-surface text-neutral-primary focus:border-brand-red/50 focus:ring-brand-red/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value as StatusFilter); setPage(1); }}
          className="border border-neutral-border rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 bg-surface text-neutral-primary focus:border-brand-red/50 focus:ring-brand-red/20"
        >
          <option value="all">{t('listings.filterAllStatus')}</option>
          <option value="active">{t('listings.statusActive')}</option>
          <option value="inactive">{t('listings.statusInactive')}</option>
        </select>
        {vendorOptions.length > 1 && (
          <select
            value={vendorFilter}
            onChange={e => { setVendorFilter(e.target.value); setPage(1); }}
            className="border border-neutral-border rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 bg-surface text-neutral-primary focus:border-brand-red/50 focus:ring-brand-red/20"
          >
            <option value="">{t('listings.filterAllVendors')}</option>
            {vendorOptions.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        )}
      </div>

      <div className="bg-surface border border-neutral-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 rounded-full border-2 border-brand-red border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <LayoutList className="w-8 h-8 text-neutral-secondary mx-auto mb-2" />
            <p className="text-[15px] font-semibold text-neutral-primary">{t('listings.emptyTitle')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-2 border-b border-neutral-border text-[11px] font-semibold text-neutral-secondary uppercase tracking-wide">
                  <th className="p-4 w-12"></th>
                  <th className="p-4">{t('listings.colTitle')}</th>
                  <th className="p-4">{t('listings.colVendor')}</th>
                  <th className="p-4">{t('listings.colCategory')}</th>
                  <th className="p-4">{t('listings.colPrice')}</th>
                  <th className="p-4">{t('listings.colStatus')}</th>
                  <th className="p-4">{t('listings.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border">
                {pageItems.map(l => (
                  <tr key={l.id} className="text-[13px] text-neutral-primary hover:bg-surface-2 transition-colors">
                    <td className="p-4">
                      <button
                        onClick={() => toggleFeatured(l)}
                        disabled={togglingId === l.id}
                        title={t('listings.toggleFeatured')}
                        className="disabled:opacity-40"
                      >
                        <Star className={`w-4 h-4 ${l.featured ? 'fill-warning text-warning' : 'text-neutral-secondary'}`} />
                      </button>
                    </td>
                    <td className="p-4 font-medium max-w-[280px] truncate">{l.title}</td>
                    <td className="p-4 text-neutral-secondary">{l.vendor_name}</td>
                    <td className="p-4 text-neutral-secondary">{l.category_name ?? '—'}</td>
                    <td className="p-4">{formatMoney(Number(l.price))}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        l.status === 'active' ? 'bg-success/10 text-success' : 'bg-neutral-secondary/10 text-neutral-secondary'
                      }`}>
                        {l.status === 'active' ? t('listings.statusActive') : t('listings.statusInactive')}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditing(l)}
                          className="p-2 rounded-lg text-neutral-secondary hover:text-neutral-primary hover:bg-surface-2 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleting(l)}
                          className="p-2 rounded-lg text-neutral-secondary hover:text-danger hover:bg-danger/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

      {editing && (
        <ListingEditModal
          listing={editing}
          onClose={() => setEditing(null)}
          onSaved={updated => {
            setListings(prev => prev.map(l => (l.id === updated.id ? { ...l, ...updated } : l)));
            setEditing(null);
          }}
        />
      )}

      {deleting && (
        <DeleteConfirmModal
          title={t('listings.deleteTitle')}
          body={t('listings.deleteBody').replace('{title}', deleting.title)}
          onCancel={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
