'use client';

import React, { useState } from 'react';

const MILESTONES = [
  { id: 1, title: 'KYC Module Go-Live',         phase: 'Phase 1', dueDate: '2026-08-20', status: 'IN_PROGRESS', progress: 72,  owner: 'Compliance Team' },
  { id: 2, title: 'AML Alert Engine Deployment', phase: 'Phase 1', dueDate: '2026-09-01', status: 'IN_PROGRESS', progress: 45,  owner: 'Engineering' },
  { id: 3, title: 'Regulatory Reporting v1',     phase: 'Phase 2', dueDate: '2026-09-15', status: 'UPCOMING',    progress: 10,  owner: 'Compliance Team' },
  { id: 4, title: 'Client Onboarding Portal',    phase: 'Phase 2', dueDate: '2026-10-01', status: 'UPCOMING',    progress: 0,   owner: 'Product Team' },
  { id: 5, title: 'Data Migration Complete',     phase: 'Phase 1', dueDate: '2026-08-05', status: 'COMPLETED',   progress: 100, owner: 'Engineering' },
  { id: 6, title: 'UAT Sign-off',                phase: 'Phase 1', dueDate: '2026-08-10', status: 'COMPLETED',   progress: 100, owner: 'QA Team' },
];

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  COMPLETED:   { label: 'Completed',   bg: '#D1FAE5', color: '#065F46' },
  IN_PROGRESS: { label: 'In Progress', bg: '#FEF3C7', color: '#92400E' },
  UPCOMING:    { label: 'Upcoming',    bg: '#F3F4F6', color: '#374151' },
};

const PHASE_COLORS: Record<string, string> = {
  'Phase 1': '#EFF6FF',
  'Phase 2': '#F5F3FF',
};

export default function MilestonesScreen() {
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All' ? MILESTONES : MILESTONES.filter(m => m.status === filter);

  const total = MILESTONES.length;
  const completed = MILESTONES.filter(m => m.status === 'COMPLETED').length;
  const overallProgress = Math.round((completed / total) * 100);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0B1F3A', marginBottom: '4px' }}>Milestones</h1>
        <p style={{ fontSize: '13px', color: '#6B7280' }}>Track project delivery progress and key deliverables</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Total Milestones',  value: total,                                                      color: '#0B1F3A' },
          { label: 'Completed',         value: completed,                                                  color: '#10B981' },
          { label: 'In Progress',       value: MILESTONES.filter(m => m.status === 'IN_PROGRESS').length,  color: '#F59E0B' },
          { label: 'Overall Progress',  value: `${overallProgress}%`,                                     color: '#2E6BFF' },
        ].map(card => (
          <div key={card.label} style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #F3F4F6', padding: '20px 24px' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: card.color, marginBottom: '4px' }}>{card.value}</div>
            <div style={{ fontSize: '13px', color: '#6B7280' }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {['All', 'IN_PROGRESS', 'UPCOMING', 'COMPLETED'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '7px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            fontSize: '12px', fontWeight: 500,
            backgroundColor: filter === f ? '#0B1F3A' : '#F3F4F6',
            color: filter === f ? '#FFFFFF' : '#6B7280',
            transition: 'all 0.15s',
          }}>
            {f === 'All' ? 'All' : STATUS_CONFIG[f]?.label || f}
          </button>
        ))}
      </div>

      {/* Milestone Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.map(m => {
          const sc = STATUS_CONFIG[m.status];
          const isComplete = m.status === 'COMPLETED';
          return (
            <div key={m.id} style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #F3F4F6', padding: '20px 24px', transition: 'box-shadow 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(11,31,58,0.06)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    {isComplete && (
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    )}
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#0B1F3A' }}>{m.title}</span>
                    <span style={{ fontSize: '11px', fontWeight: 500, color: '#1D4ED8', backgroundColor: PHASE_COLORS[m.phase] || '#F3F4F6', padding: '2px 8px', borderRadius: '20px' }}>{m.phase}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: '#6B7280' }}>
                    <span>📅 Due: {m.dueDate}</span>
                    <span>👤 {m.owner}</span>
                  </div>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 500, color: sc.color, backgroundColor: sc.bg, padding: '4px 12px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
                  {sc.label}
                </span>
              </div>

              {/* Progress Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Progress</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#0B1F3A' }}>{m.progress}%</span>
                </div>
                <div style={{ height: '6px', backgroundColor: '#F3F4F6', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${m.progress}%`, borderRadius: '4px',
                    backgroundColor: isComplete ? '#10B981' : m.status === 'IN_PROGRESS' ? '#2E6BFF' : '#D1D5DB',
                    transition: 'width 0.4s ease',
                  }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
