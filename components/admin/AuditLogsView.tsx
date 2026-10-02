'use client';

import React, { useState, useEffect } from 'react';
import { AuditLog } from '@/types';
import { History, Shield, Search, Filter } from 'lucide-react';

export default function AuditLogsView() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        setLogs(data.auditLogs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (moduleFilter !== 'all' && log.module.toLowerCase() !== moduleFilter.toLowerCase()) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-slate-700" />
            System Audit & Security Logs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable tracking for all student edits, financial transactions, fee collections, and authentication events
          </p>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          {logs.length} Recorded Security Events
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, details, actor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none"
          />
        </div>

        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none"
        >
          <option value="all">All Modules</option>
          <option value="Auth">Auth & Sessions</option>
          <option value="Student Management">Student Management</option>
          <option value="Fee Management">Fee Management</option>
          <option value="Accounts & Day Book">Accounts & Day Book</option>
          <option value="Expense Management">Expense Management</option>
          <option value="Book Management">Book Management</option>
          <option value="Staff Management">Staff Management</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-medium">Timestamp</th>
                <th className="py-2.5 px-3 font-medium">Action Event</th>
                <th className="py-2.5 px-3 font-medium">Module</th>
                <th className="py-2.5 px-3 font-medium">Event Description</th>
                <th className="py-2.5 px-3 font-medium">Actor Name</th>
                <th className="py-2.5 px-3 font-medium">Role</th>
                <th className="py-2.5 px-3 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading security audit trails...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-800 text-[11px]">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{log.module}</td>
                    <td className="py-2.5 px-3 text-slate-700 max-w-md">{log.details}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{log.userName}</td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">{log.userRole}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                          log.status === 'Success'
                            ? 'text-emerald-700 bg-emerald-50'
                            : log.status === 'Warning'
                            ? 'text-amber-700 bg-amber-50'
                            : 'text-rose-700 bg-rose-50'
                        }`}
                      >
                        {log.status}
                      </span>
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
