'use client';

import React, { useState } from 'react';
import { useGetAlertsQuery, useUpdateAlertStatusMutation, useCreateAlertMutation, useDeleteAlertMutation, useGetCasesQuery } from '@/store/services/apiService';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Link from 'next/link';
import SeverityBadge from '@/components/common/SeverityBadge';
import AlertStatusPill from '@/components/common/AlertStatusPill';

function RaiseAlertModal({ onClose, onSubmit, isLoading }: { onClose: () => void; onSubmit: (d: any) => void; isLoading: boolean }) {
  const [severity, setSeverity] = useState('HIGH');
  const [type, setType]         = useState('TRANSACTION');
  const [description, setDescription] = useState('');
  const [relatedCaseId, setRelatedCaseId] = useState('');

  const { data: casesData } = useGetCasesQuery({ page: 1, limit: 50 });
  const cases = casesData?.data || [];

  const dropStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    border: '1px solid #E5E7EB', fontSize: '13px', outline: 'none',
    appearance: 'none', backgroundColor: '#FFFFFF', boxSizing: 'border-box',
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    onSubmit({ severity, type, description, relatedCaseId: relatedCaseId || null });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(11,31,58,0.45)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: '#FFF', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 40px rgba(0,0,0,0.12)', animation: 'modalIn 0.2s ease-out' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0B1F3A', margin: 0 }}>Raise Alert</h3>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0B1F3A', marginBottom: '6px' }}>Severity</label>
              <select value={severity} onChange={e => setSeverity(e.target.value)} style={dropStyle}>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0B1F3A', marginBottom: '6px' }}>Alert Type</label>
              <select value={type} onChange={e => setType(e.target.value)} style={dropStyle}>
                <option value="TRANSACTION">Transaction</option>
                <option value="SANCTIONS">Sanctions</option>
                <option value="THRESHOLD">Threshold</option>
                <option value="PEP">PEP</option>
                <option value="DOCUMENT">Document</option>
                <option value="VELOCITY">Velocity</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0B1F3A', marginBottom: '6px' }}>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              rows={3}
              placeholder="Describe the compliance concern or flagged activity…"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0B1F3A', marginBottom: '6px' }}>Link to Case <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(optional)</span></label>
            <select value={relatedCaseId} onChange={e => setRelatedCaseId(e.target.value)} style={dropStyle}>
              <option value="">No linked case</option>
              {cases.map((c: any) => (
                <option key={c.id} value={c.id}>{c.caseId} — {c.entityName}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', background: 'none', fontSize: '13px', fontWeight: 500, color: '#374151', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={isLoading} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#EF4444', color: '#FFF', fontSize: '13px', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}>
              {isLoading ? 'Raising...' : 'Raise Alert'}
            </button>
          </div>
        </form>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes modalIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }` }} />
      </div>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export default function AlertsScreen() {
  const role = useSelector((state: RootState) => state.auth.user?.role) || 'VIEWER';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('All Severities');
  const [type, setType] = useState('All Types');
  const [status, setStatus] = useState('All Statuses');
  const [unresolvedOnly, setUnresolvedOnly] = useState(false);
  const [changingId, setChangingId] = useState<string | null>(null);
  const [showRaise, setShowRaise]   = useState(false);

  const { data, isLoading, isFetching } = useGetAlertsQuery({
    page, limit: 10, search, severity, type, status, unresolvedOnly,
  });

  const [updateStatus]  = useUpdateAlertStatusMutation();
  const [createAlert, { isLoading: isCreating }] = useCreateAlertMutation();
  const [deleteAlert]   = useDeleteAlertMutation();

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

  const handleDeleteAlert = async (id: string) => {
    if (confirm('Are you sure you want to delete this alert?')) {
      try {
        await deleteAlert(id).unwrap();
      } catch (err) {
        console.error('Failed to delete alert:', err);
      }
    }
  };

  const handleRaiseAlert = async (formData: any) => {
    try {
      await createAlert(formData).unwrap();
      setShowRaise(false);
    } catch (err) {
      console.error('Failed to raise alert:', err);
      alert('Failed to raise alert. Check console.');
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#0B1F3A', marginBottom: '4px' }}>Alerts</h1>
          <p style={{ fontSize: '13px', color: '#6B7280' }}>Real-time flags requiring compliance review</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {unresolvedCount > 0 && (
            <span style={{ background: 'rgba(214,69,69,0.10)', color: '#D64545', fontSize: '12px', fontWeight: 600, borderRadius: '999px', padding: '4px 12px' }}>
              {unresolvedCount} unresolved
            </span>
          )}
          {canManage && (
            <button
              onClick={() => setShowRaise(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#EF4444', color: '#FFF', border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#DC2626'}
              onMouseLeave={e => e.currentTarget.style.background = '#EF4444'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Raise Alert
            </button>
          )}
        </div>
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '24px', padding: '16px',
        background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px',
      }}>
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

      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                      <button
                        title="Delete Alert"
                        onClick={e => { e.stopPropagation(); handleDeleteAlert(a.id); }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '6px', color: '#8FA3C4', background: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = '#FEF2F2'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#8FA3C4'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
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
      {showRaise && canManage && (
        <RaiseAlertModal
          onClose={() => setShowRaise(false)}
          onSubmit={handleRaiseAlert}
          isLoading={isCreating}
        />
      )}
    </div>
  );
}
