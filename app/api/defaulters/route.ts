import { NextResponse } from 'next/server';
import { store } from '@/lib/data-store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campusId = searchParams.get('campusId');
  const classId = searchParams.get('classId');

  // Defaulters are students with vouchers having status 'Overdue' or 'Unpaid' (where due date passed) or 'Partial'
  let defaulters = store.feeVouchers
    .filter((v) => v.remainingAmount > 0 && (v.status === 'Overdue' || v.status === 'Unpaid' || v.status === 'Partial'))
    .map((v) => {
      const student = store.students.find((s) => s.id === v.studentId);
      const campus = store.campuses.find((c) => c.id === v.campusId);

      const daysOverdue = Math.max(
        0,
        Math.floor((new Date().getTime() - new Date(v.dueDate).getTime()) / (1000 * 3600 * 24))
      );

      const calculatedLateFine = daysOverdue > 0 ? Math.min(1000, daysOverdue * 50) : 0;

      // WhatsApp formatted alert message
      const whatsappMessage = encodeURIComponent(
        `Dear Parent (${student?.fatherName || 'Guardian'}), this is an urgent reminder from ${store.settings.schoolName}. Outstanding dues for your child ${v.studentName} (Reg: ${v.registrationNumber}, Class: ${v.className}) for the month of ${v.month} is Rs. ${(v.remainingAmount + (v.fineAmount || calculatedLateFine)).toLocaleString()}. Please clear immediately to avoid examination suspension. Thank you.`
      );

      const smsText = `Reminder: Fee for ${v.studentName} (${v.registrationNumber}) is overdue by ${daysOverdue} days. Payable: Rs. ${(v.remainingAmount + (v.fineAmount || calculatedLateFine)).toLocaleString()}. - ${store.settings.schoolName}`;

      return {
        ...v,
        studentFatherName: student?.fatherName || '',
        studentPhone: student?.mobileNumber || '',
        emergencyPhone: student?.emergencyContact || '',
        campusName: campus?.name || '',
        daysOverdue,
        suggestedFine: calculatedLateFine,
        whatsappUrl: student?.mobileNumber ? `https://wa.me/${student.mobileNumber.replace(/[^0-9]/g, '')}?text=${whatsappMessage}` : '',
        smsText,
      };
    });

  if (campusId && campusId !== 'all') {
    defaulters = defaulters.filter((d) => d.campusId === campusId);
  }

  if (classId && classId !== 'all') {
    defaulters = defaulters.filter((d) => d.classId === classId);
  }

  const totalOutstanding = defaulters.reduce((acc, d) => acc + d.remainingAmount, 0);

  return NextResponse.json({
    defaulters,
    totalCount: defaulters.length,
    totalOutstanding,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, voucherIds, fixedFine = 500 } = body;

    if (action === 'applyFines') {
      let appliedCount = 0;
      voucherIds.forEach((vid: string) => {
        const voucher = store.feeVouchers.find((v) => v.id === vid);
        if (voucher && voucher.remainingAmount > 0) {
          voucher.fineAmount += Number(fixedFine);
          voucher.totalPayable += Number(fixedFine);
          voucher.remainingAmount += Number(fixedFine);
          voucher.status = 'Overdue';
          appliedCount++;
        }
      });

      store.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        userName: 'Accountant',
        userRole: 'Accountant',
        action: 'DEFAULTER_FINES_APPLIED',
        module: 'Fee Management',
        details: `Applied late fine of PKR ${fixedFine} to ${appliedCount} defaulters`,
        status: 'Warning',
      });

      return NextResponse.json({
        success: true,
        message: `Applied PKR ${fixedFine} late fine to ${appliedCount} student vouchers.`,
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to process defaulters request' }, { status: 500 });
  }
}
