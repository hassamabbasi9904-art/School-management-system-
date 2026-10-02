import { NextResponse } from 'next/server';
import { store, recordFinancialTransaction } from '@/lib/data-store';
import { Income } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campusId = searchParams.get('campusId');
  const source = searchParams.get('source');

  let list = store.incomes;
  if (campusId && campusId !== 'all') {
    list = list.filter((i) => i.campusId === campusId);
  }
  if (source && source !== 'all') {
    list = list.filter((i) => i.source.toLowerCase() === source.toLowerCase());
  }

  return NextResponse.json({
    incomes: list,
    totalAmount: list.reduce((acc, i) => acc + i.amount, 0),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const receiptNumber = `INC-2026-${(store.incomes.length + 1).toString().padStart(4, '0')}`;

    const newIncome: Income = {
      id: `inc-${Date.now()}`,
      receiptNumber,
      date: body.date || new Date().toISOString().split('T')[0],
      source: body.source || 'Other Income',
      description: body.description,
      amount: Number(body.amount),
      campusId: body.campusId || store.campuses[0].id,
      paymentMethod: body.paymentMethod || 'Cash',
      recordedBy: body.recordedBy || 'Accounts Desk',
    };

    store.incomes.unshift(newIncome);

    // AUTOMATED DAY BOOK & CASH LEDGER HOOK
    recordFinancialTransaction({
      type: 'INCOME',
      sourceOrCategory: newIncome.source,
      description: newIncome.description,
      referenceNo: newIncome.receiptNumber,
      amount: newIncome.amount,
      campusId: newIncome.campusId,
      performedBy: newIncome.recordedBy,
    });

    return NextResponse.json(newIncome);
  } catch {
    return NextResponse.json({ error: 'Failed to record income' }, { status: 500 });
  }
}
