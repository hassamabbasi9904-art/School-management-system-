'use client';

import React, { useState, useEffect } from 'react';
import { useSchool } from '@/context/SchoolContext';
import { Student, ClassItem, SectionItem } from '@/types';
import {
  Search,
  UserPlus,
  ArrowRightLeft,
  FileCheck,
  Edit2,
  Trash2,
  Eye,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

export default function StudentManagementView() {
  const { activeCampusId, campuses, setPrintModal } = useSchool();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modals state
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPromoteOpen, setIsPromoteOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isLeavingOpen, setIsLeavingOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Form states
  const [formData, setFormData] = useState<any>({
    name: '',
    fatherName: '',
    motherName: '',
    cnicOrBForm: '',
    mobileNumber: '',
    emergencyContact: '',
    address: '',
    dateOfBirth: '2018-05-15',
    gender: 'Male',
    religion: 'Islam',
    bloodGroup: 'B+',
    admissionDate: new Date().toISOString().split('T')[0],
    campusId: '',
    classId: '',
    sectionId: '',
    monthlyFee: 4500,
    admissionFeePaid: 5000,
    discountPercentage: 0,
    parentEmail: '',
    notes: '',
  });

  const [promoteClassId, setPromoteClassId] = useState('');
  const [promoteSectionId, setPromoteSectionId] = useState('');
  const [selectedForPromotion, setSelectedForPromotion] = useState<string[]>([]);

  const [transferCampusId, setTransferCampusId] = useState('');
  const [transferReason, setTransferReason] = useState('');

  const [leavingDate, setLeavingDate] = useState(new Date().toISOString().split('T')[0]);
  const [leavingReason, setLeavingReason] = useState('Completion of studies');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stuRes, acadRes] = await Promise.all([
        fetch(`/api/students?campusId=${activeCampusId}&classId=${selectedClass}&q=${encodeURIComponent(searchQuery)}`),
        fetch('/api/academics'),
      ]);

      if (stuRes.ok) {
        const s = await stuRes.json();
        setStudents(s);
      }
      if (acadRes.ok) {
        const a = await acadRes.json();
        setClasses(a.classes || []);
        setSections(a.sections || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeCampusId, selectedClass, searchQuery]);

  // Handle Admission Submission
  const handleAdmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        campusId: formData.campusId || campuses[0]?.id || 'camp-1',
        classId: formData.classId || classes[0]?.id || 'cls-1',
        sectionId: formData.sectionId || sections[0]?.id || 'sec-1',
      };

      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsAdmissionOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Edit Student Submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      const res = await fetch('/api/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedStudent.id, ...formData }),
      });
      if (res.ok) {
        setIsEditOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Student Promotion Batch
  const handlePromoteSubmit = async () => {
    if (selectedForPromotion.length === 0 || !promoteClassId) return;
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'promote',
          studentIds: selectedForPromotion,
          targetClassId: promoteClassId,
          targetSectionId: promoteSectionId,
        }),
      });
      if (res.ok) {
        setIsPromoteOpen(false);
        setSelectedForPromotion([]);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Transfer
  const handleTransferSubmit = async () => {
    if (!selectedStudent || !transferCampusId) return;
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'transfer',
          studentId: selectedStudent.id,
          targetCampusId: transferCampusId,
          reason: transferReason,
        }),
      });
      if (res.ok) {
        setIsTransferOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Leaving Certificate
  const handleLeavingSubmit = async () => {
    if (!selectedStudent) return;
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'leave',
          studentId: selectedStudent.id,
          leavingDate,
          reason: leavingReason,
        }),
      });
      if (res.ok) {
        setIsLeavingOpen(false);
        // Open Leaving Certificate in printable modal
        setPrintModal({
          type: 'leaving_cert',
          data: {
            ...selectedStudent,
            leavingDate,
            leavingReason,
          },
        });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredStudents = students.filter((s) => {
    if (selectedStatus !== 'all' && s.status.toLowerCase() !== selectedStatus.toLowerCase()) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Student Information System</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Admission lifecycle, academic profiles, campus transfers, and leaving certificates
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedForPromotion.length > 0 && (
            <button
              onClick={() => setIsPromoteOpen(true)}
              className="px-3 py-1.5 text-xs font-medium text-amber-900 bg-amber-100 hover:bg-amber-200 rounded transition-colors flex items-center gap-1.5"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Promote Selected ({selectedForPromotion.length})
            </button>
          )}

          <button
            onClick={() => {
              setFormData({
                name: '',
                fatherName: '',
                motherName: '',
                cnicOrBForm: '',
                mobileNumber: '',
                emergencyContact: '',
                address: '',
                dateOfBirth: '2018-05-15',
                gender: 'Male',
                religion: 'Islam',
                bloodGroup: 'B+',
                admissionDate: new Date().toISOString().split('T')[0],
                campusId: activeCampusId !== 'all' ? activeCampusId : (campuses[0]?.id || 'camp-1'),
                classId: classes[0]?.id || 'cls-1',
                sectionId: sections[0]?.id || 'sec-1',
                monthlyFee: 4500,
                admissionFeePaid: 5000,
                discountPercentage: 0,
                parentEmail: '',
                notes: '',
              });
              setIsAdmissionOpen(true);
            }}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            New Admission
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, registration number, roll number, father name, or B-Form..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none text-slate-700"
          >
            <option value="all">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Transferred">Transferred</option>
            <option value="Left">Left</option>
          </select>
        </div>
      </div>

      {/* High-Density Students Data Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={
                      selectedForPromotion.length > 0 &&
                      selectedForPromotion.length === filteredStudents.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedForPromotion(filteredStudents.map((s) => s.id));
                      } else {
                        setSelectedForPromotion([]);
                      }
                    }}
                    className="rounded border-slate-300 text-slate-900 focus:ring-0"
                  />
                </th>
                <th className="py-2.5 px-3 font-medium">Reg. Number</th>
                <th className="py-2.5 px-3 font-medium">Student Name</th>
                <th className="py-2.5 px-3 font-medium">Father / Guardian</th>
                <th className="py-2.5 px-3 font-medium">Class & Section</th>
                <th className="py-2.5 px-3 font-medium">Campus</th>
                <th className="py-2.5 px-3 font-medium">Contact</th>
                <th className="py-2.5 px-3 font-medium text-right">Monthly Fee</th>
                <th className="py-2.5 px-3 font-medium">Status</th>
                <th className="py-2.5 px-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    Loading student records...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const classObj = classes.find((c) => c.id === s.classId);
                  const sectionObj = sections.find((sec) => sec.id === s.sectionId);
                  const campusObj = campuses.find((c) => c.id === s.campusId);
                  const isChecked = selectedForPromotion.includes(s.id);

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedForPromotion([...selectedForPromotion, s.id]);
                            } else {
                              setSelectedForPromotion(selectedForPromotion.filter((id) => id !== s.id));
                            }
                          }}
                          className="rounded border-slate-300 text-slate-900 focus:ring-0"
                        />
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-700">
                        {s.registrationNumber}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">
                        <div>{s.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">B-Form: {s.cnicOrBForm}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{s.fatherName}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-slate-800">{classObj?.name || 'Class'}</span>
                        <span className="text-slate-400 ml-1">({sectionObj?.name || 'A'})</span>
                        <div className="text-[10px] text-slate-400 font-mono">Roll: {s.rollNumber}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                        {campusObj?.name || 'Campus'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                        {s.mobileNumber}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-900">
                        Rs. {s.monthlyFee?.toLocaleString()}
                        {s.discountPercentage ? (
                          <div className="text-[10px] text-emerald-700">-{s.discountPercentage}% disc</div>
                        ) : null}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[11px] font-medium ${
                            s.status === 'Active'
                              ? 'text-emerald-700'
                              : s.status === 'Left'
                              ? 'text-rose-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Profile */}
                          <button
                            title="Print Leaving Certificate"
                            onClick={() => {
                              setSelectedStudent(s);
                              setIsLeavingOpen(true);
                            }}
                            className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {/* Transfer Campus */}
                          <button
                            title="Transfer Campus"
                            onClick={() => {
                              setSelectedStudent(s);
                              setTransferCampusId(s.campusId);
                              setIsTransferOpen(true);
                            }}
                            className="p-1 text-slate-500 hover:text-blue-700 rounded hover:bg-slate-100"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Profile */}
                          <button
                            title="Edit Student Profile"
                            onClick={() => {
                              setSelectedStudent(s);
                              setFormData({ ...s });
                              setIsEditOpen(true);
                            }}
                            className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW ADMISSION MODAL */}
      {isAdmissionOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">New Student Admission Form</h3>
                <p className="text-xs text-slate-500">Enter complete student and parent registration particulars</p>
              </div>
              <button
                onClick={() => setIsAdmissionOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdmissionSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Muhammad Zayan"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Father / Guardian Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    placeholder="e.g. Farhan Ali"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Mother Name</label>
                  <input
                    type="text"
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    placeholder="e.g. Sadia Farhan"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">CNIC / B-Form Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.cnicOrBForm}
                    onChange={(e) => setFormData({ ...formData, cnicOrBForm: e.target.value })}
                    placeholder="e.g. 42101-1234567-1"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Primary Mobile (WhatsApp) *</label>
                  <input
                    type="text"
                    required
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    placeholder="e.g. +92 300 1234567"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    placeholder="e.g. +92 321 7654321"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              {/* Academic Placement */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  Academic Placement & Fee
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
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
                    <label className="font-medium text-slate-700 block mb-1">Class *</label>
                    <select
                      value={formData.classId}
                      onChange={(e) => {
                        const cls = classes.find((c) => c.id === e.target.value);
                        setFormData({
                          ...formData,
                          classId: e.target.value,
                          monthlyFee: cls ? cls.monthlyTuitionFee : formData.monthlyFee,
                        });
                      }}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Monthly Tuition (PKR) *</label>
                    <input
                      type="number"
                      value={formData.monthlyFee}
                      onChange={(e) => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Admission Fee Paid (PKR)</label>
                    <input
                      type="number"
                      value={formData.admissionFeePaid}
                      onChange={(e) => setFormData({ ...formData, admissionFeePaid: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs font-mono focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Permanent Residential Address *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street address, sector, city"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAdmissionOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded transition-colors shadow-xs"
                >
                  Complete Student Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STUDENT MODAL */}
      {isEditOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">
                  Edit Student Profile ({selectedStudent.registrationNumber})
                </h3>
                <p className="text-xs text-slate-500">Update academic placement, fee structure, or contacts</p>
              </div>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Student Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Father Name</label>
                  <input
                    type="text"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Mobile Contact</label>
                  <input
                    type="text"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Monthly Tuition Fee</label>
                  <input
                    type="number"
                    value={formData.monthlyFee}
                    onChange={(e) => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Fee Concession / Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discountPercentage}
                    onChange={(e) => setFormData({ ...formData, discountPercentage: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Transferred">Transferred</option>
                    <option value="Left">Left</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Residential Address</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                />
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
                  className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BATCH PROMOTION MODAL */}
      {isPromoteOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 text-sm">
                Promote Selected Students ({selectedForPromotion.length})
              </h3>
              <button onClick={() => setIsPromoteOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600">
                Select target class for academic advancement for the {selectedForPromotion.length} selected students.
              </p>
              <div>
                <label className="font-medium text-slate-700 block mb-1">Target Class *</label>
                <select
                  value={promoteClassId}
                  onChange={(e) => setPromoteClassId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                >
                  <option value="">Select Target Class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  onClick={() => setIsPromoteOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePromoteSubmit}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded transition-colors shadow-xs"
                >
                  Confirm Batch Promotion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CAMPUS TRANSFER MODAL */}
      {isTransferOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 text-sm">Transfer Student Campus</h3>
              <button onClick={() => setIsTransferOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded">
                <div className="font-medium text-slate-900">{selectedStudent.name}</div>
                <div className="text-slate-500 font-mono text-[11px]">
                  Reg: {selectedStudent.registrationNumber}
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Target Campus *</label>
                <select
                  value={transferCampusId}
                  onChange={(e) => setTransferCampusId(e.target.value)}
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
                <label className="font-medium text-slate-700 block mb-1">Transfer Reason / Remarks</label>
                <input
                  type="text"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder="e.g. Family residential relocation"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  onClick={() => setIsTransferOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTransferSubmit}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded transition-colors shadow-xs"
                >
                  Execute Campus Transfer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LEAVING CERTIFICATE MODAL */}
      {isLeavingOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 text-sm">Issue School Leaving Certificate</h3>
              <button onClick={() => setIsLeavingOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded">
                <div className="font-medium text-slate-900">{selectedStudent.name}</div>
                <div className="text-slate-500 font-mono text-[11px]">
                  Father: {selectedStudent.fatherName} · Reg: {selectedStudent.registrationNumber}
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Leaving Date *</label>
                <input
                  type="date"
                  value={leavingDate}
                  onChange={(e) => setLeavingDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Reason for Leaving *</label>
                <input
                  type="text"
                  value={leavingReason}
                  onChange={(e) => setLeavingReason(e.target.value)}
                  placeholder="e.g. Completed Grade 10 Matriculation / Family moving abroad"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  onClick={() => setIsLeavingOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLeavingSubmit}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs"
                >
                  Generate & Print Certificate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
