'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Store } from 'lucide-react';
import { useT } from '@/lib/i18n/localization-context';
import {
  getAllVendorsApi, updateVendorStatusApi,
  type AdminVendor, type VendorStatus,
} from '@/lib/admin-api';
import VendorActionModal from './vendor-action-modal';

type StatusFilter = 'all' | VendorStatus;
const STATUS_FILTERS: StatusFilter[] = ['all', 'pending', 'approved', 'rejected', 'suspended'];

const STATUS_STYLES: Record<VendorStatus, string> = {
  pending:   'bg-warning/10 text-warning',
  approved:  'bg-success/10 text-success',
  rejected:  'bg-danger/10 text-danger',
  suspended: 'bg-neutral-secondary/10 text-neutral-secondary',
};

export default function VendorsView() {
  const t = useT();
  const [vendors, setVendors] = useState<AdminVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [actionVendor, setActionVendor] = useState<AdminVendor | null>(null);
  const [actionType, setActionType] = useState<'reject' | 'suspend' | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      setVendors(await getAllVendorsApi());
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return vendors.filter(v => {
      if (q && !v.business_name.toLowerCase().includes(q) && !v.owner_email.toLowerCase().includes(q)) return false;
      if (statusFilter !== 'all' && v.status !== statusFilter) return false;
      return true;
    });
  }, [vendors, search, statusFilter]);

  async function quickUpdate(vendor: AdminVendor, status: VendorStatus) {
    const updated = await updateVendorStatusApi(vendor.id, status);
    // Merge, don't replace — UPDATE ... RETURNING * doesn't carry the
    // owner_name/owner_email joined in from getAllVendorsApi.
    setVendors(prev => prev.map(v => (v.id === updated.id ? { ...v, ...updated } : v)));
  }

  function handleModalSubmit(vendor: AdminVendor, status: VendorStatus, reason: string) {
    return updateVendorStatusApi(vendor.id, status, reason).then(updated => {
      setVendors(prev => prev.map(v => (v.id === updated.id ? { ...v, ...updated } : v)));
      setActionVendor(null);
      setActionType(null);
    });
  }

  return (
    <div className="p-6 max-w-[1280px] mx-auto">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-neutral-primary">{t('vendors.title')}</h1>
        <p className="text-[13px] text-neutral-secondary mt-0.5">{t('vendors.subtitle')}</p>
      </div>

      <div className="bg-surface border border-neutral-border rounded-xl p-4 mb-4 space-y-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-secondary pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('vendors.searchPlaceholder')}
            className="w-full pl-9 pr-4 py-2 border border-neutral-border rounded-lg text-[13px] outline-none focus:ring-2 bg-surface text-neutral-primary focus:border-brand-red/50 focus:ring-brand-red/20"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-neutral-border">
          <span className="text-[11px] font-semibold text-neutral-secondary uppercase tracking-wider mr-1">
            {t('vendors.statusLabel')}:
          </span>
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-[12px] font-medium transition-colors border ${
                statusFilter === s
                  ? 'bg-brand-red text-white border-brand-red'
                  : 'border-neutral-border text-neutral-secondary hover:text-neutral-primary hover:border-neutral-primary'
              }`}
            >
              {t(`vendors.filter${s.charAt(0).toUpperCase() + s.slice(1)}`)}
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
            <Store className="w-8 h-8 text-neutral-secondary mx-auto mb-2" />
            <p className="text-[15px] font-semibold text-neutral-primary mb-1">{t('vendors.emptyTitle')}</p>
            <p className="text-[13px] text-neutral-secondary">{t('vendors.emptyBody')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-2 border-b border-neutral-border text-[11px] font-semibold text-neutral-secondary uppercase tracking-wide">
                  <th className="p-4">{t('vendors.colBusiness')}</th>
                  <th className="p-4">{t('vendors.colOwner')}</th>
                  <th className="p-4">{t('vendors.colStatus')}</th>
                  <th className="p-4">{t('vendors.colJoined')}</th>
                  <th className="p-4">{t('vendors.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border">
                {filtered.map(v => (
                  <tr key={v.id} className="text-[13px] text-neutral-primary hover:bg-surface-2 transition-colors">
                    <td className="p-4">
                      <p className="font-medium">{v.business_name}</p>
                      {v.website && <p className="text-[12px] text-neutral-secondary">{v.website}</p>}
                    </td>
                    <td className="p-4">
                      <p>{v.owner_name}</p>
                      <p className="text-[12px] text-neutral-secondary">{v.owner_email}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_STYLES[v.status]}`}>
                        {t(`vendors.status${v.status.charAt(0).toUpperCase() + v.status.slice(1)}`)}
                      </span>
                      {v.status === 'rejected' && v.rejection_reason && (
                        <p className="text-[11px] text-neutral-secondary mt-1 max-w-[200px] truncate" title={v.rejection_reason}>
                          {v.rejection_reason}
                        </p>
                      )}
                    </td>
                    <td className="p-4 text-neutral-secondary">
                      {new Date(v.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {v.status === 'pending' && (
                          <>
                            <button
                              onClick={() => quickUpdate(v, 'approved')}
                              className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-success/10 text-success hover:bg-success/20 transition-colors"
                            >
                              {t('vendors.actionApprove')}
                            </button>
                            <button
                              onClick={() => { setActionVendor(v); setActionType('reject'); }}
                              className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
                            >
                              {t('vendors.actionReject')}
                            </button>
                          </>
                        )}
                        {v.status === 'approved' && (
                          <button
                            onClick={() => { setActionVendor(v); setActionType('suspend'); }}
                            className="px-3 py-1.5 rounded-lg text-[12px] font-medium border border-neutral-border text-neutral-secondary hover:text-neutral-primary hover:bg-surface-2 transition-colors"
                          >
                            {t('vendors.actionSuspend')}
                          </button>
                        )}
                        {(v.status === 'suspended' || v.status === 'rejected') && (
                          <button
                            onClick={() => quickUpdate(v, 'approved')}
                            className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-success/10 text-success hover:bg-success/20 transition-colors"
                          >
                            {t('vendors.actionActivate')}
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
      </div>

      {actionVendor && actionType && (
        <VendorActionModal
          vendor={actionVendor}
          type={actionType}
          onClose={() => { setActionVendor(null); setActionType(null); }}
          onSubmit={reason => handleModalSubmit(actionVendor, actionType === 'reject' ? 'rejected' : 'suspended', reason)}
        />
      )}
    </div>
  );
}
