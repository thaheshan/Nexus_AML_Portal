'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  useCreateCaseMutation, 
  useUpdateCaseMutation,
  useGetCaseByIdQuery,
  useGetUsersQuery
} from '@/store/services/apiService';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export default function CaseFormScreen() {
  const router = useRouter();
  const params = useParams();
  const isEdit = !!params?.id;
  const id = params?.id as string;

  const userRole = useSelector((state: RootState) => state.auth.user?.role) || 'VIEWER';
  
  useEffect(() => {
    if (userRole !== 'ADMIN' && userRole !== 'DEVELOPER') {
      router.push('/cases');
    }
  }, [userRole, router]);

  const { data: users = [] } = useGetUsersQuery();
  const { data: existingData, isLoading: isFetching } = useGetCaseByIdQuery(id, { skip: !isEdit });
  const [createCase, { isLoading: isCreating }] = useCreateCaseMutation();
  const [updateCase, { isLoading: isUpdating }] = useUpdateCaseMutation();
  
  const [entityName, setEntityName] = useState('');
  const [riskLevel, setRiskLevel] = useState('MEDIUM');
  const [status, setStatus] = useState('OPEN');
  const [assigneeId, setAssigneeId] = useState('');

  useEffect(() => {
    if (isEdit && existingData) {
      setEntityName(existingData.entityName);
      setRiskLevel(existingData.riskLevel);
      setStatus(existingData.status);
      setAssigneeId(existingData.assigneeId || '');
    }
  }, [isEdit, existingData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await updateCase({ id, data: { entityName, riskLevel, status, assigneeId: assigneeId || null } }).unwrap();
      } else {
        await createCase({ entityName, riskLevel, status, assigneeId: assigneeId || null }).unwrap();
      }
      router.push('/cases');
    } catch (err) {
      console.error('Failed to save case:', err);
      alert('Failed to save case. Check console.');
    }
  };

  const isSaving = isCreating || isUpdating;

  if (isEdit && isFetching) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#6B7280' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '64px' }}>
      <Link href="/cases" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6B7280', textDecoration: 'none', fontSize: '13px', marginBottom: '32px', fontWeight: 500 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        Back to Cases
      </Link>

      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#0B1F3A', marginBottom: '24px' }}>
          {isEdit ? `Edit Case (${existingData?.caseId})` : 'Create New Case'}
        </h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Input 
            label="Entity Name" 
            placeholder="e.g. Orion Trading Ltd" 
            value={entityName} 
            onChange={e => setEntityName(e.target.value)} 
            required 
          />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--navy)', marginBottom: '6px' }}>Risk Level</label>
              <select 
                value={riskLevel} 
                onChange={e => setRiskLevel(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
              >
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--navy)', marginBottom: '6px' }}>Status</label>
              <select 
                value={status} 
                onChange={e => setStatus(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
              >
                <option value="OPEN">Open</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--navy)', marginBottom: '6px' }}>Assignee (Optional)</label>
            <select 
              value={assigneeId} 
              onChange={e => setAssigneeId(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '14px', outline: 'none' }}
            >
              <option value="">Unassigned</option>
              {users.map((u: any) => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <Link href={isEdit ? `/cases/${id}` : "/cases"} style={{ textDecoration: 'none' }}>
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={isSaving}>
              {isEdit ? (isUpdating ? 'Saving...' : 'Save Changes') : (isCreating ? 'Creating...' : 'Create Case')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
