import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded || !(decoded as any).id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const role = (decoded as any).role as string;

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const results: any[] = [];

    // ── Cases (all roles) ────────────────────────────────────────────────────
    const cases = await prisma.case.findMany({
      where: {
        OR: [
          { caseId: { contains: q, mode: 'insensitive' } },
          { entityName: { contains: q, mode: 'insensitive' } },
          { status: { contains: q, mode: 'insensitive' } },
          { riskLevel: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 5,
      orderBy: { updatedAt: 'desc' },
      select: { id: true, caseId: true, entityName: true, riskLevel: true, status: true },
    });

    cases.forEach(c => results.push({
      category: 'Cases',
      label: `${c.caseId} — ${c.entityName}`,
      meta: `${c.riskLevel} · ${c.status}`,
      href: `/cases/${c.id}`,
      icon: 'case',
    }));

    // ── Announcements (all roles) ────────────────────────────────────────────
    const announcements = await prisma.announcement.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { message: { contains: q, mode: 'insensitive' } },
          { category: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 4,
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, category: true, message: true },
    });

    announcements.forEach(a => results.push({
      category: 'Announcements',
      label: a.title,
      meta: a.category,
      href: `/announcements`,
      icon: 'announcement',
    }));

    // ── Alerts (ADMIN / DEVELOPER only) ─────────────────────────────────────
    if (role === 'ADMIN' || role === 'DEVELOPER') {
      const alerts = await prisma.alert.findMany({
        where: {
          OR: [
            { description: { contains: q, mode: 'insensitive' } },
            { type: { contains: q, mode: 'insensitive' } },
            { severity: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 4,
        orderBy: { createdAt: 'desc' },
        select: { id: true, severity: true, type: true, description: true, status: true },
      });

      alerts.forEach(a => results.push({
        category: 'Alerts',
        label: a.description.length > 60 ? a.description.slice(0, 60) + '…' : a.description,
        meta: `${a.severity} · ${a.type}`,
        href: `/alerts`,
        icon: 'alert',
      }));

      // ── Reports (ADMIN / DEVELOPER only) ─────────────────────────────────
      const reports = await prisma.report.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { type: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 4,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, type: true, createdAt: true },
      });

      reports.forEach(r => results.push({
        category: 'Reports',
        label: r.name,
        meta: r.type,
        href: `/reports`,
        icon: 'report',
      }));
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
