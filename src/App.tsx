import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { EmployeeView } from './pages/EmployeeView';
import { DirectorView } from './pages/DirectorView';
import { AccountsView } from './pages/AccountsView';
import { Building2, Shield, Database, Lock } from 'lucide-react';

function MainApp() {
  const { user, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm mb-4 animate-pulse">
          EV
        </div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Initializing Secure Session...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top 3-Zone Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {user.role === 'employee' && (
          <EmployeeView
            currentTab={currentTab}
            onOpenCreate={() => setIsCreateModalOpen(true)}
            isCreateModalOpen={isCreateModalOpen}
            setIsCreateModalOpen={setIsCreateModalOpen}
          />
        )}

        {user.role === 'director' && <DirectorView currentTab={currentTab} />}

        {user.role === 'accounts' && <AccountsView currentTab={currentTab} />}
      </main>

      {/* Clean Corporate Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">VoucherDesk Enterprise</span>
            <span>·</span>
            <span>Automated Expense & Reimbursement Workflow System</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              Role-Based Access
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              JWT Authenticated
            </span>
            <span>·</span>
            <span className="flex items-center gap-1 font-mono">
              MySQL Compliant (schema.sql)
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
