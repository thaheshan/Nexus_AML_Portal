'use client';

import React from 'react';
import { useGetAnnouncementsQuery } from '@/store/services/apiService';

export default function AnnouncementsScreen() {
  const { data: announcements, isLoading } = useGetAnnouncementsQuery();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>Announcements</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Project updates and team announcements</p>
        </div>
        <button style={{ background: 'var(--navy)', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
          + New Announcement
        </button>
      </div>

      {isLoading ? (
        <div>Loading announcements...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {announcements?.length ? (
            announcements.map((item) => (
              <div key={item.id} style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 2px rgba(11,31,58,0.06)' }}>
                {item.title}
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-muted)' }}>
              No announcements yet. Create your first one to keep the team in the loop.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
