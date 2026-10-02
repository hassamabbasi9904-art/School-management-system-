import { NextResponse } from 'next/server';
import { store, DEFAULT_PERMISSIONS } from '@/lib/data-store';
import { UserRole } from '@/types';

// Default session is Super Admin
let currentSessionUser = store.users[0];

export async function GET() {
  return NextResponse.json({
    user: currentSessionUser,
    permissions: DEFAULT_PERMISSIONS[currentSessionUser.role as UserRole],
    allUsers: store.users,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, role } = body;

    if (userId) {
      const user = store.users.find((u) => u.id === userId);
      if (user) {
        currentSessionUser = user;
        return NextResponse.json({
          success: true,
          user: currentSessionUser,
          permissions: DEFAULT_PERMISSIONS[currentSessionUser.role as UserRole],
        });
      }
    }

    if (role && DEFAULT_PERMISSIONS[role as UserRole]) {
      // Find or create virtual user for this role
      let user = store.users.find((u) => u.role === role);
      if (!user) {
        user = {
          id: `usr-${role.toLowerCase().replace(/\s+/g, '-')}`,
          name: `${role} Demo User`,
          email: `${role.toLowerCase().replace(/\s+/g, '')}@educore.edu.pk`,
          role: role as UserRole,
          campusId: 'camp-1',
          status: 'active',
          createdAt: new Date().toISOString(),
        };
      }
      currentSessionUser = user;
      return NextResponse.json({
        success: true,
        user: currentSessionUser,
        permissions: DEFAULT_PERMISSIONS[role as UserRole],
      });
    }

    return NextResponse.json({ error: 'Invalid user or role' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}
