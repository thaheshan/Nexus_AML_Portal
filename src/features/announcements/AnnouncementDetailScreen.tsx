'use client';

import React, { useState } from 'react';
import { useGetAnnouncementByIdQuery, useDeleteAnnouncementMutation } from '@/store/services/apiService';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Link from 'next/link';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';

export default function AnnouncementDetailScreen() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const user = useSelector((state: RootState) => state.auth.user);
  const role = user?.role || 'VIEWER';

  const { data: announcement, isLoading, isError } = useGetAnnouncementByIdQuery(id);
  const [deleteAnnouncement, { isLoading: isDeleting }] = useDeleteAnnouncementMutation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteAnnouncement(id).unwrap();
      router.push('/announcements');
    } catch (err) {
      console.error('Failed to delete:', err);
      setShowDeleteModal(false);
      alert('Failed to delete announcement. Check console.');
    }
  };

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#6B7280' }}>Loading...</div>;
  }

  if (isError || !announcement) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '48px 0' }}>
        <div style={{ color: '#9CA3AF', marginBottom: '16px' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0B1F3A', marginBottom: '8px' }}>404</h2>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0B1F3A', marginBottom: '8px' }}>Page not found</h3>
        <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '24px', textAlign: 'center', maxWidth: '300px' }}>
          The page you're looking for doesn't exist or may have been removed.
        </p>
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <button style={{ background: '#0B1F3A', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            Back to Dashboard
          </button>
        </Link>
      </div>
    );
  }

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const dateStr = new Date(announcement.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = new Date(announcement.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <>
      <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '64px' }}>
        <Link href="/announcements" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6B7280', textDecoration: 'none', fontSize: '13px', marginBottom: '32px', fontWeight: 500 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          Back to Announcements
        </Link>

        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '40px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <Badge label={announcement.category} />
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0B1F3A', marginTop: '16px', marginBottom: '16px', lineHeight: 1.3 }}>
            {announcement.title}
          </h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', borderBottom: '1px solid #F3F4F6', paddingBottom: '24px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1E3A5F', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>
              {getInitials(announcement.author.name)}
            </div>
            <div>
              <div style={{ fontSize: '13px', color: '#374151', fontWeight: 600 }}>{announcement.author.name}</div>
              <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Posted {dateStr} at {timeStr}</div>
            </div>
          </div>

          <div style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: announcement.imageUrl ? '32px' : '0' }}>
            {announcement.message}
          </div>

          {announcement.imageUrl && (
            <div style={{ marginTop: '32px' }}>
              <img 
                src={announcement.imageUrl} 
                alt="Announcement Attachment" 
                style={{ width: '100%', borderRadius: '8px', border: '1px solid #E5E7EB', maxHeight: '500px', objectFit: 'cover' }} 
              />
            </div>
          )}

          {role === 'ADMIN' && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #F3F4F6' }}>
              <Link href={`/announcements/${id}/edit`} style={{ textDecoration: 'none' }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1px solid #E5E7EB', color: '#374151', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  Edit
                </button>
              </Link>
              <button 
                onClick={() => setShowDeleteModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1px solid #FEE2E2', color: '#EF4444', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(11, 31, 58, 0.4)', 
          backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', 
          zIndex: 999 
        }}>
          <div style={{ 
            background: '#FFFFFF', padding: '32px', borderRadius: '16px', 
            width: '100%', maxWidth: '400px', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            animation: 'modalSlideUp 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0B1F3A', margin: 0 }}>Delete Announcement?</h3>
            </div>
            
            <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.5, marginBottom: '32px', marginLeft: '56px' }}>
              Are you sure you want to delete this announcement? This action cannot be undone.
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button type="button" variant="outline" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                style={{ 
                  background: '#EF4444', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', 
                  fontSize: '13px', fontWeight: 600, cursor: isDeleting ? 'not-allowed' : 'pointer', opacity: isDeleting ? 0.7 : 1 
                }}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes modalSlideUp {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}} />
        </div>
      )}
    </>
  );
}
