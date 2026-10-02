'use client';

import React, { useState, useEffect } from 'react';
import { useSchool } from '@/context/SchoolContext';
import { FeeVoucher, ClassItem, Student } from '@/types';
import {
  CreditCard,
  PlusCircle,
  Search,
  Filter,
  Printer,
  Edit2,
  CheckCircle2,
  DollarSign,
  Receipt,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export default function FeeManagementView() {
  const { activeCampusId, campuses, setPrintModal } = useSchool();
  const [vouchers, setVouchers] = useState<FeeVoucher[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isCollectOpen, setIsCollectOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<FeeVoucher | null>(null);

  // Generation form
  const [genMonth, setGenMonth] = useState('October 2026');
  const [genDueDate, setGenDueDate] = useState('2026-10-10');
  const [genClassId, setGenClassId] = useState('all');
  const [genCampusId, setGenCampusId] = useState('all');
  const [genAnnualCharges, setGenAnnualCharges] = useState(0);
  const [genExamFee, setGenExamFee] = useState(0);
  const [genComputerFee, setGenComputerFee] = useState(500);
  const [genMiscCharges, setGenMiscCharges] = useState(0);

  // Collection form
  const [collectAmount, setCollectAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'Cheque' | 'Online'>('Cash');
  const [fineApplied, setFineApplied] = useState(0);
  const [discountApplied, setDiscountApplied] = useState(0);
  const [collectorName, setCollectorName] = useState('Accountant');

  // Edit Voucher form
  const [editTuition, setEditTuition] = useState(0);
  const [editAnnual, setEditAnnual] = useState(0);
  const [editExam, setEditExam] = useState(0);
  const [editComputer, setEditComputer] = useState(0);
  const [editTransport, setEditTransport] = useState(0);
  const [editMisc, setEditMisc] = useState(0);
  const [editFine, setEditFine] = useState(0);
  const [editDiscount, setEditDiscount] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vRes, cRes, sRes] = await Promise.all([
        fetch(`/api/fees?campusId=${activeCampusId}&classId=${classFilter}&status=${statusFilter}&month=${monthFilter}`),
        fetch('/api/academics'),
        fetch(`/api/students?campusId=${activeCampusId}`),
      ]);

      if (vRes.ok) setVouchers(await vRes.json());
      if (cRes.ok) {
        const cData = await cRes.json();
        setClasses(cData.classes || []);
      }
      if (sRes.ok) setStudents(await sRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeCampusId, classFilter, statusFilter, monthFilter]);

  // Handle Generate Fees
  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          month: genMonth,
          dueDate: genDueDate,
          classId: genClassId !== 'all' ? genClassId : undefined,
          campusId: genCampusId !== 'all' ? genCampusId : (activeCampusId !== 'all' ? activeCampusId : undefined),
          includeAnnualCharges: genAnnualCharges,
          includeExamFee: genExamFee,
          includeComputerFee: genComputerFee,
          includeMiscCharges: genMiscCharges,
        }),
      });

      if (res.ok) {
        setIsGenerateOpen(false);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Receive Fee
  const handleCollectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVoucher) return;
    try {
      const res = await fetch('/api/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'collect',
          voucherId: selectedVoucher.id,
          amountReceived: collectAmount,
          paymentMethod,
          fineApplied,
          discountApplied,
          collectorName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsCollectOpen(false);
        // Prompt print receipt
        setPrintModal({
          type: 'fee',
          data: data.voucher,
        });
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Edit Voucher
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVoucher) return;
    try {
      const res = await fetch('/api/fees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedVoucher.id,
          tuitionFee: editTuition,
          annualCharges: editAnnual,
          examFee: editExam,
          computerFee: editComputer,
          transportFee: editTransport,
          miscCharges: editMisc,
          fineAmount: editFine,
          discountAmount: editDiscount,
        }),
      });

      if (res.ok) {
        setIsEditOpen(false);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredVouchers = vouchers.filter((v) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      v.studentName.toLowerCase().includes(q) ||
      v.registrationNumber.toLowerCase().includes(q) ||
      v.voucherNumber.toLowerCase().includes(q) ||
      v.className.toLowerCase().includes(q)
    );
  });

  const totalPayableAll = filteredVouchers.reduce((acc, v) => acc + v.totalPayable, 0);
  const totalCollectedAll = filteredVouchers.reduce((acc, v) => acc + v.paidAmount, 0);
  const totalOutstandingAll = filteredVouchers.reduce((acc, v) => acc + v.remainingAmount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Metric Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Fee Collection & Vouchers</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated billing, receipt generation, partial payments, and Day Book synchronization
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsGenerateOpen(true)}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Generate Monthly Fees
          </button>
        </div>
      </div>

      {/* Financial Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-xs text-slate-500 mb-1">Total Invoiced Amount</div>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
            Rs. {totalPayableAll.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{filteredVouchers.length} fee vouchers generated</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-xs text-slate-500 mb-1">Realized Fee Collection</div>
          <div className="text-xl font-bold text-emerald-700 font-mono tabular-nums">
            Rs. {totalCollectedAll.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700 mt-0.5">
            {totalPayableAll > 0 ? ((totalCollectedAll / totalPayableAll) * 100).toFixed(1) : 0}% recovery rate
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-xs text-slate-500 mb-1">Outstanding / Due Dues</div>
          <div className="text-xl font-bold text-amber-700 font-mono tabular-nums">
            Rs. {totalOutstandingAll.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-700 mt-0.5">Awaiting parent clearance</div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, registration number, or voucher number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Overdue">Overdue</option>
          </select>

          {/* Class Filter */}
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none text-slate-700"
          >
            <option value="all">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fee Vouchers Data Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-medium">Voucher #</th>
                <th className="py-2.5 px-3 font-medium">Student Details</th>
                <th className="py-2.5 px-3 font-medium">Class & Section</th>
                <th className="py-2.5 px-3 font-medium">Month</th>
                <th className="py-2.5 px-3 font-medium text-right">Invoiced (PKR)</th>
                <th className="py-2.5 px-3 font-medium text-right">Paid (PKR)</th>
                <th className="py-2.5 px-3 font-medium text-right">Balance</th>
                <th className="py-2.5 px-3 font-medium">Status</th>
                <th className="py-2.5 px-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Loading fee vouchers...
                  </td>
                </tr>
              ) : filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No fee vouchers found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-800">
                      {v.voucherNumber}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-900">{v.studentName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{v.registrationNumber}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {v.className} ({v.sectionName})
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{v.month}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-900">
                      Rs. {v.totalPayable?.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-700 font-medium">
                      Rs. {v.paidAmount?.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-amber-700 font-medium">
                      Rs. {v.remainingAmount?.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[11px] font-medium ${
                          v.status === 'Paid'
                            ? 'text-emerald-700'
                            : v.status === 'Partial'
                            ? 'text-blue-700'
                            : v.status === 'Overdue'
                            ? 'text-rose-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Print Receipt / Voucher */}
                        <button
                          title="Print Official Fee Voucher (Dual Copy)"
                          onClick={() => setPrintModal({ type: 'fee', data: v })}
                          className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Charges */}
                        <button
                          title="Edit Charges / Fines"
                          onClick={() => {
                            setSelectedVoucher(v);
                            setEditTuition(v.tuitionFee);
                            setEditAnnual(v.annualCharges);
                            setEditExam(v.examFee);
                            setEditComputer(v.computerFee);
                            setEditTransport(v.transportFee);
                            setEditMisc(v.miscCharges);
                            setEditFine(v.fineAmount);
                            setEditDiscount(v.discountAmount);
                            setIsEditOpen(true);
                          }}
                          className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Collect Fee Button */}
                        {v.remainingAmount > 0 && (
                          <button
                            title="Collect Fee"
                            onClick={() => {
                              setSelectedVoucher(v);
                              setCollectAmount(v.remainingAmount);
                              setFineApplied(0);
                              setDiscountApplied(0);
                              setIsCollectOpen(true);
                            }}
                            className="px-2 py-1 text-[11px] font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded transition-colors shadow-2xs"
                          >
                            Receive
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

      {/* GENERATE MONTHLY FEES MODAL */}
      {isGenerateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-lg">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Generate Monthly Fee Vouchers</h3>
                <p className="text-xs text-slate-500">Bulk generation for campus or specific classes</p>
              </div>
              <button onClick={() => setIsGenerateOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Billing Month *</label>
                  <input
                    type="text"
                    required
                    value={genMonth}
                    onChange={(e) => setGenMonth(e.target.value)}
                    placeholder="e.g. October 2026"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={genDueDate}
                    onChange={(e) => setGenDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Target Campus</label>
                  <select
                    value={genCampusId}
                    onChange={(e) => setGenCampusId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                  >
                    <option value="all">All Campuses</option>
                    {campuses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Target Class</label>
                  <select
                    value={genClassId}
                    onChange={(e) => setGenClassId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                  >
                    <option value="all">All Classes</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Extra Heads */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  Optional Additional Heads (PKR)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Annual Charges</label>
                    <input
                      type="number"
                      value={genAnnualCharges}
                      onChange={(e) => setGenAnnualCharges(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Exam Fee</label>
                    <input
                      type="number"
                      value={genExamFee}
                      onChange={(e) => setGenExamFee(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Computer Fee</label>
                    <input
                      type="number"
                      value={genComputerFee}
                      onChange={(e) => setGenComputerFee(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Misc Charges</label>
                    <input
                      type="number"
                      value={genMiscCharges}
                      onChange={(e) => setGenMiscCharges(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs font-mono"
                    />
                  </div>
                </div>
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
                  Generate Vouchers
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COLLECT FEE MODAL */}
      {isCollectOpen && selectedVoucher && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Receive Student Fee Payment</h3>
                <p className="text-xs text-slate-500">Auto-records in Day Book and prints receipt</p>
              </div>
              <button onClick={() => setIsCollectOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleCollectSubmit} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <div className="flex justify-between items-center text-slate-900 font-semibold mb-1">
                  <span>{selectedVoucher.studentName}</span>
                  <span className="font-mono text-emerald-700">Due: Rs. {selectedVoucher.remainingAmount.toLocaleString()}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {selectedVoucher.registrationNumber} · {selectedVoucher.className} ({selectedVoucher.sectionName}) · {selectedVoucher.voucherNumber}
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Amount Receiving (PKR) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedVoucher.remainingAmount + 1000}
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs font-mono font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e: any) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Online">Online / Card</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Cashier / Collector</label>
                  <input
                    type="text"
                    value={collectorName}
                    onChange={(e) => setCollectorName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Late Fine Add (PKR)</label>
                  <input
                    type="number"
                    value={fineApplied}
                    onChange={(e) => setFineApplied(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Special Discount (PKR)</label>
                  <input
                    type="number"
                    value={discountApplied}
                    onChange={(e) => setDiscountApplied(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCollectOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded transition-colors shadow-xs"
                >
                  Confirm & Print Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT VOUCHER MODAL */}
      {isEditOpen && selectedVoucher && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Edit Voucher Charges</h3>
                <p className="text-xs text-slate-500">{selectedVoucher.voucherNumber} · {selectedVoucher.studentName}</p>
              </div>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Tuition Fee</label>
                  <input
                    type="number"
                    value={editTuition}
                    onChange={(e) => setEditTuition(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Annual Charges</label>
                  <input
                    type="number"
                    value={editAnnual}
                    onChange={(e) => setEditAnnual(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Exam Fee</label>
                  <input
                    type="number"
                    value={editExam}
                    onChange={(e) => setEditExam(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Computer Fee</label>
                  <input
                    type="number"
                    value={editComputer}
                    onChange={(e) => setEditComputer(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Transport Fee</label>
                  <input
                    type="number"
                    value={editTransport}
                    onChange={(e) => setEditTransport(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Misc Charges</label>
                  <input
                    type="number"
                    value={editMisc}
                    onChange={(e) => setEditMisc(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Fine Amount</label>
                  <input
                    type="number"
                    value={editFine}
                    onChange={(e) => setEditFine(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Discount Amount</label>
                  <input
                    type="number"
                    value={editDiscount}
                    onChange={(e) => setEditDiscount(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs"
                >
                  Save Voucher Corrections
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
