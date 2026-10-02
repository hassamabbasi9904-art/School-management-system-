import { NextResponse } from 'next/server';
import { store } from '@/lib/data-store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campusId = searchParams.get('campusId');

  let ledger = store.cashLedger;
  if (campusId && campusId !== 'all') {
    ledger = ledger.filter((item) => item.campusId === campusId);
  }

  const campuses = store.campuses;
  const currentCash =
    campusId && campusId !== 'all'
      ? campuses.find((c) => c.id === campusId)?.cashBalance || 0
      : campuses.reduce((acc, c) => acc + c.cashBalance, 0);

  const totalIncome = ledger.filter((l) => l.type === 'INCOME').reduce((acc, l) => acc + l.amount, 0);
  const totalExpense = ledger.filter((l) => l.type === 'EXPENSE').reduce((acc, l) => acc + l.amount, 0);

  // Daily cash flow aggregation for last 7 days
  const dailyFlowMap = new Map<string, { income: number; expense: number }>();
  ledger.forEach((tx) => {
    const entry = dailyFlowMap.get(tx.date) || { income: 0, expense: 0 };
    if (tx.type === 'INCOME') entry.income += tx.amount;
    else entry.expense += tx.amount;
    dailyFlowMap.set(tx.date, entry);
  });

  const flowList = Array.from(dailyFlowMap.entries()).map(([date, data]) => ({
    date,
    income: data.income,
    expense: data.expense,
    net: data.income - data.expense,
  }));

  // Campus-wise cash distribution
  const campusDistribution = campuses.map((camp) => ({
    campusId: camp.id,
    campusName: camp.name,
    code: camp.code,
    cashBalance: camp.cashBalance,
  }));

  return NextResponse.json({
    currentCash,
    totalIncome,
    totalExpense,
    ledger,
    flowList,
    campusDistribution,
  });
}
