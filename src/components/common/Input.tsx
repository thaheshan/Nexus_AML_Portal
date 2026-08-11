import React, { InputHTMLAttributes, useState } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function Input({ label, type = 'text', style, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', marginBottom: '16px' }}>
      <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
        {label}
      </label>
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          type={isPassword && showPassword ? 'text' : type}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            fontSize: '14px',
            outline: 'none',
            color: 'var(--text-primary)',
            backgroundColor: '#FFFFFF',
            ...style
          }}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
