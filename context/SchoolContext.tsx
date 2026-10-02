'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Campus, User, UserRole, PermissionMatrix, NotificationItem } from '@/types';
import { DEFAULT_PERMISSIONS } from '@/lib/data-store';

interface PrintModalPayload {
  type: 'fee' | 'salary' | 'report_card' | 'leaving_cert' | 'daybook' | 'book_slip';
  data: any;
}

interface SchoolContextType {
  activeCampusId: string;
  setActiveCampusId: (id: string) => void;
  campuses: Campus[];
  activeCampus: Campus | null;
  currentUser: User | null;
  userPermissions: PermissionMatrix;
  activeNav: string;
  setActiveNav: (nav: string) => void;
  switchRole: (role: UserRole) => Promise<void>;
  switchUser: (userId: string) => Promise<void>;
  refreshAll: () => Promise<void>;
  isLoading: boolean;
  printModal: PrintModalPayload | null;
  setPrintModal: (modal: PrintModalPayload | null) => void;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export function SchoolProvider({ children }: { children: ReactNode }) {
  const [activeCampusId, setActiveCampusId] = useState<string>('all');
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userPermissions, setUserPermissions] = useState<PermissionMatrix>(DEFAULT_PERMISSIONS['Super Admin']);
  const [activeNav, setActiveNav] = useState<string>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [printModal, setPrintModal] = useState<PrintModalPayload | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const fetchSessionAndCampuses = useCallback(async () => {
    try {
      setIsLoading(true);
      const [sessionRes, campusesRes] = await Promise.all([
        fetch('/api/auth/session'),
        fetch('/api/campuses'),
      ]);

      if (sessionRes.ok) {
        const sData = await sessionRes.json();
        setCurrentUser(sData.user);
        if (sData.permissions) {
          setUserPermissions(sData.permissions);
        }
      }

      if (campusesRes.ok) {
        const cData = await campusesRes.json();
        setCampuses(cData);
      }
    } catch (e) {
      console.error('Failed to load initial data', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessionAndCampuses();
  }, [fetchSessionAndCampuses]);

  const switchRole = async (role: UserRole) => {
    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setUserPermissions(data.permissions);
      }
    } catch (e) {
      console.error('Failed to switch role', e);
    }
  };

  const switchUser = async (userId: string) => {
    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setUserPermissions(data.permissions);
      }
    } catch (e) {
      console.error('Failed to switch user', e);
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const activeCampus =
    activeCampusId === 'all'
      ? null
      : campuses.find((c) => c.id === activeCampusId) || null;

  return (
    <SchoolContext.Provider
      value={{
        activeCampusId,
        setActiveCampusId,
        campuses,
        activeCampus,
        currentUser,
        userPermissions,
        activeNav,
        setActiveNav,
        switchRole,
        switchUser,
        refreshAll: fetchSessionAndCampuses,
        isLoading,
        printModal,
        setPrintModal,
        notifications,
        markNotificationRead,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
}

export function useSchool() {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
}
