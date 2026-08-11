import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { withCache, invalidateCache } from '@/lib/cache';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const severity = searchParams.get('severity') || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    const unresolvedOnly = searchParams.get('unresolvedOnly') === 'true';

    const cacheKey = `alerts:${page}:${limit}:${search}:${severity}:${type}:${status}:${unresolvedOnly}`;

    const responseData = await withCache(cacheKey, 15, async () => {
      const skip = (page - 1) * limit;

      const whereClause: any = {};

      if (severity && severity !== 'All Severities') whereClause.severity = severity;
      if (type && type !== 'All Types') whereClause.type = type;
      if (status && status !== 'All Statuses') whereClause.status = status;
      if (unresolvedOnly) whereClause.status = { not: 'RESOLVED' };
      if (search) {
        whereClause.OR = [
          { description: { contains: search, mode: 'insensitive' } },
          { type: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [alerts, totalCount, unresolvedCount] = await Promise.all([
        prisma.alert.findMany({
          where: whereClause,
          include: {
            relatedCase: { select: { id: true, caseId: true } },
          },
          orderBy: [
            { severity: 'asc' },
            { createdAt: 'desc' },
          ],
          skip,
          take: limit,
        }),
        prisma.alert.count({ where: whereClause }),
        prisma.alert.count({ where: { status: { not: 'RESOLVED' } } }),
      ]);

      return {
        data: alerts,
        meta: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
          unresolvedCount,
        },
      };
    });

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error('Failed to fetch alerts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyToken(token);
    const role = (decoded as any)?.role;
    if (!decoded || (role !== 'ADMIN' && role !== 'DEVELOPER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { severity, type, description, relatedCaseId, status } = body;

    if (!severity || !type || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const alert = await prisma.alert.create({
      data: {
        severity,
        type,
        description,
        relatedCaseId: relatedCaseId || null,
        status: status || 'NEW',
      },
      include: {
        relatedCase: { select: { id: true, caseId: true } },
      },
    });

    await invalidateCache(['alerts:*', 'dashboard:*', 'notifications:*']);

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error('Failed to create alert:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
