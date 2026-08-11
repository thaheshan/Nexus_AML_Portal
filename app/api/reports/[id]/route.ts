import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { withCache, invalidateCache } from '@/lib/cache';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const cacheKey = `report:${params.id}`;

    const result = await withCache(cacheKey, 60, async () => {
      const report = await prisma.report.findUnique({
        where: { id: params.id },
        include: { generatedBy: { select: { id: true, name: true, email: true } } },
      });

      if (!report) return null;

      const from = report.dateRangeFrom;
      const to   = report.dateRangeTo;

      const [totalCases, highRiskCases, alertsTriggered, closedCases, caseSample] = await Promise.all([
        prisma.case.count({ where: { createdAt: { gte: from, lte: to } } }),
        prisma.case.count({ where: { riskLevel: 'HIGH', createdAt: { gte: from, lte: to } } }),
        prisma.alert.count({ where: { createdAt: { gte: from, lte: to } } }),
        prisma.case.count({ where: { status: 'CLOSED', updatedAt: { gte: from, lte: to } } }),
        prisma.case.findMany({
          where: { createdAt: { gte: from, lte: to } },
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: { caseId: true, entityName: true, riskLevel: true, status: true, createdAt: true }
        })
      ]);

      return {
        ...report,
        metrics: { totalCases, highRiskCases, alertsTriggered, closedCases, caseSample }
      };
    });

    if (!result) return NextResponse.json({ error: 'Report not found' }, { status: 404 });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch report:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyToken(token);
    const role = (decoded as any)?.role;
    if (!decoded || (role !== 'ADMIN' && role !== 'DEVELOPER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, type } = body;

    const updatedReport = await prisma.report.update({
      where: { id: params.id },
      data: { name, type },
      include: { generatedBy: { select: { id: true, name: true } } },
    });

    await invalidateCache([`report:${params.id}`, 'reports:*', 'dashboard:*']);

    return NextResponse.json(updatedReport, { status: 200 });
  } catch (error) {
    console.error('Failed to update report:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyToken(token);
    const role = (decoded as any)?.role;
    if (!decoded || (role !== 'ADMIN' && role !== 'DEVELOPER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.report.delete({ where: { id: params.id } });

    await invalidateCache([`report:${params.id}`, 'reports:*', 'dashboard:*']);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete report:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
