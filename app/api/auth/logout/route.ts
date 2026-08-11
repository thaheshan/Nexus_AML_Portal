import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Clear the HttpOnly token cookie
    cookies().set({
      name: 'token',
      value: '',
      httpOnly: true,
      path: '/',
      expires: new Date(0), // Expire instantly
    });

    return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
  } catch (error) {
    console.error('Logout Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
