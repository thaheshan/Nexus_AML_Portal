import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const dateRange = searchParams.get('dateRange') || '';

    const skip = (page - 1) * limit;
    const now = new Date();

    const whereClause: any = {};

    if (type && type !== 'All Types') whereClause.type = type;

    if (dateRange && dateRange !== 'All Time') {
      let fromDate = new Date();
      if (dateRange === 'Last 7 Days')   fromDate = new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000);
      if (dateRange === 'Last 30 Days')  fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      if (dateRange === 'Last 90 Days')  fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      whereClause.createdAt = { gte: fromDate };
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { type: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Stats for summary cards
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [reports, totalCount, thisMonthCount, scheduledCount, lastReport] = await Promise.all([
      prisma.report.findMany({
        where: whereClause,
        include: { generatedBy: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.report.count({ where: whereClause }),
      prisma.report.count({ where: { createdAt: { gte: startOfMonth } } }),
      // Scheduled reports placeholder (can be extended with a Schedule model later)
      Promise.resolve(3),
      prisma.report.findFirst({ orderBy: { createdAt: 'desc' } }),
    ]);

    return NextResponse.json({
      data: reports,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        stats: {
          thisMonth: thisMonthCount,
          scheduled: scheduledCount,
          lastGeneratedAt: lastReport?.createdAt ?? null,
        },
      },
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to fetch reports:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyToken(token);
    const userId = (decoded as any)?.id;
    const role   = (decoded as any)?.role;

    if (!decoded || !userId || (role !== 'ADMIN' && role !== 'DEVELOPER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, type, dateRangeFrom, dateRangeTo, fileUrl } = body;

    if (!name || !type || !dateRangeFrom || !dateRangeTo) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        name,
        type,
        dateRangeFrom: new Date(dateRangeFrom),
        dateRangeTo:   new Date(dateRangeTo),
        generatedById: userId,
        fileUrl: fileUrl || null,
      },
      include: { generatedBy: { select: { id: true, name: true } } },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Failed to create report:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
