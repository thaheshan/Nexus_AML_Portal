'use client';

import React from 'react';

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: string;
  color: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

function ActivityIcon({ type, color }: { type: string; color: string }) {
  return (
    <div style={{
      width: '36px',
      height: '36px',
      borderRadius: '8px',
      backgroundColor: `${color}18`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      {type === 'case' && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
      )}
      {type === 'report' && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      )}
      {type === 'alert' && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      )}
      {type === 'user' && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      )}
    </div>
  );
}

export default function ActivityFeed({ activities = [] }: ActivityFeedProps) {
  return (
    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0B1F3A' }}>Recent Activity</h3>
        <button style={{ fontSize: '13px', color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>View All</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {activities.length === 0 ? (
          <div style={{ fontSize: '13px', color: '#6B7280', textAlign: 'center', padding: '20px 0' }}>No recent activity.</div>
        ) : (
          activities.map(activity => (
            <div key={activity.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <ActivityIcon type={activity.type} color={activity.color} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0B1F3A', marginBottom: '2px' }}>{activity.title}</div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '2px', lineHeight: 1.4 }}>{activity.description}</div>
                <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{new Date(activity.time).toLocaleString()}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
