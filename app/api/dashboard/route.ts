import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Fetch user to get exact role
    const user = await prisma.user.findUnique({ where: { id: decoded.id as string } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const role = user.role;

    // --- 1. Stats Aggregation ---
    const activeCases = await prisma.case.count({
      where: { status: { in: ['OPEN', 'UNDER_REVIEW'] } }
    });

    const pendingReviews = await prisma.case.count({
      where: { status: 'UNDER_REVIEW' }
    });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const alertsToday = await prisma.alert.count({
      where: { createdAt: { gte: startOfDay } }
    });

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    const resolvedThisWeek = await prisma.case.count({
      where: { status: 'CLOSED', updatedAt: { gte: startOfWeek } }
    });

    // Calculate changes (mocked changes for now since we need historical snapshots to calculate true % change)
    // To do true % change, we'd need to compare to previous periods. We'll return 0% for now.
    const stats = {
      activeCases: { value: activeCases, change: '0%', positive: true },
      pendingReviews: { value: pendingReviews, change: '0%', positive: false },
      alertsToday: { value: alertsToday, change: '0%', positive: true },
      resolvedThisWeek: { value: resolvedThisWeek, change: '0%', positive: true },
    };

    // --- 2. Recent Activity (Role Based) ---
    let activities: any[] = [];
    const limit = 5;

    // Announcements (All roles)
    const announcements = await prisma.announcement.findMany({
      take: limit, orderBy: { createdAt: 'desc' }
    });
    activities.push(...announcements.map(a => ({
      id: `ann-${a.id}`,
      title: `Announcement: ${a.title}`,
      description: a.message,
      time: a.createdAt,
      type: 'report', // Reusing report icon for announcement
      color: '#10B981',
    })));

    // Cases (All roles)
    const cases = await prisma.case.findMany({
      take: limit, orderBy: { updatedAt: 'desc' }
    });
    activities.push(...cases.map(c => ({
      id: `case-${c.id}`,
      title: `Case #${c.caseId} Updated`,
      description: `Entity: ${c.entityName} - Status changed to ${c.status}`,
      time: c.updatedAt,
      type: 'case',
      color: '#3B82F6',
    })));

    if (role === 'ADMIN' || role === 'DEVELOPER') {
      // Alerts (Admin/Developer only)
      const alerts = await prisma.alert.findMany({
        take: limit, orderBy: { createdAt: 'desc' }
      });
      activities.push(...alerts.map(a => ({
        id: `alert-${a.id}`,
        title: `Alert: ${a.type}`,
        description: a.description,
        time: a.createdAt,
        type: 'alert',
        color: '#EF4444',
      })));

      // Reports (Admin/Developer only)
      const reports = await prisma.report.findMany({
        take: limit, orderBy: { createdAt: 'desc' }
      });
      activities.push(...reports.map(r => ({
        id: `rep-${r.id}`,
        title: `Report Generated: ${r.name}`,
        description: `Type: ${r.type}`,
        time: r.createdAt,
        type: 'report',
        color: '#10B981',
      })));
    }

    // Sort combined activities by time desc and take top 6
    activities.sort((a, b) => b.time.getTime() - a.time.getTime());
    activities = activities.slice(0, 6);

    // Format time to string (e.g. "2 hours ago") - simplified to ISO for now, frontend can parse
    const formattedActivities = activities.map(a => ({
      ...a,
      time: a.time.toISOString()
    }));

    // --- 3. Case Volume Timeseries (30 Days) ---
    // We need 12 buckets over 30 days (each bucket is 2.5 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0,0,0,0);

    const recentCases = await prisma.case.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, status: true, updatedAt: true }
    });

    const newCasesData = Array(12).fill(0);
    const resolvedData = Array(12).fill(0);
    const bucketMs = (30 * 24 * 60 * 60 * 1000) / 12;

    recentCases.forEach(c => {
      const createdBucket = Math.floor((c.createdAt.getTime() - thirtyDaysAgo.getTime()) / bucketMs);
      if (createdBucket >= 0 && createdBucket < 12) {
        newCasesData[createdBucket]++;
      }
      
      if (c.status === 'CLOSED' && c.updatedAt >= thirtyDaysAgo) {
        const resolvedBucket = Math.floor((c.updatedAt.getTime() - thirtyDaysAgo.getTime()) / bucketMs);
        if (resolvedBucket >= 0 && resolvedBucket < 12) {
          resolvedData[resolvedBucket]++;
        }
      }
    });

    // Generate xLabels (6 labels)
    const xLabels = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(thirtyDaysAgo.getTime() + (i * 2 * bucketMs));
      xLabels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }

    // Because the DB might be empty, we don't want the chart to be completely flat at 0.
    // If there is zero data, let's inject a tiny bit of dummy variance just for visual structure
    // as per typical dashboard empty states, but since user asked for 100% real data, we will leave it at 0.

    return NextResponse.json({
      stats,
      activities: formattedActivities,
      chart: {
        newCasesData,
        resolvedData,
        xLabels
      }
    });

  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
