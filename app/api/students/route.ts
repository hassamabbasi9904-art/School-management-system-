import { NextResponse } from 'next/server';
import { store, recordFinancialTransaction } from '@/lib/data-store';
import { Student } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campusId = searchParams.get('campusId');
  const classId = searchParams.get('classId');
  const query = searchParams.get('q')?.toLowerCase() || '';

  let list = store.students;

  if (campusId && campusId !== 'all') {
    list = list.filter((s) => s.campusId === campusId);
  }

  if (classId && classId !== 'all') {
    list = list.filter((s) => s.classId === classId);
  }

  if (query) {
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.registrationNumber.toLowerCase().includes(query) ||
        s.rollNumber.toLowerCase().includes(query) ||
        s.fatherName.toLowerCase().includes(query) ||
        s.cnicOrBForm.toLowerCase().includes(query) ||
        s.mobileNumber.includes(query)
    );
  }

  return NextResponse.json(list);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // Student Promotion
    if (action === 'promote') {
      const { studentIds, targetClassId, targetSectionId } = body;
      const targetClass = store.classes.find((c) => c.id === targetClassId);
      studentIds.forEach((id: string) => {
        const student = store.students.find((s) => s.id === id);
        if (student) {
          student.classId = targetClassId;
          student.sectionId = targetSectionId || student.sectionId;
          if (targetClass) {
            student.monthlyFee = targetClass.monthlyTuitionFee;
          }
        }
      });
      store.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        userName: 'Admin',
        userRole: 'Admin',
        action: 'STUDENTS_PROMOTED',
        module: 'Student Management',
        details: `Promoted ${studentIds.length} students to class ${targetClass?.name || targetClassId}`,
        status: 'Success',
      });
      return NextResponse.json({ success: true, message: `Promoted ${studentIds.length} students successfully.` });
    }

    // Student Transfer
    if (action === 'transfer') {
      const { studentId, targetCampusId, reason } = body;
      const student = store.students.find((s) => s.id === studentId);
      const targetCampus = store.campuses.find((c) => c.id === targetCampusId);
      if (!student) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 });
      }
      student.campusId = targetCampusId;
      store.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        userName: 'Admin',
        userRole: 'Admin',
        action: 'STUDENT_TRANSFERRED',
        module: 'Student Management',
        details: `Transferred ${student.name} (${student.registrationNumber}) to ${targetCampus?.name}. Reason: ${reason || 'Relocation'}`,
        status: 'Success',
      });
      return NextResponse.json({ success: true, student });
    }

    // Student Leaving Certificate
    if (action === 'leave') {
      const { studentId, leavingDate, reason } = body;
      const student = store.students.find((s) => s.id === studentId);
      if (!student) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 });
      }
      student.status = 'Left';
      student.leavingDate = leavingDate || new Date().toISOString().split('T')[0];
      student.leavingReason = reason || 'Completed Studies / Relocation';
      store.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        userName: 'Admin',
        userRole: 'Admin',
        action: 'LEAVING_CERTIFICATE_ISSUED',
        module: 'Student Management',
        details: `Issued leaving certificate for ${student.name} (${student.registrationNumber}). Reason: ${reason}`,
        status: 'Success',
      });
      return NextResponse.json({ success: true, student });
    }

    // New Student Admission
    const regSeq = (store.students.length + 1).toString().padStart(3, '0');
    const registrationNumber = body.registrationNumber || `REG-2026-${regSeq}`;
    const rollNumber = body.rollNumber || (store.students.filter((s) => s.classId === body.classId).length + 1).toString().padStart(2, '0');

    const newStudent: Student = {
      id: `stu-${Date.now()}`,
      registrationNumber,
      rollNumber,
      name: body.name,
      fatherName: body.fatherName,
      motherName: body.motherName || '',
      cnicOrBForm: body.cnicOrBForm,
      mobileNumber: body.mobileNumber,
      emergencyContact: body.emergencyContact || '',
      address: body.address,
      dateOfBirth: body.dateOfBirth,
      gender: body.gender || 'Male',
      religion: body.religion || 'Islam',
      bloodGroup: body.bloodGroup || 'O+',
      admissionDate: body.admissionDate || new Date().toISOString().split('T')[0],
      campusId: body.campusId || store.campuses[0].id,
      classId: body.classId || store.classes[0].id,
      sectionId: body.sectionId || store.sections[0].id,
      status: 'Active',
      monthlyFee: Number(body.monthlyFee) || 4500,
      discountPercentage: Number(body.discountPercentage) || 0,
      avatarUrl: body.avatarUrl || '',
      parentEmail: body.parentEmail || '',
      notes: body.notes || '',
    };

    store.students.unshift(newStudent);

    // If admission fee was charged and paid upfront, record transaction
    if (body.admissionFeePaid && Number(body.admissionFeePaid) > 0) {
      const admissionFee = Number(body.admissionFeePaid);
      recordFinancialTransaction({
        type: 'INCOME',
        sourceOrCategory: 'Admission Income',
        description: `Admission fee for ${newStudent.name} (${newStudent.registrationNumber})`,
        referenceNo: `ADM-${newStudent.registrationNumber}`,
        amount: admissionFee,
        campusId: newStudent.campusId,
        performedBy: 'Admissions Office',
      });
    }

    // Push notification
    store.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'New Student Admitted',
      message: `${newStudent.name} has been enrolled in ${registrationNumber}.`,
      type: 'admission',
      createdAt: new Date().toISOString(),
      read: false,
    });

    store.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userName: 'Admissions Desk',
      userRole: 'Receptionist/Admin',
      action: 'STUDENT_ADMISSION',
      module: 'Student Management',
      details: `Enrolled student ${newStudent.name} (Reg: ${newStudent.registrationNumber}) in Class ${newStudent.classId}`,
      status: 'Success',
    });

    return NextResponse.json(newStudent);
  } catch {
    return NextResponse.json({ error: 'Failed to process student admission' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    const student = store.students.find((s) => s.id === id);

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    Object.assign(student, updates);

    store.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userName: 'Admin',
      userRole: 'Admin',
      action: 'STUDENT_UPDATED',
      module: 'Student Management',
      details: `Updated details for ${student.name} (${student.registrationNumber})`,
      status: 'Success',
    });

    return NextResponse.json(student);
  } catch {
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const index = store.students.findIndex((s) => s.id === id);
  if (index !== -1) {
    const deleted = store.students.splice(index, 1)[0];
    store.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userName: 'Super Admin',
      userRole: 'Super Admin',
      action: 'STUDENT_DELETED',
      module: 'Student Management',
      details: `Removed student record ${deleted.name} (${deleted.registrationNumber})`,
      status: 'Warning',
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Student not found' }, { status: 404 });
}
