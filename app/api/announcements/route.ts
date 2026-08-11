import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '5');
    const category = searchParams.get('category') || 'All Categories';
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build the where clause
    const whereClause: any = {};
    if (category !== 'All Categories') {
      whereClause.category = category;
    }
    if (search) {
      whereClause.title = { contains: search, mode: 'insensitive' };
    }

    const [announcements, totalCount] = await Promise.all([
      prisma.announcement.findMany({
        where: whereClause,
        include: {
          author: { select: { name: true, role: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.announcement.count({ where: whereClause })
    ]);

    return NextResponse.json({
      data: announcements,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to fetch announcements:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Auth check - Only ADMIN can create (Simplified for demo, usually use middleware/decorators)
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const decoded = await verifyToken(token);
    if (!decoded || (decoded as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, category, message, imageUrl } = body;

    if (!title || !category || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newAnnouncement = await prisma.announcement.create({
      data: {
        title,
        category,
        message,
        imageUrl,
        authorId: (decoded as any).id,
      },
      include: {
        author: { select: { name: true, role: true } }
      }
    });

    return NextResponse.json(newAnnouncement, { status: 201 });
  } catch (error) {
    console.error('Failed to create announcement:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
