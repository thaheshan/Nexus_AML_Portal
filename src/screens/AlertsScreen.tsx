'use client';

import React, { useState } from 'react';
import { useGetAlertsQuery, useUpdateAlertStatusMutation } from '@/store/services/apiService';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Link from 'next/link';
import SeverityBadge from '@/components/common/SeverityBadge';
import AlertStatusPill from '@/components/common/AlertStatusPill';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

const SEVERITY_ORDER: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

export default function AlertsScreen() {
  const role = useSelector((state: RootState) => state.auth.user?.role) || 'VIEWER';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('All Severities');
  const [type, setType] = useState('All Types');
  const [status, setStatus] = useState('All Statuses');
  const [unresolvedOnly, setUnresolvedOnly] = useState(false);
  const [changingId, setChangingId] = useState<string | null>(null);

  const { data, isLoading, isFetching } = useGetAlertsQuery({
    page, limit: 10, search, severity, type, status, unresolvedOnly,
  });

  const [updateStatus] = useUpdateAlertStatusMutation();

  const alerts = data?.data || [];
  const meta = data?.meta;
  const unresolvedCount = meta?.unresolvedCount ?? 0;

  const canManage = role === 'ADMIN' || role === 'DEVELOPER';

  const handleStatusChange = async (id: string, newStatus: string) => {
    setChangingId(id);
    try {
      await updateStatus({ id, data: { status: newStatus } }).unwrap();
    } finally {
      setChangingId(null);
    }
  };

  const dropdownStyle: React.CSSProperties = {
    padding: '8px 32px 8px 12px', borderRadius: '8px', border: '1px solid #E5E7EB',
    fontSize: '13px', outline: 'none', appearance: 'none', backgroundColor: '#FFFFFF',
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', cursor: 'pointer',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: '64px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#0B1F3A', marginBottom: '4px' }}>Alerts</h1>
          <p style={{ fontSize: '13px', color: '#6B7280' }}>Real-time flags requiring compliance review</p>
        </div>
        {unresolvedCount > 0 && (
          <span style={{
            background: 'rgba(214,69,69,0.10)', color: '#D64545',
            fontSize: '12px', fontWeight: 600, borderRadius: '999px',
            padding: '4px 12px', alignSelf: 'center',
          }}>
            {unresolvedCount} unresolved
          </span>
        )}
      </div>

      {/* ── Filter toolbar ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '24px', padding: '16px',
        background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', width: '300px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"
            style={{ position: 'absolute', left: '12px', top: '10px' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Search alerts..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px', outline: 'none', background: '#F9FAFB' }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select value={severity} onChange={e => { setSeverity(e.target.value); setPage(1); }} style={dropdownStyle}>
            <option value="All Severities">Severity</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <select value={type} onChange={e => { setType(e.target.value); setPage(1); }} style={dropdownStyle}>
            <option value="All Types">Type</option>
            <option value="TRANSACTION">Transaction</option>
            <option value="SANCTIONS">Sanctions</option>
            <option value="THRESHOLD">Threshold</option>
            <option value="PEP">PEP</option>
            <option value="DOCUMENT">Document</option>
            <option value="VELOCITY">Velocity</option>
          </select>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} style={dropdownStyle}>
            <option value="All Statuses">Status</option>
            <option value="NEW">New</option>
            <option value="INVESTIGATING">Investigating</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          {/* Unresolved toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 500, color: '#374151', whiteSpace: 'nowrap' }}>
            <div
              onClick={() => { setUnresolvedOnly(v => !v); setPage(1); }}
              style={{
                width: '36px', height: '20px', borderRadius: '999px',
                background: unresolvedOnly ? '#0B1F3A' : '#D1D5DB',
                position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0,
              }}
            >
              <div style={{
                width: '14px', height: '14px', borderRadius: '50%', background: '#FFF',
                position: 'absolute', top: '3px',
                left: unresolvedOnly ? '19px' : '3px',
                transition: 'left 0.2s',
                boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
              }} />
            </div>
            Unresolved only
          </label>
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>

        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '120px 1fr 130px 110px 140px' + (canManage ? ' 140px' : ''),
          padding: '14px 24px', background: '#F5F7FA', borderBottom: '1px solid #E2E8F0',
          fontSize: '11px', fontWeight: 600, color: '#5A6B85', textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          <div>Severity</div>
          <div>Alert Description</div>
          <div>Related Case</div>
          <div>Triggered</div>
          <div>Status</div>
          {canManage && <div>Action</div>}
        </div>

        {/* Rows */}
        <div style={{ position: 'relative' }}>
          {isLoading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#6B7280', fontSize: '13px' }}>Loading alerts...</div>
          ) : alerts.length === 0 ? (
            <div style={{ padding: '64px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🛡️</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#0B1F3A', marginBottom: '6px' }}>No alerts found</div>
              <div style={{ fontSize: '13px', color: '#9CA3AF' }}>Adjust your filters or check back later.</div>
            </div>
          ) : (
            alerts.map((a: any) => {
              const isCritical = a.severity.toUpperCase() === 'CRITICAL';
              const isChanging = changingId === a.id;
              return (
                <div
                  key={a.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '120px 1fr 130px 110px 140px' + (canManage ? ' 140px' : ''),
                    alignItems: 'center',
                    padding: '16px 24px',
                    borderBottom: '1px solid #E2E8F0',
                    borderLeft: isCritical ? '3px solid #D64545' : '3px solid transparent',
                    fontSize: '13px', color: '#374151',
                    transition: 'background 0.15s',
                    background: 'transparent',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(46,107,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div><SeverityBadge severity={a.severity} /></div>

                  <div style={{ paddingRight: '16px' }}>
                    <div style={{ fontSize: '13px', color: '#1E293B', fontWeight: 500, lineHeight: 1.4 }}>
                      {a.description}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px', textTransform: 'capitalize' }}>
                      {a.type.charAt(0) + a.type.slice(1).toLowerCase()} alert
                    </div>
                  </div>

                  <div>
                    {a.relatedCase ? (
                      <Link href={`/cases/${a.relatedCase.id}`} style={{ color: '#2E6BFF', fontWeight: 500, fontSize: '12px', textDecoration: 'none' }}
                        onClick={e => e.stopPropagation()}>
                        {a.relatedCase.caseId}
                      </Link>
                    ) : (
                      <span style={{ color: '#94A3B8', fontSize: '12px' }}>—</span>
                    )}
                  </div>

                  <div style={{ fontSize: '12px', color: '#64748B' }}>{timeAgo(a.createdAt)}</div>

                  <div><AlertStatusPill status={a.status} /></div>

                  {canManage && (
                    <div>
                      <select
                        value={a.status}
                        disabled={isChanging}
                        onChange={e => handleStatusChange(a.id, e.target.value)}
                        onClick={e => e.stopPropagation()}
                        style={{
                          padding: '5px 24px 5px 8px', borderRadius: '6px', border: '1px solid #E5E7EB',
                          fontSize: '11px', outline: 'none', appearance: 'none', backgroundColor: '#F9FAFB',
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center',
                          cursor: isChanging ? 'not-allowed' : 'pointer',
                          opacity: isChanging ? 0.5 : 1,
                        }}
                      >
                        <option value="NEW">New</option>
                        <option value="INVESTIGATING">Investigating</option>
                        <option value="ACKNOWLEDGED">Acknowledged</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {isFetching && !isLoading && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.5)' }} />
          )}
        </div>
      </div>

      {/* ── Pagination ── */}
      {!isLoading && meta && meta.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '32px' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ background: 'none', border: 'none', cursor: page === 1 ? 'not-allowed' : 'pointer', color: page === 1 ? '#D1D5DB' : '#6B7280', display: 'flex', alignItems: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>

          <div style={{ display: 'flex', gap: '4px' }}>
            {Array.from({ length: meta.totalPages }).map((_, i) => {
              const p = i + 1;
              if (p === 1 || p === meta.totalPages || (p >= page - 1 && p <= page + 1)) {
                return (
                  <button key={i} onClick={() => setPage(p)}
                    style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px',
                      background: page === p ? '#F3F4F6' : 'transparent',
                      color: page === p ? '#0B1F3A' : '#6B7280',
                      fontWeight: page === p ? 600 : 400,
                    }}>
                    {p}
                  </button>
                );
              } else if (p === page - 2 || p === page + 2) {
                return <span key={i} style={{ padding: '0 4px', color: '#9CA3AF' }}>...</span>;
              }
              return null;
            })}
          </div>

          <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages}
            style={{ background: 'none', border: 'none', cursor: page === meta.totalPages ? 'not-allowed' : 'pointer', color: page === meta.totalPages ? '#D1D5DB' : '#6B7280', display: 'flex', alignItems: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      )}
    </div>
  );
}
