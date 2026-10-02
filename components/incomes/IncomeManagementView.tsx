'use client';

import React, { useState, useEffect } from 'react';
import { useSchool } from '@/context/SchoolContext';
import { Income } from '@/types';
import {
  DollarSign,
  PlusCircle,
  TrendingUp,
  Receipt,
  Search,
} from 'lucide-react';

export default function IncomeManagementView() {
  const { activeCampusId, campuses } = useSchool();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    source: 'Other Income',
    description: '',
    amount: 0,
    campusId: '',
    paymentMethod: 'Cash',
    recordedBy: 'Accounts Officer',
  });

  const fetchIncomes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/incomes?campusId=${activeCampusId}&source=${sourceFilter}`);
      if (res.ok) {
        const data = await res.json();
        setIncomes(data.incomes || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, [activeCampusId, sourceFilter]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/incomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          campusId: formData.campusId || (activeCampusId !== 'all' ? activeCampusId : campuses[0]?.id),
        }),
      });

      if (res.ok) {
        setIsAddOpen(false);
        fetchIncomes();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const totalIncomeAmount = incomes.reduce((acc, i) => acc + i.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-700" />
            Direct Income Streams & Sundry Receipts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transport income, auditorium/hall rentals, prospectus sales, and other auxiliary institutional revenues
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] text-slate-500 block">Total Auxiliary Inflow</span>
            <span className="text-base font-bold font-mono text-emerald-700">
              Rs. {totalIncomeAmount.toLocaleString()}
            </span>
          </div>

          <button
            onClick={() => {
              setFormData({
                date: new Date().toISOString().split('T')[0],
                source: 'Other Income',
                description: '',
                amount: 0,
                campusId: activeCampusId !== 'all' ? activeCampusId : (campuses[0]?.id || 'camp-1'),
                paymentMethod: 'Cash',
                recordedBy: 'Accounts Officer',
              });
              setIsAddOpen(true);
            }}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Record Direct Income
          </button>
        </div>
      </div>

      {/* Filter and Income Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800">Auxiliary Income Records</span>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded text-slate-700 focus:outline-none"
          >
            <option value="all">All Sources</option>
            <option value="Admission Income">Admission Income</option>
            <option value="Transport Income">Transport Income</option>
            <option value="Book Sales">Book Sales</option>
            <option value="Other Income">Other Income</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-medium">Receipt #</th>
                <th className="py-2.5 px-3 font-medium">Date</th>
                <th className="py-2.5 px-3 font-medium">Revenue Stream</th>
                <th className="py-2.5 px-3 font-medium">Description</th>
                <th className="py-2.5 px-3 font-medium">Campus</th>
                <th className="py-2.5 px-3 font-medium">Payment Mode</th>
                <th className="py-2.5 px-3 font-medium text-right">Amount (PKR)</th>
                <th className="py-2.5 px-3 font-medium text-right">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading income records...
                  </td>
                </tr>
              ) : incomes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No auxiliary income records recorded.
                  </td>
                </tr>
              ) : (
                incomes.map((i) => {
                  const campus = campuses.find((c) => c.id === i.campusId);
                  return (
                    <tr key={i.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-800">{i.receiptNumber}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{i.date}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{i.source}</td>
                      <td className="py-2.5 px-3 text-slate-700 max-w-xs">{i.description}</td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px]">{campus?.name || 'Campus'}</td>
                      <td className="py-2.5 px-3 text-slate-600">{i.paymentMethod}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-emerald-700">
                        +Rs. {i.amount?.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-500 text-[11px]">{i.recordedBy}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD INCOME MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 text-sm">Record Direct Income Receipt</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Receipt Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Income Stream *</label>
                  <select
                    value={formData.source}
                    onChange={(e: any) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                  >
                    <option value="Admission Income">Admission Income</option>
                    <option value="Transport Income">Transport Income</option>
                    <option value="Book Sales">Book Sales</option>
                    <option value="Other Income">Other Income</option>
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
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Description / Details *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Received prospectus and brochure sales from counter"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
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
                  Record Income & Post to Day Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
