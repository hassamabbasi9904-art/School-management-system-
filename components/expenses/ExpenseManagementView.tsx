'use client';

import React, { useState, useEffect } from 'react';
import { useSchool } from '@/context/SchoolContext';
import { Expense, ExpenseCategory } from '@/types';
import {
  TrendingDown,
  PlusCircle,
  Filter,
  CheckCircle,
  AlertCircle,
  Search,
} from 'lucide-react';

export default function ExpenseManagementView() {
  const { activeCampusId, campuses } = useSchool();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    categoryId: '',
    description: '',
    amount: 0,
    campusId: '',
    paymentMethod: 'Cash',
    recordedBy: 'Accountant',
  });

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/expenses?campusId=${activeCampusId}&categoryId=${selectedCategory}`);
      if (res.ok) {
        const data = await res.json();
        setExpenses(data.expenses || []);
        setCategories(data.categories || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [activeCampusId, selectedCategory]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          categoryId: formData.categoryId || categories[0]?.id,
          campusId: formData.campusId || (activeCampusId !== 'all' ? activeCampusId : campuses[0]?.id),
        }),
      });

      if (res.ok) {
        setIsAddOpen(false);
        fetchExpenses();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const totalExpenseAmount = expenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-rose-600" />
            Expense Voucher Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational expenditure tracking, vendor payments, utility bills, and automated Day Book reconciliation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] text-slate-500 block">Total Filtered Outflow</span>
            <span className="text-base font-bold font-mono text-rose-700">
              Rs. {totalExpenseAmount.toLocaleString()}
            </span>
          </div>

          <button
            onClick={() => {
              setFormData({
                date: new Date().toISOString().split('T')[0],
                categoryId: categories[0]?.id || '',
                description: '',
                amount: 0,
                campusId: activeCampusId !== 'all' ? activeCampusId : (campuses[0]?.id || 'camp-1'),
                paymentMethod: 'Cash',
                recordedBy: 'Accountant',
              });
              setIsAddOpen(true);
            }}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Record Expense Voucher
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-700">Filter by Expense Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Showing <span className="font-mono font-medium text-slate-800">{expenses.length}</span> expense vouchers
        </div>
      </div>

      {/* Expense Vouchers Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-medium">Voucher #</th>
                <th className="py-2.5 px-3 font-medium">Date</th>
                <th className="py-2.5 px-3 font-medium">Category</th>
                <th className="py-2.5 px-3 font-medium">Description / Payee</th>
                <th className="py-2.5 px-3 font-medium">Campus</th>
                <th className="py-2.5 px-3 font-medium">Payment Mode</th>
                <th className="py-2.5 px-3 font-medium text-right">Amount (PKR)</th>
                <th className="py-2.5 px-3 font-medium text-center">Status</th>
                <th className="py-2.5 px-3 font-medium text-right">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Loading expenses...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No expense vouchers found.
                  </td>
                </tr>
              ) : (
                expenses.map((e) => {
                  const campus = campuses.find((c) => c.id === e.campusId);
                  return (
                    <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-800">
                        {e.voucherNumber}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono">{e.date}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{e.categoryName}</td>
                      <td className="py-2.5 px-3 text-slate-700 max-w-xs">{e.description}</td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px]">{campus?.name || 'Campus'}</td>
                      <td className="py-2.5 px-3 text-slate-600">{e.paymentMethod}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-rose-700">
                        Rs. {e.amount?.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="text-[11px] font-medium text-emerald-700 flex items-center justify-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> {e.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-500 text-[11px]">{e.recordedBy}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD EXPENSE MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Record Expense Voucher</h3>
                <p className="text-xs text-slate-500">Auto-deducts from Cash Vault and logs in Day Book</p>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Expense Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Category *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Campus *</label>
                  <select
                    value={formData.campusId}
                    onChange={(e) => setFormData({ ...formData, campusId: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                  >
                    {campuses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Amount (PKR) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs font-mono font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Detailed Description / Vendor *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Paid K-Electric electricity bill for September"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs"
                >
                  Post Voucher & Update Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
