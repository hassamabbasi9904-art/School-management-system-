'use client';

import React, { useEffect, useState } from 'react';
import { useSchool } from '@/context/SchoolContext';
import {
  Users,
  GraduationCap,
  Briefcase,
  CreditCard,
  Wallet,
  TrendingDown,
  AlertTriangle,
  UserPlus,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Building,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export default function DashboardOverview() {
  const { activeCampusId, campuses, setActiveNav, setPrintModal } = useSchool();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/dashboard?campusId=${activeCampusId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeCampusId]);

  if (loading && !data) {
    return (
      <div className="p-8 text-center text-slate-500 flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-slate-400" /> Loading Executive ERP Dashboard...
      </div>
    );
  }

  const { cards, monthlyTrends, campusBreakdown, recentDayBook, recentAuditLogs } = data || {};

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            School ERP Management Dashboard
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Academic Session 2026-2027</span>
            <span aria-hidden="true">·</span>
            <span>
              {activeCampusId === 'all'
                ? 'Consolidated Multi-Campus View'
                : campuses.find((c) => c.id === activeCampusId)?.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveNav('fees')}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
          >
            Collect Fee
          </button>
          <button
            onClick={() => setActiveNav('daybook')}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
          >
            View Day Book
          </button>
          <button
            onClick={() => setActiveNav('students')}
            className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded transition-colors shadow-xs"
          >
            + Admit Student
          </button>
        </div>
      </div>

      {/* The 11 Core Dashboard Cards Requested */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5">
        {/* 1. Total Students */}
        <div
          onClick={() => setActiveNav('students')}
          className="bg-white p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Total Students</span>
            <Users className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
            {cards?.totalStudents?.toLocaleString() || 0}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" /> Active enrolled
          </div>
        </div>

        {/* 2. Total Teachers */}
        <div
          onClick={() => setActiveNav('staff')}
          className="bg-white p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Total Teachers</span>
            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
            {cards?.totalTeachers?.toLocaleString() || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Teaching faculty</div>
        </div>

        {/* 3. Total Staff */}
        <div
          onClick={() => setActiveNav('staff')}
          className="bg-white p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Total Staff</span>
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
            {cards?.totalStaff?.toLocaleString() || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Admin & support</div>
        </div>

        {/* 4. Total Fee Collection */}
        <div
          onClick={() => setActiveNav('fees')}
          className="bg-white p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Fee Collection</span>
            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700 font-mono tabular-nums">
            Rs. {cards?.totalFeeCollection?.toLocaleString() || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Realized revenue</div>
        </div>

        {/* 5. Current Cash Balance */}
        <div
          onClick={() => setActiveNav('cash')}
          className="bg-white p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Current Cash</span>
            <Wallet className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-blue-700 font-mono tabular-nums">
            Rs. {cards?.currentCashBalance?.toLocaleString() || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Physical vault & bank</div>
        </div>

        {/* 6. Total Expenses */}
        <div
          onClick={() => setActiveNav('expenses')}
          className="bg-white p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Total Expenses</span>
            <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-rose-700 font-mono tabular-nums">
            Rs. {cards?.totalExpenses?.toLocaleString() || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Campus overheads</div>
        </div>

        {/* 7. Total Defaulters */}
        <div
          onClick={() => setActiveNav('defaulters')}
          className="bg-white p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Fee Defaulters</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-amber-700 font-mono tabular-nums">
            {cards?.totalDefaulters?.toLocaleString() || 0}
          </div>
          <div className="text-[11px] text-amber-700 font-mono mt-1">
            Rs. {cards?.totalDefaulterAmount?.toLocaleString() || 0} due
          </div>
        </div>

        {/* 8. New Admissions */}
        <div
          onClick={() => setActiveNav('students')}
          className="bg-white p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>New Admissions</span>
            <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
            {cards?.newAdmissions?.toLocaleString() || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Session 2026-27</div>
        </div>

        {/* 9. Book Sales */}
        <div
          onClick={() => setActiveNav('books')}
          className="bg-white p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Book Sales</span>
            <BookOpen className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
            Rs. {cards?.bookSales?.toLocaleString() || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Bookstore counter</div>
        </div>

        {/* 10. Monthly Income */}
        <div
          onClick={() => setActiveNav('reports')}
          className="bg-white p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Monthly Income</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700 font-mono tabular-nums">
            Rs. {cards?.monthlyIncome?.toLocaleString() || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Total revenue in</div>
        </div>

        {/* 11. Monthly Expense */}
        <div
          onClick={() => setActiveNav('reports')}
          className="bg-white p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Monthly Expense</span>
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-rose-700 font-mono tabular-nums">
            Rs. {cards?.monthlyExpense?.toLocaleString() || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Total outflow</div>
        </div>

        {/* Net Monthly Operating Surplus */}
        <div className="bg-slate-900 text-white p-3.5 rounded-lg border border-slate-800">
          <div className="text-slate-400 text-xs mb-1">Net Operating Margin</div>
          <div className="text-xl font-bold text-emerald-400 font-mono tabular-nums">
            Rs. {((cards?.monthlyIncome || 0) - (cards?.monthlyExpense || 0)).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Surplus position</div>
        </div>
      </div>

      {/* Main Charts & Campus Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Trend Chart (2 columns) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Financial Performance & Cash Flow</h2>
              <p className="text-xs text-slate-500">Monthly Income vs Campus Overhead Expenses (PKR)</p>
            </div>
            <button
              onClick={() => setActiveNav('reports')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-medium"
            >
              Full P&L Report →
            </button>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`Rs. ${Number(val).toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '4px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="income" name="Total Income" fill="#10B981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="expense" name="Total Expense" fill="#F43F5E" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campus Overview Cards (1 column) */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900">Campus Cash & Enrollment</h2>
              <button
                onClick={() => setActiveNav('campuses')}
                className="text-xs text-slate-600 hover:text-slate-900"
              >
                Manage
              </button>
            </div>

            <div className="space-y-3">
              {campusBreakdown?.map((camp: any) => (
                <div
                  key={camp.campusId}
                  className="p-3 bg-slate-50 border border-slate-200/80 rounded"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-900 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      {camp.name}
                    </span>
                    <span className="font-mono text-slate-500 text-[11px]">{camp.code}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-200/60 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Students</span>
                      <span className="font-mono font-medium text-slate-800">{camp.students}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Cash Balance</span>
                      <span className="font-mono font-medium text-blue-700">Rs. {(camp.cashBalance / 1000).toFixed(0)}k</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Collected</span>
                      <span className="font-mono font-medium text-emerald-700">Rs. {(camp.feeCollected / 1000).toFixed(0)}k</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total Campuses: {campuses.length}</span>
            <span className="text-emerald-700 font-medium">All Online & Active</span>
          </div>
        </div>
      </div>

      {/* Day Book Live Feed & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Day Book Quick Summary */}
        <div className="bg-white p-5 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Recent Day Book Ledgers</h2>
              <p className="text-xs text-slate-500">Automatic daily reconciliation formula</p>
            </div>
            <button
              onClick={() => setActiveNav('daybook')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-medium"
            >
              Full Day Book →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-y border-slate-200">
                <tr>
                  <th className="py-2 px-2.5 font-medium">Date</th>
                  <th className="py-2 px-2.5 font-medium text-right">Opening</th>
                  <th className="py-2 px-2.5 font-medium text-right text-emerald-700">Income</th>
                  <th className="py-2 px-2.5 font-medium text-right text-rose-700">Expense</th>
                  <th className="py-2 px-2.5 font-medium text-right font-semibold">Closing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentDayBook?.map((db: any) => (
                  <tr key={db.id} className="hover:bg-slate-50/70 font-mono tabular-nums">
                    <td className="py-2 px-2.5 text-slate-700">{db.date}</td>
                    <td className="py-2 px-2.5 text-right text-slate-600">Rs. {db.openingBalance?.toLocaleString()}</td>
                    <td className="py-2 px-2.5 text-right text-emerald-700 font-medium">+Rs. {db.totalIncome?.toLocaleString()}</td>
                    <td className="py-2 px-2.5 text-right text-rose-700 font-medium">-Rs. {db.totalExpense?.toLocaleString()}</td>
                    <td className="py-2 px-2.5 text-right text-slate-900 font-bold">Rs. {db.closingBalance?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security & Audit Activity */}
        <div className="bg-white p-5 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">System Activity & Audit Log</h2>
              <p className="text-xs text-slate-500">Security event history & transaction trail</p>
            </div>
            <button
              onClick={() => setActiveNav('audit')}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium"
            >
              All Logs →
            </button>
          </div>

          <div className="space-y-2.5">
            {recentAuditLogs?.map((log: any) => (
              <div key={log.id} className="p-2.5 bg-slate-50/80 rounded border border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{log.action}</span>
                  <span className="text-[11px] font-mono text-slate-400">{log.timestamp}</span>
                </div>
                <div className="text-slate-600 text-[11px] mt-0.5">{log.details}</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Actor: <span className="font-medium text-slate-700">{log.userName}</span> ({log.userRole}) · Module: {log.module}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
