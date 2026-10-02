import { NextResponse } from 'next/server';
import { store, recordFinancialTransaction } from '@/lib/data-store';
import { Expense } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campusId = searchParams.get('campusId');
  const categoryId = searchParams.get('categoryId');

  let list = store.expenses;
  if (campusId && campusId !== 'all') {
    list = list.filter((e) => e.campusId === campusId);
  }
  if (categoryId && categoryId !== 'all') {
    list = list.filter((e) => e.categoryId === categoryId);
  }

  return NextResponse.json({
    expenses: list,
    categories: store.expenseCategories,
    totalAmount: list.reduce((acc, e) => acc + e.amount, 0),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // Approve / Reject expense
    if (action === 'updateStatus') {
      const { expenseId, status } = body;
      const expense = store.expenses.find((e) => e.id === expenseId);
      if (!expense) return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
      expense.status = status;
      return NextResponse.json(expense);
    }

    const category = store.expenseCategories.find((c) => c.id === body.categoryId);
    const voucherNumber = `EXP-2026-${(store.expenses.length + 91).toString().padStart(4, '0')}`;

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      voucherNumber,
      date: body.date || new Date().toISOString().split('T')[0],
      categoryId: body.categoryId,
      categoryName: category?.name || 'General Expense',
      description: body.description,
      amount: Number(body.amount),
      campusId: body.campusId || store.campuses[0].id,
      paymentMethod: body.paymentMethod || 'Cash',
      status: 'Approved',
      recordedBy: body.recordedBy || 'Accountant',
    };

    store.expenses.unshift(newExpense);

    // AUTOMATED DAY BOOK & CASH LEDGER HOOK
    recordFinancialTransaction({
      type: 'EXPENSE',
      sourceOrCategory: newExpense.categoryName,
      description: newExpense.description,
      referenceNo: newExpense.voucherNumber,
      amount: newExpense.amount,
      campusId: newExpense.campusId,
      performedBy: newExpense.recordedBy,
    });

    return NextResponse.json(newExpense);
  } catch {
    return NextResponse.json({ error: 'Failed to record expense' }, { status: 500 });
  }
}
