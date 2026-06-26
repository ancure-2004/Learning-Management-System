import React, { useState, useEffect, useMemo, useRef } from 'react';
import { theme as T } from '@/theme';
import { STUDENT_NAV } from '@/layouts/StudentLayout';
import I from '@/components/Icon';

/* Student NAV â€” imported from StudentLayout (single source of truth) */
const NAV = STUDENT_NAV;

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   SEARCH MODAL â€” Spotlight palette, same shape as admin
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const SearchModal = ({ isOpen, onClose, onAction }) => {
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef(null);

  const allItems = useMemo(() => {
    const items = [];
    NAV.forEach(group => group.items.forEach(item => items.push({
      label: item.label, icon: item.icon, path: item.path, category: 'Pages',
    })));
    items.push(
      { label: 'View today\'s timetable', icon: 'timetable', path: '/student-timetable', category: 'Actions' },
      { label: 'My subjects',             icon: 'subject',   path: '/student-subjects',  category: 'Actions' },
      { label: 'Check attendance',        icon: 'check',     path: '/student-attendance', category: 'Actions' },
      { label: 'Rate my teachers',        icon: 'rating',    path: '/rate-teachers',      category: 'Actions' },
      { label: 'Academic calendar',       icon: 'calendar',  path: '/student-calendar',   category: 'Actions' },
    );
    return items;
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return allItems;
    const q = query.toLowerCase().trim();
    return allItems.filter(item => item.label.toLowerCase().includes(q));
  }, [allItems, query]);

  const grouped = useMemo(() => {
    const order = ['Pages', 'Actions'];
    const buckets = {};
    filtered.forEach(item => {
      if (!buckets[item.category]) buckets[item.category] = [];
      buckets[item.category].push(item);
    });
    return order
      .filter(cat => buckets[cat] && buckets[cat].length > 0)
      .map(cat => ({ category: cat, items: buckets[cat] }));
  }, [filtered]);

  useEffect(() => { setSelectedIdx(0); }, [query]);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    } else { setQuery(''); setSelectedIdx(0); }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx(idx => Math.min(idx + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx(idx => Math.max(idx - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = filtered[selectedIdx];
        if (item?.path) { onAction(item.path); onClose(); }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, filtered, selectedIdx, onAction, onClose]);

  if (!isOpen) return null;

  const kbdStyle = {
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: 4, padding: '0 6px',
    fontSize: 10, fontWeight: 600, color: T.text3,
    fontFamily: 'inherit', minWidth: 18, height: 18,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    lineHeight: 1,
  };

  let globalIdx = 0;

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(20, 20, 40, 0.42)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      paddingTop: '14vh',
      animation: 'ch-search-bg-in 320ms cubic-bezier(0.16, 1, 0.3, 1)',
    }}>
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Search" style={{
        background: T.surface,
        width: '90%', maxWidth: 620, maxHeight: '70vh',
        borderRadius: 16,
        boxShadow: '0 24px 80px rgba(20, 20, 40, 0.20), 0 4px 16px rgba(20, 20, 40, 0.08), 0 1px 0 rgba(255,255,255,0.7) inset',
        border: `1px solid ${T.border}`,
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        animation: 'ch-search-modal-in 380ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 18px', borderBottom: `1px solid ${T.divider}`,
        }}>
          <span style={{ color: T.text3, flexShrink: 0, display: 'flex' }}>
            <I name="search" size={18} />
          </span>
          <input ref={inputRef} type="text" value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, actions, or anythingâ€¦"
            style={{
              flex: 1, border: 'none', outline: 'none',
              background: 'transparent',
              fontSize: 15, fontWeight: 500, color: T.text,
              fontFamily: 'inherit', letterSpacing: '-0.015em',
              minWidth: 0,
            }} />
          <span style={kbdStyle}>ESC</span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
          {filtered.length === 0 ? (
            <div style={{
              padding: '50px 20px', textAlign: 'center',
              color: T.text3, fontSize: 13, fontWeight: 500,
            }}>No results for â€œ{query}â€</div>
          ) : grouped.map(({ category, items }) => (
            <div key={category} style={{ marginBottom: 6 }}>
              <div style={{
                padding: '8px 18px 4px',
                fontSize: 10, fontWeight: 700, color: T.text4,
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>{category}</div>
              {items.map((item) => {
                const myIdx = globalIdx++;
                const isSelected = myIdx === selectedIdx;
                return (
                  <div key={`${category}-${item.label}-${myIdx}`} style={{ padding: '0 6px' }}>
                    <button
                      onClick={() => { onAction(item.path); onClose(); }}
                      onMouseEnter={() => setSelectedIdx(myIdx)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        width: '100%', padding: '9px 12px',
                        border: 'none', cursor: 'pointer',
                        borderRadius: 9,
                        background: isSelected ? T.accentSoft : 'transparent',
                        textAlign: 'left', fontFamily: 'inherit',
                        transition: 'background 100ms ease',
                      }}>
                      <span style={{
                        width: 30, height: 30, borderRadius: 8,
                        background: isSelected ? T.accent : T.surfaceMuted,
                        color: isSelected ? '#fff' : T.text2,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 120ms ease',
                        boxShadow: isSelected
                          ? `0 4px 10px ${T.accent}33, 0 1px 0 rgba(255,255,255,0.4) inset`
                          : 'none',
                      }}>
                        <I name={item.icon || 'overview'} size={14} />
                      </span>
                      <span style={{
                        flex: 1, minWidth: 0,
                        fontSize: 13.5,
                        fontWeight: isSelected ? 700 : 600,
                        color: isSelected ? T.accent : T.text,
                        letterSpacing: '-0.015em',
                        whiteSpace: 'nowrap', overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>{item.label}</span>
                      {isSelected && (
                        <span style={{
                          fontSize: 14, color: T.accent, fontWeight: 700,
                          flexShrink: 0,
                        }}>â†µ</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div style={{
          padding: '10px 18px',
          borderTop: `1px solid ${T.divider}`,
          display: 'flex', alignItems: 'center', gap: 16,
          fontSize: 10.5, color: T.text3, fontWeight: 500,
          background: T.surfaceMuted,
          letterSpacing: '-0.005em',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={kbdStyle}>â†‘</span>
            <span style={kbdStyle}>â†“</span>
            <span style={{ marginLeft: 3 }}>Navigate</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={kbdStyle}>â†µ</span>
            <span style={{ marginLeft: 3 }}>Open</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 'auto' }}>
            <span style={kbdStyle}>ESC</span>
            <span style={{ marginLeft: 3 }}>Close</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
