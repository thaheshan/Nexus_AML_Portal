import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Filters
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const riskLevel = searchParams.get('riskLevel') || '';
    const assigneeId = searchParams.get('assigneeId') || '';

    const skip = (page - 1) * limit;

    // Build the where clause
    const whereClause: any = {};
    
    if (status && status !== 'All Statuses') {
      whereClause.status = status;
    }
    
    if (riskLevel && riskLevel !== 'All Risk Levels') {
      whereClause.riskLevel = riskLevel;
    }

    if (assigneeId && assigneeId !== 'All Assignees') {
      whereClause.assigneeId = assigneeId;
    }

    if (search) {
      whereClause.OR = [
        { entityName: { contains: search, mode: 'insensitive' } },
        { caseId: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [cases, totalCount] = await Promise.all([
      prisma.case.findMany({
        where: whereClause,
        include: {
          assignee: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.case.count({ where: whereClause })
    ]);

    return NextResponse.json({
      data: cases,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to fetch cases:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const decoded = await verifyToken(token);
    const role = (decoded as any)?.role;
    
    // Only Admin and Developer can create cases
    if (!decoded || (role !== 'ADMIN' && role !== 'DEVELOPER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { entityName, riskLevel, status, assigneeId } = body;

    if (!entityName || !riskLevel || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Auto-generate CASE-XXXX
    // In a production app, we'd use a transaction or a DB sequence to ensure uniqueness safely under high load.
    // Here we'll grab the highest current Case ID and increment it.
    const lastCase = await prisma.case.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    let nextNumber = 1000; // Start at 1000
    if (lastCase && lastCase.caseId.startsWith('CASE-')) {
      const parts = lastCase.caseId.split('-');
      if (parts.length === 2 && !isNaN(parseInt(parts[1]))) {
        nextNumber = parseInt(parts[1]) + 1;
      }
    }
    const newCaseId = `CASE-${nextNumber}`;

    const newCase = await prisma.case.create({
      data: {
        caseId: newCaseId,
        entityName,
        riskLevel,
        status,
        assigneeId: assigneeId || null,
      },
      include: {
        assignee: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json(newCase, { status: 201 });
  } catch (error) {
    console.error('Failed to create case:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
