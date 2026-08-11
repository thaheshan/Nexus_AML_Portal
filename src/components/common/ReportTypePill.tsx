'use client';

import React from 'react';

interface ReportTypePillProps {
  type: string;
}

export default function ReportTypePill({ type }: ReportTypePillProps) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    SUMMARY:         { bg: 'rgba(46,107,255,0.10)',   text: '#2E6BFF', label: 'Summary' },
    RISK_ASSESSMENT: { bg: 'rgba(224,164,0,0.12)',    text: '#C47F00', label: 'Risk Assessment' },
    AUDIT_LOG:       { bg: 'rgba(90,107,133,0.10)',   text: '#5A6B85', label: 'Audit Log' },
  };

  const c = config[type.toUpperCase()] ?? { bg: '#F3F4F6', text: '#6B7280', label: type };

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '4px 10px', borderRadius: '6px',
      fontSize: '11px', fontWeight: 600,
      backgroundColor: c.bg, color: c.text, whiteSpace: 'nowrap',
    }}>
      {c.label}
    </span>
  );
}
