import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const report = await prisma.report.findUnique({
      where: { id: params.id },
      include: { generatedBy: { select: { id: true, name: true } } },
    });

    if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    return NextResponse.json(report, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch report:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyToken(token);
    const role = (decoded as any)?.role;
    if (!decoded || role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.report.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete report:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
