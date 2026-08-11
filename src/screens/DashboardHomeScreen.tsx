'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import StatCard from '@/components/dashboard/StatCard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import CaseVolumeChart from '@/components/dashboard/CaseVolumeChart';

export default function DashboardHomeScreen() {
  const user = useSelector((state: RootState) => state.auth.user);
  const role = user?.role || 'VIEWER';

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const firstName = user?.name?.split(' ')[0] || 'User';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0B1F3A', marginBottom: '4px' }}>
          Welcome back, {firstName}
        </h1>
        <p style={{ fontSize: '13px', color: '#6B7280' }}>{today}</p>
      </div>

      {/* Stat Cards — role-gated */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <StatCard label="Active Cases"         value="142" change="22%"  positive={true} />
        <StatCard label="Pending Reviews"      value="38"  change="4%"   positive={false} />
        {(role === 'ADMIN' || role === 'DEVELOPER') && (
          <StatCard label="Alerts Today"       value="215" change="8%"   positive={true} />
        )}
        {(role === 'ADMIN') && (
          <StatCard label="Resolved This Week" value="89"  change="0%"   positive={true} neutral />
        )}
      </div>

      {/* Bottom Section */}
      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Recent Activity — left */}
        <div style={{ flex: 1 }}>
          <ActivityFeed />
        </div>

        {/* Chart — right, only for Admin + Developer */}
        {(role === 'ADMIN' || role === 'DEVELOPER') && (
          <div style={{ flex: 1 }}>
            <CaseVolumeChart />
          </div>
        )}
      </div>
    </div>
  );
}
