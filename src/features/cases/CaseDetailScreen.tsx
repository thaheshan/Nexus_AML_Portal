'use client';

import React, { useState } from 'react';
import { useGetCaseByIdQuery, useDeleteCaseMutation } from '@/store/services/apiService';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Link from 'next/link';
import RiskBadge from '@/components/common/RiskBadge';
import StatusIndicator from '@/components/common/StatusIndicator';

export default function CaseDetailScreen() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const user = useSelector((state: RootState) => state.auth.user);
  const role = user?.role || 'VIEWER';

  const { data: caseItem, isLoading, isError } = useGetCaseByIdQuery(id);
  const [deleteCase, { isLoading: isDeleting }] = useDeleteCaseMutation();

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#6B7280' }}>Loading case details...</div>;
  }

  if (isError || !caseItem) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '48px 0' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0B1F3A', marginBottom: '8px' }}>Case not found</h2>
        <Link href="/cases" style={{ textDecoration: 'none' }}>
          <button style={{ background: '#0B1F3A', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            Back to Cases
          </button>
        </Link>
      </div>
    );
  }

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const dateStr = new Date(caseItem.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  
  const canEdit = role === 'ADMIN' || role === 'DEVELOPER';

  const handleDeleteCase = async () => {
    if (confirm(`Are you sure you want to delete case ${caseItem.caseId}? This action cannot be undone.`)) {
      try {
        await deleteCase(id).unwrap();
        router.push('/cases');
      } catch (err) {
        console.error('Failed to delete case:', err);
        alert('Failed to delete case.');
      }
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '64px' }}>
      <Link href="/cases" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6B7280', textDecoration: 'none', fontSize: '13px', marginBottom: '32px', fontWeight: 500 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        Back to Cases
      </Link>

      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '40px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.05em', marginBottom: '8px' }}>
              {caseItem.caseId}
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0B1F3A', margin: 0 }}>
              {caseItem.entityName}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <RiskBadge level={caseItem.riskLevel} />
            <StatusIndicator status={caseItem.status} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', padding: '24px', background: '#F9FAFB', borderRadius: '12px', marginBottom: '32px', border: '1px solid #F3F4F6' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px', fontWeight: 500 }}>Date Opened</div>
            <div style={{ fontSize: '14px', color: '#374151', fontWeight: 600 }}>{dateStr}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px', fontWeight: 500 }}>Assigned To</div>
            {caseItem.assignee ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#1E3A5F', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600 }}>
                  {getInitials(caseItem.assignee.name)}
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#374151', fontWeight: 600 }}>{caseItem.assignee.name}</div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '14px', color: '#9CA3AF', fontStyle: 'italic' }}>Unassigned</div>
            )}
          </div>
        </div>

        {canEdit && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #F3F4F6' }}>
            <Link href={`/cases/${id}/edit`} style={{ textDecoration: 'none' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1px solid #E5E7EB', color: '#374151', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                Edit Case Details
              </button>
            </Link>

            <button
              onClick={handleDeleteCase}
              disabled={isDeleting}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1px solid #FCA5A5', color: '#EF4444', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, cursor: isDeleting ? 'not-allowed' : 'pointer', opacity: isDeleting ? 0.7 : 1 }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              {isDeleting ? 'Deleting...' : 'Delete Case'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
