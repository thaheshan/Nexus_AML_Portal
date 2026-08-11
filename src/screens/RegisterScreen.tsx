'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRegisterMutation } from '@/store/services/apiService';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Link from 'next/link';
import logoImage from '../../public/images/logo_nexus_portal.png';

export default function RegisterScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'VIEWER'; // Fallback to VIEWER

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [registerUser, { isLoading, error }] = useRegisterMutation();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerUser({ name, email, password, role }).unwrap();
      // Redirect to login after successful registration
      router.push('/login');
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-main)' }}>
      {/* Top Left Logo */}
      <div style={{ position: 'absolute', top: '32px', left: '40px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src={logoImage.src} alt="Nexus Logo" style={{ width: '28px', height: 'auto' }} />
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--navy)', letterSpacing: '-0.01em', lineHeight: 1.1 }}>Nexus AML</div>
          <div style={{ fontSize: '10px', color: '#4D6A8A', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Portal</div>
        </div>
      </div>
      <div style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(11,31,58,0.1)', width: '400px' }}>
        <h2 style={{ color: 'var(--navy)', marginBottom: '8px' }}>Create Account</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
          Registering as <strong>{role}</strong>
        </p>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column' }}>
          <Input 
            label="Full Name" 
            type="text" 
            placeholder="Jane Doe" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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

          {error && <div style={{ color: 'var(--red)', fontSize: '13px', marginBottom: '16px' }}>Failed to register. Email may already be in use.</div>}

          <div style={{ marginTop: '16px' }}>
            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </div>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--blue)', textDecoration: 'none', fontWeight: 600 }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
