import React, { useState, useEffect } from 'react';
import { Voucher, DashboardStats, VoucherFilterParams } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FilterBar } from '../components/FilterBar';
import { StatusBadge } from '../components/StatusBadge';
import { VoucherDetailModal } from '../components/VoucherDetailModal';
import { VoucherFormModal } from '../pages/VoucherFormModal';
import {
  FileText,
  FileEdit,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  Plus,
  Trash2,
  Eye,
  Send,
  AlertTriangle,
  Receipt,
  Layers,
} from 'lucide-react';

interface EmployeeViewProps {
  currentTab: string;
  onOpenCreate: () => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
}

export const EmployeeView: React.FC<EmployeeViewProps> = ({
  currentTab,
  onOpenCreate,
  isCreateModalOpen,
  setIsCreateModalOpen,
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [deleteConfirmVoucher, setDeleteConfirmVoucher] = useState<Voucher | null>(null);

  const [filters, setFilters] = useState<VoucherFilterParams>({
    search: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

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
      console.error('Failed to load employee data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const handleSaveDraft = async (data: any) => {
    if (editingVoucher) {
      await api.updateVoucher(editingVoucher.id, data);
    } else {
      await api.createVoucher(data);
    }
    setEditingVoucher(null);
    await loadData();
  };

  const handleSubmitVoucher = async (data: any) => {
    if (editingVoucher) {
      await api.updateVoucher(editingVoucher.id, data);
      await api.submitVoucher(editingVoucher.id, data.employeeSignature);
    } else {
      const res = await api.createVoucher(data);
      await api.submitVoucher(res.voucher.id, data.employeeSignature);
    }
    setEditingVoucher(null);
    await loadData();
  };

  const handleDirectSubmitDraft = async (voucher: Voucher) => {
    try {
      await api.submitVoucher(voucher.id);
      setSelectedVoucher(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit voucher');
    }
  };

  const handleDeleteDraft = async (voucher: Voucher) => {
    try {
      await api.deleteVoucher(voucher.id);
      setDeleteConfirmVoucher(null);
      setSelectedVoucher(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete voucher');
    }
  };

  return (
    <div className="space-y-6">
      {/* Employee Greeting & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Department: <span className="font-semibold text-slate-700">{user?.department}</span> · ID: <span className="font-mono text-slate-700">{user?.employeeId}</span>
          </p>
        </div>
        <button
          onClick={onOpenCreate}
          className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create Expense Voucher
        </button>
      </div>

      {/* 8. Employee Dashboard Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Vouchers */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Claims</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {stats?.totalVouchers ?? 0}
          </div>
          <span className="text-[11px] text-slate-400">All submissions</span>
        </div>

        {/* Draft Vouchers */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Drafts</span>
            <FileEdit className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-700 tabular-nums">
            {stats?.draftVouchers ?? 0}
          </div>
          <span className="text-[11px] text-slate-400">Editable before submit</span>
        </div>

        {/* Pending Approval */}
        <div className="bg-white p-4 rounded-xl border border-amber-200/80 bg-amber-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Pending</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-900 tabular-nums">
            {stats?.pendingApproval ?? 0}
          </div>
          <span className="text-[11px] text-amber-600/80">With Director</span>
        </div>

        {/* Approved Vouchers */}
        <div className="bg-white p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-900 tabular-nums">
            {stats?.approvedVouchers ?? 0}
          </div>
          <span className="text-[11px] text-emerald-600/80">Director approved</span>
        </div>

        {/* Rejected Vouchers */}
        <div className="bg-white p-4 rounded-xl border border-rose-200/80 bg-rose-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-rose-700 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Rejected</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-900 tabular-nums">
            {stats?.rejectedVouchers ?? 0}
          </div>
          <span className="text-[11px] text-rose-600/80">View remarks</span>
        </div>

        {/* Total Amount Claimed */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Claimed ($)</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 tabular-nums truncate">
            ${(stats?.totalAmountClaimed ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-400">Submitted value</span>
        </div>
      </div>

      {/* Search, Filter & Sort Component */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        userRole="employee"
        totalResults={totalCount}
      />

      {/* Vouchers Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">My Expense Vouchers</h2>
            <p className="text-xs text-slate-500">
              Only vouchers created by your account are accessible here
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {vouchers.length} shown
          </span>
        </div>

        {vouchers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No vouchers found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't created any vouchers matching the current filters. Click below to start your first reimbursement claim.
            </p>
            <button
              onClick={onOpenCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Create First Voucher
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Voucher #</th>
                  <th className="px-4 py-3">Expense Date</th>
                  <th className="px-4 py-3">Title & Purpose</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Amount</th>
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
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-600">
                      {voucher.expenseDate}
                    </td>
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="font-semibold text-slate-900 truncate">
                        {voucher.expenseTitle}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {voucher.department}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-600">
                      {voucher.expenseCategory}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold tabular-nums text-slate-900 whitespace-nowrap">
                      ${voucher.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <StatusBadge status={voucher.status} size="sm" />
                      {voucher.status === 'rejected' && voucher.rejectionReason && (
                        <div className="text-[10px] text-rose-600 truncate max-w-[140px] mt-0.5">
                          {voucher.rejectionReason}
                        </div>
                      )}
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

                        {/* Edit & Delete & Submit only if DRAFT status */}
                        {voucher.status === 'draft' && (
                          <>
                            <button
                              onClick={() => setEditingVoucher(voucher)}
                              title="Edit Draft"
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                            >
                              <FileEdit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDirectSubmitDraft(voucher)}
                              title="Submit for Approval"
                              className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmVoucher(voucher)}
                              title="Delete Draft"
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

      {/* Create / Edit Modal */}
      {(isCreateModalOpen || editingVoucher) && (
        <VoucherFormModal
          voucherToEdit={editingVoucher}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingVoucher(null);
          }}
          onSaveDraft={handleSaveDraft}
          onSubmitVoucher={handleSubmitVoucher}
        />
      )}

      {/* Voucher Detail Modal */}
      {selectedVoucher && (
        <VoucherDetailModal
          voucher={selectedVoucher}
          onClose={() => setSelectedVoucher(null)}
          userRole="employee"
          onEdit={(v) => {
            setSelectedVoucher(null);
            setEditingVoucher(v);
          }}
          onSubmit={handleDirectSubmitDraft}
          onDelete={(v) => {
            setDeleteConfirmVoucher(v);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold text-slate-900">Delete Draft Voucher?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete draft voucher{' '}
              <strong className="font-mono text-slate-800">
                {deleteConfirmVoucher.voucherNumber}
              </strong>
              ? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmVoucher(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteDraft(deleteConfirmVoucher)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
              >
                Delete Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
