'use client';

import React, { useState } from 'react';
import { useForgotPasswordMutation } from '@/store/services/apiService';
import Link from 'next/link';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  const [forgotPassword, { isLoading, error }] = useForgotPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      await forgotPassword({ email }).unwrap();
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to send reset email:', err);
    }
  };

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
          
          {submitted ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0B1F3A', marginBottom: '8px' }}>Check Your Email</h2>
              <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.5, marginBottom: '32px' }}>
                If an account exists with <strong>{email}</strong>, we have sent a password reset link. Please check your inbox.
              </p>
              <Link href="/login" style={{ textDecoration: 'none' }}>
                <button style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#0B1F3A', color: '#FFFFFF', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                  Return to Login
                </button>
              </Link>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0B1F3A', marginBottom: '8px' }}>Forgot Password</h2>
                <p style={{ fontSize: '14px', color: '#6B7280' }}>Enter your email address and we'll send you a link to reset your password.</p>
              </div>

              {error && (
                <div style={{ backgroundColor: '#FEF2F2', borderLeft: '4px solid #EF4444', padding: '12px', marginBottom: '24px', borderRadius: '4px' }}>
                  <p style={{ fontSize: '13px', color: '#B91C1C', margin: 0 }}>
                    {(error as any)?.data?.error || 'An error occurred. Please try again.'}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label htmlFor="email" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }}
                    placeholder="Enter your email"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email}
                  style={{
                    width: '100%', padding: '12px', marginTop: '8px', borderRadius: '8px', border: 'none',
                    backgroundColor: '#0B1F3A', color: '#FFFFFF', fontSize: '14px', fontWeight: 600,
                    cursor: (isLoading || !email) ? 'not-allowed' : 'pointer',
                    opacity: (isLoading || !email) ? 0.7 : 1,
                    transition: 'opacity 0.2s'
                  }}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <div style={{ marginTop: '32px', textAlign: 'center' }}>
                <Link href="/login" style={{ fontSize: '13px', color: '#2E6BFF', textDecoration: 'none', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                  Back to Login
                </Link>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
