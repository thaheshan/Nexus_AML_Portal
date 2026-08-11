import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data for announcements so the dashboard doesn't crash
  const mockAnnouncements = [
    { id: '1', title: 'System Maintenance Scheduled', category: 'Update', message: 'Downtime expected at midnight.', authorId: 'sys', createdAt: new Date() },
    { id: '2', title: 'New AML Regulations', category: 'Important', message: 'Please review the updated guidelines.', authorId: 'sys', createdAt: new Date() }
  ];

  return NextResponse.json(mockAnnouncements, { status: 200 });
}
