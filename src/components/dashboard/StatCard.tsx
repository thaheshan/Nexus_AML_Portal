'use client';

import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  change: string;
  positive: boolean;
  neutral?: boolean;
}

export default function StatCard({ label, value, change, positive, neutral }: StatCardProps) {
  const changeColor = neutral ? '#6B7280' : positive ? '#10B981' : '#EF4444';
  const arrow = neutral ? '→' : positive ? '↑' : '↓';

  return (
    <div style={{
      flex: 1,
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid #E5E7EB',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px', fontWeight: 500 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '36px', fontWeight: 700, color: '#0B1F3A', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '12px', fontWeight: 600, color: changeColor, display: 'flex', alignItems: 'center', gap: '2px', marginBottom: '4px' }}>
          <span>{arrow}</span>
          <span>{change}</span>
        </div>
      </div>
    </div>
  );
}
