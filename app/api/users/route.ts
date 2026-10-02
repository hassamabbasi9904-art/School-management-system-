import { NextResponse } from 'next/server';
import { store, DEFAULT_PERMISSIONS } from '@/lib/data-store';
import { User, UserRole } from '@/types';

export async function GET() {
  return NextResponse.json({
    users: store.users,
    roles: [
      'Super Admin',
      'Admin',
      'Accountant',
      'Principal',
      'Teacher',
      'Receptionist',
      'Parent',
    ],
    permissions: DEFAULT_PERMISSIONS,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: body.name,
      email: body.email,
      role: body.role as UserRole,
      campusId: body.campusId || 'all',
      phone: body.phone,
      status: body.status || 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    store.users.push(newUser);

    store.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userName: 'Super Admin',
      userRole: 'Super Admin',
      action: 'USER_CREATED',
      module: 'User Management',
      details: `Created new system user ${newUser.name} with role ${newUser.role}`,
      status: 'Success',
    });

    return NextResponse.json(newUser);
  } catch {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
