'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { RootState } from '@/store/store';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLogoutMutation } from '@/store/services/apiService';

export default function DashboardScreen({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  
  const user = useSelector((state: RootState) => state.auth.user);
  const role = user?.role || 'VIEWER';
  
  const [logoutApi] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap(); // Call backend to destroy HttpOnly cookie
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      dispatch(logout()); // Clear Redux state
      router.push('/login'); // Redirect to login
    }
  };

  // Define full menu items
  const menuItems = [
    { id: 'announcements', label: 'Announcements', path: '/announcements', roles: ['ADMIN', 'CLIENT', 'VIEWER'] },
    { id: 'cases', label: 'Cases / Tasks', path: '/cases', roles: ['ADMIN', 'DEVELOPER'] },
    { id: 'alerts', label: 'Alerts', path: '/alerts', roles: ['ADMIN'] },
    { id: 'reports', label: 'Reports', path: '/reports', roles: ['ADMIN'] },
    { id: 'docs', label: 'Technical Docs', path: '/docs', roles: ['ADMIN', 'DEVELOPER'] },
    { id: 'deployments', label: 'Deploy Status', path: '/deployments', roles: ['DEVELOPER'] },
    { id: 'milestones', label: 'Milestones', path: '/milestones', roles: ['CLIENT'] },
  ];

  // Filter based on user's role
  const visibleItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      {/* Sidebar */}
      <div style={{ width: '240px', backgroundColor: 'var(--navy)', color: 'white', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Nexus AML</h2>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '40px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {user?.name} <br/>
          <span style={{ color: 'var(--gold)' }}>Role: {role}</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {visibleItems.map(item => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.id} 
                href={item.path}
                style={{ 
                  padding: '10px 12px', 
                  backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  textDecoration: 'none',
                  color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                  fontWeight: isActive ? 600 : 400,
                  transition: 'background-color 0.2s'
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <button onClick={handleLogout} style={{ marginTop: 'auto', background: 'transparent', border: 'none', color: 'var(--text-muted)', textAlign: 'left', cursor: 'pointer', padding: '8px 12px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#FFFFFF'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
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
