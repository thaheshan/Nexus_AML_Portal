'use client';

import React, { useState, useRef } from 'react';

const newCasesData = [105, 120, 95, 130, 145, 110, 160, 155, 140, 175, 190, 195];
const resolvedData  = [100, 115, 110, 120, 130, 125, 140, 150, 145, 160, 165, 170];
const xLabels       = ['Oct 1', 'Oct 5', 'Oct 10', 'Oct 15', 'Oct 20', 'Oct 25'];

const W   = 500;
const H   = 160;
const PAD = { top: 16, right: 16, bottom: 24, left: 32 };
const MIN = 80;
const MAX = 210;

function calcPoints(data: number[]) {
  const xStep = (W - PAD.left - PAD.right) / (data.length - 1);
  return data.map((v, i) => ({
    x: PAD.left + i * xStep,
    y: PAD.top + ((MAX - v) / (MAX - MIN)) * (H - PAD.top - PAD.bottom),
    value: v,
  }));
}

function toSmoothPath(pts: { x: number; y: number }[]) {
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cpX = (pts[i - 1].x + pts[i].x) / 2;
    d += ` C ${cpX} ${pts[i - 1].y}, ${cpX} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
  }
  return d;
}

function toFillPath(pts: { x: number; y: number }[]) {
  const line = toSmoothPath(pts);
  const bottom = H - PAD.bottom;
  return `${line} L ${pts[pts.length - 1].x} ${bottom} L ${pts[0].x} ${bottom} Z`;
}

const newPts = calcPoints(newCasesData);
const resPts = calcPoints(resolvedData);
const newPath  = toSmoothPath(newPts);
const resPath  = toSmoothPath(resPts);
const newFill  = toFillPath(newPts);
const resFill  = toFillPath(resPts);

export default function CaseVolumeChart() {
  const svgRef  = useRef<SVGSVGElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg  = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    // Scale mouse X to viewBox coordinates
    const mouseX = ((e.clientX - rect.left) / rect.width) * W;
    // Find nearest index
    let nearest = 0;
    let minDist = Infinity;
    newPts.forEach((pt, i) => {
      const d = Math.abs(pt.x - mouseX);
      if (d < minDist) { minDist = d; nearest = i; }
    });
    setHoverIdx(nearest);
  };

  const handleMouseLeave = () => setHoverIdx(null);

  const hNP = hoverIdx !== null ? newPts[hoverIdx] : null;
  const hRP = hoverIdx !== null ? resPts[hoverIdx] : null;

  // Tooltip placement — keep it inside the chart
  const tooltipX = hNP ? Math.min(hNP.x + 10, W - 110) : 0;
  const tooltipY = hNP ? Math.max(hNP.y - 48, PAD.top) : 0;

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      border: '1px solid #E5E7EB',
      padding: '24px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      flex: 1,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0B1F3A' }}>Case Volume (30 Days)</h3>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="5"  r="1" fill="currentColor"/>
            <circle cx="12" cy="12" r="1" fill="currentColor"/>
            <circle cx="12" cy="19" r="1" fill="currentColor"/>
          </svg>
        </button>
      </div>

      {/* SVG Chart */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="160"
        style={{ overflow: 'visible', cursor: 'crosshair' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#3B82F6" stopOpacity="0.18"/>
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="grayGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#6B7280" stopOpacity="0.12"/>
            <stop offset="100%" stopColor="#6B7280" stopOpacity="0"/>
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[100, 130, 160, 190].map(v => {
          const y = PAD.top + ((MAX - v) / (MAX - MIN)) * (H - PAD.top - PAD.bottom);
          return (
            <g key={v}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#F3F4F6" strokeWidth="1"/>
              <text x={PAD.left - 6} y={y + 4} fontSize="9" fill="#9CA3AF" textAnchor="end">{v}</text>
            </g>
          );
        })}

        {/* X Labels */}
        {xLabels.map((l, i) => {
          const x = PAD.left + i * ((W - PAD.left - PAD.right) / (xLabels.length - 1));
          return <text key={l} x={x} y={H - 4} fontSize="9" fill="#9CA3AF" textAnchor="middle">{l}</text>;
        })}

        {/* Fill areas */}
        <path d={resFill} fill="url(#grayGrad)"/>
        <path d={newFill} fill="url(#blueGrad)"/>

        {/* Lines */}
        <path d={resPath} fill="none" stroke="#0B1F3A"  strokeWidth="2"   strokeLinecap="round"/>
        <path d={newPath} fill="none" stroke="#3B82F6"  strokeWidth="2.5" strokeLinecap="round"/>

        {/* Hover crosshair + dots + tooltip */}
        {hoverIdx !== null && hNP && hRP && (
          <>
            {/* Vertical line */}
            <line
              x1={hNP.x} y1={PAD.top}
              x2={hNP.x} y2={H - PAD.bottom}
              stroke="#CBD5E1" strokeWidth="1" strokeDasharray="4 2"
            />

            {/* Dot — New Cases */}
            <circle cx={hNP.x} cy={hNP.y} r="5" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2"/>
            {/* Dot — Resolved */}
            <circle cx={hRP.x} cy={hRP.y} r="5" fill="#0B1F3A" stroke="#FFFFFF" strokeWidth="2"/>

            {/* Tooltip box */}
            <g transform={`translate(${tooltipX}, ${tooltipY})`}>
              <rect x="0" y="0" width="105" height="56" rx="6" fill="#0B1F3A" opacity="0.92"/>

              {/* New Cases row */}
              <rect x="10" y="12" width="8" height="8" rx="2" fill="#3B82F6"/>
              <text x="24" y="20" fontSize="10" fill="#CBD5E1" fontFamily="Inter, sans-serif">New Cases</text>
              <text x="95" y="20" fontSize="11" fontWeight="700" fill="#FFFFFF" textAnchor="end" fontFamily="Inter, sans-serif">
                {newCasesData[hoverIdx]}
              </text>

              {/* Resolved row */}
              <rect x="10" y="30" width="8" height="8" rx="2" fill="#94A3B8"/>
              <text x="24" y="38" fontSize="10" fill="#CBD5E1" fontFamily="Inter, sans-serif">Resolved</text>
              <text x="95" y="38" fontSize="11" fontWeight="700" fill="#FFFFFF" textAnchor="end" fontFamily="Inter, sans-serif">
                {resolvedData[hoverIdx]}
              </text>
            </g>
          </>
        )}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '24px', marginTop: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6B7280' }}>
          <div style={{ width: '20px', height: '2.5px', backgroundColor: '#3B82F6', borderRadius: '2px' }}/>
          New Cases
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6B7280' }}>
          <div style={{ width: '20px', height: '2px', backgroundColor: '#0B1F3A', borderRadius: '2px' }}/>
          Resolved
        </div>
      </div>
    </div>
  );
}
