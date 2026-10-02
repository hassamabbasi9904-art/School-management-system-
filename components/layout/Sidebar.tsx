'use client';

import React from 'react';
import { useSchool } from '@/context/SchoolContext';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  AlertCircle,
  BookOpen,
  DollarSign,
  Receipt,
  GraduationCap,
  Briefcase,
  FileCheck2,
  FileText,
  Settings,
  ShieldCheck,
  Building2,
  History,
  TrendingDown,
  Layers,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  section: string;
  badge?: number;
  permissionCheck?: (perms: any) => boolean;
}

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { activeNav, setActiveNav, userPermissions } = useSchool();

  const navItems: NavItem[] = [
    // Main Dashboard
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Core' },

    // Student Lifecycle
    {
      id: 'students',
      label: 'Student Directory',
      icon: Users,
      section: 'Students & Admissions',
      permissionCheck: (p) => p.students?.view,
    },
    {
      id: 'academics',
      label: 'Classes & Sections',
      icon: Layers,
      section: 'Students & Admissions',
      permissionCheck: (p) => p.academics?.view,
    },

    // Fees & Billing
    {
      id: 'fees',
      label: 'Fee Management',
      icon: CreditCard,
      section: 'Fee & Billing',
      permissionCheck: (p) => p.fees?.view,
    },
    {
      id: 'defaulters',
      label: 'Fee Defaulters',
      icon: AlertCircle,
      section: 'Fee & Billing',
      permissionCheck: (p) => p.fees?.view,
    },

    // Financial & Day Book
    {
      id: 'daybook',
      label: 'Day Book System',
      icon: Receipt,
      section: 'Accounts & Day Book',
      permissionCheck: (p) => p.accounts?.dayBook,
    },
    {
      id: 'cash',
      label: 'Cash Flow Ledger',
      icon: DollarSign,
      section: 'Accounts & Day Book',
      permissionCheck: (p) => p.accounts?.cashLedger,
    },
    {
      id: 'expenses',
      label: 'Expense Vouchers',
      icon: TrendingDown,
      section: 'Accounts & Day Book',
      permissionCheck: (p) => p.accounts?.addExpense,
    },
    {
      id: 'incomes',
      label: 'Other Incomes',
      icon: DollarSign,
      section: 'Accounts & Day Book',
      permissionCheck: (p) => p.accounts?.addIncome,
    },

    // Academics & Examination
    {
      id: 'exams',
      label: 'Examination & Results',
      icon: GraduationCap,
      section: 'Academics & Exams',
      permissionCheck: (p) => p.academics?.examinations,
    },
    {
      id: 'books',
      label: 'Books & Inventory',
      icon: BookOpen,
      section: 'Academics & Exams',
      permissionCheck: (p) => p.books?.view,
    },

    // Human Resources
    {
      id: 'staff',
      label: 'Staff Directory',
      icon: Briefcase,
      section: 'Staff & Payroll',
      permissionCheck: (p) => p.staff?.view,
    },
    {
      id: 'salaries',
      label: 'Salary Management',
      icon: FileCheck2,
      section: 'Staff & Payroll',
      permissionCheck: (p) => p.staff?.payroll,
    },

    // Reports & Governance
    {
      id: 'reports',
      label: 'Financial & MIS Reports',
      icon: FileText,
      section: 'Analytics & Reports',
      permissionCheck: (p) => p.reports?.view,
    },
    {
      id: 'campuses',
      label: 'Campuses',
      icon: Building2,
      section: 'Administration',
      permissionCheck: (p) => p.settings?.manageCampuses,
    },
    {
      id: 'users',
      label: 'Users & RBAC',
      icon: ShieldCheck,
      section: 'Administration',
      permissionCheck: (p) => p.settings?.manageUsers,
    },
    {
      id: 'settings',
      label: 'School Settings',
      icon: Settings,
      section: 'Administration',
      permissionCheck: (p) => p.settings?.view,
    },
    {
      id: 'audit',
      label: 'System Audit Logs',
      icon: History,
      section: 'Administration',
      permissionCheck: (p) => p.settings?.auditLogs,
    },
  ];

  // Filter based on user permissions
  const visibleNav = navItems.filter((item) => {
    if (!item.permissionCheck) return true;
    return item.permissionCheck(userPermissions);
  });

  // Group by section
  const sections = Array.from(new Set(visibleNav.map((i) => i.section)));

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center font-bold text-white text-base shadow-sm">
              E
            </div>
            <div>
              <span className="font-semibold text-white tracking-tight text-sm block">EduCore ERP</span>
              <span className="text-[11px] text-slate-400 block font-normal">School Management Suite</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Nav List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {sections.map((sec) => (
            <div key={sec} className="space-y-1">
              <div className="px-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                {sec}
              </div>
              {visibleNav
                .filter((item) => item.section === sec)
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveNav(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded transition-colors text-left ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate flex-1">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="text-[10px] tabular-nums font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          ))}
        </div>

        {/* System Version & Campus Quick Indicator */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-300 flex items-center justify-between">
          <span>Enterprise v2.4</span>
          <span className="font-mono text-slate-300">Multi-Campus Mode</span>
        </div>
      </aside>
    </>
  );
}
