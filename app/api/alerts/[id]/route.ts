import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const alert = await prisma.alert.findUnique({
      where: { id: params.id },
      include: {
        relatedCase: { select: { id: true, caseId: true, entityName: true } },
      },
    });

    if (!alert) return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    return NextResponse.json(alert, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch alert:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyToken(token);
    const role = (decoded as any)?.role;
    if (!decoded || (role !== 'ADMIN' && role !== 'DEVELOPER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    const updated = await prisma.alert.update({
      where: { id: params.id },
      data: body,
      include: {
        relatedCase: { select: { id: true, caseId: true, entityName: true } },
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Failed to update alert:', error);
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

    await prisma.alert.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete alert:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
