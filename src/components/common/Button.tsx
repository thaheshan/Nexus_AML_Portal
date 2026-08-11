import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export default function Button({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  icon,
  style,
  ...props 
}: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    width: fullWidth ? '100%' : 'auto',
    fontFamily: 'inherit',
    outline: 'none',
  };

  const variants = {
    primary: {
      backgroundColor: 'var(--navy)',
      color: '#FFFFFF',
      border: '1px solid var(--navy)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--navy)',
      border: '1px solid var(--border-color)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--text-secondary)',
      border: 'none',
      padding: '8px 16px',
    }
  };

  return (
    <button 
      style={{ ...baseStyle, ...variants[variant], ...style }} 
      {...props}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}
