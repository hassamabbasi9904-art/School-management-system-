'use client';

import React, { useState, useEffect } from 'react';
import { useSchool } from '@/context/SchoolContext';
import { SalaryPayment } from '@/types';
import {
  FileCheck2,
  PlusCircle,
  Printer,
  CreditCard,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export default function SalaryManagementView() {
  const { activeCampusId, campuses, setPrintModal } = useSchool();
  const [salaries, setSalaries] = useState<SalaryPayment[]>([]);
  const [totalDisbursed, setTotalDisbursed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('September 2026');

  // Modals
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<SalaryPayment | null>(null);

  // Pay Form
  const [allowances, setAllowances] = useState(0);
  const [deductions, setDeductions] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'Bank Transfer' | 'Cash'>('Bank Transfer');
  const [paidBy, setPaidBy] = useState('Accountant');

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/salaries?campusId=${activeCampusId}&month=${selectedMonth}`);
      if (res.ok) {
        const data = await res.json();
        setSalaries(data.salaries || []);
        setTotalDisbursed(data.totalDisbursed || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaries();
  }, [activeCampusId, selectedMonth]);

  const handleGeneratePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/salaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generatePayroll',
          month: selectedMonth,
          campusId: activeCampusId,
        }),
      });
      if (res.ok) {
        setIsGenerateOpen(false);
        fetchSalaries();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePaySalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSalary) return;
    try {
      const res = await fetch('/api/salaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'paySalary',
          salaryId: selectedSalary.id,
          allowances,
          deductions,
          paymentMethod,
          paidBy,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsPayOpen(false);
        // Print Salary Slip Voucher
        setPrintModal({
          type: 'salary',
          data: data.salary,
        });
        fetchSalaries();
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
            <FileCheck2 className="w-5 h-5 text-indigo-700" />
            Salary & Monthly Payroll Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated payroll roll-out, allowances, tax/absentee deductions, printable salary slips, and Day Book logging
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsGenerateOpen(true)}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Generate Monthly Payroll
          </button>
        </div>
      </div>

      {/* Metric Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-xs text-slate-500 mb-1">Total Payroll Staff Count</div>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
            {salaries.length} records
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{selectedMonth}</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-xs text-slate-500 mb-1">Total Disbursed to Date</div>
          <div className="text-xl font-bold text-emerald-700 font-mono tabular-nums">
            Rs. {totalDisbursed.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700 mt-0.5">Auto-posted to Day Book expenses</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-xs text-slate-500 mb-1">Pending Salary Disbursals</div>
          <div className="text-xl font-bold text-amber-700 font-mono tabular-nums">
            {salaries.filter((s) => s.status === 'Pending').length} pending
          </div>
          <div className="text-[11px] text-amber-700 mt-0.5">Ready for clearance</div>
        </div>
      </div>

      {/* Salary Slips Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800">Payroll Records for {selectedMonth}</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded text-slate-700 focus:outline-none"
          >
            <option value="August 2026">August 2026</option>
            <option value="September 2026">September 2026</option>
            <option value="October 2026">October 2026</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-medium">Slip #</th>
                <th className="py-2.5 px-3 font-medium">Employee Name</th>
                <th className="py-2.5 px-3 font-medium">Designation</th>
                <th className="py-2.5 px-3 font-medium text-right">Base Salary</th>
                <th className="py-2.5 px-3 font-medium text-right text-emerald-700">+ Allowances</th>
                <th className="py-2.5 px-3 font-medium text-right text-rose-700">- Deductions</th>
                <th className="py-2.5 px-3 font-medium text-right font-bold text-slate-900">Net Payable</th>
                <th className="py-2.5 px-3 font-medium text-center">Status</th>
                <th className="py-2.5 px-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Loading payroll data...
                  </td>
                </tr>
              ) : salaries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No payroll slips generated for {selectedMonth}. Click "Generate Monthly Payroll" to start.
                  </td>
                </tr>
              ) : (
                salaries.map((sal) => (
                  <tr key={sal.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-800">{sal.slipNumber}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{sal.staffName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{sal.designation}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                      Rs. {sal.baseSalary?.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-700">
                      +Rs. {sal.allowances?.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-rose-700">
                      -Rs. {sal.deductions?.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                      Rs. {sal.netSalary?.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`text-[11px] font-medium ${
                          sal.status === 'Paid' ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {sal.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {sal.status === 'Paid' ? (
                          <button
                            title="Print Official Salary Slip"
                            onClick={() => setPrintModal({ type: 'salary', data: sal })}
                            className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedSalary(sal);
                              setAllowances(sal.allowances || 0);
                              setDeductions(sal.deductions || 0);
                              setIsPayOpen(true);
                            }}
                            className="px-2.5 py-1 text-[11px] font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded transition-colors shadow-2xs"
                          >
                            Disburse
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* GENERATE PAYROLL MODAL */}
      {isGenerateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-sm">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 text-sm">Generate Monthly Payroll</h3>
              <button onClick={() => setIsGenerateOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>
            <form onSubmit={handleGeneratePayroll} className="p-5 space-y-4 text-xs">
              <p className="text-slate-600">
                This will create base salary slips for all active staff members for the selected month.
              </p>
              <div>
                <label className="font-medium text-slate-700 block mb-1">Payroll Month *</label>
                <input
                  type="text"
                  required
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsGenerateOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs"
                >
                  Generate Payroll Records
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DISBURSE SALARY MODAL */}
      {isPayOpen && selectedSalary && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Disburse Staff Salary</h3>
                <p className="text-xs text-slate-500">{selectedSalary.staffName} ({selectedSalary.designation})</p>
              </div>
              <button onClick={() => setIsPayOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handlePaySalary} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <div className="text-slate-500 text-[11px]">Base Contract Salary</div>
                <div className="text-base font-bold font-mono text-slate-900">
                  Rs. {selectedSalary.baseSalary.toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Allowances / Bonus</label>
                  <input
                    type="number"
                    min="0"
                    value={allowances}
                    onChange={(e) => setAllowances(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Deductions (Leave/Tax)</label>
                  <input
                    type="number"
                    min="0"
                    value={deductions}
                    onChange={(e) => setDeductions(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Disbursement Mode</label>
                  <select
                    value={paymentMethod}
                    onChange={(e: any) => setPaymentMethod(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Authorized By</label>
                  <input
                    type="text"
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded flex justify-between items-center font-mono">
                <span className="text-emerald-900 font-sans font-medium text-xs">Net Disbursal Amount:</span>
                <span className="text-base font-bold text-emerald-900">
                  Rs. {(selectedSalary.baseSalary + allowances - deductions).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsPayOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded transition-colors shadow-xs"
                >
                  Disburse & Print Salary Slip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
