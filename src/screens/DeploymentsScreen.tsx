'use client';

import React, { useState } from 'react';

const DEPLOYMENTS = [
  { id: 1, service: 'nexus-api',        env: 'Production',  status: 'LIVE',     version: 'v2.4.1', deployedAt: '2026-08-11 09:12', deployedBy: 'CI/CD Pipeline' },
  { id: 2, service: 'nexus-frontend',   env: 'Production',  status: 'LIVE',     version: 'v3.1.0', deployedAt: '2026-08-11 09:10', deployedBy: 'CI/CD Pipeline' },
  { id: 3, service: 'nexus-worker',     env: 'Staging',     status: 'BUILDING', version: 'v2.4.2', deployedAt: '2026-08-11 15:40', deployedBy: 'Thaheshan M.' },
  { id: 4, service: 'nexus-db-migrate', env: 'Production',  status: 'FAILED',   version: 'v1.9.0', deployedAt: '2026-08-10 22:05', deployedBy: 'CI/CD Pipeline' },
  { id: 5, service: 'nexus-cache',      env: 'Staging',     status: 'LIVE',     version: 'v1.3.0', deployedAt: '2026-08-09 14:30', deployedBy: 'Thaheshan M.' },
];

const STATUS_CONFIG: Record<string, { bg: string; color: string; dot: string }> = {
  LIVE:     { bg: '#D1FAE5', color: '#065F46', dot: '#10B981' },
  BUILDING: { bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
  FAILED:   { bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
};

const ENV_CONFIG: Record<string, { bg: string; color: string }> = {
  Production: { bg: '#EFF6FF', color: '#1D4ED8' },
  Staging:    { bg: '#F5F3FF', color: '#6D28D9' },
};

export default function DeploymentsScreen() {
  const [search, setSearch] = useState('');
  const [envFilter, setEnvFilter] = useState('All');

  const filtered = DEPLOYMENTS.filter(d => {
    const matchSearch = d.service.toLowerCase().includes(search.toLowerCase());
    const matchEnv = envFilter === 'All' || d.env === envFilter;
    return matchSearch && matchEnv;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0B1F3A', marginBottom: '4px' }}>Deploy Status</h1>
          <p style={{ fontSize: '13px', color: '#6B7280' }}>Monitor service deployments across all environments</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#D1FAE5', padding: '8px 14px', borderRadius: '20px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#065F46' }}>All Systems Operational</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Live Services',    value: DEPLOYMENTS.filter(d => d.status === 'LIVE').length,     color: '#10B981' },
          { label: 'Building',         value: DEPLOYMENTS.filter(d => d.status === 'BUILDING').length, color: '#F59E0B' },
          { label: 'Failed',           value: DEPLOYMENTS.filter(d => d.status === 'FAILED').length,   color: '#EF4444' },
        ].map(card => (
          <div key={card.label} style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #F3F4F6', padding: '20px 24px' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: card.color, marginBottom: '4px' }}>{card.value}</div>
            <div style={{ fontSize: '13px', color: '#6B7280' }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
          <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search services..." style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }} />
        </div>
        <select value={envFilter} onChange={e => setEnvFilter(e.target.value)} style={{ padding: '9px 32px 9px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px', color: '#374151', outline: 'none', cursor: 'pointer', backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', appearance: 'none' }}>
          <option>All</option>
          <option>Production</option>
          <option>Staging</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #F3F4F6', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #F3F4F6' }}>
              {['Service', 'Environment', 'Version', 'Status', 'Deployed By', 'Deployed At'].map(h => (
                <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, i) => {
              const sc = STATUS_CONFIG[d.status];
              const ec = ENV_CONFIG[d.env];
              return (
                <tr key={d.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #F9FAFB' : 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(46,107,255,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                  <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#0B1F3A', fontFamily: 'monospace' }}>{d.service}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: ec.color, backgroundColor: ec.bg, padding: '3px 10px', borderRadius: '20px' }}>{d.env}</span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#374151', fontFamily: 'monospace' }}>{d.version}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 500, color: sc.color, backgroundColor: sc.bg, padding: '4px 10px', borderRadius: '20px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: sc.dot, flexShrink: 0 }} />
                      {d.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#374151' }}>{d.deployedBy}</td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: '#6B7280' }}>{d.deployedAt}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
