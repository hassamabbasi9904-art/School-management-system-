'use client';

import React, { useState } from 'react';
import { SchoolProvider, useSchool } from '@/context/SchoolContext';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import StudentManagementView from '@/components/students/StudentManagementView';
import FeeManagementView from '@/components/fees/FeeManagementView';
import DefaulterListView from '@/components/fees/DefaulterListView';
import DayBookView from '@/components/accounting/DayBookView';
import CashManagementView from '@/components/accounting/CashManagementView';
import ExpenseManagementView from '@/components/expenses/ExpenseManagementView';
import IncomeManagementView from '@/components/incomes/IncomeManagementView';
import BookManagementView from '@/components/books/BookManagementView';
import ClassesSectionsView from '@/components/academics/ClassesSectionsView';
import StaffManagementView from '@/components/staff/StaffManagementView';
import SalaryManagementView from '@/components/staff/SalaryManagementView';
import ExamSystemView from '@/components/exams/ExamSystemView';
import ReportsView from '@/components/reports/ReportsView';
import CampusManagementView from '@/components/admin/CampusManagementView';
import UserManagementView from '@/components/admin/UserManagementView';
import SchoolSettingsView from '@/components/admin/SchoolSettingsView';
import AuditLogsView from '@/components/admin/AuditLogsView';
import PrintVoucherModal from '@/components/common/PrintVoucherModal';

function AppContent() {
  const { activeNav } = useSchool();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeNav) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'students':
        return <StudentManagementView />;
      case 'academics':
        return <ClassesSectionsView />;
      case 'fees':
        return <FeeManagementView />;
      case 'defaulters':
        return <DefaulterListView />;
      case 'daybook':
        return <DayBookView />;
      case 'cash':
        return <CashManagementView />;
      case 'expenses':
        return <ExpenseManagementView />;
      case 'incomes':
        return <IncomeManagementView />;
      case 'books':
        return <BookManagementView />;
      case 'staff':
        return <StaffManagementView />;
      case 'salaries':
        return <SalaryManagementView />;
      case 'exams':
        return <ExamSystemView />;
      case 'reports':
        return <ReportsView />;
      case 'campuses':
        return <CampusManagementView />;
      case 'users':
        return <UserManagementView />;
      case 'settings':
        return <SchoolSettingsView />;
      case 'audit':
        return <AuditLogsView />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Viewport */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <TopBar onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Universal Print Modal for Official Documents */}
      <PrintVoucherModal />
    </div>
  );
}

export default function Home() {
  return (
    <SchoolProvider>
      <AppContent />
    </SchoolProvider>
  );
}
