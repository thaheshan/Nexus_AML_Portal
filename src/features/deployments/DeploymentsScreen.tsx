'use client';

import React, { useState } from 'react';
import { useGetDeploymentsQuery, useAddDeploymentMutation, useUpdateDeploymentStatusMutation } from '@/store/services/apiService';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

const STATUS_CFG: Record<string, { bg: string; color: string; dot: string; label: string }> = {
  LIVE:     { bg: '#D1FAE5', color: '#065F46', dot: '#10B981', label: 'LIVE' },
  BUILDING: { bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B', label: 'BUILDING' },
  FAILED:   { bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444', label: 'FAILED' },
};

const ENV_CFG: Record<string, { bg: string; color: string }> = {
  Production: { bg: '#EFF6FF', color: '#1D4ED8' },
  Staging:    { bg: '#F5F3FF', color: '#6D28D9' },
};

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function AddDeploymentModal({ onClose, onSubmit, isLoading }: { onClose: () => void; onSubmit: (d: any) => void; isLoading: boolean }) {
  const [form, setForm] = useState({ service: '', env: 'Production', version: '', status: 'BUILDING' });

  const field = (label: string, key: keyof typeof form, type?: string) => (
    <div>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0B1F3A', marginBottom: '6px' }}>{label}</label>
      <input
        type={type || 'text'}
        value={form[key]}
        required
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
      />
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(11,31,58,0.45)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: '#FFF', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '460px', boxShadow: '0 20px 40px rgba(0,0,0,0.12)', animation: 'modalIn 0.2s ease-out' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2E6BFF', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0B1F3A', margin: 0 }}>Add Deployment</h3>
        </div>

        <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {field('Service Name', 'service')}
          {field('Version', 'version')}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0B1F3A', marginBottom: '6px' }}>Environment</label>
              <select value={form.env} onChange={e => setForm({ ...form, env: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px', outline: 'none', backgroundColor: '#FFF', boxSizing: 'border-box' }}>
                <option value="Production">Production</option>
                <option value="Staging">Staging</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0B1F3A', marginBottom: '6px' }}>Initial Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px', outline: 'none', backgroundColor: '#FFF', boxSizing: 'border-box' }}>
                <option value="BUILDING">Building</option>
                <option value="LIVE">Live</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', background: 'none', fontSize: '13px', fontWeight: 500, color: '#374151', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={isLoading} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#0B1F3A', color: '#FFF', fontSize: '13px', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}>
              {isLoading ? 'Adding...' : 'Add Deployment'}
            </button>
          </div>
        </form>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes modalIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }` }} />
      </div>
    </div>
  );
}

export default function DeploymentsScreen() {
  const user = useSelector((state: RootState) => state.auth.user);
  const role = user?.role || 'VIEWER';
  const canManage = role === 'DEVELOPER' || role === 'ADMIN';

  const [search, setSearch] = useState('');
  const [envFilter, setEnvFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);

  const { data, isLoading, isFetching } = useGetDeploymentsQuery({ search, env: envFilter });
  const [addDeployment, { isLoading: isAdding }] = useAddDeploymentMutation();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateDeploymentStatusMutation();

  const deployments: any[] = data?.data || [];
  const stats = data?.stats;

  const handleAdd = async (form: any) => {
    try {
      await addDeployment(form).unwrap();
      setShowAdd(false);
    } catch {
      alert('Failed to add deployment. Please try again.');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateStatus({ id, status }).unwrap();
    } catch {
      alert('Failed to update status.');
    }
  };

  const systemColor = stats?.isHealthy ? { bg: '#D1FAE5', dot: '#10B981', text: '#065F46' } : { bg: '#FEE2E2', dot: '#EF4444', text: '#991B1B' };

  return (
    <div style={{ paddingBottom: '64px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0B1F3A', marginBottom: '4px' }}>Deploy Status</h1>
          <p style={{ fontSize: '13px', color: '#6B7280' }}>Monitor service deployments across all environments</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {!isLoading && stats && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: systemColor.bg, padding: '8px 14px', borderRadius: '20px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: systemColor.dot }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: systemColor.text }}>{stats.systemStatus}</span>
            </div>
          )}
          {canManage && (
            <button
              onClick={() => setShowAdd(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0B1F3A', color: '#FFF', border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1E3A5F'}
              onMouseLeave={e => e.currentTarget.style.background = '#0B1F3A'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Deployment
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Live Services', value: isLoading ? '—' : stats?.liveCount ?? 0,     color: '#10B981' },
          { label: 'Building',      value: isLoading ? '—' : stats?.buildingCount ?? 0, color: '#F59E0B' },
          { label: 'Failed',        value: isLoading ? '—' : stats?.failedCount ?? 0,   color: '#EF4444' },
        ].map(card => (
          <div key={card.label} style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: card.color, marginBottom: '4px' }}>{card.value}</div>
            <div style={{ fontSize: '13px', color: '#6B7280' }}>{card.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
          <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search services..."
            style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }}
          />
        </div>
        {['All', 'Production', 'Staging'].map(e => (
          <button key={e} onClick={() => setEnvFilter(e)}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
              borderColor: envFilter === e ? '#0B1F3A' : '#E5E7EB',
              background: envFilter === e ? '#0B1F3A' : '#FFF',
              color: envFilter === e ? '#FFF' : '#374151',
            }}>
            {e}
          </button>
        ))}
      </div>

      <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', position: 'relative' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              {['Service', 'Environment', 'Version', 'Status', 'Deployed By', 'Deployed At', ...(canManage ? ['Update Status'] : [])].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#6B7280', fontSize: '13px' }}>Loading deployments…</td></tr>
            ) : deployments.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🚀</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#0B1F3A', marginBottom: '4px' }}>No deployments found</div>
                <div style={{ fontSize: '13px', color: '#9CA3AF' }}>Add your first deployment above.</div>
              </td></tr>
            ) : (
              deployments.map((d: any, i: number) => {
                const sc = STATUS_CFG[d.status] || STATUS_CFG['LIVE'];
                const ec = ENV_CFG[d.env] || ENV_CFG['Staging'];
                return (
                  <tr key={d.id} style={{ borderBottom: i < deployments.length - 1 ? '1px solid #F3F4F6' : 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(46,107,255,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#0B1F3A', fontFamily: 'monospace' }}>{d.service}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: ec.color, backgroundColor: ec.bg, padding: '3px 10px', borderRadius: '20px' }}>{d.env}</span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#374151', fontFamily: 'monospace' }}>{d.version}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 500, color: sc.color, backgroundColor: sc.bg, padding: '4px 10px', borderRadius: '20px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: sc.dot, flexShrink: 0 }} />
                        {sc.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#374151' }}>{d.deployedBy}</td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: '#6B7280' }}>
                      {d.createdAt ? timeAgo(d.createdAt) : '—'}
                    </td>
                    {canManage && (
                      <td style={{ padding: '14px 16px' }}>
                        <select
                          value={d.status}
                          onChange={e => handleStatusChange(d.id, e.target.value)}
                          disabled={isUpdating}
                          style={{ padding: '5px 24px 5px 8px', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '11px', outline: 'none', appearance: 'none', backgroundColor: '#F9FAFB', cursor: 'pointer',
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}
                        >
                          <option value="LIVE">LIVE</option>
                          <option value="BUILDING">BUILDING</option>
                          <option value="FAILED">FAILED</option>
                        </select>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {isFetching && !isLoading && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.5)' }} />
        )}
      </div>

      {showAdd && (
        <AddDeploymentModal
          onClose={() => setShowAdd(false)}
          onSubmit={handleAdd}
          isLoading={isAdding}
        />
      )}
    </div>
  );
}
