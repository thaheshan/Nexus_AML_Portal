'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/slices/authSlice';

export default function AuthScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login for now
    const dummyUser = { id: '1', email, name: 'Test User' };
    const dummyToken = 'dummy-jwt-token-123';
    
    // In a real app, you'd call /api/auth/login and it would set an HttpOnly cookie
    document.cookie = `token=${dummyToken}; path=/`;
    dispatch(setCredentials({ user: dummyUser, token: dummyToken }));
    router.push('/announcements');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <div style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(11,31,58,0.1)', width: '400px' }}>
        <h2 style={{ color: 'var(--navy)', marginBottom: '8px' }}>Sign In</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>Welcome back to Nexus AML Portal</p>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
          />
          <button type="submit" style={{ padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--navy)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
