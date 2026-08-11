'use client';

import React from 'react';

interface RiskBadgeProps {
  level: string;
}

export default function RiskBadge({ level }: RiskBadgeProps) {
  let bgColor = '#F3F4F6';
  let textColor = '#4B5563';

  if (level.toUpperCase() === 'HIGH') {
    bgColor = '#FEE2E2';
    textColor = '#EF4444';
  } else if (level.toUpperCase() === 'MEDIUM') {
    bgColor = '#FEF3C7';
    textColor = '#F59E0B';
  } else if (level.toUpperCase() === 'LOW') {
    bgColor = '#D1FAE5';
    textColor = '#10B981';
  }

  // Format nicely (e.g. "High")
  const displayLevel = level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4px 10px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: 600,
      backgroundColor: bgColor,
      color: textColor,
    }}>
      {displayLevel}
    </span>
  );
}
