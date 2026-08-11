import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded || !(decoded as any).id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const role = (decoded as any).role as string;

    const notifications: any[] = [];
    const limit = 4;

    // 1. Recent Announcements (all roles)
    const announcements = await prisma.announcement.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, message: true, category: true, createdAt: true },
    });

    announcements.forEach(a => {
      notifications.push({
        id: `ann-${a.id}`,
        title: `Announcement: ${a.title}`,
        message: a.message.length > 70 ? a.message.slice(0, 70) + '…' : a.message,
        time: a.createdAt,
        type: 'announcement',
        category: a.category,
        href: '/announcements',
        read: false,
      });
    });

    // 2. Recent Cases (all roles)
    const cases = await prisma.case.findMany({
      take: limit,
      orderBy: { updatedAt: 'desc' },
      select: { id: true, caseId: true, entityName: true, status: true, riskLevel: true, updatedAt: true },
    });

    cases.forEach(c => {
      notifications.push({
        id: `case-${c.id}`,
        title: `Case ${c.caseId} updated`,
        message: `${c.entityName} is now ${c.status} (${c.riskLevel} Risk)`,
        time: c.updatedAt,
        type: 'case',
        category: c.riskLevel,
        href: `/cases/${c.id}`,
        read: false,
      });
    });

    // 3. Alerts & Reports (ADMIN / DEVELOPER only)
    if (role === 'ADMIN' || role === 'DEVELOPER') {
      const alerts = await prisma.alert.findMany({
        where: { status: { not: 'RESOLVED' } },
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: { id: true, severity: true, type: true, description: true, createdAt: true },
      });

      alerts.forEach(al => {
        notifications.push({
          id: `alt-${al.id}`,
          title: `Alert Triggered: ${al.severity}`,
          message: al.description.length > 70 ? al.description.slice(0, 70) + '…' : al.description,
          time: al.createdAt,
          type: 'alert',
          category: al.type,
          href: '/alerts',
          read: false,
        });
      });

      const reports = await prisma.report.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, type: true, createdAt: true },
      });

      reports.forEach(r => {
        notifications.push({
          id: `rep-${r.id}`,
          title: `Report Ready`,
          message: `${r.name} (${r.type}) has been generated`,
          time: r.createdAt,
          type: 'report',
          category: r.type,
          href: '/reports',
          read: false,
        });
      });
    }

    // Sort combined notifications chronologically desc and pick top 8
    notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    const topNotifications = notifications.slice(0, 8);

    return NextResponse.json({
      unreadCount: topNotifications.length,
      notifications: topNotifications,
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
