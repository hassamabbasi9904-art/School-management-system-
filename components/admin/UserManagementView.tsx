'use client';

import React, { useState, useEffect } from 'react';
import { useSchool } from '@/context/SchoolContext';
import { User, UserRole } from '@/types';
import { DEFAULT_PERMISSIONS } from '@/lib/data-store';
import {
  ShieldCheck,
  UserPlus,
  CheckCircle2,
  XCircle,
  Key,
  Users,
} from 'lucide-react';

export default function UserManagementView() {
  const { campuses } = useSchool();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'rbac'>('users');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Admin',
    campusId: 'all',
    phone: '',
    status: 'active',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsAddUserOpen(false);
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const roles: UserRole[] = [
    'Super Admin',
    'Admin',
    'Accountant',
    'Principal',
    'Teacher',
    'Receptionist',
    'Parent',
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            Users, Roles & Granular RBAC Permissions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Role-based access control, campus scoping, user credentials, and permission matrices
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              name: '',
              email: '',
              role: 'Admin',
              campusId: 'all',
              phone: '',
              status: 'active',
            });
            setIsAddUserOpen(true);
          }}
          className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Create System User
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit text-xs font-medium">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeTab === 'users' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          User Accounts ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('rbac')}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeTab === 'rbac' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Role Permission Matrix
        </button>
      </div>

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-medium">Name</th>
                  <th className="py-2.5 px-3 font-medium">Email / Username</th>
                  <th className="py-2.5 px-3 font-medium">Assigned Role</th>
                  <th className="py-2.5 px-3 font-medium">Assigned Campus</th>
                  <th className="py-2.5 px-3 font-medium">Phone</th>
                  <th className="py-2.5 px-3 font-medium text-center">Status</th>
                  <th className="py-2.5 px-3 font-medium text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Loading users...
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const campus = campuses.find((c) => c.id === u.campusId);
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-slate-900">{u.name}</td>
                        <td className="py-2.5 px-3 text-slate-600 font-mono">{u.email}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-emerald-800 text-[11px] bg-emerald-50 px-2 py-0.5 rounded">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          {u.campusId === 'all' ? 'All Campuses (Global)' : campus?.name || u.campusId}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 font-mono">{u.phone || '-'}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="text-[11px] font-medium text-emerald-700">
                            {u.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-400 font-mono text-[11px]">
                          {u.createdAt?.substring(0, 10)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RBAC MATRIX TAB */}
      {activeTab === 'rbac' && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-900">Role-Based Access Control (RBAC) Matrix</h2>
            <p className="text-xs text-slate-500">Security capabilities configured across all ERP modules</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-medium">ERP Module</th>
                  <th className="py-2.5 px-3 font-medium">Privilege / Action</th>
                  {roles.map((r) => (
                    <th key={r} className="py-2.5 px-3 font-medium text-center">
                      {r}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Students */}
                <tr>
                  <td rowSpan={3} className="py-2.5 px-3 font-medium text-slate-900 border-r border-slate-100 bg-slate-50/40">
                    Students
                  </td>
                  <td className="py-2 px-3 text-slate-700">View Directory & Search</td>
                  {roles.map((r) => (
                    <td key={r} className="py-2 px-3 text-center">
                      {DEFAULT_PERMISSIONS[r].students.view ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 px-3 text-slate-700">Admit New Student / Edit</td>
                  {roles.map((r) => (
                    <td key={r} className="py-2 px-3 text-center">
                      {DEFAULT_PERMISSIONS[r].students.create ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 px-3 text-slate-700">Promotions & Transfers</td>
                  {roles.map((r) => (
                    <td key={r} className="py-2 px-3 text-center">
                      {DEFAULT_PERMISSIONS[r].students.promote ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>

                {/* Fees */}
                <tr>
                  <td rowSpan={2} className="py-2.5 px-3 font-medium text-slate-900 border-r border-slate-100 bg-slate-50/40">
                    Fees & Billing
                  </td>
                  <td className="py-2 px-3 text-slate-700">Generate Monthly Vouchers</td>
                  {roles.map((r) => (
                    <td key={r} className="py-2 px-3 text-center">
                      {DEFAULT_PERMISSIONS[r].fees.generate ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 px-3 text-slate-700">Receive / Collect Payments</td>
                  {roles.map((r) => (
                    <td key={r} className="py-2 px-3 text-center">
                      {DEFAULT_PERMISSIONS[r].fees.collect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>

                {/* Accounts */}
                <tr>
                  <td rowSpan={2} className="py-2.5 px-3 font-medium text-slate-900 border-r border-slate-100 bg-slate-50/40">
                    Accounts
                  </td>
                  <td className="py-2 px-3 text-slate-700">Day Book & Cash Ledger</td>
                  {roles.map((r) => (
                    <td key={r} className="py-2 px-3 text-center">
                      {DEFAULT_PERMISSIONS[r].accounts.dayBook ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 px-3 text-slate-700">Post Expense Vouchers</td>
                  {roles.map((r) => (
                    <td key={r} className="py-2 px-3 text-center">
                      {DEFAULT_PERMISSIONS[r].accounts.addExpense ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>

                {/* Staff & Payroll */}
                <tr>
                  <td className="py-2.5 px-3 font-medium text-slate-900 border-r border-slate-100 bg-slate-50/40">
                    HR / Payroll
                  </td>
                  <td className="py-2 px-3 text-slate-700">Salary Generation & Disbursal</td>
                  {roles.map((r) => (
                    <td key={r} className="py-2 px-3 text-center">
                      {DEFAULT_PERMISSIONS[r].staff.payroll ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>

                {/* Settings */}
                <tr>
                  <td className="py-2.5 px-3 font-medium text-slate-900 border-r border-slate-100 bg-slate-50/40">
                    Administration
                  </td>
                  <td className="py-2 px-3 text-slate-700">Manage Users, Campuses, & Audits</td>
                  {roles.map((r) => (
                    <td key={r} className="py-2 px-3 text-center">
                      {DEFAULT_PERMISSIONS[r].settings.auditLogs ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 text-sm">Create System User</h3>
              <button onClick={() => setIsAddUserOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">User Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Asad Ullah Khan"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Email / Username *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="asad.khan@educore.edu.pk"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Campus Scope</label>
                  <select
                    value={formData.campusId}
                    onChange={(e) => setFormData({ ...formData, campusId: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                  >
                    <option value="all">All Campuses</option>
                    {campuses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+92 300 9876543"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs"
                >
                  Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
