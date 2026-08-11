'use client';

import React from 'react';

interface AlertStatusPillProps {
  status: string;
}

export default function AlertStatusPill({ status }: AlertStatusPillProps) {
  const s = status.toUpperCase();

  const config: Record<string, { bg: string; text: string; label: string }> = {
    NEW:           { bg: 'rgba(214,69,69,0.10)', text: '#D64545', label: 'New' },
    INVESTIGATING: { bg: 'rgba(46,107,255,0.10)', text: '#2E6BFF',  label: 'Investigating' },
    ACKNOWLEDGED:  { bg: 'rgba(90,107,133,0.10)', text: '#5A6B85',  label: 'Acknowledged' },
    RESOLVED:      { bg: 'rgba(31,169,127,0.10)', text: '#1FA97F',  label: 'Resolved' },
  };

  const c = config[s] || { bg: '#F3F4F6', text: '#6B7280', label: status };

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '4px 10px', borderRadius: '12px',
      fontSize: '11px', fontWeight: 500,
      backgroundColor: c.bg, color: c.text,
    }}>
      {c.label}
    </span>
  );
}
