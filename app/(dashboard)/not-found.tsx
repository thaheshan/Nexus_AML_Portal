'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      minHeight: '60vh',
      textAlign: 'center',
      padding: '48px 24px',
    }}>
      {/* Map / Lost Icon */}
      <div style={{ marginBottom: '24px', color: '#CBD5E1' }}>
        <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
          <line x1="9" y1="3" x2="9" y2="18"/>
          <line x1="15" y1="6" x2="15" y2="21"/>
        </svg>
      </div>

      <h1 style={{
        fontSize: '56px',
        fontWeight: 800,
        color: '#0B1F3A',
        letterSpacing: '-2px',
        lineHeight: 1,
        marginBottom: '12px',
      }}>
        404
      </h1>

      <h2 style={{
        fontSize: '18px',
        fontWeight: 600,
        color: '#0B1F3A',
        marginBottom: '12px',
      }}>
        Page not found
      </h2>

      <p style={{
        fontSize: '14px',
        color: '#6B7280',
        maxWidth: '280px',
        lineHeight: 1.6,
        marginBottom: '32px',
      }}>
        The page you're looking for doesn't exist or may have been moved.
      </p>

      <button
        onClick={() => router.push('/dashboard')}
        style={{
          padding: '11px 24px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: '#0B1F3A',
          color: '#FFFFFF',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        Back to Dashboard
      </button>
    </div>
  );
}
