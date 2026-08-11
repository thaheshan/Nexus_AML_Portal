import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { cookies, headers } from 'next/headers';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting on Login Route to Prevent Brute-Force Attacks
    const reqHeaders = headers();
    const clientIp = reqHeaders.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    
    // Limit: max 5 login attempts per 60 seconds per IP
    const rl = await rateLimit(`login:${clientIp}`, 5, 60);
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in a minute.' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rl.reset - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': rl.limit.toString(),
            'X-RateLimit-Remaining': rl.remaining.toString(),
          },
        }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Generate JWT payload
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    const token = await signToken(payload);

    // Set secure HTTP-Only cookie (HTTPS enforced in production via secure flag)
    cookies().set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return NextResponse.json({
      message: 'Logged in successfully',
      user: payload,
      token
    }, { status: 200 });

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
