'use client';

import React, { useState, useEffect } from 'react';
import { useSchool } from '@/context/SchoolContext';
import { SchoolSettings, AcademicSession } from '@/types';
import {
  Settings,
  Save,
  Download,
  Upload,
  Calendar,
  Shield,
  CheckCircle,
  Database,
} from 'lucide-react';

export default function SchoolSettingsView() {
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState('');

  // Add session form
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
  const [newSessionName, setNewSessionName] = useState('2027-2028');
  const [newStartDate, setNewStartDate] = useState('2027-08-01');
  const [newEndDate, setNewEndDate] = useState('2028-06-30');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        setSessions(data.sessions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateSettings', settings }),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBackupDownload = async () => {
    try {
      const res = await fetch('/api/settings?action=backup');
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `educore_school_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restoreBackup', backupData: parsed.data || parsed }),
      });
      if (res.ok) {
        setRestoreMessage('System data snapshot restored successfully!');
        fetchSettings();
        setTimeout(() => setRestoreMessage(''), 4000);
      }
    } catch (err) {
      alert('Failed to parse backup JSON file');
    }
  };

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addSession',
          name: newSessionName,
          startDate: newStartDate,
          endDate: newEndDate,
          isCurrent: false,
        }),
      });
      if (res.ok) {
        setIsAddSessionOpen(false);
        fetchSettings();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !settings) {
    return <div className="p-8 text-center text-slate-400">Loading settings configuration...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-700" />
            School Enterprise Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            General institutional parameters, academic sessions, and full database backup / restore
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Saved
            </span>
          )}
        </div>
      </div>

      {restoreMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded font-medium">
          {restoreMessage}
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="bg-white p-5 rounded-lg border border-slate-200 space-y-4 text-xs">
        <h2 className="text-sm font-semibold text-slate-900 pb-2 border-b border-slate-100">
          General Institution Particulars
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label className="font-medium text-slate-700 block mb-1">School Legal Name *</label>
            <input
              type="text"
              required
              value={settings.schoolName}
              onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="font-medium text-slate-700 block mb-1">Tagline / Motto</label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
            />
          </div>

          <div>
            <label className="font-medium text-slate-700 block mb-1">Government Registration #</label>
            <input
              type="text"
              value={settings.registrationNo}
              onChange={(e) => setSettings({ ...settings, registrationNo: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs font-mono"
            />
          </div>

          <div>
            <label className="font-medium text-slate-700 block mb-1">Tax / NTN Number</label>
            <input
              type="text"
              value={settings.taxNumber}
              onChange={(e) => setSettings({ ...settings, taxNumber: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs font-mono"
            />
          </div>

          <div>
            <label className="font-medium text-slate-700 block mb-1">Primary Phone</label>
            <input
              type="text"
              value={settings.primaryPhone}
              onChange={(e) => setSettings({ ...settings, primaryPhone: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs font-mono"
            />
          </div>

          <div>
            <label className="font-medium text-slate-700 block mb-1">Official Email</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
            />
          </div>

          <div>
            <label className="font-medium text-slate-700 block mb-1">Currency Code</label>
            <input
              type="text"
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs font-mono"
            />
          </div>

          <div>
            <label className="font-medium text-slate-700 block mb-1">Currency Symbol</label>
            <input
              type="text"
              value={settings.currencySymbol}
              onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs font-mono"
            />
          </div>

          <div>
            <label className="font-medium text-slate-700 block mb-1">Current Active Session</label>
            <select
              value={settings.currentSession}
              onChange={(e) => setSettings({ ...settings, currentSession: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} {s.isCurrent ? '(Current)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="font-medium text-slate-700 block mb-1">Main Head Office Address</label>
          <input
            type="text"
            value={settings.address}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            Save Institutional Settings
          </button>
        </div>
      </form>

      {/* Academic Sessions & Backup Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Academic Sessions */}
        <div className="bg-white p-5 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Academic Sessions</h2>
              <p className="text-xs text-slate-500">School operational fiscal/academic cycles</p>
            </div>
            <button
              onClick={() => setIsAddSessionOpen(true)}
              className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded"
            >
              + Add Session
            </button>
          </div>

          <div className="space-y-2">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="p-3 bg-slate-50 border border-slate-200/80 rounded flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-slate-900 font-mono">{sess.name}</span>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {sess.startDate} to {sess.endDate}
                  </div>
                </div>
                {sess.name === settings.currentSession ? (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                    Active Session
                  </span>
                ) : (
                  <button
                    onClick={() => setSettings({ ...settings, currentSession: sess.name })}
                    className="text-[11px] text-slate-500 hover:text-slate-800 underline"
                  >
                    Set Active
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Database Backup & Disaster Recovery */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="mb-3 pb-2 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-slate-500" />
                Backup & Disaster Recovery
              </h2>
              <p className="text-xs text-slate-500">
                Export complete JSON snapshot or restore previous backup archive
              </p>
            </div>

            <div className="space-y-3 text-xs text-slate-600 mb-4">
              <p>
                The backup file encapsulates all student records, fee vouchers, Day Book ledgers, cash
                transactions, staff payroll, exams, and audit trail logs.
              </p>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2">
                <div className="font-semibold text-slate-800">Export System Snapshot:</div>
                <button
                  onClick={handleBackupDownload}
                  className="w-full py-2 px-3 text-xs font-medium text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Complete System JSON Backup
                </button>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2">
                <div className="font-semibold text-slate-800">Restore from Backup:</div>
                <label className="w-full py-2 px-3 text-xs font-medium text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose JSON Backup File to Restore...</span>
                  <input type="file" accept=".json" onChange={handleRestoreFile} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-400">
            Automated Day Book & database integrity protection enabled.
          </div>
        </div>
      </div>

      {/* ADD SESSION MODAL */}
      {isAddSessionOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-sm">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 text-sm">Add Academic Session</h3>
              <button onClick={() => setIsAddSessionOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>
            <form onSubmit={handleAddSession} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Session Name *</label>
                <input
                  type="text"
                  required
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  placeholder="e.g. 2027-2028"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddSessionOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs"
                >
                  Create Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
