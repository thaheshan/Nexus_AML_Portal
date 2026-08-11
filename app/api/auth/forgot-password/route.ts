import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // To prevent email enumeration, we always return a success message
    // even if the user is not found.
    if (user) {
      // Generate a secure random token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.passwordResetToken.create({
        data: {
          email,
          token,
          expiresAt,
        },
      });

      // Construct reset URL (using localhost for dev as agreed)
      const resetUrl = `http://localhost:3000/reset-password?token=${token}`;

      // Send email via Resend
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        // DEV NOTE: Resend free tier only sends to verified email.
        // Replace with email once a verified domain is added.
        to: 'furiousnivas@gmail.com',
        subject: 'Reset your Nexus AML Portal password',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #0B1F3A;">Password Reset Request</h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.5;">
              We received a request to reset the password for your Nexus AML Portal account associated with this email address.
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.5;">
              You can reset your password by clicking the button below:
            </p>
            <div style="margin: 32px 0;">
              <a href="${resetUrl}" style="background-color: #0B1F3A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #6B7280; font-size: 14px;">
              If you didn't request this, you can safely ignore this email. This link will expire in 1 hour.
            </p>
            <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 32px 0;" />
            <p style="color: #9CA3AF; font-size: 12px;">
              Nexus AML Portal Security Team
            </p>
          </div>
        `
      });
    }

    return NextResponse.json(
      { message: 'If an account exists with that email, a password reset link has been sent.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
