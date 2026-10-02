'use client';

import React, { useState, useEffect } from 'react';
import { useSchool } from '@/context/SchoolContext';
import { DayBookEntry } from '@/types';
import {
  Receipt,
  Calendar,
  Filter,
  Printer,
  CheckCircle2,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';

export default function DayBookView() {
  const { activeCampusId, campuses, setPrintModal } = useSchool();
  const [entries, setEntries] = useState<DayBookEntry[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [isOpeningModalOpen, setIsOpeningModalOpen] = useState(false);
  const [manualOpening, setManualOpening] = useState(0);

  const fetchDayBook = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/daybook?campusId=${activeCampusId}&date=${selectedDate}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
        setSummary(data.summary || {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDayBook();
  }, [activeCampusId, selectedDate]);

  const handleSetOpeningBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const today = new Date().toISOString().split('T')[0];
      const campusId = activeCampusId !== 'all' ? activeCampusId : (campuses[0]?.id || 'camp-1');
      const res = await fetch('/api/daybook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate || today,
          campusId,
          manualOpeningBalance: manualOpening,
        }),
      });
      if (res.ok) {
        setIsOpeningModalOpen(false);
        fetchDayBook();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-700" />
            Day Book Accounting System
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automatic real-time recording: Closing Balance = Opening Balance + Total Income - Total Expense
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setManualOpening(summary?.totalOpening || 450000);
              setIsOpeningModalOpen(true);
            }}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
          >
            Adjust Opening Balance
          </button>
          <button
            onClick={() =>
              setPrintModal({
                type: 'daybook',
                data: {
                  entries,
                  summary,
                  campusName:
                    activeCampusId === 'all'
                      ? 'Consolidated Multi-Campus'
                      : campuses.find((c) => c.id === activeCampusId)?.name,
                  date: selectedDate || 'Current Reconciliation Period',
                },
              })
            }
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Day Book Ledger
          </button>
        </div>
      </div>

      {/* Financial Formula Strip */}
      <div className="bg-slate-900 text-white p-4 rounded-lg shadow-xs">
        <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2">
          Automated Daily Reconciliation Formula
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
            <div className="text-[11px] text-slate-400">Opening Balance</div>
            <div className="text-base font-bold font-mono tabular-nums text-slate-200 mt-1">
              Rs. {summary?.totalOpening?.toLocaleString() || 0}
            </div>
          </div>

          <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
            <div className="text-[11px] text-emerald-400">+ Total Income</div>
            <div className="text-base font-bold font-mono tabular-nums text-emerald-400 mt-1">
              Rs. {summary?.totalIncome?.toLocaleString() || 0}
            </div>
          </div>

          <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
            <div className="text-[11px] text-rose-400">- Total Expense</div>
            <div className="text-base font-bold font-mono tabular-nums text-rose-400 mt-1">
              Rs. {summary?.totalExpense?.toLocaleString() || 0}
            </div>
          </div>

          <div className="bg-emerald-950/70 p-2.5 rounded border border-emerald-700 col-span-2 sm:col-span-2">
            <div className="text-[11px] text-emerald-300 font-medium">= Verified Closing Balance</div>
            <div className="text-lg font-bold font-mono tabular-nums text-emerald-200 mt-1">
              Rs. {summary?.netClosing?.toLocaleString() || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Date Filter & Search */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-700">Filter by Specific Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded focus:outline-none"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="text-xs text-slate-500 hover:text-slate-800 underline ml-2"
            >
              Clear
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500">
          Auto-synchronized with every Fee Receipt, Book Sale, Expense Voucher, and Payroll payment.
        </div>
      </div>

      {/* Day Book Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-medium">Date</th>
                <th className="py-2.5 px-3 font-medium">Campus</th>
                <th className="py-2.5 px-3 font-medium text-right">Opening Balance</th>
                <th className="py-2.5 px-3 font-medium text-right text-emerald-700">Fee Income</th>
                <th className="py-2.5 px-3 font-medium text-right text-emerald-700">Admission Fee</th>
                <th className="py-2.5 px-3 font-medium text-right text-teal-700">Book Sales</th>
                <th className="py-2.5 px-3 font-medium text-right text-emerald-700">Other Income</th>
                <th className="py-2.5 px-3 font-medium text-right text-rose-700">Expenses</th>
                <th className="py-2.5 px-3 font-medium text-right font-bold text-slate-900">Closing Balance</th>
                <th className="py-2.5 px-3 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    Loading Day Book records...
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No day book entries recorded for this selection.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => {
                  const campus = campuses.find((c) => c.id === entry.campusId);
                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/80 font-mono tabular-nums">
                      <td className="py-2.5 px-3 text-slate-800 font-medium">{entry.date}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-sans text-[11px]">
                        {campus?.name || entry.campusId}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700">
                        Rs. {entry.openingBalance?.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-700 font-medium">
                        +Rs. {entry.feeCollection?.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-700">
                        +Rs. {entry.admissionIncome?.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right text-teal-700">
                        +Rs. {entry.bookSalesIncome?.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-700">
                        +Rs. {entry.otherIncome?.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right text-rose-700 font-medium">
                        -Rs. {entry.totalExpense?.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-900 font-bold text-sm bg-slate-50/50">
                        Rs. {entry.closingBalance?.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center font-sans">
                        <span className="text-[11px] font-medium text-emerald-700 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Reconciled
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADJUST OPENING BALANCE MODAL */}
      {isOpeningModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-sm">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 text-sm">Adjust Ledger Opening Balance</h3>
              <button onClick={() => setIsOpeningModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>
            <form onSubmit={handleSetOpeningBalance} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Opening Cash Balance (PKR) *</label>
                <input
                  type="number"
                  required
                  value={manualOpening}
                  onChange={(e) => setManualOpening(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded font-mono font-bold text-slate-900 focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsOpeningModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs"
                >
                  Apply & Recompute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
