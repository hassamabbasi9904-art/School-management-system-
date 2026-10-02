'use client';

import React, { useState, useEffect } from 'react';
import { useSchool } from '@/context/SchoolContext';
import { CashTransaction } from '@/types';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Building,
  TrendingUp,
  CreditCard,
  Search,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function CashManagementView() {
  const { activeCampusId, campuses } = useSchool();
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchCashData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/cash?campusId=${activeCampusId}`);
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
    fetchCashData();
  }, [activeCampusId]);

  const { currentCash, totalIncome, totalExpense, ledger, flowList, campusDistribution } = data;

  const filteredLedger = (ledger || []).filter((l: CashTransaction) => {
    if (typeFilter !== 'all' && l.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            Cash Management & Liquidity Flow
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Formula: Current Cash = Previous Balance + Income - Expenses · Campus vault tracking
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-500 block">Total Liquidity Pool</span>
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            Rs. {currentCash?.toLocaleString() || 0}
          </span>
        </div>
      </div>

      {/* Cash Distribution by Campus */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {campusDistribution?.map((camp: any) => (
          <div key={camp.campusId} className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-2">
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {camp.campusName}
              </span>
              <span className="font-mono text-slate-400 text-[11px]">{camp.code}</span>
            </div>
            <div className="text-xl font-bold text-blue-700 font-mono tabular-nums">
              Rs. {camp.cashBalance?.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Available campus vault cash</div>
          </div>
        ))}
      </div>

      {/* Cash Flow Timeline Chart */}
      <div className="bg-white p-5 rounded-lg border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Daily Cash Flow Dynamics</h2>
            <p className="text-xs text-slate-500">Inflows vs Outflows across all operational accounts</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={flowList || []} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(val: any) => [`Rs. ${Number(val).toLocaleString()}`, '']}
                contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '4px', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="income" name="Cash Inflow" stroke="#10B981" fill="#D1FAE5" />
              <Area type="monotone" dataKey="expense" name="Cash Outflow" stroke="#F43F5E" fill="#FFE4E6" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Real-time Cash Ledger Transactions */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Cash Ledger Transaction Feed</h2>
            <p className="text-xs text-slate-500">Chronological financial ledger with balance after entry</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none"
            >
              <option value="all">All Flow Types</option>
              <option value="INCOME">Inflows Only (+)</option>
              <option value="EXPENSE">Outflows Only (-)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-medium">Timestamp</th>
                <th className="py-2.5 px-3 font-medium">Type</th>
                <th className="py-2.5 px-3 font-medium">Category / Head</th>
                <th className="py-2.5 px-3 font-medium">Description</th>
                <th className="py-2.5 px-3 font-medium">Ref #</th>
                <th className="py-2.5 px-3 font-medium text-right">Transaction Amount</th>
                <th className="py-2.5 px-3 font-medium text-right">Vault Balance After</th>
                <th className="py-2.5 px-3 font-medium text-right">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading cash transactions...
                  </td>
                </tr>
              ) : filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No cash transactions recorded.
                  </td>
                </tr>
              ) : (
                filteredLedger.map((tx: CashTransaction) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 font-mono tabular-nums">
                    <td className="py-2.5 px-3 text-slate-700">
                      {tx.date} <span className="text-[11px] text-slate-400">{tx.time}</span>
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span
                        className={`text-[11px] font-semibold ${
                          tx.type === 'INCOME' ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-800 font-medium">{tx.category}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-600 max-w-xs truncate">{tx.description}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono">{tx.referenceNo}</td>
                    <td
                      className={`py-2.5 px-3 text-right font-bold ${
                        tx.type === 'INCOME' ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {tx.type === 'INCOME' ? '+' : '-'}Rs. {tx.amount?.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-900 font-medium">
                      Rs. {tx.balanceAfter?.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-sans text-[11px] text-slate-500">
                      {tx.performedBy}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
