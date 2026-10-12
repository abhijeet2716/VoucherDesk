import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  FileText,
  UserCheck,
  Building2,
  ChevronDown,
  LogOut,
  ShieldCheck,
  User,
  PlusCircle,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenCreateModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenCreateModal }) => {
  const { user, switchRole, logout } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  if (!user) return null;

  const role = user.role;

  const getNavLinks = () => {
    switch (role) {
      case 'employee':
        return [
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'my-vouchers', label: 'My Vouchers' },
          { id: 'create', label: '+ New Voucher', action: onOpenCreateModal },
        ];
      case 'director':
        return [
          { id: 'dashboard', label: 'Executive Dashboard' },
          { id: 'pending-approvals', label: 'Pending Approvals' },
          { id: 'all-vouchers', label: 'All Vouchers' },
        ];
      case 'accounts':
        return [
          { id: 'dashboard', label: 'Accounts Dashboard' },
          { id: 'all-vouchers', label: 'All Vouchers' },
          { id: 'reimbursements', label: 'Reimbursement Queue' },
        ];
    }
  };

  const navLinks = getNavLinks();

  const handleRoleSelect = (newRole: UserRole) => {
    setRoleMenuOpen(false);
    switchRole(newRole);
    setCurrentTab('dashboard');
  };

  const getRoleDisplayName = (r: UserRole) => {
    switch (r) {
      case 'employee':
        return 'Employee';
      case 'director':
        return 'Director (Admin)';
      case 'accounts':
        return 'Accounts Team';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-xs">
              EV
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setCurrentTab('dashboard');
              }}
              className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-slate-700 transition-colors"
            >
              VoucherDesk
            </a>
            <span className="hidden sm:inline-block text-xs text-slate-400 font-mono tracking-wider border-l border-slate-200 pl-3">
              ENTERPRISE
            </span>
          </div>

          {/* Zone 2: Navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {navLinks.map((link) => {
              if (link.action) {
                return (
                  <button
                    key={link.id}
                    onClick={link.action}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 shadow-xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    {link.label}
                  </button>
                );
              }
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setCurrentTab(link.id)}
                  className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 relative py-1 text-xs sm:text-sm ${
                    isActive ? 'text-slate-900 font-semibold' : 'text-slate-600'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Quick Role Switcher & User Account */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Role switch pill / dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-lg text-xs font-medium text-slate-800 transition-colors border border-slate-200"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="hidden lg:inline text-slate-500">Role:</span>
                <span className="font-semibold text-slate-900">{getRoleDisplayName(user.role)}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
                  <div className="px-3 py-1.5 border-b border-slate-100 font-medium text-slate-400 text-[11px] uppercase tracking-wider">
                    Switch Test Persona
                  </div>
                  <button
                    onClick={() => handleRoleSelect('employee')}
                    className={`w-full px-3 py-2 text-left flex items-start gap-2.5 hover:bg-slate-50 transition-colors ${
                      user.role === 'employee' ? 'bg-blue-50/60 font-semibold text-blue-900' : 'text-slate-700'
                    }`}
                  >
                    <User className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium">Employee (Alex Morgan)</div>
                      <div className="text-[11px] text-slate-400 font-normal">Create, submit & track my vouchers</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleRoleSelect('director')}
                    className={`w-full px-3 py-2 text-left flex items-start gap-2.5 hover:bg-slate-50 transition-colors ${
                      user.role === 'director' ? 'bg-amber-50/60 font-semibold text-amber-900' : 'text-slate-700'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium">Director (David Vance)</div>
                      <div className="text-[11px] text-slate-400 font-normal">Approve / reject all vouchers with signature</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleRoleSelect('accounts')}
                    className={`w-full px-3 py-2 text-left flex items-start gap-2.5 hover:bg-slate-50 transition-colors ${
                      user.role === 'accounts' ? 'bg-emerald-50/60 font-semibold text-emerald-900' : 'text-slate-700'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium">Accounts Team (Elena Rostova)</div>
                      <div className="text-[11px] text-slate-400 font-normal">Monitor organization vouchers & reimbursements</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Nav row */}
        <div className="md:hidden flex items-center gap-4 py-2 border-t border-slate-100 overflow-x-auto text-xs">
          {navLinks.map((link) => {
            if (link.action) {
              return (
                <button
                  key={link.id}
                  onClick={link.action}
                  className="font-bold text-blue-600 shrink-0"
                >
                  {link.label}
                </button>
              );
            }
            return (
              <button
                key={link.id}
                onClick={() => setCurrentTab(link.id)}
                className={`shrink-0 py-1 ${
                  currentTab === link.id ? 'font-bold text-slate-900' : 'text-slate-600'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
