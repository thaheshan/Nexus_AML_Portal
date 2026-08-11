'use client';

import React, { useState } from 'react';
import { useGetReportsQuery, useCreateReportMutation, useDeleteReportMutation, useGetReportByIdQuery, useUpdateReportMutation } from '@/store/services/apiService';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import ReportTypePill from '@/components/common/ReportTypePill';
import { downloadReportPDF } from '@/lib/pdfGenerator';

// ─── helpers ────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

const dropdownStyle: React.CSSProperties = {
  padding: '8px 32px 8px 12px', borderRadius: '8px', border: '1px solid #E5E7EB',
  fontSize: '13px', outline: 'none', appearance: 'none', backgroundColor: '#FFFFFF',
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', cursor: 'pointer',
};

// ─── Generate Modal ──────────────────────────────────────────────────────────
function GenerateModal({ onClose, onSubmit, isLoading }: { onClose: () => void; onSubmit: (d: any) => void; isLoading: boolean }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('SUMMARY');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !from || !to) return;
    onSubmit({ name, type, dateRangeFrom: from, dateRangeTo: to });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      backgroundColor: 'rgba(11,31,58,0.45)', backdropFilter: 'blur(4px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
    }}>
      <div style={{
        background: '#FFF', borderRadius: '16px', padding: '32px',
        width: '100%', maxWidth: '480px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
        animation: 'modalIn 0.2s ease-out',
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0B1F3A', marginBottom: '24px' }}>Generate Report</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0B1F3A', marginBottom: '6px' }}>Report Name</label>
            <input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Monthly AML Summary — August 2026"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0B1F3A', marginBottom: '6px' }}>Report Type</label>
            <select value={type} onChange={e => setType(e.target.value)} style={{ ...dropdownStyle, width: '100%', boxSizing: 'border-box' }}>
              <option value="SUMMARY">Summary</option>
              <option value="RISK_ASSESSMENT">Risk Assessment</option>
              <option value="AUDIT_LOG">Audit Log</option>
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0B1F3A', marginBottom: '6px' }}>From</label>
              <input type="date" value={from} onChange={e => setFrom(e.target.value)} required
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0B1F3A', marginBottom: '6px' }}>To</label>
              <input type="date" value={to} onChange={e => setTo(e.target.value)} required
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={onClose}
              style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', background: 'none', fontSize: '13px', fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#0B1F3A', color: '#FFF', fontSize: '13px', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}>
              {isLoading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </form>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes modalIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }` }} />
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ────────────────────────────────────────────────────
function DeleteModal({ onClose, onConfirm, isLoading }: { onClose: () => void; onConfirm: () => void; isLoading: boolean }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(11,31,58,0.45)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: '#FFF', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.12)', animation: 'modalIn 0.2s ease-out' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0B1F3A', margin: 0 }}>Delete Report?</h3>
        </div>
        <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.5, marginBottom: '32px', marginLeft: '56px' }}>
          This report will be permanently removed. This action cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={onClose} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', background: 'none', fontSize: '13px', fontWeight: 500, color: '#374151', cursor: 'pointer' }}>Cancel</button>
          <button onClick={onConfirm} disabled={isLoading}
            style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#EF4444', color: '#FFF', fontSize: '13px', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes modalIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }` }} />
      </div>
    </div>
  );
}

