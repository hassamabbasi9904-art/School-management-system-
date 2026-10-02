'use client';

import React, { useState } from 'react';
import { useSchool } from '@/context/SchoolContext';
import { UserRole } from '@/types';
import {
  Menu,
  Building,
  UserCheck,
  PlusCircle,
  Bell,
  Calendar,
  Search,
} from 'lucide-react';

export default function TopBar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const {
    activeNav,
    setActiveNav,
    campuses,
    activeCampusId,
    setActiveCampusId,
    currentUser,
    switchRole,
    notifications,
    markNotificationRead,
  } = useSchool();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const roles: UserRole[] = [
    'Super Admin',
    'Admin',
    'Accountant',
    'Principal',
    'Teacher',
    'Receptionist',
    'Parent',
  ];

  // Capitalize active nav title
  const getNavTitle = (nav: string) => {
    const titles: Record<string, string> = {
      dashboard: 'Executive ERP Dashboard',
      students: 'Student Directory & Admissions',
      academics: 'Class Strength & Academic Sections',
      fees: 'Fee Structure & Collection Vouchers',
      defaulters: 'Defaulter Management & Recovery Alerts',
      daybook: 'Day Book System & Daily Ledger',
      cash: 'Cash Management & Liquidity Flow',
      expenses: 'Expense Vouchers & Approvals',
      incomes: 'Other Income Streams',
      exams: 'Examination Portal & Report Cards',
      books: 'Book Inventory & Issue Slips',
      staff: 'Staff Directory & Designations',
      salaries: 'Payroll & Salary Disbursement',
      reports: 'Financial Auditing & MIS Reports',
      campuses: 'Campus Infrastructure Management',
      users: 'User Access & Permission Matrix',
      settings: 'School Configuration & Backups',
      audit: 'System Activity & Security Audit Logs',
    };
    return titles[nav] || 'School Management System';
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile trigger & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>EduCore</span>
            <span aria-hidden="true">/</span>
            <span className="text-slate-800 font-medium truncate">{getNavTitle(activeNav)}</span>
          </div>
        </div>
      </div>

      {/* Right Controls: Campus Selector, Session, Quick Actions, Role Switcher */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Global Campus Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100/90 border border-slate-200 rounded px-2.5 py-1.5 text-xs">
          <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="text-slate-500 hidden sm:inline">Campus:</span>
          <select
            value={activeCampusId}
            onChange={(e) => setActiveCampusId(e.target.value)}
            className="bg-transparent text-slate-900 font-medium focus:outline-none cursor-pointer text-xs"
          >
            <option value="all">All Campuses (Consolidated)</option>
            {campuses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Academic Session */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200/80 rounded px-2.5 py-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-mono text-slate-700">2026-2027</span>
        </div>

        {/* Quick Add Action Menu */}
        <div className="relative">
          <button
            onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Quick Action</span>
          </button>

          {isQuickAddOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-md shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
              <button
                onClick={() => {
                  setActiveNav('students');
                  setIsQuickAddOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <span>+</span> New Student Admission
              </button>
              <button
                onClick={() => {
                  setActiveNav('fees');
                  setIsQuickAddOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <span>+</span> Receive / Collect Fee
              </button>
              <button
                onClick={() => {
                  setActiveNav('expenses');
                  setIsQuickAddOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <span>+</span> Record Expense Voucher
              </button>
              <button
                onClick={() => {
                  setActiveNav('books');
                  setIsQuickAddOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <span>+</span> Book Sale Slip
              </button>
              <button
                onClick={() => {
                  setActiveNav('daybook');
                  setIsQuickAddOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <span>📄</span> Open Today's Day Book
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg border border-slate-200 p-2 z-50 text-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 px-1 font-semibold text-slate-900">
                <span>System Notifications</span>
                <span className="text-[10px] text-slate-500">{notifications.length} alerts</span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 mt-1">
                {notifications.length === 0 ? (
                  <div className="p-3 text-center text-slate-400">No new alerts</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-2 hover:bg-slate-50 cursor-pointer rounded ${
                        !n.read ? 'bg-slate-50/70 font-medium' : 'text-slate-600'
                      }`}
                    >
                      <div className="text-slate-800">{n.title}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2 p-1.5 pl-2 rounded hover:bg-slate-100 border border-slate-200 transition-colors text-xs text-left"
          >
            <div className="w-6 h-6 rounded bg-slate-800 text-white flex items-center justify-center font-bold text-[11px]">
              {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
            </div>
            <div className="hidden sm:block">
              <span className="font-medium text-slate-900 block leading-tight">{currentUser?.name || 'Administrator'}</span>
              <span className="text-[10px] text-emerald-700 font-semibold block leading-tight flex items-center gap-1">
                <UserCheck className="w-2.5 h-2.5 inline" /> {currentUser?.role || 'Super Admin'}
              </span>
            </div>
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                Switch Role / View
              </div>
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r);
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-50 ${
                    currentUser?.role === r ? 'text-emerald-700 font-semibold bg-emerald-50/50' : 'text-slate-700'
                  }`}
                >
                  <span>{r}</span>
                  {currentUser?.role === r && <span className="text-emerald-600 text-xs">Active</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
