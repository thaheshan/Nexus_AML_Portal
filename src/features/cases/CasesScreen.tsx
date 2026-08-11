'use client';

import React, { useState } from 'react';
import { useGetCasesQuery, useGetUsersQuery } from '@/store/services/apiService';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Link from 'next/link';
import RiskBadge from '@/components/common/RiskBadge';
import StatusIndicator from '@/components/common/StatusIndicator';

export default function CasesScreen() {
  const user = useSelector((state: RootState) => state.auth.user);
  const role = user?.role || 'VIEWER';
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All Statuses');
  const [riskLevel, setRiskLevel] = useState('All Risk Levels');
  const [assigneeId, setAssigneeId] = useState('All Assignees');

  const { data: users = [] } = useGetUsersQuery();

  const { data, isLoading, isFetching } = useGetCasesQuery({ 
    page, limit: 10, search, status, riskLevel, assigneeId 
  });
  
  const cases = data?.data || [];
  const meta = data?.meta;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const canCreate = role === 'ADMIN' || role === 'DEVELOPER';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '64px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#0B1F3A', marginBottom: '4px' }}>Cases</h1>
          <p style={{ fontSize: '13px', color: '#6B7280' }}>Track and manage AML compliance cases</p>
        </div>
        {canCreate && (
          <Link href="/cases/new" style={{ textDecoration: 'none' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0B1F3A', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1E3A5F'}
              onMouseLeave={e => e.currentTarget.style.background = '#0B1F3A'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              New Case
            </button>
          </Link>
        )}
      </div>

      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        marginBottom: '24px', padding: '16px', background: '#FFFFFF', 
        border: '1px solid #E5E7EB', borderRadius: '12px' 
      }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', top: '10px' }}>
            <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Search cases..." 
            value={search}
            onChange={handleSearch}
            style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px', outline: 'none', background: '#F9FAFB' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select 
            value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
            style={{ padding: '8px 32px 8px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px', outline: 'none', appearance: 'none', backgroundColor: '#FFFFFF', backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'10\' height=\'6\' viewBox=\'0 0 10 6\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1L5 5L9 1\' stroke=\'%236B7280\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', cursor: 'pointer' }}
          >
            <option value="All Statuses">Status</option>
            <option value="OPEN">Open</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select 
            value={riskLevel} onChange={e => { setRiskLevel(e.target.value); setPage(1); }}
            style={{ padding: '8px 32px 8px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px', outline: 'none', appearance: 'none', backgroundColor: '#FFFFFF', backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'10\' height=\'6\' viewBox=\'0 0 10 6\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1L5 5L9 1\' stroke=\'%236B7280\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', cursor: 'pointer' }}
          >
            <option value="All Risk Levels">Risk Level</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <select 
            value={assigneeId} onChange={e => { setAssigneeId(e.target.value); setPage(1); }}
            style={{ padding: '8px 32px 8px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px', outline: 'none', appearance: 'none', backgroundColor: '#FFFFFF', backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'10\' height=\'6\' viewBox=\'0 0 10 6\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1L5 5L9 1\' stroke=\'%236B7280\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', cursor: 'pointer' }}
          >
            <option value="All Assignees">Assigned To</option>
            <option value="">Unassigned</option>
            {users.map((u: any) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1fr 1fr 1.5fr 1fr 40px', padding: '16px 24px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <div>Case ID</div>
          <div>Entity Name</div>
          <div>Risk Level</div>
          <div>Status</div>
          <div>Assigned To</div>
          <div>Date Opened</div>
          <div></div>
        </div>

        <div style={{ position: 'relative' }}>
          {isLoading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#6B7280', fontSize: '13px' }}>Loading cases...</div>
          ) : cases.length === 0 ? (
            <div style={{ padding: '64px', textAlign: 'center', color: '#6B7280', fontSize: '13px' }}>No cases found matching your criteria.</div>
          ) : (
            cases.map((c: any) => {
              const dateStr = new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              return (
                <Link key={c.id} href={`/cases/${c.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ 
                    display: 'grid', gridTemplateColumns: '1.2fr 2fr 1fr 1fr 1.5fr 1fr 40px', alignItems: 'center', 
                    padding: '16px 24px', borderBottom: '1px solid #F3F4F6', color: '#374151', fontSize: '13px', 
                    transition: 'background 0.15s', cursor: 'pointer' 
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ fontWeight: 500, color: '#0B1F3A' }}>{c.caseId}</div>
                    <div>{c.entityName}</div>
                    <div><RiskBadge level={c.riskLevel} /></div>
                    <div><StatusIndicator status={c.status} /></div>
                    <div>
                      {c.assignee ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#1E3A5F', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 600 }}>
                            {getInitials(c.assignee.name)}
                          </div>
                          <span>{c.assignee.name}</span>
                        </div>
                      ) : (
                        <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Unassigned</span>
                      )}
                    </div>
                    <div style={{ color: '#6B7280' }}>{dateStr}</div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', color: '#9CA3AF' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
          
          {isFetching && !isLoading && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.5)' }} />
          )}
        </div>
      </div>

      {!isLoading && meta && meta.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '32px' }}>
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ background: 'none', border: 'none', cursor: page === 1 ? 'not-allowed' : 'pointer', color: page === 1 ? '#D1D5DB' : '#6B7280', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          
          <div style={{ display: 'flex', gap: '4px' }}>
            {Array.from({ length: meta.totalPages }).map((_, i) => {
              const pageNum = i + 1;
              if (pageNum === 1 || pageNum === meta.totalPages || (pageNum >= page - 1 && pageNum <= page + 1)) {
                return (
                  <button 
                    key={i} 
                    onClick={() => setPage(pageNum)}
                    style={{ 
                      width: '28px', height: '28px', borderRadius: '6px', 
                      background: page === pageNum ? '#F3F4F6' : 'transparent', 
                      border: 'none', cursor: 'pointer', 
                      color: page === pageNum ? '#0B1F3A' : '#6B7280', 
                      fontWeight: page === pageNum ? 600 : 400,
                      fontSize: '13px'
                    }}
                  >
                    {pageNum}
                  </button>
                );
              } else if (pageNum === page - 2 || pageNum === page + 2) {
                return <span key={i} style={{ padding: '0 4px', color: '#9CA3AF' }}>...</span>;
              }
              return null;
            })}
          </div>

          <button 
            onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
            disabled={page === meta.totalPages}
            style={{ background: 'none', border: 'none', cursor: page === meta.totalPages ? 'not-allowed' : 'pointer', color: page === meta.totalPages ? '#D1D5DB' : '#6B7280', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      )}
    </div>
  );
}
