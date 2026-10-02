import { NextResponse } from 'next/server';
import { store } from '@/lib/data-store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campusId = searchParams.get('campusId') || 'all';

  const students = campusId === 'all' ? store.students : store.students.filter((s) => s.campusId === campusId);
  const vouchers = campusId === 'all' ? store.feeVouchers : store.feeVouchers.filter((v) => v.campusId === campusId);
  const expenses = campusId === 'all' ? store.expenses : store.expenses.filter((e) => e.campusId === campusId);
  const incomes = campusId === 'all' ? store.incomes : store.incomes.filter((i) => i.campusId === campusId);
  const bookSlips = campusId === 'all' ? store.bookSaleSlips : store.bookSaleSlips.filter((b) => b.campusId === campusId);
  const salaries = campusId === 'all' ? store.salaries : store.salaries.filter((s) => s.campusId === campusId);
  const books = campusId === 'all' ? store.books : store.books.filter((b) => b.campusId === campusId);

  // Financial Summary (Profit & Loss)
  const totalFeeCollected = vouchers.reduce((acc, v) => acc + v.paidAmount, 0);
  const totalBookSales = bookSlips.reduce((acc, b) => acc + b.totalAmount, 0);
  const totalOtherIncome = incomes.reduce((acc, i) => acc + i.amount, 0);
  const grossIncome = totalFeeCollected + totalBookSales + totalOtherIncome;

  const totalDirectExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalSalariesPaid = salaries.filter((s) => s.status === 'Paid').reduce((acc, s) => acc + s.netSalary, 0);
  const totalExpenses = totalDirectExpenses; // Note: salary disbursement already creates an Expense record

  const netSurplusOrDeficit = grossIncome - totalExpenses;

  // Class-wise collection breakdown
  const classBreakdownMap = new Map<string, { className: string; target: number; collected: number; pending: number }>();
  store.classes.forEach((c) => {
    classBreakdownMap.set(c.id, { className: c.name, target: 0, collected: 0, pending: 0 });
  });

  vouchers.forEach((v) => {
    const entry = classBreakdownMap.get(v.classId) || { className: v.className, target: 0, collected: 0, pending: 0 };
    entry.target += v.totalPayable;
    entry.collected += v.paidAmount;
    entry.pending += v.remainingAmount;
    classBreakdownMap.set(v.classId, entry);
  });

  // Expense by category
  const expenseByCategoryMap = new Map<string, number>();
  expenses.forEach((e) => {
    const current = expenseByCategoryMap.get(e.categoryName) || 0;
    expenseByCategoryMap.set(e.categoryName, current + e.amount);
  });

  const expenseCategoryBreakdown = Array.from(expenseByCategoryMap.entries()).map(([name, value]) => ({
    name,
    value,
  }));

  return NextResponse.json({
    pnl: {
      totalFeeCollected,
      totalBookSales,
      totalOtherIncome,
      grossIncome,
      totalExpenses,
      totalSalariesPaid,
      netSurplusOrDeficit,
    },
    classBreakdown: Array.from(classBreakdownMap.values()),
    expenseCategoryBreakdown,
    studentSummary: {
      totalActive: students.filter((s) => s.status === 'Active').length,
      totalLeft: students.filter((s) => s.status === 'Left').length,
      totalDiscounted: students.filter((s) => (s.discountPercentage || 0) > 0).length,
    },
    inventorySummary: {
      totalTitles: books.length,
      totalUnitsInStock: books.reduce((acc, b) => acc + b.stockQuantity, 0),
      stockValuation: books.reduce((acc, b) => acc + b.stockQuantity * b.unitPrice, 0),
    },
  });
}
