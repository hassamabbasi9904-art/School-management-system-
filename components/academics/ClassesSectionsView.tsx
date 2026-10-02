'use client';

import React, { useState, useEffect } from 'react';
import { useSchool } from '@/context/SchoolContext';
import { ClassItem, SectionItem, SubjectItem } from '@/types';
import {
  Layers,
  PlusCircle,
  Users,
  BookOpen,
  DoorOpen,
} from 'lucide-react';

export default function ClassesSectionsView() {
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);

  // Forms
  const [className, setClassName] = useState('');
  const [classFee, setClassFee] = useState(4500);

  const [targetClassId, setTargetClassId] = useState('');
  const [sectionName, setSectionName] = useState('A');
  const [sectionTeacher, setSectionTeacher] = useState('');
  const [sectionRoom, setSectionRoom] = useState('Room 101');
  const [sectionCapacity, setSectionCapacity] = useState(35);

  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');

  const fetchAcademics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/academics');
      if (res.ok) {
        const data = await res.json();
        setClasses(data.classes || []);
        setSections(data.sections || []);
        setSubjects(data.subjects || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademics();
  }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/academics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createClass',
          name: className,
          numericLevel: classes.length + 1,
          monthlyTuitionFee: classFee,
        }),
      });
      if (res.ok) {
        setIsClassModalOpen(false);
        setClassName('');
        fetchAcademics();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/academics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createSection',
          classId: targetClassId || classes[0]?.id,
          name: sectionName,
          classTeacherName: sectionTeacher,
          roomNumber: sectionRoom,
          capacity: sectionCapacity,
        }),
      });
      if (res.ok) {
        setIsSectionModalOpen(false);
        fetchAcademics();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/academics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createSubject',
          classId: targetClassId || classes[0]?.id,
          name: subjectName,
          code: subjectCode || `SUB-${Date.now().toString().slice(-4)}`,
          totalMarks: 100,
          passingMarks: 40,
        }),
      });
      if (res.ok) {
        setIsSubjectModalOpen(false);
        setSubjectName('');
        setSubjectCode('');
        fetchAcademics();
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
            <Layers className="w-5 h-5 text-indigo-600" />
            Classes, Sections & Subject Curriculum
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Class strength tracking, homeroom teachers, room allocation, and course subjects
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setTargetClassId(classes[0]?.id || '');
              setIsSectionModalOpen(true);
            }}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
          >
            + Add Section
          </button>
          <button
            onClick={() => {
              setTargetClassId(classes[0]?.id || '');
              setIsSubjectModalOpen(true);
            }}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
          >
            + Add Subject
          </button>
          <button
            onClick={() => setIsClassModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Add New Class
          </button>
        </div>
      </div>

      {/* Classes Grid with Class Strength */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-slate-400">Loading academic classes...</div>
        ) : (
          classes.map((cls) => (
            <div key={cls.id} className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-slate-900 text-sm">{cls.name}</h2>
                  <span className="font-mono text-[11px] text-slate-500">
                    Rs. {cls.monthlyTuitionFee?.toLocaleString()}/mo
                  </span>
                </div>

                {/* Strength Meter */}
                <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" /> Class Strength:
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {cls.studentCount || 0} Students
                    </span>
                  </div>
                </div>

                {/* Sections */}
                <div className="space-y-1 mb-3">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Assigned Sections
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cls.sectionsList?.map((sec: SectionItem) => (
                      <div
                        key={sec.id}
                        className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-700 font-medium"
                      >
                        Section {sec.name} · {sec.classTeacherName || 'No Teacher'}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subjects */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Curriculum Subjects
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {cls.subjectsList?.map((sub: SubjectItem) => (
                      <span key={sub.id} className="text-[11px] text-slate-600 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                        {sub.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Multi-Campus Curriculum</span>
                <span className="text-emerald-700 font-medium">Standard Syllabus</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE CLASS MODAL */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-sm">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 text-sm">Add New Academic Class</h3>
              <button onClick={() => setIsClassModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateClass} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Class Name *</label>
                <input
                  type="text"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g. Grade 6 / O-Level 1"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Base Monthly Tuition (PKR) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={classFee}
                  onChange={(e) => setClassFee(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs font-mono font-bold text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs"
                >
                  Save Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE SECTION MODAL */}
      {isSectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-sm">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 text-sm">Add Section</h3>
              <button onClick={() => setIsSectionModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateSection} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Class *</label>
                <select
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Section Name *</label>
                <input
                  type="text"
                  required
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  placeholder="e.g. A, B, Blue, Lotus"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Homeroom / Class Teacher</label>
                <input
                  type="text"
                  value={sectionTeacher}
                  onChange={(e) => setSectionTeacher(e.target.value)}
                  placeholder="e.g. Ms. Ayesha Siddiqa"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsSectionModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs"
                >
                  Add Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE SUBJECT MODAL */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-sm">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 text-sm">Add Subject to Curriculum</h3>
              <button onClick={() => setIsSubjectModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateSubject} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Class *</label>
                <select
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Subject Title *</label>
                <input
                  type="text"
                  required
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Course Code</label>
                <input
                  type="text"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  placeholder="e.g. CS-101"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
