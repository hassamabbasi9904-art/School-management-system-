'use client';

import React, { useState, useEffect } from 'react';
import { useSchool } from '@/context/SchoolContext';
import { Exam, ExamResult, ClassItem, Student } from '@/types';
import {
  GraduationCap,
  PlusCircle,
  Trophy,
  Printer,
  Edit2,
  CheckCircle,
  FileText,
  Search,
} from 'lucide-react';

export default function ExamSystemView() {
  const { activeCampusId, campuses, setPrintModal } = useSchool();
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [positionHolders, setPositionHolders] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedExamId, setSelectedExamId] = useState('all');
  const [selectedClassId, setSelectedClassId] = useState('all');

  // Modals
  const [isCreateExamOpen, setIsCreateExamOpen] = useState(false);
  const [isEnterMarksOpen, setIsEnterMarksOpen] = useState(false);

  // Create Exam Form
  const [examTitle, setExamTitle] = useState('');
  const [examType, setExamType] = useState<'Mid-Term' | 'Final Exam' | 'Monthly Test' | 'First Term'>('Mid-Term');
  const [startDate, setStartDate] = useState('2026-11-15');
  const [endDate, setEndDate] = useState('2026-11-25');

  // Enter Marks Form
  const [targetStudentId, setTargetStudentId] = useState('');
  const [targetExamId, setTargetExamId] = useState('');
  const [subjectMarksList, setSubjectMarksList] = useState<
    { subjectName: string; totalMarks: number; obtainedMarks: number }[]
  >([
    { subjectName: 'English', totalMarks: 100, obtainedMarks: 85 },
    { subjectName: 'Mathematics', totalMarks: 100, obtainedMarks: 90 },
    { subjectName: 'General Science', totalMarks: 100, obtainedMarks: 82 },
    { subjectName: 'Urdu', totalMarks: 100, obtainedMarks: 78 },
    { subjectName: 'Islamiat', totalMarks: 50, obtainedMarks: 44 },
  ]);
  const [remarks, setRemarks] = useState('Excellent academic progress');

  const fetchExamData = async () => {
    try {
      setLoading(true);
      const [eRes, cRes, sRes] = await Promise.all([
        fetch(`/api/exams?campusId=${activeCampusId}&examId=${selectedExamId}&classId=${selectedClassId}`),
        fetch('/api/academics'),
        fetch(`/api/students?campusId=${activeCampusId}`),
      ]);

      if (eRes.ok) {
        const data = await eRes.json();
        setExams(data.exams || []);
        setResults(data.results || []);
        setPositionHolders(data.positionHolders || []);
      }
      if (cRes.ok) {
        const cData = await cRes.json();
        setClasses(cData.classes || []);
      }
      if (sRes.ok) {
        setStudents(await sRes.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamData();
  }, [activeCampusId, selectedExamId, selectedClassId]);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createExam',
          title: examTitle,
          examType,
          startDate,
          endDate,
          campusId: activeCampusId,
        }),
      });
      if (res.ok) {
        setIsCreateExamOpen(false);
        fetchExamData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarksSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStudentId || !targetExamId) return;
    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'enterMarks',
          examId: targetExamId,
          studentId: targetStudentId,
          subjectMarks: subjectMarksList,
          remarks,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsEnterMarksOpen(false);
        setPrintModal({
          type: 'report_card',
          data: data.result,
        });
        fetchExamData();
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
            <GraduationCap className="w-5 h-5 text-indigo-700" />
            Examinations & Academic Report Cards
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Marks entry grid, GPA & grade calculation, position holders ranking, and printable report cards
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setTargetExamId(exams[0]?.id || '');
              setTargetStudentId(students[0]?.id || '');
              setIsEnterMarksOpen(true);
            }}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors flex items-center gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Enter Subject Marks
          </button>

          <button
            onClick={() => {
              setExamTitle('Second Term Assessment 2026');
              setIsCreateExamOpen(true);
            }}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Schedule New Exam
          </button>
        </div>
      </div>

      {/* Position Holders Showcase */}
      {positionHolders.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 via-white to-amber-50/40 p-5 rounded-lg border border-amber-200">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-amber-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Class Position Holders & Distinctions
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {positionHolders.map((ph, idx) => (
              <div
                key={ph.id}
                className="bg-white p-3.5 rounded border border-amber-200 shadow-xs flex items-center justify-between"
              >
                <div>
                  <span className="text-[11px] font-bold text-amber-700 block">
                    {idx === 0 ? '🥇 1st Position' : idx === 1 ? '🥈 2nd Position' : '🥉 3rd Position'}
                  </span>
                  <div className="font-semibold text-slate-900 text-xs mt-0.5">{ph.studentName}</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {ph.className} · Reg: {ph.registrationNumber}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-bold font-mono text-emerald-700">{ph.percentage}%</div>
                  <div className="text-[10px] text-slate-400 font-mono">GPA {ph.gpa?.toFixed(1)} · Grade {ph.grade}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Strip */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-700">
            <span>Exam:</span>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded focus:outline-none"
            >
              <option value="all">All Exams</option>
              {exams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} ({e.examType})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-700">
            <span>Class:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded focus:outline-none"
            >
              <option value="all">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          {results.length} Published Result Cards
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-medium">Rank</th>
                <th className="py-2.5 px-3 font-medium">Student Name</th>
                <th className="py-2.5 px-3 font-medium">Class & Section</th>
                <th className="py-2.5 px-3 font-medium text-right">Max Marks</th>
                <th className="py-2.5 px-3 font-medium text-right">Obtained Marks</th>
                <th className="py-2.5 px-3 font-medium text-right">Percentage</th>
                <th className="py-2.5 px-3 font-medium text-center">Grade</th>
                <th className="py-2.5 px-3 font-medium text-center">GPA</th>
                <th className="py-2.5 px-3 font-medium text-right">Official Report Card</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Loading examination results...
                  </td>
                </tr>
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No results recorded for this selection. Click "Enter Subject Marks" to log scores.
                  </td>
                </tr>
              ) : (
                results.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-bold font-mono text-slate-700">
                      #{r.positionRank || '-'}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{r.studentName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{r.registrationNumber}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {r.className} ({r.sectionName})
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">{r.totalMarks}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {r.obtainedMarks}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                      {r.percentage}%
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="font-bold font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[11px]">
                        {r.grade}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-700">{r.gpa?.toFixed(1)}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        title="Print Official Result Card"
                        onClick={() => setPrintModal({ type: 'report_card', data: r })}
                        className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors inline-flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" />
                        Print Card
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SCHEDULE EXAM MODAL */}
      {isCreateExamOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 text-sm">Schedule Academic Examination</h3>
              <button onClick={() => setIsCreateExamOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateExam} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Exam Title *</label>
                <input
                  type="text"
                  required
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="e.g. Mid-Term Examination 2026"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Exam Type</label>
                <select
                  value={examType}
                  onChange={(e: any) => setExamType(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                >
                  <option value="Mid-Term">Mid-Term</option>
                  <option value="Final Exam">Final Exam</option>
                  <option value="First Term">First Term</option>
                  <option value="Monthly Test">Monthly Test</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateExamOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs"
                >
                  Publish Exam Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ENTER MARKS MODAL */}
      {isEnterMarksOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Enter Subject Marks & Compute Grade</h3>
                <p className="text-xs text-slate-500">Auto-calculates GPA, percentage, and letter grade</p>
              </div>
              <button onClick={() => setIsEnterMarksOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleMarksSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Select Exam *</label>
                  <select
                    value={targetExamId}
                    onChange={(e) => setTargetExamId(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                  >
                    {exams.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Select Student *</label>
                  <select
                    value={targetStudentId}
                    onChange={(e) => setTargetStudentId(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                  >
                    {students.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.registrationNumber})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject Marks Grid */}
              <div className="border border-slate-200 rounded p-3 bg-slate-50/50">
                <span className="font-semibold text-slate-800 block mb-2">Subject Scores</span>
                <div className="space-y-2">
                  {subjectMarksList.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.subjectName}
                        onChange={(e) => {
                          const updated = [...subjectMarksList];
                          updated[idx].subjectName = e.target.value;
                          setSubjectMarksList(updated);
                        }}
                        className="flex-1 px-2.5 py-1 border border-slate-200 rounded bg-white text-xs"
                      />
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <span>Obt:</span>
                        <input
                          type="number"
                          value={item.obtainedMarks}
                          onChange={(e) => {
                            const updated = [...subjectMarksList];
                            updated[idx].obtainedMarks = Number(e.target.value);
                            setSubjectMarksList(updated);
                          }}
                          className="w-16 px-2 py-1 border border-slate-200 rounded bg-white font-bold text-slate-900"
                        />
                        <span>/</span>
                        <input
                          type="number"
                          value={item.totalMarks}
                          onChange={(e) => {
                            const updated = [...subjectMarksList];
                            updated[idx].totalMarks = Number(e.target.value);
                            setSubjectMarksList(updated);
                          }}
                          className="w-16 px-2 py-1 border border-slate-200 rounded bg-white text-slate-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Principal / Teacher Remarks</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEnterMarksOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-700 hover:bg-indigo-800 rounded transition-colors shadow-xs"
                >
                  Save & Print Report Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
