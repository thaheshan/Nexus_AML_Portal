'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import StatCard from '@/components/dashboard/StatCard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import CaseVolumeChart from '@/components/dashboard/CaseVolumeChart';
import { useGetDashboardDataQuery } from '@/store/services/apiService';

export default function DashboardHomeScreen() {
  const user = useSelector((state: RootState) => state.auth.user);
  const role = user?.role || 'VIEWER';
  
  const { data: dashboardData, isLoading, error } = useGetDashboardDataQuery();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const firstName = user?.name?.split(' ')[0] || 'User';

  if (isLoading) {
    return <div style={{ padding: '24px', color: '#6B7280' }}>Loading dashboard data...</div>;
  }

  if (error || !dashboardData) {
    return <div style={{ padding: '24px', color: '#EF4444' }}>Failed to load dashboard data.</div>;
  }

  const { stats, activities, chart } = dashboardData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0B1F3A', marginBottom: '4px' }}>
          Welcome back, {firstName}
        </h1>
        <p style={{ fontSize: '13px', color: '#6B7280' }}>{today}</p>
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        <StatCard label="Active Cases"         value={stats.activeCases.value} change={stats.activeCases.change}  positive={stats.activeCases.positive} />
        <StatCard label="Pending Reviews"      value={stats.pendingReviews.value}  change={stats.pendingReviews.change}   positive={stats.pendingReviews.positive} />
        {(role === 'ADMIN' || role === 'DEVELOPER') && (
          <StatCard label="Alerts Today"       value={stats.alertsToday.value} change={stats.alertsToday.change}   positive={stats.alertsToday.positive} />
        )}
        {(role === 'ADMIN') && (
          <StatCard label="Resolved This Week" value={stats.resolvedThisWeek.value}  change={stats.resolvedThisWeek.change}   positive={stats.resolvedThisWeek.positive} neutral />
        )}
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        <div style={{ flex: 1 }}>
          <ActivityFeed activities={activities} />
        </div>

        {(role === 'ADMIN' || role === 'DEVELOPER') && (
          <div style={{ flex: 1 }}>
            <CaseVolumeChart 
              newCasesData={chart.newCasesData}
              resolvedData={chart.resolvedData}
              xLabels={chart.xLabels}
            />
          </div>
        )}
      </div>
    </div>
  );
}
