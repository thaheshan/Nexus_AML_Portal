'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { logout } from '@/store/slices/authSlice';

export default function DashboardScreen({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = () => {
    document.cookie = 'token=; Max-Age=0; path=/';
    dispatch(logout());
    router.push('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      {/* Sidebar */}
      <div style={{ width: '240px', backgroundColor: 'var(--navy)', color: 'white', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '40px' }}>Nexus AML</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
          <div style={{ padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer' }}>Announcements</div>
          {/* Add more nav items here */}
        </nav>
        <button onClick={handleLogout} style={{ marginTop: 'auto', background: 'transparent', border: 'none', color: 'var(--text-muted)', textAlign: 'left', cursor: 'pointer', padding: '8px 12px' }}>
          Logout
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <header style={{ height: '64px', backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', padding: '0 32px' }}>
          <div style={{ fontWeight: 500 }}>Dashboard</div>
        </header>

        {/* Page Content */}
        <main style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
