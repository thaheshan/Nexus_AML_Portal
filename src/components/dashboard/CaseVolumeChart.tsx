'use client';

import React, { useState, useRef } from 'react';

interface CaseVolumeChartProps {
  newCasesData: number[];
  resolvedData: number[];
  xLabels: string[];
}

const W   = 500;
const H   = 160;
const PAD = { top: 16, right: 16, bottom: 24, left: 32 };

function calcPoints(data: number[], min: number, max: number) {
  const xStep = (W - PAD.left - PAD.right) / Math.max(1, data.length - 1);
  const range = Math.max(1, max - min);
  return data.map((v, i) => ({
    x: PAD.left + i * xStep,
    y: PAD.top + ((max - v) / range) * (H - PAD.top - PAD.bottom),
    value: v,
  }));
}

function toSmoothPath(pts: { x: number; y: number }[]) {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cpX = (pts[i - 1].x + pts[i].x) / 2;
    d += ` C ${cpX} ${pts[i - 1].y}, ${cpX} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
  }
  return d;
}

function toFillPath(pts: { x: number; y: number }[]) {
  if (pts.length === 0) return '';
  const line = toSmoothPath(pts);
  const bottom = H - PAD.bottom;
  return `${line} L ${pts[pts.length - 1].x} ${bottom} L ${pts[0].x} ${bottom} Z`;
}

export default function CaseVolumeChart({ newCasesData = [], resolvedData = [], xLabels = [] }: CaseVolumeChartProps) {
  const safeNew = newCasesData.length ? newCasesData : [0, 0, 0, 0, 0, 0];
  const safeRes = resolvedData.length ? resolvedData : [0, 0, 0, 0, 0, 0];
  const safeLabels = xLabels.length ? xLabels : ['Jul 12', 'Jul 17', 'Jul 22', 'Jul 27', 'Aug 1', 'Aug 6'];

  const allVals = [...safeNew, ...safeRes];
  const maxVal = Math.max(...allVals, 5); // Headroom for max value
  const minVal = 0;

  const newPts = calcPoints(safeNew, minVal, maxVal);
  const resPts = calcPoints(safeRes, minVal, maxVal);
  const newPath  = toSmoothPath(newPts);
  const resPath  = toSmoothPath(resPts);
  const newFill  = toFillPath(newPts);
  const resFill  = toFillPath(resPts);
  const svgRef  = useRef<SVGSVGElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg  = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * W;

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

  const tooltipX = hNP ? Math.min(hNP.x + 10, W - 110) : 0;
  const tooltipY = hNP ? Math.max(hNP.y - 48, PAD.top) : 0;

  // Grid steps (4 ticks: 0, 1/3, 2/3, max)
  const gridTicks = [
    minVal,
    Math.round(maxVal / 3),
    Math.round((maxVal * 2) / 3),
    maxVal
  ];

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
        <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Live Real-Time Data</span>
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

        {/* Grid lines & Y-axis labels */}
        {gridTicks.map((v, i) => {
          const y = PAD.top + ((maxVal - v) / Math.max(1, maxVal - minVal)) * (H - PAD.top - PAD.bottom);
          return (
            <g key={`grid-${i}-${v}`}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#F3F4F6" strokeWidth="1"/>
              <text x={PAD.left - 6} y={y + 4} fontSize="9" fill="#9CA3AF" textAnchor="end">{v}</text>
            </g>
          );
        })}

        {/* X Labels */}
        {safeLabels.map((l, i) => {
          const x = PAD.left + i * ((W - PAD.left - PAD.right) / Math.max(1, safeLabels.length - 1));
          return <text key={`lbl-${i}-${l}`} x={x} y={H - 4} fontSize="9" fill="#9CA3AF" textAnchor="middle">{l}</text>;
        })}

        {/* Fill areas */}
        <path d={resFill} fill="url(#grayGrad)"/>
        <path d={newFill} fill="url(#blueGrad)"/>

        {/* Line paths */}
        <path d={resPath} fill="none" stroke="#0B1F3A"  strokeWidth="2"   strokeLinecap="round"/>
        <path d={newPath} fill="none" stroke="#3B82F6"  strokeWidth="2.5" strokeLinecap="round"/>

        {/* Data points */}
        {newPts.map((pt, idx) => (
          <circle key={`np-${idx}`} cx={pt.x} cy={pt.y} r="3" fill="#3B82F6" />
        ))}
        {resPts.map((pt, idx) => (
          <circle key={`rp-${idx}`} cx={pt.x} cy={pt.y} r="3" fill="#0B1F3A" />
        ))}

        {/* Hover crosshair + dots + tooltip */}
        {hoverIdx !== null && hNP && hRP && (
          <>
            <line
              x1={hNP.x} y1={PAD.top}
              x2={hNP.x} y2={H - PAD.bottom}
              stroke="#CBD5E1" strokeWidth="1" strokeDasharray="4 2"
            />
            <circle cx={hNP.x} cy={hNP.y} r="5" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2"/>
            <circle cx={hRP.x} cy={hRP.y} r="5" fill="#0B1F3A" stroke="#FFFFFF" strokeWidth="2"/>

            <g transform={`translate(${tooltipX}, ${tooltipY})`}>
              <rect x="0" y="0" width="105" height="56" rx="6" fill="#0B1F3A" opacity="0.92"/>

              <rect x="10" y="12" width="8" height="8" rx="2" fill="#3B82F6"/>
              <text x="24" y="20" fontSize="10" fill="#CBD5E1" fontFamily="Inter, sans-serif">New Cases</text>
              <text x="95" y="20" fontSize="11" fontWeight="700" fill="#FFFFFF" textAnchor="end" fontFamily="Inter, sans-serif">
                {safeNew[hoverIdx]}
              </text>

              <rect x="10" y="30" width="8" height="8" rx="2" fill="#94A3B8"/>
              <text x="24" y="38" fontSize="10" fill="#CBD5E1" fontFamily="Inter, sans-serif">Resolved</text>
              <text x="95" y="38" fontSize="11" fontWeight="700" fill="#FFFFFF" textAnchor="end" fontFamily="Inter, sans-serif">
                {safeRes[hoverIdx]}
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
