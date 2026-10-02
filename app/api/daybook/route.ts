import { NextResponse } from 'next/server';
import { store } from '@/lib/data-store';
import { DayBookEntry } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campusId = searchParams.get('campusId');
  const date = searchParams.get('date');

  let entries = store.dayBook;

  if (campusId && campusId !== 'all') {
    entries = entries.filter((d) => d.campusId === campusId);
  }

  if (date) {
    entries = entries.filter((d) => d.date === date);
  }

  // Summary aggregation
  const totalOpening = entries.length > 0 ? entries[entries.length - 1].openingBalance : 0;
  const totalFee = entries.reduce((acc, d) => acc + d.feeCollection, 0);
  const totalAdmission = entries.reduce((acc, d) => acc + d.admissionIncome, 0);
  const totalBookSales = entries.reduce((acc, d) => acc + d.bookSalesIncome, 0);
  const totalOther = entries.reduce((acc, d) => acc + d.otherIncome, 0);
  const totalIncome = entries.reduce((acc, d) => acc + d.totalIncome, 0);
  const totalExpense = entries.reduce((acc, d) => acc + d.totalExpense, 0);
  const netClosing = entries.length > 0 ? entries[0].closingBalance : 0;

  return NextResponse.json({
    entries,
    summary: {
      totalOpening,
      totalFee,
      totalAdmission,
      totalBookSales,
      totalOther,
      totalIncome,
      totalExpense,
      netClosing,
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, campusId, manualOpeningBalance } = body;

    const existing = store.dayBook.find((d) => d.date === date && d.campusId === campusId);

    if (existing) {
      if (manualOpeningBalance !== undefined) {
        existing.openingBalance = Number(manualOpeningBalance);
        existing.closingBalance =
          existing.openingBalance + existing.totalIncome - existing.totalExpense;
      }
      existing.isReconciled = true;
      return NextResponse.json(existing);
    }

    const newEntry: DayBookEntry = {
      id: `db-${Date.now()}`,
      date,
      campusId,
      openingBalance: Number(manualOpeningBalance) || 0,
      feeCollection: 0,
      admissionIncome: 0,
      bookSalesIncome: 0,
      otherIncome: 0,
      totalIncome: 0,
      totalExpense: 0,
      closingBalance: Number(manualOpeningBalance) || 0,
      transactionsCount: 0,
      isReconciled: true,
    };

    store.dayBook.unshift(newEntry);
    return NextResponse.json(newEntry);
  } catch {
    return NextResponse.json({ error: 'Failed to update daybook' }, { status: 500 });
  }
}
