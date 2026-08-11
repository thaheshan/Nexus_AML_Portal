'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { RootState } from '@/store/store';
import { useLogoutMutation, useGetMeQuery } from '@/store/services/apiService';
import Link from 'next/link';
import AuthRehydrator from '@/components/AuthRehydrator';

// ─── SVG Nav Icons ─────────────────────────────────────────────────────────
const Icons = {
  Dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  Cases: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  Announcements: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  Alerts: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Reports: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  ),
  Docs: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  Deploy: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  Milestones: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Settings: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
    </svg>
  ),
  Logout: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Bell: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
};

// ─── Full Nav Definition ────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'dashboard',     label: 'Dashboard',      path: '/dashboard',     icon: Icons.Dashboard,     roles: ['ADMIN', 'DEVELOPER', 'CLIENT', 'VIEWER'] },
  { id: 'cases',         label: 'Cases',           path: '/cases',         icon: Icons.Cases,         roles: ['ADMIN', 'DEVELOPER', 'CLIENT', 'VIEWER'] },
  { id: 'announcements', label: 'Announcements',   path: '/announcements', icon: Icons.Announcements, roles: ['ADMIN', 'CLIENT', 'VIEWER'] },
  { id: 'alerts',        label: 'Alerts',          path: '/alerts',        icon: Icons.Alerts,        roles: ['ADMIN', 'DEVELOPER', 'CLIENT', 'VIEWER'] },
  { id: 'reports',       label: 'Reports',         path: '/reports',       icon: Icons.Reports,       roles: ['ADMIN', 'DEVELOPER', 'CLIENT', 'VIEWER'] },

  { id: 'deployments',   label: 'Deploy Status',   path: '/deployments',   icon: Icons.Deploy,        roles: ['DEVELOPER'] },
  { id: 'milestones',    label: 'Milestones',      path: '/milestones',    icon: Icons.Milestones,    roles: ['CLIENT'] },
  { id: 'settings',      label: 'Settings',        path: '/settings',      icon: Icons.Settings,      roles: ['ADMIN'] },
];

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function DashboardScreen({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  const user = useSelector((state: RootState) => state.auth.user);
  const role = user?.role || 'VIEWER';

  const [logoutApi] = useLogoutMutation();
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  // Fetch full profile so header avatar reflects uploaded picture
  const { data: profile } = useGetMeQuery();

  const handleLogout = async () => {
    try { await logoutApi().unwrap(); } catch {}
    dispatch(logout());
    router.push('/login');
  };

  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(role));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F5F7FA', fontFamily: 'Inter, sans-serif' }}>
      <AuthRehydrator />

      {/* ── Sidebar ── */}
      <aside style={{
        width: '220px',
        minWidth: '220px',
        backgroundColor: '#0B1F3A',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 100,
      }}>

        {/* Logo */}
        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.01em' }}>Nexus AML</div>
          <div style={{ fontSize: '10px', color: '#4D6A8A', marginTop: '2px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Portal</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
          {visibleItems.map(item => {
            const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path));
            return (
              <Link
                key={item.id}
                href={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: isActive ? '#FFFFFF' : '#6B8CAE',
                  backgroundColor: isActive ? 'rgba(59,130,246,0.18)' : 'transparent',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '13.5px',
                  transition: 'all 0.15s ease',
                  borderLeft: isActive ? '3px solid #3B82F6' : '3px solid transparent',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <item.icon />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Profile + Logout */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', padding: '8px 12px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              backgroundColor: '#1E3A5F',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 700, color: '#FFFFFF', flexShrink: 0,
            }}>
              {getInitials(user?.name || 'U')}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'User'}
              </div>
              <div style={{ fontSize: '10px', color: '#4D6A8A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{role}</div>
            </div>
            <button
              onClick={() => setShowLogoutModal(true)}
              title="Logout"
              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#4D6A8A', padding: '4px', flexShrink: 0, transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#FFFFFF'}
              onMouseLeave={e => e.currentTarget.style.color = '#4D6A8A'}
            >
              <Icons.Logout />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div style={{ flex: 1, marginLeft: '220px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* Topbar */}
        <header style={{
          height: '60px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#F5F7FA', borderRadius: '8px', padding: '8px 14px', width: '280px', border: '1px solid #E5E7EB' }}>
            <Icons.Search />
            <input
              type="text"
              placeholder="Search cases, announcements..."
              style={{ border: 'none', background: 'none', outline: 'none', fontSize: '13px', color: '#374151', width: '100%' }}
            />
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', position: 'relative', padding: '6px' }}>
              <Icons.Bell />
              <span style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', backgroundColor: '#EF4444', borderRadius: '50%', border: '2px solid #FFFFFF' }}/>
            </button>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#1E3A5F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#FFFFFF', cursor: 'pointer', overflow: 'hidden', flexShrink: 0 }}>
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                getInitials(user?.name || 'U')
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
      {/* ── Logout Confirmation Modal ── */}
      {showLogoutModal && (
        <div
          onClick={() => setShowLogoutModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            backgroundColor: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(2px)',
            animation: 'fadeIn 0.15s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '36px 32px',
              width: '100%',
              maxWidth: '360px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              textAlign: 'center',
              animation: 'slideUp 0.2s ease',
            }}
          >
            {/* Icon */}
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%',
              backgroundColor: '#F0F4FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px auto',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2E6BFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>

            {/* Title */}
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0B1F3A', marginBottom: '8px' }}>
              Sign out of Nexus?
            </h2>

            {/* Subtitle */}
            <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.6, marginBottom: '28px' }}>
              You'll need to sign in again to access your account.
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{
                  flex: 1, padding: '11px', borderRadius: '8px',
                  border: '1px solid #E5E7EB', background: '#FFFFFF',
                  fontSize: '14px', fontWeight: 500, color: '#374151',
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                style={{
                  flex: 1, padding: '11px', borderRadius: '8px',
                  border: 'none', background: '#0B1F3A',
                  fontSize: '14px', fontWeight: 600, color: '#FFFFFF',
                  cursor: 'pointer', transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  );
}
