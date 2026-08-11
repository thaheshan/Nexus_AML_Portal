'use client';

import React, { useState } from 'react';
import { useGetAnnouncementsQuery } from '@/store/services/apiService';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import AnnouncementCard from '@/components/announcements/AnnouncementCard';
import Link from 'next/link';

export default function AnnouncementsScreen() {
  const user = useSelector((state: RootState) => state.auth.user);
  const role = user?.role || 'VIEWER';
  
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('All Categories');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useGetAnnouncementsQuery({ page, limit: 5, category, search });
  
  const announcements = data?.data || [];
  const meta = data?.meta;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    setPage(1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#0B1F3A', marginBottom: '4px' }}>Announcements</h1>
          <p style={{ fontSize: '13px', color: '#6B7280' }}>Project updates and team announcements</p>
        </div>
        {role === 'ADMIN' && (
          <Link href="/announcements/new" style={{ textDecoration: 'none' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0B1F3A', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1E3A5F'}
              onMouseLeave={e => e.currentTarget.style.background = '#0B1F3A'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              New Announcement
            </button>
          </Link>
        )}
      </div>

      {/* Filters Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', top: '10px' }}>
            <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Search announcements..." 
            value={search}
            onChange={handleSearch}
            style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px', outline: 'none' }}
          />
        </div>
        <div>
          <select 
            value={category}
            onChange={handleCategoryChange}
            style={{ padding: '8px 36px 8px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px', outline: 'none', appearance: 'none', backgroundColor: '#FFFFFF', backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'10\' height=\'6\' viewBox=\'0 0 10 6\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1L5 5L9 1\' stroke=\'%236B7280\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
          >
            <option value="All Categories">All Categories</option>
            <option value="Update">Update</option>
            <option value="Important">Important</option>
            <option value="Milestone">Milestone</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#6B7280' }}>Loading...</div>
      ) : announcements.length === 0 ? (
        /* Empty State */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#F3F4F6', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '16px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 12H3"></path><path d="M16 6H3"></path><path d="M16 18H3"></path><path d="M18 9v6"></path><path d="M21 12h-3"></path>
            </svg>
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0B1F3A', marginBottom: '8px' }}>No announcements yet</h3>
          <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '24px', textAlign: 'center', maxWidth: '300px', lineHeight: 1.5 }}>
            Create your first announcement to keep the team in the loop.
          </p>
          {role === 'ADMIN' && (
            <Link href="/announcements/new" style={{ textDecoration: 'none' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0B1F3A', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                New Announcement
              </button>
            </Link>
          )}
        </div>
      ) : (
        /* List State */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {announcements.map((item: any) => (
            <AnnouncementCard key={item.id} {...item} />
          ))}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '32px' }}>
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ background: 'none', border: 'none', cursor: page === 1 ? 'not-allowed' : 'pointer', color: page === 1 ? '#D1D5DB' : '#6B7280', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                Previous
              </button>
              
              <div style={{ display: 'flex', gap: '4px' }}>
                {Array.from({ length: meta.totalPages }).map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setPage(i + 1)}
                    style={{ 
                      width: '28px', height: '28px', borderRadius: '6px', 
                      background: page === i + 1 ? '#F3F4F6' : 'transparent', 
                      border: 'none', cursor: 'pointer', 
                      color: page === i + 1 ? '#0B1F3A' : '#6B7280', 
                      fontWeight: page === i + 1 ? 600 : 400,
                      fontSize: '13px'
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                style={{ background: 'none', border: 'none', cursor: page === meta.totalPages ? 'not-allowed' : 'pointer', color: page === meta.totalPages ? '#D1D5DB' : '#6B7280', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                Next
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
