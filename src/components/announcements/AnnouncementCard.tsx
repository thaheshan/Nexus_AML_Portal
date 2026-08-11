'use client';

import React from 'react';
import Badge from '../common/Badge';
import Link from 'next/link';

interface AnnouncementCardProps {
  id: string;
  title: string;
  category: string;
  message: string;
  author: { name: string; role: string };
  createdAt: string;
}

export default function AnnouncementCard({ id, title, category, message, author, createdAt }: AnnouncementCardProps) {
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  
  // Format date relative or actual
  const dateObj = new Date(createdAt);
  const now = new Date();
  const diffHours = Math.abs(now.getTime() - dateObj.getTime()) / 36e5;
  
  let timeStr = '';
  if (diffHours < 24) {
    if (diffHours < 1) timeStr = 'Just now';
    else timeStr = `${Math.floor(diffHours)} hours ago`;
  } else {
    timeStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <Link href={`/announcements/${id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#3B82F6';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(11,31,58,0.05)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#E5E7EB';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
      }}>
        <Badge label={category} />
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0B1F3A', marginBottom: '8px' }}>{title}</h3>
        <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.5, marginBottom: '24px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {message}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#1E3A5F', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600 }}>
              {getInitials(author.name)}
            </div>
            <span style={{ fontSize: '12px', color: '#374151', fontWeight: 500 }}>{author.name}</span>
          </div>
          <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{timeStr}</span>
        </div>
      </div>
    </Link>
  );
}
