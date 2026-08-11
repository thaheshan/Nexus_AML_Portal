'use client';

import React from 'react';

interface StatusIndicatorProps {
  status: string;
}

export default function StatusIndicator({ status }: StatusIndicatorProps) {
  let dotColor = '#6B7280';
  let bgColor = '#F3F4F6';
  let textColor = '#4B5563';
  let label = 'Unknown';

  if (status.toUpperCase() === 'OPEN') {
    dotColor = '#3B82F6';
    bgColor = '#EFF6FF';
    textColor = '#2563EB';
    label = 'Open';
  } else if (status.toUpperCase() === 'UNDER_REVIEW') {
    dotColor = '#6B7280';
    bgColor = '#F3F4F6';
    textColor = '#4B5563';
    label = 'Under Review';
  } else if (status.toUpperCase() === 'CLOSED') {
    dotColor = '#10B981';
    bgColor = '#ECFDF5';
    textColor = '#059669';
    label = 'Closed';
  }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 500,
      backgroundColor: bgColor,
      color: textColor,
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: dotColor }} />
      {label}
    </span>
  );
}
