import React, { useState, useEffect } from 'react';
import { Voucher, DashboardStats, VoucherFilterParams } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FilterBar } from '../components/FilterBar';
import { StatusBadge } from '../components/StatusBadge';
import { VoucherDetailModal } from '../components/VoucherDetailModal';
import { ApprovalModal } from '../pages/ApprovalModal';
import {
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  Layers,
  Eye,
  ShieldCheck,
  Check,
  X,
  AlertCircle,
  Building,
} from 'lucide-react';

interface DirectorViewProps {
  currentTab: string;
}

export const DirectorView: React.FC<DirectorViewProps> = ({ currentTab }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [reviewVoucher, setReviewVoucher] = useState<Voucher | null>(null);
  const [reviewInitialMode, setReviewInitialMode] = useState<'approve' | 'reject'>('approve');

  const [filters, setFilters] = useState<VoucherFilterParams>({
    search: '',
    status: currentTab === 'pending-approvals' ? 'pending_approval' : '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Sync tab change with filter
  useEffect(() => {
    if (currentTab === 'pending-approvals') {
      setFilters((prev) => ({ ...prev, status: 'pending_approval' }));
    } else if (currentTab === 'all-vouchers') {
      setFilters((prev) => ({ ...prev, status: '' }));
    }
  }, [currentTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, listRes] = await Promise.all([
        api.getDashboardStats(),
        api.getVouchers(filters),
      ]);
      setStats(statsRes.stats);
      setVouchers(listRes.vouchers);
      setTotalCount(listRes.total);
    } catch (err) {
      console.error('Failed to load Director data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const handleConfirmApprove = async (voucherId: string, directorSignature: string) => {
    await api.approveVoucher(voucherId, directorSignature);
    setReviewVoucher(null);
    setSelectedVoucher(null);
    await loadData();
  };

  const handleConfirmReject = async (voucherId: string, rejectionReason: string) => {
    await api.rejectVoucher(voucherId, rejectionReason);
    setReviewVoucher(null);
    setSelectedVoucher(null);
    await loadData();
  };

  const openReviewModal = (voucher: Voucher, mode: 'approve' | 'reject') => {
    setReviewVoucher(voucher);
    setReviewInitialMode(mode);
  };

  return (
    <div className="space-y-6">
      {/* Director Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Director Approval Console
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Logged in as <span className="font-semibold text-slate-700">{user?.name}</span> · Executive Authorization
          </p>
        </div>

        {stats && (stats.pendingApprovalCount ?? 0) > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-semibold">
            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>{stats.pendingApprovalCount} Vouchers Awaiting Your Approval</span>
          </div>
        )}
      </div>

      {/* 8. Director Dashboard Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Pending Approval Count */}
        <div className="bg-white p-4.5 rounded-xl border border-amber-200/90 bg-amber-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-900 tabular-nums">
            {stats?.pendingApprovalCount ?? 0}
          </div>
          <span className="text-[11px] text-amber-700/80">Requires your review</span>
        </div>

        {/* Approved Today */}
        <div className="bg-white p-4.5 rounded-xl border border-emerald-200/90 bg-emerald-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Approved Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-900 tabular-nums">
            {stats?.approvedToday ?? 0}
          </div>
          <span className="text-[11px] text-emerald-700/80">Authorized for payment</span>
        </div>

        {/* Rejected Today */}
        <div className="bg-white p-4.5 rounded-xl border border-rose-200/90 bg-rose-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-rose-700 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Rejected Today</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-rose-900 tabular-nums">
            {stats?.rejectedToday ?? 0}
          </div>
          <span className="text-[11px] text-rose-700/80">With documented reasons</span>
        </div>

        {/* Total Pending Amount */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Pending ($)</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 tabular-nums truncate">
            ${(stats?.totalPendingAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-400">Total pipeline exposure</span>
        </div>
      </div>

      {/* Search, Filter & Sort Component */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        userRole="director"
        totalResults={totalCount}
      />

      {/* Vouchers Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {currentTab === 'pending-approvals' ? 'Pending Approval Requests' : 'Organization Vouchers'}
            </h2>
            <p className="text-xs text-slate-500">
              Review claim details, employee signatures, and authorize reimbursements
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {vouchers.length} results
          </span>
        </div>

        {vouchers.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No vouchers match criteria</h3>
            <p className="text-xs text-slate-500">
              All approval items may be up to date, or adjust filter selections.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Voucher #</th>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Expense Title & Category</th>
                  <th className="px-4 py-3">Expense Date</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Signature</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                {vouchers.map((voucher) => (
                  <tr
                    key={voucher.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => setSelectedVoucher(voucher)}
                  >
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {voucher.voucherNumber}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{voucher.employeeName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {voucher.employeeId || 'ID: EMP'}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 font-medium">
                      {voucher.department}
                    </td>
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="font-semibold text-slate-900 truncate">
                        {voucher.expenseTitle}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {voucher.expenseCategory}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-600">
                      {voucher.expenseDate}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold tabular-nums text-slate-900 whitespace-nowrap">
                      ${voucher.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {voucher.employeeSignature ? (
                        <div className="h-6 w-16 bg-slate-50 border border-slate-200 rounded p-0.5 flex items-center justify-center">
                          <img
                            src={voucher.employeeSignature}
                            alt="Signature"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <StatusBadge status={voucher.status} size="sm" />
                    </td>
                    <td
                      className="px-4 py-3.5 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedVoucher(voucher)}
                          title="View Details"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Quick Approve & Reject Buttons for Pending Vouchers */}
                        {voucher.status === 'pending_approval' && (
                          <>
                            <button
                              onClick={() => openReviewModal(voucher, 'approve')}
                              title="Sign & Approve"
                              className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors shadow-2xs flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              Approve
                            </button>
                            <button
                              onClick={() => openReviewModal(voucher, 'reject')}
                              title="Reject with remarks"
                              className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors flex items-center gap-1"
                            >
                              <X className="w-3 h-3" />
                              Reject
                            </button>
                          </>
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

      {/* Review & Decision Modal */}
      {reviewVoucher && (
        <ApprovalModal
          voucher={reviewVoucher}
          initialMode={reviewInitialMode}
          onClose={() => setReviewVoucher(null)}
          onConfirmApprove={handleConfirmApprove}
          onConfirmReject={handleConfirmReject}
        />
      )}

      {/* Voucher Detail Modal */}
      {selectedVoucher && (
        <VoucherDetailModal
          voucher={selectedVoucher}
          onClose={() => setSelectedVoucher(null)}
          userRole="director"
          onApprove={(v) => {
            setSelectedVoucher(null);
            openReviewModal(v, 'approve');
          }}
          onReject={(v) => {
            setSelectedVoucher(null);
            openReviewModal(v, 'reject');
          }}
        />
      )}
    </div>
  );
};