// ─── View Report Modal ──────────────────────────────────────────────────────
function ViewReportModal({ reportId, onClose }: { reportId: string; onClose: () => void }) {
  const { data: report, isLoading } = useGetReportByIdQuery(reportId);

  if (isLoading || !report) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(11,31,58,0.45)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ background: '#FFF', borderRadius: '16px', padding: '32px', color: '#6B7280', fontSize: '14px' }}>Loading report details...</div>
      </div>
    );
  }

  const metrics = report.metrics || {};

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(11,31,58,0.45)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px' }}>
      <div style={{ background: '#FFF', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', animation: 'modalIn 0.2s ease-out' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#2E6BFF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              {report.type} REPORT
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0B1F3A', margin: 0 }}>{report.name}</h2>
            <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
              Covered Period: {fmtDate(report.dateRangeFrom)} – {fmtDate(report.dateRangeTo)}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '4px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Metadata grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '20px', fontSize: '12px' }}>
          <div><span style={{ color: '#64748B' }}>Generated By:</span> <strong>{report.generatedBy?.name || 'System Admin'}</strong></div>
          <div><span style={{ color: '#64748B' }}>Created On:</span> <strong>{fmtDate(report.createdAt)}</strong></div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          <div style={{ padding: '12px', border: '1px solid #E2E8F0', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#0B1F3A' }}>{metrics.totalCases ?? 0}</div>
            <div style={{ fontSize: '11px', color: '#64748B' }}>Total Cases</div>
          </div>
          <div style={{ padding: '12px', border: '1px solid #E2E8F0', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#DC2626' }}>{metrics.highRiskCases ?? 0}</div>
            <div style={{ fontSize: '11px', color: '#64748B' }}>High Risk</div>
          </div>
          <div style={{ padding: '12px', border: '1px solid #E2E8F0', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#D97706' }}>{metrics.alertsTriggered ?? 0}</div>
            <div style={{ fontSize: '11px', color: '#64748B' }}>Alerts</div>
          </div>
          <div style={{ padding: '12px', border: '1px solid #E2E8F0', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#16A34A' }}>{metrics.closedCases ?? 0}</div>
            <div style={{ fontSize: '11px', color: '#64748B' }}>Resolved</div>
          </div>
        </div>

        {/* Case Log Sample */}
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#0B1F3A', marginBottom: '8px' }}>Period Audit Activity</div>
        {metrics.caseSample && metrics.caseSample.length > 0 ? (
          <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden', marginBottom: '24px', fontSize: '12px' }}>
            {metrics.caseSample.map((c: any, i: number) => (
              <div key={c.caseId} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: i < metrics.caseSample.length - 1 ? '1px solid #F1F5F9' : 'none', background: '#FFF' }}>
                <div>
                  <strong>{c.caseId}</strong> — {c.entityName}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: c.riskLevel === 'HIGH' ? '#FEE2E2' : '#E0F2FE', color: c.riskLevel === 'HIGH' ? '#991B1B' : '#0369A1' }}>{c.riskLevel}</span>
                  <span style={{ color: '#64748B' }}>{c.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '12px', color: '#9CA3AF', fontStyle: 'italic', marginBottom: '24px' }}>No active cases logged during this timeframe.</div>
        )}

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={onClose} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', background: 'none', fontSize: '13px', fontWeight: 500, color: '#374151', cursor: 'pointer' }}>Close</button>
          <button onClick={() => downloadReportPDF(report)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#0B1F3A', color: '#FFF', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function ReportsScreen() {
  const role = useSelector((state: RootState) => state.auth.user?.role) || 'VIEWER';
  const canManage = role === 'ADMIN' || role === 'DEVELOPER';

  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState('');
  const [type, setType]           = useState('All Types');
  const [dateRange, setDateRange] = useState('All Time');
  const [showGenerate, setShowGenerate] = useState(false);
  const [deleteId, setDeleteId]   = useState<string | null>(null);
  const [viewId, setViewId]       = useState<string | null>(null);
  const [editReport, setEditReport] = useState<any | null>(null);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  const { data, isLoading, isFetching } = useGetReportsQuery({ page, limit: 10, search, type, dateRange });
  const [createReport, { isLoading: isCreating }] = useCreateReportMutation();
  const [updateReport, { isLoading: isUpdating }] = useUpdateReportMutation();
  const [deleteReport, { isLoading: isDeleting }] = useDeleteReportMutation();

  const reports  = data?.data  || [];
  const meta     = data?.meta;
  const stats    = meta?.stats;

  const handleGenerate = async (formData: any) => {
    try {
      await createReport(formData).unwrap();
      setShowGenerate(false);
    } catch (err) {
      console.error('Failed to create report:', err);
      alert('Failed to generate report. Check console.');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteReport(deleteId).unwrap();
      setDeleteId(null);
    } catch (err) {
      console.error('Failed to delete report:', err);
      alert('Failed to delete report. Check console.');
    }
  };

  const statCardStyle: React.CSSProperties = {
    background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px',
    padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', flex: 1,
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: '64px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#0B1F3A', marginBottom: '4px' }}>Reports</h1>
            <p style={{ fontSize: '13px', color: '#6B7280' }}>Generate and export compliance reports</p>
          </div>
          {canManage && (
            <button
              onClick={() => setShowGenerate(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0B1F3A', color: '#FFF', border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1E3A5F'}
              onMouseLeave={e => e.currentTarget.style.background = '#0B1F3A'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Generate Report
            </button>
          )}
        </div>

        {/* ── Summary cards ── */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={statCardStyle}>
            <div style={{ fontSize: '12px', fontWeight: 500, color: '#6B7280', marginBottom: '8px' }}>Reports This Month</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#0B1F3A' }}>{isLoading ? '—' : stats?.thisMonth ?? 0}</div>
          </div>
          <div style={statCardStyle}>
            <div style={{ fontSize: '12px', fontWeight: 500, color: '#6B7280', marginBottom: '8px' }}>Scheduled Reports</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#0B1F3A' }}>{isLoading ? '—' : stats?.scheduled ?? 0}</div>
          </div>
          <div style={statCardStyle}>
            <div style={{ fontSize: '12px', fontWeight: 500, color: '#6B7280', marginBottom: '8px' }}>Last Generated</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0B1F3A' }}>{isLoading ? '—' : timeAgo(stats?.lastGeneratedAt)}</div>
          </div>
        </div>

        {/* ── Filter toolbar ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '16px', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '10px' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder="Search reports..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px', outline: 'none', background: '#F9FAFB', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <select value={type} onChange={e => { setType(e.target.value); setPage(1); }} style={dropdownStyle}>
              <option value="All Types">Report Type</option>
              <option value="SUMMARY">Summary</option>
              <option value="RISK_ASSESSMENT">Risk Assessment</option>
              <option value="AUDIT_LOG">Audit Log</option>
            </select>
            <select value={dateRange} onChange={e => { setDateRange(e.target.value); setPage(1); }} style={dropdownStyle}>
              <option value="All Time">Date Range</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last 90 Days">Last 90 Days</option>
            </select>
          </div>
        </div>

        {/* ── Table ── */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>

          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 140px 180px 160px 120px 80px', padding: '14px 24px', background: '#F5F7FA', borderBottom: '1px solid #E2E8F0', fontSize: '11px', fontWeight: 600, color: '#5A6B85', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <div>Report Name</div>
            <div>Type</div>
            <div>Date Range Covered</div>
            <div>Generated By</div>
            <div>Date Created</div>
            <div></div>
          </div>

          {/* Rows */}
          <div style={{ position: 'relative' }}>
            {isLoading ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#6B7280', fontSize: '13px' }}>Loading reports...</div>
            ) : reports.length === 0 ? (
              <div style={{ padding: '64px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', color: '#9CA3AF' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                  </svg>
                </div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#0B1F3A', marginBottom: '6px' }}>No reports yet</div>
                <div style={{ fontSize: '13px', color: '#9CA3AF' }}>
                  {canManage ? 'Click "Generate Report" to create your first report.' : 'No reports have been generated yet.'}
                </div>
              </div>
            ) : (
              reports.map((r: any) => {
                const isHovered = hoveredRowId === r.id;
                return (
                  <div
                    key={r.id}
                    style={{ display: 'grid', gridTemplateColumns: '2fr 140px 180px 160px 120px 80px', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #E2E8F0', fontSize: '13px', color: '#374151', background: isHovered ? 'rgba(46,107,255,0.04)' : 'transparent', transition: 'background 0.15s' }}
                    onMouseEnter={() => setHoveredRowId(r.id)}
                    onMouseLeave={() => setHoveredRowId(null)}
                  >
                    {/* Report Name with doc icon */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingRight: '12px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8FA3C4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                      </svg>
                      <span style={{ fontWeight: 500, color: '#0B1F3A', lineHeight: 1.3 }}>{r.name}</span>
                    </div>

                    <div><ReportTypePill type={r.type} /></div>

                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      {fmtDate(r.dateRangeFrom)} – {fmtDate(r.dateRangeTo)}
                    </div>

                    {/* Generated By avatar + name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#1E3A5F', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 600, flexShrink: 0 }}>
                        {getInitials(r.generatedBy.name)}
                      </div>
                      <span style={{ fontSize: '12px' }}>{r.generatedBy.name}</span>
                    </div>

                    <div style={{ fontSize: '12px', color: '#64748B' }}>{fmtDate(r.createdAt)}</div>

                    {/* Action icons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>

                      {/* View */}
                      <button
                        title="View Report"
                        onClick={e => { e.stopPropagation(); setViewId(r.id); }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '6px', color: '#8FA3C4', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s, background 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#2E6BFF'; e.currentTarget.style.background = '#EFF4FF'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#8FA3C4'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>

                      {/* Download PDF */}
                      <button
                        title="Download PDF"
                        onClick={async e => {
                          e.stopPropagation();
                          try {
                            const res = await fetch(`/api/reports/${r.id}`);
                            const data = await res.json();
                            downloadReportPDF(data);
                          } catch { alert('Failed to load report for download.'); }
                        }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '6px', color: '#8FA3C4', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s, background 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#0B1F3A'; e.currentTarget.style.background = '#F3F4F6'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#8FA3C4'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                      </button>

                      {/* Edit (ADMIN / DEVELOPER only) */}
                      {canManage && (
                        <button
                          title="Edit Report"
                          onClick={e => {
                            e.stopPropagation();
                            setEditReport(r);
                          }}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '6px', color: '#8FA3C4', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s, background 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#0B1F3A'; e.currentTarget.style.background = '#F3F4F6'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#8FA3C4'; e.currentTarget.style.background = 'transparent'; }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                      )}

                      {/* Delete (ADMIN only) */}
                      {role === 'ADMIN' && (
                        <button
                          title="Delete"
                          onClick={e => { e.stopPropagation(); setDeleteId(r.id); }}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '6px', color: '#8FA3C4', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s, background 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = '#FEF2F2'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#8FA3C4'; e.currentTarget.style.background = 'transparent'; }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      )}
                    </div>
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
                      style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', background: page === p ? '#F3F4F6' : 'transparent', color: page === p ? '#0B1F3A' : '#6B7280', fontWeight: page === p ? 600 : 400 }}>
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

      {/* ── Modals ── */}
      {showGenerate && (
        <GenerateModal
          onClose={() => setShowGenerate(false)}
          onSubmit={handleGenerate}
          isLoading={isCreating}
        />
      )}
      {deleteId && (
        <DeleteModal
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          isLoading={isDeleting}
        />
      )}
      {viewId && (
        <ViewReportModal
          reportId={viewId}
          onClose={() => setViewId(null)}
        />
      )}
      {editReport && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(11,31,58,0.45)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#FFF', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0B1F3A', marginBottom: '20px' }}>Edit Report Details</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await updateReport({ id: editReport.id, data: { name: editReport.name, type: editReport.type } }).unwrap();
                setEditReport(null);
              } catch (err) { alert('Failed to update report'); }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0B1F3A', marginBottom: '6px' }}>Report Name</label>
                <input
                  type="text"
                  value={editReport.name}
                  onChange={e => setEditReport({ ...editReport, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#0B1F3A', marginBottom: '6px' }}>Report Type</label>
                <select
                  value={editReport.type}
                  onChange={e => setEditReport({ ...editReport, type: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px', outline: 'none', backgroundColor: '#FFF', boxSizing: 'border-box' }}
                >
                  <option value="SUMMARY">Summary</option>
                  <option value="RISK_ASSESSMENT">Risk Assessment</option>
                  <option value="AUDIT_LOG">Audit Log</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setEditReport(null)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', background: 'none', fontSize: '13px', fontWeight: 500, color: '#374151', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isUpdating} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#0B1F3A', color: '#FFF', fontSize: '13px', fontWeight: 600, cursor: isUpdating ? 'not-allowed' : 'pointer' }}>
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
