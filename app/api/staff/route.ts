import { NextResponse } from 'next/server';
import { store } from '@/lib/data-store';
import { StaffMember } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const campusId = searchParams.get('campusId');
  const staffType = searchParams.get('type');

  let list = store.staff;
  if (campusId && campusId !== 'all') {
    list = list.filter((s) => s.campusId === campusId);
  }
  if (staffType && staffType !== 'all') {
    list = list.filter((s) => s.staffType === staffType);
  }

  return NextResponse.json(list);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newStaff: StaffMember = {
      id: `stf-${Date.now()}`,
      name: body.name,
      designation: body.designation,
      staffType: body.staffType || 'Teacher',
      cnic: body.cnic,
      contact: body.contact,
      email: body.email || '',
      joiningDate: body.joiningDate || new Date().toISOString().split('T')[0],
      salary: Number(body.salary) || 50000,
      campusId: body.campusId || store.campuses[0].id,
      status: body.status || 'Active',
    };

    store.staff.unshift(newStaff);

    store.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userName: 'Admin',
      userRole: 'Admin',
      action: 'STAFF_ADDED',
      module: 'Staff Management',
      details: `Added new staff ${newStaff.name} (${newStaff.designation})`,
      status: 'Success',
    });

    return NextResponse.json(newStaff);
  } catch {
    return NextResponse.json({ error: 'Failed to add staff member' }, { status: 500 });
  }
}
