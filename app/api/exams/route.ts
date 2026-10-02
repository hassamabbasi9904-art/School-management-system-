import { NextResponse } from 'next/server';
import { store } from '@/lib/data-store';
import { Exam, ExamResult } from '@/types';

function calculateGradeAndGpa(percentage: number): { grade: string; gpa: number } {
  if (percentage >= 90) return { grade: 'A+', gpa: 4.0 };
  if (percentage >= 80) return { grade: 'A', gpa: 3.7 };
  if (percentage >= 70) return { grade: 'B', gpa: 3.0 };
  if (percentage >= 60) return { grade: 'C', gpa: 2.3 };
  if (percentage >= 50) return { grade: 'D', gpa: 1.7 };
  return { grade: 'F', gpa: 0.0 };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const examId = searchParams.get('examId');
  const classId = searchParams.get('classId');
  const campusId = searchParams.get('campusId');

  const exams = store.exams;

  let results = store.examResults;
  if (examId && examId !== 'all') {
    results = results.filter((r) => r.examId === examId);
  }
  if (classId && classId !== 'all') {
    results = results.filter((r) => r.classId === classId);
  }
  if (campusId && campusId !== 'all') {
    results = results.filter((r) => r.campusId === campusId);
  }

  // Sort by percentage descending to determine position holders
  results.sort((a, b) => b.percentage - a.percentage);
  results.forEach((r, idx) => {
    r.positionRank = idx + 1;
  });

  return NextResponse.json({
    exams,
    results,
    positionHolders: results.slice(0, 3),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // Action: Create New Exam
    if (action === 'createExam') {
      const newExam: Exam = {
        id: `ex-${Date.now()}`,
        title: body.title,
        examType: body.examType || 'Monthly Test',
        session: body.session || store.settings.currentSession,
        startDate: body.startDate,
        endDate: body.endDate,
        campusId: body.campusId || 'all',
        status: 'Upcoming',
      };
      store.exams.unshift(newExam);
      return NextResponse.json(newExam);
    }

    // Action: Submit / Enter Marks
    if (action === 'enterMarks') {
      const { examId, studentId, subjectMarks, remarks } = body;
      const student = store.students.find((s) => s.id === studentId);
      const classObj = store.classes.find((c) => c.id === student?.classId);
      const sectionObj = store.sections.find((s) => s.id === student?.sectionId);

      if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

      let totalMaxMarks = 0;
      let totalObtained = 0;

      const marksList = subjectMarks.map((sm: { subjectName: string; totalMarks: number; obtainedMarks: number }) => {
        const total = Number(sm.totalMarks) || 100;
        const obtained = Number(sm.obtainedMarks) || 0;
        totalMaxMarks += total;
        totalObtained += obtained;
        const pct = (obtained / total) * 100;
        const { grade } = calculateGradeAndGpa(pct);
        return {
          subjectName: sm.subjectName,
          totalMarks: total,
          obtainedMarks: obtained,
          grade,
        };
      });

      const overallPercentage = totalMaxMarks > 0 ? (totalObtained / totalMaxMarks) * 100 : 0;
      const { grade, gpa } = calculateGradeAndGpa(overallPercentage);

      // Check if result already exists
      const existingIdx = store.examResults.findIndex((r) => r.examId === examId && r.studentId === studentId);

      const resultCard: ExamResult = {
        id: existingIdx !== -1 ? store.examResults[existingIdx].id : `res-${Date.now()}`,
        examId,
        studentId: student.id,
        studentName: student.name,
        registrationNumber: student.registrationNumber,
        classId: student.classId,
        className: classObj?.name || 'Class',
        sectionName: sectionObj?.name || 'A',
        campusId: student.campusId,
        subjectMarks: marksList,
        totalMarks: totalMaxMarks,
        obtainedMarks: totalObtained,
        percentage: Number(overallPercentage.toFixed(1)),
        grade,
        gpa,
        remarks: remarks || (grade === 'A+' ? 'Distinction' : 'Passed'),
      };

      if (existingIdx !== -1) {
        store.examResults[existingIdx] = resultCard;
      } else {
        store.examResults.unshift(resultCard);
      }

      return NextResponse.json({ success: true, result: resultCard });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to process exam request' }, { status: 500 });
  }
}
