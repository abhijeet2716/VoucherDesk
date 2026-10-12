import React, { useState, useEffect } from 'react';
import { Voucher, DashboardStats, VoucherFilterParams } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FilterBar } from '../components/FilterBar';
import { StatusBadge, PaymentBadge } from '../components/StatusBadge';
import { VoucherDetailModal } from '../components/VoucherDetailModal';
import { ReimbursementModal } from '../pages/ReimbursementModal';
import {
  Building2,
  DollarSign,
  Layers,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Printer,
  CreditCard,
  Download,
} from 'lucide-react';

interface AccountsViewProps {
  currentTab: string;
}

export const AccountsView: React.FC<AccountsViewProps> = ({ currentTab }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [reimburseVoucher, setReimburseVoucher] = useState<Voucher | null>(null);

  const [filters, setFilters] = useState<VoucherFilterParams>({
    search: '',
    status: currentTab === 'reimbursements' ? 'approved' : '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  useEffect(() => {
    if (currentTab === 'reimbursements') {
      setFilters((prev) => ({ ...prev, status: 'approved' }));
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
      console.error('Failed to load accounts data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const handleConfirmReimburse = async (voucherId: string, paymentRef: string) => {
    await api.processReimbursement(voucherId, { paymentReference: paymentRef });
    setReimburseVoucher(null);
    setSelectedVoucher(null);
    await loadData();
  };

  return (
    <div className="space-y-6">
      {/* Accounts Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Accounts & Reimbursement Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Logged in as <span className="font-semibold text-slate-700">{user?.name}</span> · Finance & Disbursement
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Reimbursement Pipeline:</span>
          <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold font-mono">
            ${(stats?.totalApprovedExpenseAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* 8. Accounts Dashboard Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Vouchers */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Vouchers</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {stats?.totalVouchers ?? 0}
          </div>
          <span className="text-[11px] text-slate-400">Organization wide</span>
        </div>

        {/* Pending Approval */}
        <div className="bg-white p-4 rounded-xl border border-amber-200/80 bg-amber-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-900 tabular-nums">
            {stats?.pendingApproval ?? 0}
          </div>
          <span className="text-[11px] text-amber-600/80">Awaiting Director</span>
        </div>

        {/* Approved Vouchers */}
        <div className="bg-white p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-900 tabular-nums">
            {stats?.approvedVouchers ?? 0}
          </div>
          <span className="text-[11px] text-emerald-600/80">Ready to reimburse</span>
        </div>

        {/* Rejected Vouchers */}
        <div className="bg-white p-4 rounded-xl border border-rose-200/80 bg-rose-50/20 shadow-2xs">
          <div className="flex items-center justify-between text-rose-700 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Rejected</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-900 tabular-nums">
            {stats?.rejectedVouchers ?? 0}
          </div>
          <span className="text-[11px] text-rose-600/80">Non-reimbursable</span>
        </div>

        {/* Total Approved Amount */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Approved ($)</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 tabular-nums truncate">
            ${(stats?.totalApprovedExpenseAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-400">Total liability</span>
        </div>

        {/* Total Reimbursed Amount */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Disbursed ($)</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-800 tabular-nums truncate">
            ${(stats?.totalReimbursedAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-400">Paid out</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        userRole="accounts"
        totalResults={totalCount}
      />

      {/* Accounts Vouchers Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {currentTab === 'reimbursements' ? 'Reimbursement Payout Queue' : 'All Enterprise Expense Vouchers'}
            </h2>
            <p className="text-xs text-slate-500">
              Monitor vouchers, audit signatures, and execute disbursement processing
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">{vouchers.length} records</span>
        </div>

        {vouchers.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No vouchers found</h3>
            <p className="text-xs text-slate-500">Adjust the filters above to view more items.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Voucher #</th>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Expense Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Signatures</th>
                  <th className="px-4 py-3">Approval</th>
                  <th className="px-4 py-3">Payment</th>
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
                        {voucher.employeeId || 'EMP'}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 font-medium">
                      {voucher.department}
                    </td>
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="font-semibold text-slate-900 truncate">
                        {voucher.expenseTitle}
                      </div>
                      <div className="text-[11px] text-slate-400">{voucher.expenseDate}</div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-600">
                      {voucher.expenseCategory}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold tabular-nums text-slate-900 whitespace-nowrap">
                      ${voucher.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            voucher.employeeSignature
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                          title="Employee Signature"
                        >
                          Emp: {voucher.employeeSignature ? 'Yes' : 'No'}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            voucher.directorSignature
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                          title="Director Signature"
                        >
                          Dir: {voucher.directorSignature ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <StatusBadge status={voucher.status} size="sm" />
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <PaymentBadge paymentStatus={voucher.paymentStatus} />
                    </td>
                    <td
                      className="px-4 py-3.5 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedVoucher(voucher)}
                          title="View / Print Document"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Process Reimbursement button for Approved vouchers */}
                        {voucher.status === 'approved' && voucher.paymentStatus !== 'reimbursed' && (
                          <button
                            onClick={() => setReimburseVoucher(voucher)}
                            title="Disburse / Reimbursed"
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded transition-colors shadow-2xs flex items-center gap-1"
                          >
                            <CreditCard className="w-3 h-3" />
                            Disburse
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

      {/* Reimbursement Processing Modal */}
      {reimburseVoucher && (
        <ReimbursementModal
          voucher={reimburseVoucher}
          onClose={() => setReimburseVoucher(null)}
          onConfirmReimburse={handleConfirmReimburse}
        />
      )}

      {/* Voucher Detail Modal */}
      {selectedVoucher && (
        <VoucherDetailModal
          voucher={selectedVoucher}
          onClose={() => setSelectedVoucher(null)}
          userRole="accounts"
          onReimburse={(v) => {
            setSelectedVoucher(null);
            setReimburseVoucher(v);
          }}
        />
      )}
    </div>
  );
};
