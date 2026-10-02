'use client';

import React, { useState, useEffect } from 'react';
import { useSchool } from '@/context/SchoolContext';
import {
  FileText,
  Printer,
  TrendingUp,
  CreditCard,
  Users,
  BookOpen,
  PieChart as PieChartIcon,
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

export default function ReportsView() {
  const { activeCampusId, campuses } = useSchool();
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeReportTab, setActiveReportTab] = useState<'pnl' | 'classes' | 'expenses' | 'summary'>('pnl');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reports?campusId=${activeCampusId}`);
      if (res.ok) {
        setReportData(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [activeCampusId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading || !reportData) {
    return <div className="p-8 text-center text-slate-400">Loading comprehensive institutional reports...</div>;
  }

  const { pnl, classBreakdown, expenseCategoryBreakdown, studentSummary, inventorySummary } = reportData;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-700" />
            Institutional Financial & Management Reports (MIS)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Profit & Loss, campus-wise collection efficiency, expense category distribution, and enrollment summary
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-3.5 py-1.5 text-xs font-medium text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" />
          Print / Export Current Report
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit text-xs font-medium">
        <button
          onClick={() => setActiveReportTab('pnl')}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeReportTab === 'pnl' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Profit & Loss Statement
        </button>
        <button
          onClick={() => setActiveReportTab('classes')}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeReportTab === 'classes' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Class Collection Breakdown
        </button>
        <button
          onClick={() => setActiveReportTab('expenses')}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeReportTab === 'expenses' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Expense Distribution
        </button>
        <button
          onClick={() => setActiveReportTab('summary')}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeReportTab === 'summary' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Operations & Inventory
        </button>
      </div>

      {/* TAB 1: PROFIT & LOSS STATEMENT */}
      {activeReportTab === 'pnl' && (
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-lg border border-slate-200">
            <h2 className="text-sm font-semibold text-slate-900 pb-2 border-b border-slate-100 mb-4">
              Statement of Income & Operational Expenditures
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Incomes */}
              <div className="space-y-3">
                <span className="font-bold uppercase tracking-wider text-emerald-800 text-[11px] block pb-1 border-b border-slate-200">
                  A. Gross Institutional Revenues
                </span>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Realized Tuition & Student Fees</span>
                  <span className="font-mono tabular-nums text-slate-900">
                    Rs. {pnl?.totalFeeCollected?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Curriculum Book Sales Income</span>
                  <span className="font-mono tabular-nums text-slate-900">
                    Rs. {pnl?.totalBookSales?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Admission Processing & Sundry Income</span>
                  <span className="font-mono tabular-nums text-slate-900">
                    Rs. {pnl?.totalOtherIncome?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-t border-slate-300 font-bold text-emerald-700 text-sm">
                  <span>Total Gross Revenues (A)</span>
                  <span className="font-mono tabular-nums">Rs. {pnl?.grossIncome?.toLocaleString()}</span>
                </div>
              </div>

              {/* Expenses */}
              <div className="space-y-3">
                <span className="font-bold uppercase tracking-wider text-rose-800 text-[11px] block pb-1 border-b border-slate-200">
                  B. Campus Operating Overheads
                </span>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Salaries & Faculty Payroll</span>
                  <span className="font-mono tabular-nums text-slate-900">
                    Rs. {pnl?.totalSalariesPaid?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Utilities, Rent, Transport & Maintenance</span>
                  <span className="font-mono tabular-nums text-slate-900">
                    Rs. {((pnl?.totalExpenses || 0) - (pnl?.totalSalariesPaid || 0)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-t border-slate-300 font-bold text-rose-700 text-sm">
                  <span>Total Operational Overheads (B)</span>
                  <span className="font-mono tabular-nums">Rs. {pnl?.totalExpenses?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Net Surplus / Deficit */}
            <div className="mt-6 pt-4 border-t-2 border-slate-900 flex justify-between items-center bg-slate-50 p-4 rounded">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-slate-700 block">
                  Net Operating Surplus / (Deficit) (A - B)
                </span>
                <span className="text-[11px] text-slate-500">
                  Pre-tax institutional retained earnings for the academic period
                </span>
              </div>
              <div className="text-xl font-bold font-mono tabular-nums text-emerald-700">
                Rs. {pnl?.netSurplusOrDeficit?.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLASS COLLECTION BREAKDOWN */}
      {activeReportTab === 'classes' && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-900">Class-Wise Fee Invoicing & Collection Report</h2>
            <p className="text-xs text-slate-500">Target billings vs realized collections vs overdue dues</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-medium">Academic Class</th>
                  <th className="py-2.5 px-3 font-medium text-right">Invoiced Target (PKR)</th>
                  <th className="py-2.5 px-3 font-medium text-right text-emerald-700">Realized Collections</th>
                  <th className="py-2.5 px-3 font-medium text-right text-amber-700">Overdue Outstanding</th>
                  <th className="py-2.5 px-3 font-medium text-center">Collection %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                {classBreakdown?.map((item: any, idx: number) => {
                  const pct = item.target > 0 ? ((item.collected / item.target) * 100).toFixed(1) : '100.0';
                  return (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-900">{item.className}</td>
                      <td className="py-2.5 px-3 text-right text-slate-700">Rs. {item.target?.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-700 font-medium">
                        Rs. {item.collected?.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right text-amber-700">Rs. {item.pending?.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-800">{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: EXPENSE DISTRIBUTION */}
      {activeReportTab === 'expenses' && (
        <div className="bg-white p-5 rounded-lg border border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900 mb-1">Expense Breakdown by Operational Head</h2>
          <p className="text-xs text-slate-500 mb-4">Distribution across infrastructure, utilities, IT, and salaries</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {expenseCategoryBreakdown?.map((cat: any, idx: number) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200/80 rounded">
                <span className="text-xs text-slate-600 block">{cat.name}</span>
                <span className="text-base font-bold font-mono tabular-nums text-slate-900 mt-1 block">
                  Rs. {cat.value?.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ENROLLMENT & INVENTORY SUMMARY */}
      {activeReportTab === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white p-5 rounded-lg border border-slate-200">
            <h2 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-500" />
              Student Demographics Summary
            </h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Active Students</span>
                <span className="font-mono font-bold text-slate-900">{studentSummary?.totalActive}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Transferred / Left Students</span>
                <span className="font-mono font-bold text-slate-600">{studentSummary?.totalLeft}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Scholarship / Fee Concession Holders</span>
                <span className="font-mono font-bold text-emerald-700">{studentSummary?.totalDiscounted}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200">
            <h2 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-slate-500" />
              Bookstore & Stock Valuation
            </h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Curriculum Titles in Catalog</span>
                <span className="font-mono font-bold text-slate-900">{inventorySummary?.totalTitles}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Total Physical Units in Stock</span>
                <span className="font-mono font-bold text-slate-900">{inventorySummary?.totalUnitsInStock}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Total Stock Asset Valuation</span>
                <span className="font-mono font-bold text-slate-900">
                  Rs. {inventorySummary?.stockValuation?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
