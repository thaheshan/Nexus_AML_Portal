'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ── Icons ────────────────────────────────────────────────────────────────────
function IconCase()         { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>; }
function IconAnnouncement() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"/></svg>; }
function IconAlert()        { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>; }
function IconReport()       { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>; }
function IconSearch()       { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function IconSpinner()      { return <div style={{ width: 14, height: 14, border: '2px solid #E5E7EB', borderTop: '2px solid #0B1F3A', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}/>; }

const ICON_MAP: Record<string, React.ReactNode> = {
  case:         <IconCase />,
  announcement: <IconAnnouncement />,
  alert:        <IconAlert />,
  report:       <IconReport />,
};

const CATEGORY_COLOR: Record<string, string> = {
  Cases:         '#2E6BFF',
  Announcements: '#10B981',
  Alerts:        '#EF4444',
  Reports:       '#8B5CF6',
};

interface SearchResult {
  category: string;
  label: string;
  meta: string;
  href: string;
  icon: string;
}

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export default function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen]       = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef  = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced fetch
  const fetchResults = useCallback(
    debounce(async (q: string) => {
      if (!q || q.length < 2) { setResults([]); setLoading(false); return; }
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        setResults(json.results || []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 280),
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setActiveIdx(-1);
    if (val.length >= 2) {
      setLoading(true);
      setOpen(true);
    } else {
      setResults([]);
      setOpen(false);
    }
    fetchResults(val);
  };

  const handleSelect = (result: SearchResult) => {
    router.push(result.href);
    setQuery('');
    setResults([]);
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && activeIdx >= 0) handleSelect(results[activeIdx]);
    if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
  };

  // Group results by category
  const grouped: Record<string, SearchResult[]> = {};
  results.forEach(r => {
    if (!grouped[r.category]) grouped[r.category] = [];
    grouped[r.category].push(r);
  });

  const hasResults = results.length > 0;
  const flatIdx = (cat: string, i: number) => {
    let offset = 0;
    for (const c of Object.keys(grouped)) {
      if (c === cat) return offset + i;
      offset += grouped[c].length;
    }
    return -1;
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '320px' }}>
      {/* Input */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        backgroundColor: '#F5F7FA', borderRadius: '10px',
        padding: '8px 14px', border: `1px solid ${open ? '#0B1F3A' : '#E5E7EB'}`,
        transition: 'border-color 0.15s, box-shadow 0.15s',
        boxShadow: open ? '0 0 0 3px rgba(11,31,58,0.06)' : 'none',
      }}>
        {loading ? <IconSpinner /> : <IconSearch />}
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="Search cases, announcements..."
          onChange={handleChange}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          onKeyDown={handleKeyDown}
          style={{
            border: 'none', background: 'none', outline: 'none',
            fontSize: '13px', color: '#374151', width: '100%',
          }}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setOpen(false); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '0', lineHeight: 1, flexShrink: 0 }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0,
          width: '100%', minWidth: '360px',
          background: '#FFFFFF', borderRadius: '12px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 8px 32px rgba(11,31,58,0.12)',
          zIndex: 9999, overflow: 'hidden',
          animation: 'dropIn 0.15s ease-out',
        }}>
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes dropIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:none; } }
            @keyframes spin { to { transform: rotate(360deg); } }
          `}} />

          {loading && !hasResults && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#6B7280', fontSize: '13px' }}>
              Searching…
            </div>
          )}

          {!loading && !hasResults && query.length >= 2 && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>
              No results found for <strong>"{query}"</strong>
            </div>
          )}

          {hasResults && Object.keys(grouped).map(category => (
            <div key={category}>
              {/* Category label */}
              <div style={{
                padding: '8px 16px 4px',
                fontSize: '10px', fontWeight: 700,
                color: CATEGORY_COLOR[category] || '#6B7280',
                textTransform: 'uppercase', letterSpacing: '0.07em',
                borderTop: '1px solid #F1F5F9',
              }}>
                {category}
              </div>

              {grouped[category].map((result, i) => {
                const fi = flatIdx(category, i);
                const isActive = fi === activeIdx;
                return (
                  <div
                    key={i}
                    onMouseEnter={() => setActiveIdx(fi)}
                    onMouseLeave={() => setActiveIdx(-1)}
                    onMouseDown={e => { e.preventDefault(); handleSelect(result); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '10px 16px', cursor: 'pointer',
                      background: isActive ? '#F5F8FF' : 'transparent',
                      transition: 'background 0.1s',
                    }}
                  >
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: `${CATEGORY_COLOR[category]}15`,
                      color: CATEGORY_COLOR[category] || '#6B7280',
                    }}>
                      {ICON_MAP[result.icon]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#0B1F3A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {result.label}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '1px' }}>
                        {result.meta}
                      </div>
                    </div>
                    {/* Arrow */}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Footer hint */}
          {hasResults && (
            <div style={{ padding: '8px 16px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '16px', fontSize: '10px', color: '#9CA3AF' }}>
              <span>↑↓ navigate</span>
              <span>⏎ open</span>
              <span>Esc close</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
