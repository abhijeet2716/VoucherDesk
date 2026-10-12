import React, { useState } from 'react';
import { VoucherFilterParams, UserRole } from '../types';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  RotateCcw,
} from 'lucide-react';

interface FilterBarProps {
  filters: VoucherFilterParams;
  onFilterChange: (filters: VoucherFilterParams) => void;
  userRole: UserRole;
  totalResults: number;
}

const DEPARTMENTS = [
  'Engineering',
  'Marketing',
  'Sales',
  'Human Resources',
  'Finance & Accounts',
  'Operations',
  'Product Design',
  'Legal',
];

const CATEGORIES = [
  'Travel',
  'Meals & Entertainment',
  'Office Supplies',
  'Software & Subscriptions',
  'Training & Certifications',
  'Client Meeting',
  'Logistics',
  'Miscellaneous',
];

const STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  userRole,
  totalResults,
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (key: keyof VoucherFilterParams, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value === '' ? undefined : value,
    });
  };

  const handleReset = () => {
    onFilterChange({
      search: '',
      voucherNumber: '',
      employeeName: '',
      department: '',
      category: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const activeFilterCount = [
    filters.voucherNumber,
    filters.employeeName,
    filters.department,
    filters.category,
    filters.status,
    filters.dateFrom,
    filters.dateTo,
    filters.minAmount,
    filters.maxAmount,
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 mb-6 transition-all">
      {/* Top Search & Primary Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Voucher #, Title, Description, or Department..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 text-xs sm:text-sm bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => handleChange('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {/* Quick status tabs for employee / director */}
          <select
            value={filters.status || ''}
            onChange={(e) => handleChange('status', e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
            <select
              value={filters.sortBy || 'createdAt'}
              onChange={(e) => handleChange('sortBy', e.target.value)}
              className="text-xs px-2.5 py-2 text-slate-700 font-medium bg-transparent border-r border-slate-200 focus:outline-none"
            >
              <option value="createdAt">Date Created</option>
              <option value="expenseDate">Expense Date</option>
              <option value="amount">Amount</option>
              <option value="voucherNumber">Voucher #</option>
              <option value="status">Status</option>
              {userRole !== 'employee' && <option value="employeeName">Employee</option>}
            </select>
            <button
              type="button"
              onClick={() =>
                handleChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')
              }
              title={`Sorting: ${filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
              className="p-2 hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Toggle More Filters */}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
              expanded || activeFilterCount > 0
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-4.5 h-4.5 rounded-full bg-blue-600 text-[10px] text-white flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Filter Panel */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Department */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Department
            </label>
            <select
              value={filters.department || ''}
              onChange={(e) => handleChange('department', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-800 focus:bg-white focus:outline-none"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Expense Category */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={filters.category || ''}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-800 focus:bg-white focus:outline-none"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Employee Name (Director & Accounts only) */}
          {userRole !== 'employee' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Employee Name
              </label>
              <input
                type="text"
                placeholder="Filter by employee..."
                value={filters.employeeName || ''}
                onChange={(e) => handleChange('employeeName', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>
          )}

          {/* Voucher Number specific */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Voucher Number
            </label>
            <input
              type="text"
              placeholder="e.g. EV-2026-0101"
              value={filters.voucherNumber || ''}
              onChange={(e) => handleChange('voucherNumber', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-800 font-mono text-xs focus:bg-white focus:outline-none"
            />
          </div>

          {/* Date Range: From & To */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Expense Date From
            </label>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleChange('dateFrom', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Expense Date To
            </label>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => handleChange('dateTo', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Amount Range: Min & Max */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Min Amount ($)
            </label>
            <input
              type="number"
              placeholder="0.00"
              value={filters.minAmount || ''}
              onChange={(e) => handleChange('minAmount', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-800 tabular-nums focus:bg-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Max Amount ($)
            </label>
            <input
              type="number"
              placeholder="5000.00"
              value={filters.maxAmount || ''}
              onChange={(e) => handleChange('maxAmount', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-800 tabular-nums focus:bg-white focus:outline-none"
            />
          </div>

          {/* Action Row */}
          <div className="col-span-full flex items-center justify-between pt-2">
            <span className="text-slate-500 text-xs">
              Showing <span className="font-semibold text-slate-900">{totalResults}</span> matching vouchers
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1 rounded hover:bg-rose-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
