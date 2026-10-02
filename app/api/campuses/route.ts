import { NextResponse } from 'next/server';
import { store } from '@/lib/data-store';
import { Campus } from '@/types';

export async function GET() {
  const campusesWithStats = store.campuses.map((camp) => {
    const studentCount = store.students.filter((s) => s.campusId === camp.id).length;
    const staffCount = store.staff.filter((st) => st.campusId === camp.id).length;
    const vouchers = store.feeVouchers.filter((v) => v.campusId === camp.id);
    const feeCollected = vouchers.reduce((acc, v) => acc + v.paidAmount, 0);
    const expenses = store.expenses.filter((e) => e.campusId === camp.id).reduce((acc, e) => acc + e.amount, 0);
    const directIncome = store.incomes.filter((i) => i.campusId === camp.id).reduce((acc, i) => acc + i.amount, 0);
    const bookSales = store.bookSaleSlips.filter((b) => b.campusId === camp.id).reduce((acc, b) => acc + b.paidAmount, 0);

    return {
      ...camp,
      studentCount,
      staffCount,
      feeCollected,
      totalIncome: feeCollected + directIncome + bookSales,
      totalExpenses: expenses,
    };
  });

  return NextResponse.json(campusesWithStats);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newCampus: Campus = {
      id: `camp-${Date.now()}`,
      name: body.name,
      code: body.code.toUpperCase(),
      address: body.address,
      phone: body.phone,
      email: body.email,
      principalName: body.principalName || '',
      status: body.status || 'active',
      cashBalance: Number(body.initialCashBalance) || 0,
    };

    store.campuses.push(newCampus);

    store.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userName: 'Super Admin',
      userRole: 'Super Admin',
      action: 'CAMPUS_CREATED',
      module: 'Campus Management',
      details: `Created new campus: ${newCampus.name} (${newCampus.code})`,
      status: 'Success',
    });

    return NextResponse.json(newCampus);
  } catch {
    return NextResponse.json({ error: 'Failed to create campus' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    const campus = store.campuses.find((c) => c.id === id);

    if (!campus) return NextResponse.json({ error: 'Campus not found' }, { status: 404 });
    Object.assign(campus, updates);

    return NextResponse.json(campus);
  } catch {
    return NextResponse.json({ error: 'Failed to update campus' }, { status: 500 });
  }
}
