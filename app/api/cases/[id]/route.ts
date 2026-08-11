import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const caseItem = await prisma.case.findUnique({
      where: { id: params.id },
      include: {
        assignee: { select: { id: true, name: true } }
      }
    });

    if (!caseItem) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    return NextResponse.json(caseItem, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch case:', error);
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
    const { entityName, riskLevel, status, assigneeId } = body;

    const updatedCase = await prisma.case.update({
      where: { id: params.id },
      data: { entityName, riskLevel, status, assigneeId: assigneeId || null },
      include: {
        assignee: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json(updatedCase, { status: 200 });
  } catch (error) {
    console.error('Failed to update case:', error);
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

    // Delete associated alerts first
    await prisma.alert.deleteMany({ where: { relatedCaseId: params.id } });

    // Delete case
    await prisma.case.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete case:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
