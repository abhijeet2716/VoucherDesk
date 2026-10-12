import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  ShieldCheck,
  User,
  UserCheck,
  Building2,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

export const Login: React.FC = () => {
  const { login, switchRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please provide both email and password');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: UserRole, demoEmail: string) => {
    setError(null);
    setIsLoading(true);
    try {
      await switchRole(role, demoEmail);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with demo account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg mx-auto shadow-md mb-3">
          EV
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          VoucherDesk Enterprise
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Automated Expense Voucher Creation, Director Approval Workflow & Accounts Reimbursement
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-slate-200/80 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Standard Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Corporate Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-colors"
                />
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Default demo password: <span className="font-mono text-slate-600 font-semibold">password123</span></div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-lg text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 transition-colors disabled:opacity-50 shadow-xs"
            >
              Sign In to Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Sign In Persona Cards */}
          <div className="pt-5 border-t border-slate-200">
            <div className="text-center mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-white px-2">
                Or One-Click Test Login By Role
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Employee */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleDemoLogin('employee', 'alex.morgan@company.com')}
                className="p-3 text-left border border-slate-200 hover:border-blue-400 rounded-xl hover:bg-blue-50/50 transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-md bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">Employee</span>
                </div>
                <div className="text-[11px] text-slate-600 font-medium">Alex Morgan</div>
                <div className="text-[10px] text-slate-400">Engineering · Submit Claims</div>
              </button>

              {/* Director */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleDemoLogin('director', 'david.vance@company.com')}
                className="p-3 text-left border border-slate-200 hover:border-amber-400 rounded-xl hover:bg-amber-50/50 transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-md bg-amber-100 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">Director</span>
                </div>
                <div className="text-[11px] text-slate-600 font-medium">David Vance</div>
                <div className="text-[10px] text-slate-400">Executive · Approve & Sign</div>
              </button>

              {/* Accounts */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleDemoLogin('accounts', 'elena.rostova@company.com')}
                className="p-3 text-left border border-slate-200 hover:border-emerald-400 rounded-xl hover:bg-emerald-50/50 transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-md bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">Accounts</span>
                </div>
                <div className="text-[11px] text-slate-600 font-medium">Elena Rostova</div>
                <div className="text-[10px] text-slate-400">Finance · Reimbursements</div>
              </button>
            </div>
          </div>
        </div>

        {/* Security & System Features list */}
        <div className="mt-6 text-center text-xs text-slate-500 space-y-1">
          <p>
            Role-Based Access Control (RBAC) · Cryptographic JWT Tokens · Digital Signature Verification
          </p>
        </div>
      </div>
    </div>
  );
};
