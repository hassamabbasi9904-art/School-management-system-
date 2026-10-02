'use client';

import React, { useState, useEffect } from 'react';
import { useSchool } from '@/context/SchoolContext';
import { Campus } from '@/types';
import {
  Building2,
  PlusCircle,
  Phone,
  Mail,
  MapPin,
  Wallet,
  Users,
  Briefcase,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

export default function CampusManagementView() {
  const { campuses, refreshAll } = useSchool();
  const [campusesWithStats, setCampusesWithStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    principalName: '',
    initialCashBalance: 250000,
  });

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/campuses');
      if (res.ok) {
        setCampusesWithStats(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/campuses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsAddOpen(false);
        fetchStats();
        refreshAll();
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
            <Building2 className="w-5 h-5 text-slate-700" />
            Multi-Campus Infrastructure Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Campus-wise financial isolation, vaults, localized student directories, and leadership assignment
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              name: '',
              code: '',
              address: '',
              phone: '',
              email: '',
              principalName: '',
              initialCashBalance: 250000,
            });
            setIsAddOpen(true);
          }}
          className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Provision New Campus
        </button>
      </div>

      {/* Campuses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-slate-400">Loading campuses...</div>
        ) : (
          campusesWithStats.map((camp) => (
            <div key={camp.id} className="bg-white p-5 rounded-lg border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-slate-900 text-sm">{camp.name}</h2>
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {camp.code}
                  </span>
                </div>

                <div className="text-xs text-slate-600 mb-3 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="line-clamp-1">{camp.address}</span>
                </div>

                {/* Principal & Contacts */}
                <div className="p-3 bg-slate-50 rounded border border-slate-200/70 space-y-1.5 text-xs text-slate-600 mb-4">
                  <div className="font-medium text-slate-900">
                    Principal: <span className="font-normal">{camp.principalName || 'Appointed Head'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{camp.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{camp.email}</span>
                  </div>
                </div>

                {/* Campus Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="p-2.5 bg-slate-50/80 rounded border border-slate-100">
                    <span className="text-[11px] text-slate-500 block">Enrolled Students</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {camp.studentCount || 0}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50/80 rounded border border-slate-100">
                    <span className="text-[11px] text-slate-500 block">Staff Strength</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {camp.staffCount || 0}
                    </span>
                  </div>

                  <div className="p-2.5 bg-emerald-50/70 rounded border border-emerald-100">
                    <span className="text-[11px] text-emerald-800 block font-medium">Income Realized</span>
                    <span className="font-mono font-bold text-emerald-700 text-sm">
                      Rs. {((camp.totalIncome || 0) / 1000).toFixed(0)}k
                    </span>
                  </div>

                  <div className="p-2.5 bg-rose-50/70 rounded border border-rose-100">
                    <span className="text-[11px] text-rose-800 block font-medium">Expenses Incurred</span>
                    <span className="font-mono font-bold text-rose-700 text-sm">
                      Rs. {((camp.totalExpenses || 0) / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>
              </div>

              {/* Campus Cash Vault */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                    Campus Physical Vault Cash
                  </span>
                  <span className="text-base font-bold font-mono text-blue-700">
                    Rs. {camp.cashBalance?.toLocaleString()}
                  </span>
                </div>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {camp.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ADD CAMPUS MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 text-sm">Provision New Campus</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Campus Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Model Town Campus (Lahore)"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Campus Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. MT-04"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Initial Vault Cash (PKR)</label>
                  <input
                    type="number"
                    value={formData.initialCashBalance}
                    onChange={(e) => setFormData({ ...formData, initialCashBalance: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Full Physical Address *</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Plot/Street, Sector, City"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Contact Phone *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+92 42 3588 1234"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="modeltown@educore.edu.pk"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Principal / Incharge Name</label>
                <input
                  type="text"
                  value={formData.principalName}
                  onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                  placeholder="e.g. Dr. Munir Ahmed"
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
                  Create Campus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
