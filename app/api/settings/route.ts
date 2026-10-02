import { NextResponse } from 'next/server';
import { store } from '@/lib/data-store';
import { AcademicSession } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'backup') {
    // Generate full JSON snapshot
    return NextResponse.json({
      exportDate: new Date().toISOString(),
      version: '1.0.0-enterprise',
      data: store,
    });
  }

  return NextResponse.json({
    settings: store.settings,
    sessions: store.academicSessions,
    auditLogs: store.auditLogs,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'updateSettings') {
      Object.assign(store.settings, body.settings);
      store.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        userName: 'Super Admin',
        userRole: 'Super Admin',
        action: 'SETTINGS_UPDATED',
        module: 'System Settings',
        details: 'Updated global school settings and contact info',
        status: 'Success',
      });
      return NextResponse.json(store.settings);
    }

    if (action === 'addSession') {
      const newSession: AcademicSession = {
        id: `sess-${Date.now()}`,
        name: body.name,
        startDate: body.startDate,
        endDate: body.endDate,
        isCurrent: Boolean(body.isCurrent),
      };
      if (newSession.isCurrent) {
        store.academicSessions.forEach((s) => (s.isCurrent = false));
        store.settings.currentSession = newSession.name;
      }
      store.academicSessions.push(newSession);
      return NextResponse.json(newSession);
    }

    if (action === 'restoreBackup') {
      const { backupData } = body;
      if (!backupData) return NextResponse.json({ error: 'Invalid backup file' }, { status: 400 });

      Object.assign(store, backupData);
      store.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        userName: 'Super Admin',
        userRole: 'Super Admin',
        action: 'DATABASE_RESTORE',
        module: 'Backup & Restore',
        details: 'System restored from backup snapshot',
        status: 'Warning',
      });
      return NextResponse.json({ success: true, message: 'Database restored successfully' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to process settings request' }, { status: 500 });
  }
}
