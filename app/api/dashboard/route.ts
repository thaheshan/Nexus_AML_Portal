import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { withCache } from '@/lib/cache';

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

    const userId = decoded.id as string;
    const cacheKey = `dashboard:${userId}`;

    // Cache TTL 30s
    const dashboardData = await withCache(cacheKey, 30, async () => {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return null;

      const role = user.role;

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

      const stats = {
        activeCases: { value: activeCases, change: '0%', positive: true },
        pendingReviews: { value: pendingReviews, change: '0%', positive: false },
        alertsToday: { value: alertsToday, change: '0%', positive: true },
        resolvedThisWeek: { value: resolvedThisWeek, change: '0%', positive: true },
      };

      let activities: any[] = [];
      const limit = 5;

      const announcements = await prisma.announcement.findMany({
        take: limit, orderBy: { createdAt: 'desc' }
      });
      activities.push(...announcements.map(a => ({
        id: `ann-${a.id}`,
        title: `Announcement: ${a.title}`,
        description: a.message,
        time: a.createdAt,
        type: 'report',
        color: '#10B981',
      })));

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

      activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      activities = activities.slice(0, 6);

      const formattedActivities = activities.map(a => ({
        ...a,
        time: new Date(a.time).toISOString()
      }));

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
        const createdBucket = Math.floor((new Date(c.createdAt).getTime() - thirtyDaysAgo.getTime()) / bucketMs);
        if (createdBucket >= 0 && createdBucket < 12) {
          newCasesData[createdBucket]++;
        }
        
        if (c.status === 'CLOSED' && new Date(c.updatedAt) >= thirtyDaysAgo) {
          const resolvedBucket = Math.floor((new Date(c.updatedAt).getTime() - thirtyDaysAgo.getTime()) / bucketMs);
          if (resolvedBucket >= 0 && resolvedBucket < 12) {
            resolvedData[resolvedBucket]++;
          }
        }
      });

      const xLabels = [];
      for (let i = 0; i < 6; i++) {
        const d = new Date(thirtyDaysAgo.getTime() + (i * 2 * bucketMs));
        xLabels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      }

      return {
        stats,
        activities: formattedActivities,
        chart: {
          newCasesData,
          resolvedData,
          xLabels
        }
      };
    });

    if (!dashboardData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
