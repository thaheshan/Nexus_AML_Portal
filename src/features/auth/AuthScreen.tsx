'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/slices/authSlice';
import { useLoginMutation } from '@/store/services/apiService';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import bgImage from '../../../public/images/bg_image.png';
import logoImage from '../../../public/images/logo_nexus_portal.png';
import Link from 'next/link';

export default function AuthScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading, error }] = useLoginMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await login({ email, password }).unwrap();
      dispatch(setCredentials({ user: response.user, token: response.token }));
      router.push('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', backgroundColor: '#FFFFFF' }}>
      <div style={{ 
        flex: 1, 
        backgroundColor: '#071324',
        backgroundImage: `url(${bgImage.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        padding: '48px',
        color: '#FFFFFF'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '80px' }}>
          <img src={logoImage.src} alt="Nexus Logo" style={{ width: '32px', height: 'auto', marginBottom: '4px' }} />
          <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>NEXUS</div>
        </div>

        <div style={{ maxWidth: '480px', marginBottom: 'auto' }}>
          <h1 style={{ fontSize: '42px', fontWeight: 500, lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.02em' }}>
            Compliance intelligence, <br/>unified.
          </h1>
          <p style={{ fontSize: '16px', color: '#8FA3C4', lineHeight: 1.5, fontWeight: 400 }}>
            Monitor cases, screen entities, and manage AML workflows from a single secure portal.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: '#5A6B85', fontWeight: 500 }}>
          <span>SOC 2 Type II</span>
          <span>|</span>
          <span>ISO 27001</span>
          <span>|</span>
          <span>256-bit Encryption</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '48px' }}>
        <div style={{ width: '100%', maxWidth: '360px' }}>
          <div style={{ marginBottom: '40px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Welcome Back</div>
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--navy)', letterSpacing: '-0.01em' }}>Sign in to your account</h2>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column' }}>
            <Input 
              label="Work Email" 
              type="email" 
              placeholder="you@company.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <div style={{ color: 'var(--red)', fontSize: '13px', marginBottom: '16px' }}>Invalid credentials</div>}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', fontSize: '13px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <input type="checkbox" style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--navy)' }} />
                Remember me
              </label>
              <a href="/forgot-password" style={{ color: 'var(--blue)', textDecoration: 'none', fontWeight: 500 }}>Forgot password?</a>
            </div>

            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '32px 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
            <div style={{ padding: '0 16px', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>OR</div>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
          </div>

          <Button type="button" variant="outline" fullWidth icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--blue)' }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          }>
            Sign in with SSO
          </Button>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link href="/register/role" style={{ color: 'var(--blue)', textDecoration: 'none', fontWeight: 600 }}>
              Sign up
            </Link>
          </div>

          <div style={{ marginTop: '48px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Protected by enterprise-grade encryption.<br/>
            Unauthorized access is prohibited and monitored.
          </div>
        </div>
      </div>
    </div>
  );
}
