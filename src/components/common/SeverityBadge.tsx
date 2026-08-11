'use client';

import React from 'react';

interface SeverityBadgeProps {
  severity: string;
}

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  const s = severity.toUpperCase();

  const config: Record<string, { bg: string; text: string; dot?: string; label: string }> = {
    CRITICAL: { bg: 'rgba(214,69,69,0.10)', text: '#D64545', dot: '#D64545', label: 'Critical' },
    HIGH:     { bg: 'rgba(224,164,0,0.12)', text: '#C47F00', dot: undefined,  label: 'High' },
    MEDIUM:   { bg: 'rgba(224,164,0,0.08)', text: '#B07300', dot: undefined,  label: 'Medium' },
    LOW:      { bg: 'rgba(143,163,196,0.15)', text: '#5A6B85', dot: undefined, label: 'Low' },
  };

  const c = config[s] || config['LOW'];

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '4px 10px', borderRadius: '6px',
      fontSize: '11px', fontWeight: 600,
      backgroundColor: c.bg, color: c.text,
    }}>
      {c.dot && (
        <span style={{
          width: '6px', height: '6px', borderRadius: '50%',
          backgroundColor: c.dot,
          boxShadow: `0 0 0 0 ${c.dot}`,
          animation: 'pulseRing 1.4s ease-in-out infinite',
          display: 'inline-block', flexShrink: 0,
        }} />
      )}
      {c.label}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulseRing {
          0%   { box-shadow: 0 0 0 0 rgba(214,69,69,0.5); }
          70%  { box-shadow: 0 0 0 5px rgba(214,69,69,0); }
          100% { box-shadow: 0 0 0 0 rgba(214,69,69,0); }
        }
      `}} />
    </span>
  );
}
