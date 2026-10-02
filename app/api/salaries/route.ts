import { NextResponse } from 'next/server';
import { store, recordFinancialTransaction } from '@/lib/data-store';
import { SalaryPayment } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campusId = searchParams.get('campusId');
  const month = searchParams.get('month');

  let list = store.salaries;
  if (campusId && campusId !== 'all') {
    list = list.filter((s) => s.campusId === campusId);
  }
  if (month && month !== 'all') {
    list = list.filter((s) => s.month.toLowerCase() === month.toLowerCase());
  }

  return NextResponse.json({
    salaries: list,
    totalDisbursed: list.filter((s) => s.status === 'Paid').reduce((acc, s) => acc + s.netSalary, 0),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // Action: Generate Monthly Payroll for all or campus staff
    if (action === 'generatePayroll') {
      const { month = 'September 2026', campusId = 'all' } = body;
      let targetStaff = store.staff.filter((s) => s.status === 'Active');
      if (campusId !== 'all') {
        targetStaff = targetStaff.filter((s) => s.campusId === campusId);
      }

      const generated: SalaryPayment[] = [];
      let seq = store.salaries.length + 1;

      for (const st of targetStaff) {
        const exists = store.salaries.some(
          (s) => s.staffId === st.id && s.month.toLowerCase() === month.toLowerCase()
        );
        if (exists) continue;

        const slipNumber = `SAL-2026-${(seq++).toString().padStart(4, '0')}`;
        const newSalary: SalaryPayment = {
          id: `sal-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          slipNumber,
          staffId: st.id,
          staffName: st.name,
          designation: st.designation,
          month,
          baseSalary: st.salary,
          allowances: 0,
          deductions: 0,
          netSalary: st.salary,
          paymentDate: new Date().toISOString().split('T')[0],
          paymentMethod: 'Bank Transfer',
          status: 'Pending',
          campusId: st.campusId,
          paidBy: 'Accounts Dept',
        };

        store.salaries.unshift(newSalary);
        generated.push(newSalary);
      }

      return NextResponse.json({
        success: true,
        message: `Generated payroll for ${generated.length} staff members for ${month}`,
        generatedCount: generated.length,
      });
    }

    // Action: Disburse / Pay Salary
    if (action === 'paySalary') {
      const { salaryId, paymentMethod = 'Bank Transfer', allowances = 0, deductions = 0, paidBy = 'Accountant' } = body;
      const salary = store.salaries.find((s) => s.id === salaryId);
      if (!salary) return NextResponse.json({ error: 'Salary record not found' }, { status: 404 });

      salary.allowances = Number(allowances);
      salary.deductions = Number(deductions);
      salary.netSalary = salary.baseSalary + salary.allowances - salary.deductions;
      salary.paymentDate = new Date().toISOString().split('T')[0];
      salary.paymentMethod = paymentMethod;
      salary.status = 'Paid';
      salary.paidBy = paidBy;

      // AUTOMATED EXPENSE & DAY BOOK HOOK
      const expenseVoucherNumber = `EXP-SAL-${salary.slipNumber}`;
      store.expenses.unshift({
        id: `exp-${Date.now()}`,
        voucherNumber: expenseVoucherNumber,
        date: salary.paymentDate,
        categoryId: 'cat-1',
        categoryName: 'Salaries',
        description: `Salary disbursement for ${salary.staffName} (${salary.designation}) for ${salary.month}`,
        amount: salary.netSalary,
        campusId: salary.campusId,
        paymentMethod,
        status: 'Approved',
        recordedBy: paidBy,
      });

      recordFinancialTransaction({
        type: 'EXPENSE',
        sourceOrCategory: 'Salaries',
        description: `Salary paid to ${salary.staffName} (${salary.month})`,
        referenceNo: salary.slipNumber,
        amount: salary.netSalary,
        campusId: salary.campusId,
        performedBy: paidBy,
      });

      return NextResponse.json({ success: true, salary });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to process salary request' }, { status: 500 });
  }
}
