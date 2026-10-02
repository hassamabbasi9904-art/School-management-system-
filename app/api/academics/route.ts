import { NextResponse } from 'next/server';
import { store } from '@/lib/data-store';
import { ClassItem, SectionItem, SubjectItem } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  if (type === 'sections') return NextResponse.json(store.sections);
  if (type === 'subjects') return NextResponse.json(store.subjects);

  // Return full academic overview
  const classesWithStrength = store.classes.map((cls) => {
    const studentCount = store.students.filter((s) => s.classId === cls.id && s.status === 'Active').length;
    const classSections = store.sections.filter((s) => s.classId === cls.id);
    const classSubjects = store.subjects.filter((sub) => sub.classId === cls.id);
    return {
      ...cls,
      studentCount,
      sectionsList: classSections,
      subjectsList: classSubjects,
    };
  });

  return NextResponse.json({
    classes: classesWithStrength,
    sections: store.sections,
    subjects: store.subjects,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'createClass') {
      const newClass: ClassItem = {
        id: `cls-${Date.now()}`,
        name: body.name,
        numericLevel: Number(body.numericLevel) || 1,
        sections: body.sections || ['A'],
        subjects: body.subjects || [],
        monthlyTuitionFee: Number(body.monthlyTuitionFee) || 4500,
        campusId: body.campusId || 'all',
      };
      store.classes.push(newClass);

      // Create default section A
      store.sections.push({
        id: `sec-${Date.now()}`,
        classId: newClass.id,
        name: 'A',
        capacity: 35,
      });

      return NextResponse.json(newClass);
    }

    if (action === 'createSection') {
      const newSection: SectionItem = {
        id: `sec-${Date.now()}`,
        classId: body.classId,
        name: body.name,
        classTeacherName: body.classTeacherName,
        roomNumber: body.roomNumber,
        capacity: Number(body.capacity) || 35,
      };
      store.sections.push(newSection);
      return NextResponse.json(newSection);
    }

    if (action === 'createSubject') {
      const newSubject: SubjectItem = {
        id: `sub-${Date.now()}`,
        name: body.name,
        code: body.code || `SUB-${Date.now().toString().slice(-4)}`,
        classId: body.classId,
        totalMarks: Number(body.totalMarks) || 100,
        passingMarks: Number(body.passingMarks) || 40,
      };
      store.subjects.push(newSubject);
      return NextResponse.json(newSubject);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to process academic request' }, { status: 500 });
  }
}
