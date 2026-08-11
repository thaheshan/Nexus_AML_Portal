'use client';

import React from 'react';

interface BadgeProps {
  label: string;
}

export default function Badge({ label }: BadgeProps) {
  let bgColor = '#F3F4F6';
  let textColor = '#4B5563';

  if (label.toLowerCase() === 'update') {
    bgColor = '#E0F2FE';
    textColor = '#0284C7';
  } else if (label.toLowerCase() === 'important') {
    bgColor = '#FEF3C7';
    textColor = '#D97706';
  } else if (label.toLowerCase() === 'milestone') {
    bgColor = '#D1FAE5';
    textColor = '#059669';
  }

  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 600,
      backgroundColor: bgColor,
      color: textColor,
      marginBottom: '8px'
    }}>
      {label}
    </span>
  );
}
