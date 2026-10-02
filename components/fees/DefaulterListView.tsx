'use client';

import React, { useState, useEffect } from 'react';
import { useSchool } from '@/context/SchoolContext';
import { ClassItem } from '@/types';
import {
  AlertTriangle,
  MessageSquare,
  Copy,
  CheckCircle,
  Filter,
  DollarSign,
  PhoneCall,
  Search,
  ExternalLink,
} from 'lucide-react';

export default function DefaulterListView() {
  const { activeCampusId, campuses } = useSchool();
  const [defaulters, setDefaulters] = useState<any[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedVouchers, setSelectedVouchers] = useState<string[]>([]);
  const [fixedFine, setFixedFine] = useState(500);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const fetchDefaulters = async () => {
    try {
      setLoading(true);
      const [dRes, cRes] = await Promise.all([
        fetch(`/api/defaulters?campusId=${activeCampusId}&classId=${selectedClass}`),
        fetch('/api/academics'),
      ]);

      if (dRes.ok) {
        const data = await dRes.json();
        setDefaulters(data.defaulters || []);
      }
      if (cRes.ok) {
        const cData = await cRes.json();
        setClasses(cData.classes || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefaulters();
  }, [activeCampusId, selectedClass]);

  const handleApplyFines = async () => {
    if (selectedVouchers.length === 0) return;
    try {
      const res = await fetch('/api/defaulters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'applyFines',
          voucherIds: selectedVouchers,
          fixedFine,
        }),
      });
      if (res.ok) {
        setSelectedVouchers([]);
        fetchDefaulters();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const copyAllSMS = () => {
    const list = defaulters.map((d) => `${d.studentPhone}: ${d.smsText}`).join('\n\n');
    navigator.clipboard.writeText(list);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const totalOutstanding = defaulters.reduce((acc, d) => acc + d.remainingAmount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Defaulter Management & Recovery
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify overdue students, compute late penalties, and generate WhatsApp/SMS broadcast lists
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyAllSMS}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors flex items-center gap-1.5"
          >
            {copiedAll ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedAll ? 'Copied All SMS Broadcast' : 'Copy All SMS List'}
          </button>

          {selectedVouchers.length > 0 && (
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={fixedFine}
                onChange={(e) => setFixedFine(Number(e.target.value))}
                placeholder="Late Fine PKR"
                className="w-20 px-2 py-1 text-xs border border-slate-200 rounded font-mono"
              />
              <button
                onClick={handleApplyFines}
                className="px-3 py-1.5 text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 rounded transition-colors shadow-xs"
              >
                Apply Fine ({selectedVouchers.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-xs text-slate-500 mb-1">Total Defaulter Cases</div>
          <div className="text-xl font-bold text-amber-700 font-mono tabular-nums">
            {defaulters.length} students
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Requires follow-up</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-xs text-slate-500 mb-1">Total Outstanding Overdue</div>
          <div className="text-xl font-bold text-rose-700 font-mono tabular-nums">
            Rs. {totalOutstanding.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Campus receivables</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-xs text-slate-500 mb-1">Quick Action</div>
          <div className="text-xs text-slate-600 mt-1">
            Send WhatsApp payment reminders directly to parent mobile numbers in 1-click.
          </div>
        </div>
      </div>

      {/* Filter by class */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-700">Filter by Class:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none"
          >
            <option value="all">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Showing <span className="font-mono font-medium text-slate-800">{defaulters.length}</span> overdue accounts
        </div>
      </div>

      {/* Defaulter Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={
                      selectedVouchers.length > 0 &&
                      selectedVouchers.length === defaulters.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) setSelectedVouchers(defaulters.map((d) => d.id));
                      else setSelectedVouchers([]);
                    }}
                    className="rounded border-slate-300 text-slate-900 focus:ring-0"
                  />
                </th>
                <th className="py-2.5 px-3 font-medium">Student / Reg #</th>
                <th className="py-2.5 px-3 font-medium">Father Name</th>
                <th className="py-2.5 px-3 font-medium">Class</th>
                <th className="py-2.5 px-3 font-medium">Due Date</th>
                <th className="py-2.5 px-3 font-medium text-center">Overdue Days</th>
                <th className="py-2.5 px-3 font-medium text-right">Payable Balance</th>
                <th className="py-2.5 px-3 font-medium text-right">Suggested Fine</th>
                <th className="py-2.5 px-3 font-medium text-right">Broadcast / Notify</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Loading defaulter list...
                  </td>
                </tr>
              ) : defaulters.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-emerald-700 font-medium">
                    No defaulters found! All student fees are currently up to date.
                  </td>
                </tr>
              ) : (
                defaulters.map((d, idx) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3">
                      <input
                        type="checkbox"
                        checked={selectedVouchers.includes(d.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedVouchers([...selectedVouchers, d.id]);
                          else setSelectedVouchers(selectedVouchers.filter((id) => id !== d.id));
                        }}
                        className="rounded border-slate-300 text-slate-900 focus:ring-0"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{d.studentName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{d.registrationNumber}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      <div>{d.studentFatherName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{d.studentPhone}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {d.className} ({d.sectionName})
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono">{d.dueDate}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="font-mono text-rose-700 font-medium">
                        {d.daysOverdue} days
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-rose-700 font-bold">
                      Rs. {d.remainingAmount?.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-amber-700 font-medium">
                      +Rs. {d.suggestedFine?.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Copy SMS text */}
                        <button
                          title="Copy SMS Template"
                          onClick={() => {
                            navigator.clipboard.writeText(d.smsText);
                            setCopiedIndex(idx);
                            setTimeout(() => setCopiedIndex(null), 2000);
                          }}
                          className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
                        >
                          {copiedIndex === idx ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* WhatsApp Broadcast Button */}
                        {d.whatsappUrl ? (
                          <a
                            href={d.whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 text-[11px] font-medium text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded transition-colors flex items-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" />
                            WhatsApp
                          </a>
                        ) : null}
                      </div>
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
