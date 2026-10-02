import { NextResponse } from 'next/server';
import { store, recordFinancialTransaction } from '@/lib/data-store';
import { FeeVoucher } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campusId = searchParams.get('campusId');
  const classId = searchParams.get('classId');
  const status = searchParams.get('status');
  const month = searchParams.get('month');

  let list = store.feeVouchers;

  if (campusId && campusId !== 'all') {
    list = list.filter((v) => v.campusId === campusId);
  }

  if (classId && classId !== 'all') {
    list = list.filter((v) => v.classId === classId);
  }

  if (status && status !== 'all') {
    list = list.filter((v) => v.status.toLowerCase() === status.toLowerCase());
  }

  if (month && month !== 'all') {
    list = list.filter((v) => v.month.toLowerCase() === month.toLowerCase());
  }

  return NextResponse.json(list);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // Action: Generate Fees (Monthly / Class / Campus / Single)
    if (action === 'generate') {
      const {
        campusId,
        classId,
        studentId,
        month = 'October 2026',
        dueDate = '2026-10-10',
        includeAnnualCharges = 0,
        includeExamFee = 0,
        includeComputerFee = 500,
        includeMiscCharges = 0,
      } = body;

      let targetStudents = store.students.filter((s) => s.status === 'Active');

      if (studentId) {
        targetStudents = targetStudents.filter((s) => s.id === studentId);
      } else {
        if (campusId && campusId !== 'all') {
          targetStudents = targetStudents.filter((s) => s.campusId === campusId);
        }
        if (classId && classId !== 'all') {
          targetStudents = targetStudents.filter((s) => s.classId === classId);
        }
      }

      if (targetStudents.length === 0) {
        return NextResponse.json({ error: 'No active students found matching criteria' }, { status: 400 });
      }

      const generated: FeeVoucher[] = [];
      const currentYear = new Date().getFullYear();
      let voucherIndex = store.feeVouchers.length + 1;

      for (const student of targetStudents) {
        // Check if voucher already exists for this month
        const exists = store.feeVouchers.some(
          (v) => v.studentId === student.id && v.month.toLowerCase() === month.toLowerCase()
        );
        if (exists) continue;

        const classObj = store.classes.find((c) => c.id === student.classId);
        const sectionObj = store.sections.find((s) => s.id === student.sectionId);

        const tuitionFee = student.monthlyFee || classObj?.monthlyTuitionFee || 4500;
        const discountAmount = student.discountPercentage ? (tuitionFee * student.discountPercentage) / 100 : 0;
        const annualCharges = Number(includeAnnualCharges) || 0;
        const examFee = Number(includeExamFee) || 0;
        const computerFee = Number(includeComputerFee) || 0;
        const miscCharges = Number(includeMiscCharges) || 0;
        const transportFee = 0;

        const totalPayable = tuitionFee + annualCharges + examFee + computerFee + miscCharges + transportFee - discountAmount;

        const voucherNumber = `VCH-${currentYear}-${(voucherIndex++).toString().padStart(4, '0')}`;

        const newVoucher: FeeVoucher = {
          id: `vch-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          voucherNumber,
          studentId: student.id,
          studentName: student.name,
          registrationNumber: student.registrationNumber,
          classId: student.classId,
          className: classObj?.name || 'Class',
          sectionName: sectionObj?.name || 'A',
          campusId: student.campusId,
          month,
          dueDate,
          issueDate: new Date().toISOString().split('T')[0],
          tuitionFee,
          annualCharges,
          examFee,
          computerFee,
          transportFee,
          miscCharges,
          discountAmount,
          fineAmount: 0,
          totalPayable,
          paidAmount: 0,
          remainingAmount: totalPayable,
          status: 'Unpaid',
        };

        store.feeVouchers.unshift(newVoucher);
        generated.push(newVoucher);
      }

      store.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        userName: 'Accountant',
        userRole: 'Accountant',
        action: 'FEE_GENERATION',
        module: 'Fee Management',
        details: `Generated ${generated.length} fee vouchers for month ${month}`,
        status: 'Success',
      });

      return NextResponse.json({
        success: true,
        message: `Successfully generated ${generated.length} fee vouchers for ${month}`,
        generatedCount: generated.length,
      });
    }

    // Action: Collect / Receive Fee
    if (action === 'collect') {
      const {
        voucherId,
        amountReceived,
        paymentMethod = 'Cash',
        discountApplied = 0,
        fineApplied = 0,
        collectorName = 'Accountant',
      } = body;

      const voucher = store.feeVouchers.find((v) => v.id === voucherId);
      if (!voucher) {
        return NextResponse.json({ error: 'Voucher not found' }, { status: 404 });
      }

      const received = Number(amountReceived);
      const discount = Number(discountApplied);
      const fine = Number(fineApplied);

      if (received <= 0) {
        return NextResponse.json({ error: 'Amount received must be greater than zero' }, { status: 400 });
      }

      voucher.fineAmount += fine;
      voucher.discountAmount += discount;
      voucher.totalPayable = voucher.totalPayable + fine - discount;
      voucher.paidAmount += received;
      voucher.remainingAmount = Math.max(0, voucher.totalPayable - voucher.paidAmount);

      if (voucher.remainingAmount === 0) {
        voucher.status = 'Paid';
      } else {
        voucher.status = 'Partial';
      }

      voucher.paymentDate = new Date().toISOString().split('T')[0];
      voucher.paymentMethod = paymentMethod;
      voucher.collectedBy = collectorName;

      // AUTOMATED DAY BOOK & CASH LEDGER HOOK
      recordFinancialTransaction({
        type: 'INCOME',
        sourceOrCategory: 'Student Fee',
        description: `Fee received from ${voucher.studentName} (${voucher.registrationNumber}) - ${voucher.month}`,
        referenceNo: voucher.voucherNumber,
        amount: received,
        campusId: voucher.campusId,
        performedBy: collectorName,
      });

      return NextResponse.json({ success: true, voucher });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to process fee request' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    const voucher = store.feeVouchers.find((v) => v.id === id);

    if (!voucher) {
      return NextResponse.json({ error: 'Voucher not found' }, { status: 404 });
    }

    // Recompute total if individual charges changed
    if (
      updates.tuitionFee !== undefined ||
      updates.annualCharges !== undefined ||
      updates.examFee !== undefined ||
      updates.computerFee !== undefined ||
      updates.transportFee !== undefined ||
      updates.miscCharges !== undefined ||
      updates.discountAmount !== undefined ||
      updates.fineAmount !== undefined
    ) {
      const tuitionFee = updates.tuitionFee !== undefined ? Number(updates.tuitionFee) : voucher.tuitionFee;
      const annualCharges = updates.annualCharges !== undefined ? Number(updates.annualCharges) : voucher.annualCharges;
      const examFee = updates.examFee !== undefined ? Number(updates.examFee) : voucher.examFee;
      const computerFee = updates.computerFee !== undefined ? Number(updates.computerFee) : voucher.computerFee;
      const transportFee = updates.transportFee !== undefined ? Number(updates.transportFee) : voucher.transportFee;
      const miscCharges = updates.miscCharges !== undefined ? Number(updates.miscCharges) : voucher.miscCharges;
      const discount = updates.discountAmount !== undefined ? Number(updates.discountAmount) : voucher.discountAmount;
      const fine = updates.fineAmount !== undefined ? Number(updates.fineAmount) : voucher.fineAmount;

      const total = tuitionFee + annualCharges + examFee + computerFee + transportFee + miscCharges + fine - discount;
      updates.totalPayable = total;
      updates.remainingAmount = Math.max(0, total - voucher.paidAmount);
      if (updates.remainingAmount === 0 && voucher.paidAmount > 0) {
        updates.status = 'Paid';
      } else if (voucher.paidAmount > 0) {
        updates.status = 'Partial';
      }
    }

    Object.assign(voucher, updates);

    store.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userName: 'Accountant',
      userRole: 'Accountant',
      action: 'FEE_VOUCHER_MODIFIED',
      module: 'Fee Management',
      details: `Modified voucher ${voucher.voucherNumber} for ${voucher.studentName}`,
      status: 'Warning',
    });

    return NextResponse.json(voucher);
  } catch {
    return NextResponse.json({ error: 'Failed to update voucher' }, { status: 500 });
  }
}
