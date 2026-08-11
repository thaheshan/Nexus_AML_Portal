'use client';

import React, { useState, Suspense } from 'react';
import { useResetPasswordMutation } from '@/store/services/apiService';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [resetPassword, { isLoading, error }] = useResetPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newPassword) return;

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await resetPassword({ token, newPassword }).unwrap();
      setSuccess(true);
    } catch (err) {
      console.error('Failed to reset password:', err);
    }
  };

  if (!token) {
    return (
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0B1F3A', marginBottom: '16px' }}>Invalid Link</h2>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '32px' }}>
          This password reset link is invalid or missing the reset token. Please request a new link.
        </p>
        <Link href="/forgot-password" style={{ textDecoration: 'none' }}>
          <button style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#0B1F3A', color: '#FFFFFF', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            Request New Link
          </button>
        </Link>
      </div>
    );
  }

  return (
    <>
      {success ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0B1F3A', marginBottom: '8px' }}>Password Reset Successfully</h2>
          <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.5, marginBottom: '32px' }}>
            Your password has been changed. You can now use your new credentials to log in.
          </p>
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <button style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#0B1F3A', color: '#FFFFFF', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
              Proceed to Login
            </button>
          </Link>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0B1F3A', marginBottom: '8px' }}>Create New Password</h2>
            <p style={{ fontSize: '14px', color: '#6B7280' }}>Please enter your new password below.</p>
          </div>

          {error && (
            <div style={{ backgroundColor: '#FEF2F2', borderLeft: '4px solid #EF4444', padding: '12px', marginBottom: '24px', borderRadius: '4px' }}>
              <p style={{ fontSize: '13px', color: '#B91C1C', margin: 0 }}>
                {(error as any)?.data?.error || 'An error occurred. The link may have expired.'}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label htmlFor="newPassword" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !newPassword || !confirmPassword}
              style={{
                width: '100%', padding: '12px', marginTop: '8px', borderRadius: '8px', border: 'none',
                backgroundColor: '#0B1F3A', color: '#FFFFFF', fontSize: '14px', fontWeight: 600,
                cursor: (isLoading || !newPassword) ? 'not-allowed' : 'pointer',
                opacity: (isLoading || !newPassword) ? 0.7 : 1,
              }}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </>
      )}
    </>
  );
}

export default function ResetPasswordScreen() {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#F5F7FA' }}>
      
      <div style={{ 
        flex: 1, 
        backgroundColor: '#071324', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '40px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '400px', textAlign: 'center', zIndex: 10 }}>
          <h1 style={{ color: '#FFFFFF', fontSize: '32px', fontWeight: 700, marginBottom: '16px', letterSpacing: '-0.02em' }}>
            NEXUS <span style={{ color: '#C9A227' }}>AML</span>
          </h1>
          <p style={{ color: '#8FA3C4', fontSize: '16px', lineHeight: 1.6, fontWeight: 400 }}>
            Securely reset your password and regain access to the portal.
          </p>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#FFFFFF', padding: '48px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
          <Suspense fallback={<div style={{ textAlign: 'center', padding: '24px' }}>Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
