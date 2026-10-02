'use client';

import React, { useState, useEffect } from 'react';
import { useSchool } from '@/context/SchoolContext';
import { StaffMember } from '@/types';
import {
  Briefcase,
  UserPlus,
  Search,
  Filter,
  CreditCard,
  CheckCircle,
} from 'lucide-react';

export default function StaffManagementView() {
  const { activeCampusId, campuses, setActiveNav } = useSchool();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    staffType: 'Teacher',
    cnic: '',
    contact: '',
    email: '',
    joiningDate: new Date().toISOString().split('T')[0],
    salary: 55000,
    campusId: '',
    status: 'Active',
  });

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/staff?campusId=${activeCampusId}&type=${typeFilter}`);
      if (res.ok) {
        setStaffList(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [activeCampusId, typeFilter]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          campusId: formData.campusId || (activeCampusId !== 'all' ? activeCampusId : campuses[0]?.id),
        }),
      });

      if (res.ok) {
        setIsAddOpen(false);
        fetchStaff();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredStaff = staffList.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.designation.toLowerCase().includes(q) || s.cnic.includes(q);
  });

  const totalPayrollLiability = staffList.filter((s) => s.status === 'Active').reduce((acc, s) => acc + s.salary, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-slate-700" />
            Human Resources & Staff Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Faculty records, administrative personnel, drivers, support staff, and monthly payroll liability
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveNav('salaries')}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors flex items-center gap-1.5"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Payroll Disbursals
          </button>

          <button
            onClick={() => {
              setFormData({
                name: '',
                designation: '',
                staffType: 'Teacher',
                cnic: '',
                contact: '',
                email: '',
                joiningDate: new Date().toISOString().split('T')[0],
                salary: 55000,
                campusId: activeCampusId !== 'all' ? activeCampusId : (campuses[0]?.id || 'camp-1'),
                status: 'Active',
              });
              setIsAddOpen(true);
            }}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Staff Member
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-xs text-slate-500 mb-1">Total Active Faculty & Staff</div>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
            {staffList.filter((s) => s.status === 'Active').length} members
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">On active payroll</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-xs text-slate-500 mb-1">Monthly Salary Commitment</div>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
            Rs. {totalPayrollLiability.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Base gross liability</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="text-xs text-slate-500 mb-1">Teaching Staff Ratio</div>
          <div className="text-xl font-bold text-emerald-700 font-mono tabular-nums">
            {staffList.filter((s) => s.staffType === 'Teacher').length} Teachers
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Academic department</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by staff name, designation, or CNIC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none"
          >
            <option value="all">All Staff Types</option>
            <option value="Teacher">Teachers</option>
            <option value="Accountant">Accountants</option>
            <option value="Receptionist">Receptionists</option>
            <option value="Driver">Drivers</option>
            <option value="Peon">Peons / Support</option>
            <option value="Admin Staff">Admin Staff</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-medium">Full Name</th>
                <th className="py-2.5 px-3 font-medium">Designation</th>
                <th className="py-2.5 px-3 font-medium">Staff Category</th>
                <th className="py-2.5 px-3 font-medium">Campus</th>
                <th className="py-2.5 px-3 font-medium">CNIC</th>
                <th className="py-2.5 px-3 font-medium">Contact Phone</th>
                <th className="py-2.5 px-3 font-medium">Joining Date</th>
                <th className="py-2.5 px-3 font-medium text-right">Base Salary (PKR)</th>
                <th className="py-2.5 px-3 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Loading staff directory...
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No staff records found.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((st) => {
                  const campus = campuses.find((c) => c.id === st.campusId);
                  return (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-slate-900">{st.name}</td>
                      <td className="py-2.5 px-3 text-slate-700">{st.designation}</td>
                      <td className="py-2.5 px-3 text-slate-600">{st.staffType}</td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px]">{campus?.name || 'Campus'}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{st.cnic}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{st.contact}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{st.joiningDate}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-slate-900">
                        Rs. {st.salary?.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="text-[11px] font-medium text-emerald-700 flex items-center justify-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> {st.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD STAFF MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 text-sm">Add Staff Member</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="font-medium text-slate-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Prof. Arshad Mehmood"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Designation *</label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Senior Math Teacher"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Category *</label>
                  <select
                    value={formData.staffType}
                    onChange={(e) => setFormData({ ...formData, staffType: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                  >
                    <option value="Teacher">Teacher</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Driver">Driver</option>
                    <option value="Peon">Peon / Support</option>
                    <option value="Admin Staff">Admin Staff</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">CNIC Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.cnic}
                    onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                    placeholder="42101-1234567-1"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Contact Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="+92 300 1234567"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Monthly Salary (PKR) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs font-mono font-bold text-slate-900 focus:outline-none"
                  />
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
                  Save Staff Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
