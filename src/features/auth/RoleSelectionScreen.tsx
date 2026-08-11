'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import logoImage from '../../../public/images/logo_nexus_portal.png';

export default function RoleSelectionScreen() {
  const router = useRouter();

  const roles = [
    {
      id: 'ADMIN',
      title: 'Admin / PM',
      description: 'Full access. Manage team, all projects, create announcements, assign tasks.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--navy)' }}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      )
    },
    {
      id: 'DEVELOPER',
      title: 'Developer / Tech',
      description: 'Tasks/tickets, technical docs, deploy status — sees dev-focused stats.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--blue)' }}>
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
      )
    },
    {
      id: 'CLIENT',
      title: 'Client / Stakeholder',
      description: 'Simplified dashboard. Milestones, announcements, progress overview only.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--gold)' }}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    },
    {
      id: 'VIEWER',
      title: 'Viewer',
      description: 'Read-only access. Sees announcements and general project status.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      )
    }
  ];

  const handleSelectRole = (roleId: string) => {
    router.push(`/register?role=${roleId}`);
  };

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-main)', padding: '40px' }}>
      <div style={{ position: 'absolute', top: '32px', left: '40px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src={logoImage.src} alt="Nexus Logo" style={{ width: '28px', height: 'auto' }} />
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--navy)', letterSpacing: '-0.01em', lineHeight: 1.1 }}>Nexus AML</div>
          <div style={{ fontSize: '10px', color: '#4D6A8A', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Portal</div>
        </div>
      </div>
      <div style={{ maxWidth: '1000px', width: '100%' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--navy)', marginBottom: '8px', textAlign: 'center' }}>Choose your role</h2>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '40px', textAlign: 'center' }}>Select how you will be using the Nexus AML Portal</p>
        
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
          {roles.map(role => (
            <div 
              key={role.id}
              onClick={() => handleSelectRole(role.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                width: '220px',
                height: '220px',
                padding: '24px',
                backgroundColor: 'var(--bg-card)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(11,31,58,0.05)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--blue)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(11,31,58,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(11,31,58,0.05)';
              }}
            >
              <div style={{ marginBottom: '16px' }}>{role.icon}</div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--navy)', marginBottom: '8px' }}>{role.title}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{role.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
