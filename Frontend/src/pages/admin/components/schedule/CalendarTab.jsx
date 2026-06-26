/**
 * CalendarTab.jsx — Chronos Admin / Schedule
 * ──────────────────────────────────────────────────────────────────────────
 * Academic calendar (holidays / exams / events / vacations).
 * ──────────────────────────────────────────────────────────────────────────
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { theme as T } from '@/theme';
import { useAuth } from '@/context/AuthContext';
import calendarService from '@/services/calendarService';
import {
  ChIcon,
  PrimaryBtn, GhostBtn,
  Field, Input, Select, Textarea,
  Toast, Drawer, ConfirmModal,
  Badge,
} from '@/layouts/AdminLayout';
import { Spinner, EVENT_TYPES, evtCfg } from './helpers';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const WEEK_DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const CalendarTab = () => {
  const { user } = useAuth();
  const containerRef = useRef(null);
  const [containerW, setContainerW] = useState(1200); // measured width of tab

  /* Measure container width with ResizeObserver */
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) setContainerW(entry.contentRect.width);
    });
    ro.observe(containerRef.current);
    setContainerW(containerRef.current.offsetWidth);
    return () => ro.disconnect();
  }, []);

  /* Breakpoints */
  const isCompact = containerW < 900;   // calendar + side panel stack
  const isNarrow  = containerW < 600;   // stat grid 2-col, header wraps
  const isTiny    = containerW < 440;   // minimal cell size

  const [events,       setEvents]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filterType,   setFilterType]   = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear,  setCurrentYear]  = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [editingId,    setEditingId]    = useState(null);
  const [confirmId,    setConfirmId]    = useState(null);
  const [toast,        setToast]        = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [sideOpen,     setSideOpen]     = useState(false); // compact mode side toggle

  const BLANK = { title: '', description: '', startDate: '', endDate: '', eventType: 'holiday', isRecurring: false, academicYear: '2025-26' };
  const [form, setForm] = useState(BLANK);

  const load = useCallback(async () => {
    try {
      const params = filterType ? { eventType: filterType } : undefined;
      const data = await calendarService.getAll(params);
      setEvents(data);
    } catch {}
    setLoading(false);
  }, [filterType]);

  useEffect(() => { load(); }, [load]);

  const eventsForDate = (date) => events.filter(e => {
    const start = new Date(e.startDate); start.setHours(0,0,0,0);
    const end   = new Date(e.endDate);   end.setHours(23,59,59,999);
    return date >= start && date <= end;
  });

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y-1); }
    else setCurrentMonth(m => m-1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y+1); }
    else setCurrentMonth(m => m+1);
  };
  const goToday = () => {
    const now = new Date();
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
  };

  const openAdd = (date = null) => {
    const d = (date || new Date()).toISOString().split('T')[0];
    setForm({ ...BLANK, startDate: d, endDate: d });
    setEditingId(null);
    setDrawerOpen(true);
  };

  const openEdit = (e) => {
    setForm({
      title: e.title,
      description: e.description || '',
      startDate: new Date(e.startDate).toISOString().split('T')[0],
      endDate:   new Date(e.endDate).toISOString().split('T')[0],
      eventType: e.eventType,
      isRecurring: e.isRecurring,
      academicYear: e.academicYear || '2025-26',
    });
    setEditingId(e._id);
    setDrawerOpen(true);
  };

  const closeDrawer = () => { setDrawerOpen(false); setEditingId(null); };

  const handleSave = async () => {
    if (!form.title || !form.startDate || !form.endDate) {
      setToast({ msg: 'Title and dates are required', type: 'error' }); return;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      setToast({ msg: 'End date must be after start date', type: 'error' }); return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await calendarService.update(editingId, form);
        setToast({ msg: 'Event updated', type: 'success' });
      } else {
        await calendarService.create({ ...form, userId: user?._id });
        setToast({ msg: 'Event created', type: 'success' });
      }
      closeDrawer(); load();
    } catch (err) {
      setToast({ msg: err.response?.data?.error || 'Save failed', type: 'error' });
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    try {
      await calendarService.remove(confirmId);
      setToast({ msg: 'Event deleted', type: 'success' });
      setSelectedDate(null);
      load();
    } catch (err) {
      setToast({ msg: 'Delete failed', type: 'error' });
    }
    setConfirmId(null);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    if (isCompact) setSideOpen(true); // auto-open side panel on compact
  };

  /* Build grid */
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay    = new Date(currentYear, currentMonth, 1).getDay();
  const today       = new Date(); today.setHours(0,0,0,0);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(currentYear, currentMonth, d));

  const monthEvents = events.filter(e => {
    const s = new Date(e.startDate);
    return s.getMonth() === currentMonth && s.getFullYear() === currentYear;
  });

  const upcoming = events
    .filter(e => new Date(e.startDate) >= today)
    .sort((a,b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 6);

  const selectedEvents = selectedDate ? eventsForDate(selectedDate) : [];

  /* Side panel — rendered either as a column (wide) or as a slide-over sheet (compact) */
  const SidePanel = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Selected date */}
      {selectedDate ? (
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: '16px 18px', boxShadow: T.shadowCard }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text, letterSpacing: '-0.02em' }}>
              {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={()=>openAdd(selectedDate)} style={{
                fontSize: 11, fontWeight: 700, color: T.accent,
                padding: '4px 10px', borderRadius: 6,
                background: T.accentSoft, border: 'none',
                cursor: 'pointer', fontFamily: 'inherit',
              }}>+ Add</button>
              {isCompact && (
                <button onClick={()=>setSideOpen(false)} style={{
                  fontSize: 11, fontWeight: 700, color: T.text3,
                  padding: '4px 8px', borderRadius: 6,
                  background: T.surfaceMuted, border: 'none',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>✕</button>
              )}
            </div>
          </div>
          {selectedEvents.length === 0 ? (
            <div style={{ fontSize: 12, color: T.text3, fontStyle: 'italic', padding: '12px 0' }}>No events</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedEvents.map(e => {
                const c = evtCfg(e.eventType);
                return (
                  <div key={e._id} style={{
                    background: c.bg, border: `1px solid ${c.color}33`,
                    borderRadius: 10, padding: '10px 12px',
                    display: 'flex', flexDirection: 'column', gap: 4,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: c.color, letterSpacing: '-0.015em' }}>
                        {e.title}
                      </div>
                      <div style={{ display: 'flex', gap: 2 }}>
                        <button onClick={()=>openEdit(e)} style={{ width: 22, height: 22, borderRadius: 5, background: 'rgba(255,255,255,0.5)', border: 'none', color: T.text2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <ChIcon name="edit" size={11} />
                        </button>
                        <button onClick={()=>setConfirmId(e._id)} style={{ width: 22, height: 22, borderRadius: 5, background: 'rgba(255,255,255,0.5)', border: 'none', color: T.text2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <ChIcon name="trash" size={11} />
                        </button>
                      </div>
                    </div>
                    {e.description && <div style={{ fontSize: 11, color: T.text2, fontWeight: 500 }}>{e.description}</div>}
                    <div style={{ fontSize: 10, color: T.text3, fontWeight: 500 }}>
                      {new Date(e.startDate).toLocaleDateString()} – {new Date(e.endDate).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : !isCompact ? (
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: '16px 18px', boxShadow: T.shadowCard }}>
          <div style={{ fontSize: 12, color: T.text3, fontStyle: 'italic' }}>Click a date to see its events</div>
        </div>
      ) : null}

      {/* Upcoming */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: '16px 18px', boxShadow: T.shadowCard }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: T.text, letterSpacing: '-0.025em', marginBottom: 12 }}>
          Upcoming Events
        </div>
        {upcoming.length === 0 ? (
          <div style={{ fontSize: 12, color: T.text3, fontStyle: 'italic' }}>No upcoming events</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {upcoming.map(e => {
              const c = evtCfg(e.eventType);
              return (
                <div key={e._id} className="ch-admin-row" style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 6px', borderRadius: 8, cursor: 'pointer',
                  transition: `background 200ms ${T.ease}`,
                }} onClick={()=>{ setSelectedDate(new Date(e.startDate)); if(isCompact) setSideOpen(true); }}>
                  <div style={{ width: 3, alignSelf: 'stretch', borderRadius: 99, background: c.color, minHeight: 30 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: T.text, letterSpacing: '-0.015em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {e.title}
                    </div>
                    <div style={{ fontSize: 10.5, color: T.text3, marginTop: 1, fontWeight: 500 }}>
                      {new Date(e.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <Badge color={c.color}>{c.label}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div ref={containerRef} style={{ padding: '0 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}
      <ConfirmModal
        open={!!confirmId}
        onCancel={()=>setConfirmId(null)}
        onConfirm={handleDelete}
        message="Delete this event? This cannot be undone."
      />

      {/* ── Stat strip — 4-col wide, 2-col narrow ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isNarrow ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 10 }}>
        {EVENT_TYPES.map((t, i) => {
          const count = monthEvents.filter(e => e.eventType === t.value).length;
          return (
            <div key={t.value} style={{
              background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 16, padding: isNarrow ? '12px 14px' : '16px 20px', boxShadow: T.shadowCard,
              animation: `admin-fade-up 500ms cubic-bezier(0.16,1,0.3,1) ${i*60}ms both`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: isNarrow ? 11 : 12, fontWeight: 600, color: T.text3 }}>{t.label}s</span>
                <div style={{ width: 24, height: 24, borderRadius: 7, background: t.bg, color: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChIcon name="calendar" size={11} />
                </div>
              </div>
              <div style={{ fontSize: isNarrow ? 24 : 30, fontWeight: 700, color: T.text, letterSpacing: '-0.05em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                {String(count).padStart(2,'0')}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Main layout: side-by-side wide, stacked narrow ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isCompact ? '1fr' : '1fr 300px',
        gap: 16,
        alignItems: 'start',
      }}>
        {/* Calendar */}
        <div style={{
          background: T.surface, border: `1px solid ${T.border}`,
          borderRadius: 20, boxShadow: T.shadowCard, overflow: 'hidden',
          minWidth: 0, maxWidth: '100%',
        }}>
          {/* Header — stacks when very narrow */}
          <div style={{
            background: `linear-gradient(135deg,${T.accent2} 0%,${T.accent} 60%,#6d28d9 100%)`,
            padding: isTiny ? '12px 12px' : '14px 16px',
            display: 'flex', flexDirection: isNarrow ? 'column' : 'row',
            alignItems: isNarrow ? 'stretch' : 'center',
            justifyContent: 'space-between', gap: 10,
            color: '#fff',
          }}>
            {/* Month nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: isNarrow ? 'space-between' : 'flex-start' }}>
              <button onClick={prevMonth} style={{
                width: 32, height: 32, borderRadius: 9, border: 'none',
                background: 'rgba(255,255,255,0.18)', color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit',
              }}>
                <ChIcon name="chev" size={14} style={{ transform: 'rotate(180deg)' }} />
              </button>
              <div style={{ fontSize: isTiny ? 15 : 17, fontWeight: 700, letterSpacing: '-0.025em', flex: isNarrow ? 1 : 'none', textAlign: 'center', minWidth: isTiny ? 0 : 168 }}>
                {MONTHS[currentMonth]} {currentYear}
              </div>
              <button onClick={nextMonth} style={{
                width: 32, height: 32, borderRadius: 9, border: 'none',
                background: 'rgba(255,255,255,0.18)', color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit',
              }}>
                <ChIcon name="chev" size={14} />
              </button>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <button onClick={goToday} style={{
                padding: '6px 12px', borderRadius: 8, border: 'none',
                background: 'rgba(255,255,255,0.18)', color: '#fff', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, fontFamily: 'inherit', letterSpacing: '-0.005em',
              }}>Today</button>
              <select value={filterType} onChange={e=>setFilterType(e.target.value)} style={{
                padding: '6px 10px', borderRadius: 8, border: 'none',
                background: 'rgba(255,255,255,0.18)', color: '#fff',
                fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
              }}>
                <option value="" style={{ color: T.text }}>All types</option>
                {EVENT_TYPES.map(t => <option key={t.value} value={t.value} style={{ color: T.text }}>{t.label}</option>)}
              </select>
              <button onClick={()=>openAdd()} style={{
                padding: '6px 12px', borderRadius: 8, border: 'none',
                background: '#fff', color: T.accent, cursor: 'pointer',
                fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <ChIcon name="plus" size={12} /> Add Event
              </button>
            </div>
          </div>

          {/* Unified day-headers + cells grid — wrapped in horizontal scroller */}
          {loading ? <Spinner /> : (
            <div style={{
              overflowX: 'auto',
              overflowY: 'visible',
              WebkitOverflowScrolling: 'touch',
            }}
            className="cal-scroll-wrap"
            >
              <style dangerouslySetInnerHTML={{ __html: `
                .cal-scroll-wrap::-webkit-scrollbar { height: 8px; }
                .cal-scroll-wrap::-webkit-scrollbar-track { background: transparent; }
                .cal-scroll-wrap::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.30); border-radius: 99px; }
                .cal-scroll-wrap::-webkit-scrollbar-thumb:hover { background: rgba(124,58,237,0.55); }
              `}} />
              <div className="keep-grid" style={{
                display: 'grid',
                gridTemplateColumns: `repeat(7, minmax(${isTiny ? 44 : 80}px, 1fr))`,
                minWidth: isTiny ? 308 : 560,
              }}>
              {/* Header row */}
              {WEEK_DAYS.map(d => (
                <div key={d} style={{
                  padding: isTiny ? '6px 2px' : '10px 4px',
                  textAlign: 'center', fontSize: isTiny ? 9 : 10.5,
                  fontWeight: 700, color: T.text3,
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                  borderBottom: `1px solid ${T.divider}`,
                }}>{isTiny ? d.slice(0,1) : d}</div>
              ))}

              {/* Day cells */}
              {cells.map((date, i) => {
                if (!date) return <div key={i} style={{ minHeight: isTiny ? 56 : isNarrow ? 72 : 90, background: T.surfaceMuted, borderRight: `1px solid ${T.divider}`, borderBottom: `1px solid ${T.divider}` }} />;
                const dEvents = eventsForDate(date);
                const isToday = date.getTime() === today.getTime();
                const isSel   = selectedDate && date.getTime() === selectedDate.getTime();
                const isWknd  = date.getDay() === 0 || date.getDay() === 6;
                const maxEvts = isTiny ? 1 : isNarrow ? 1 : 2;
                return (
                  <div key={i}
                    onClick={() => handleDateClick(date)}
                    style={{
                      minHeight: isTiny ? 56 : isNarrow ? 72 : 90,
                      padding: isTiny ? 3 : 5,
                      borderRight: `1px solid ${T.divider}`,
                      borderBottom: `1px solid ${T.divider}`,
                      background: isSel ? T.accentSoft : isWknd ? T.surfaceMuted : T.surface,
                      cursor: 'pointer',
                      transition: `background 200ms ${T.ease}`,
                    }}
                    onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = T.surfaceMuted; }}
                    onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = isWknd ? T.surfaceMuted : T.surface; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
                      <span style={{
                        fontSize: isTiny ? 11 : 12, fontWeight: 700,
                        color: isToday ? '#fff' : isWknd ? T.text4 : T.text2,
                        background: isToday ? `linear-gradient(135deg,${T.accent2},${T.accent})` : 'transparent',
                        width: isToday ? 20 : 'auto', height: isToday ? 20 : 'auto',
                        borderRadius: '50%', minWidth: isToday ? 20 : 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', flexShrink: 0,
                      }}>{date.getDate()}</span>
                      {dEvents.length > maxEvts && (
                        <span style={{ fontSize: 8, fontWeight: 700, color: T.text3, flexShrink: 0 }}>+{dEvents.length - maxEvts}</span>
                      )}
                    </div>
                    {!isTiny && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {dEvents.slice(0, maxEvts).map((e, j) => {
                          const c = evtCfg(e.eventType);
                          return (
                            <div key={j} style={{
                              background: c.bg, color: c.color,
                              borderRadius: 3, padding: '1.5px 4px',
                              fontSize: isNarrow ? 8.5 : 9.5, fontWeight: 700,
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>{e.title}</div>
                          );
                        })}
                      </div>
                    )}
                    {isTiny && dEvents.length > 0 && (
                      <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', marginTop: 2 }}>
                        {dEvents.slice(0, 3).map((e, j) => (
                          <div key={j} style={{ width: 6, height: 6, borderRadius: '50%', background: evtCfg(e.eventType).color, flexShrink: 0 }} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              </div>
            </div>
          )}
        </div>

        {/* Side panel — shown as column on wide, slide-up sheet on compact */}
        {isCompact ? (
          /* Compact: bottom sheet / accordion */
          sideOpen ? (
            <div style={{
              background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 20, boxShadow: T.shadowLift, overflow: 'hidden',
              animation: 'admin-fade-up 250ms cubic-bezier(0.16,1,0.3,1)',
            }}>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: T.text, letterSpacing: '-0.025em' }}>
                  {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Upcoming Events'}
                </span>
                <button onClick={()=>setSideOpen(false)} style={{ background: T.surfaceMuted, border: 'none', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: T.text3, fontFamily: 'inherit' }}>
                  <ChIcon name="close" size={13} />
                </button>
              </div>
              <div style={{ padding: '14px 18px', maxHeight: 320, overflowY: 'auto' }}>
                <SidePanel />
              </div>
            </div>
          ) : (
            /* Collapsed: show a subtle "upcoming events" hint bar */
            upcoming.length > 0 && (
              <button onClick={()=>setSideOpen(true)} style={{
                background: T.surface, border: `1px solid ${T.border}`,
                borderRadius: 14, padding: '12px 16px', boxShadow: T.shadowCard,
                display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                fontFamily: T.font, width: '100%', textAlign: 'left',
                transition: `all 200ms ${T.ease}`,
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.accentBorder; e.currentTarget.style.background = T.accentSoft; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.surface; }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 10, background: T.accentSoft, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ChIcon name="calendar" size={14} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text, letterSpacing: '-0.02em' }}>Upcoming Events</div>
                  <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{upcoming.length} event{upcoming.length!==1?'s':''} coming up — tap to view</div>
                </div>
                <ChIcon name="chev" size={14} style={{ color: T.text4 }} />
              </button>
            )
          )
        ) : (
          <SidePanel />
        )}
      </div>

      {/* Add/Edit Drawer */}
      <Drawer open={drawerOpen} onClose={closeDrawer} title={editingId ? 'Edit Event' : 'New Event'}>
        <Field label="Title" required>
          <Input value={form.title} onChange={e=>setForm({...form, title: e.target.value})} placeholder="e.g., Republic Day" />
        </Field>
        <Field label="Description">
          <Textarea value={form.description} onChange={e=>setForm({...form, description: e.target.value})} rows={2} placeholder="Optional" />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Start Date" required>
            <Input type="date" value={form.startDate} onChange={e=>setForm({...form, startDate: e.target.value})} />
          </Field>
          <Field label="End Date" required>
            <Input type="date" value={form.endDate} onChange={e=>setForm({...form, endDate: e.target.value})} />
          </Field>
        </div>
        <Field label="Event Type">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 6 }}>
            {EVENT_TYPES.map(t => {
              const active = form.eventType === t.value;
              return (
                <button key={t.value} onClick={()=>setForm({...form, eventType: t.value})}
                  style={{
                    padding: '10px 12px', borderRadius: 10,
                    border: `1px solid ${active ? t.color : T.border}`,
                    background: active ? t.bg : T.surface,
                    color: active ? t.color : T.text2,
                    fontSize: 12.5, fontWeight: active ? 700 : 500,
                    cursor: 'pointer', fontFamily: 'inherit',
                    letterSpacing: '-0.01em', transition: `all 200ms ${T.ease}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
                  <ChIcon name="calendar" size={12} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </Field>
        <Field label="Academic Year">
          <Select value={form.academicYear} onChange={e=>setForm({...form, academicYear: e.target.value})}>
            <option value="2024-25">2024-25</option>
            <option value="2025-26">2025-26</option>
            <option value="2026-27">2026-27</option>
          </Select>
        </Field>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.isRecurring} onChange={e=>setForm({...form, isRecurring: e.target.checked})}
            style={{ width: 16, height: 16, accentColor: T.accent }} />
          <span style={{ fontSize: 13, color: T.text2, fontWeight: 500, letterSpacing: '-0.01em' }}>
            Recurring yearly
          </span>
        </label>
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <PrimaryBtn onClick={handleSave} disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
            {saving ? 'Saving…' : editingId ? 'Update Event' : 'Create Event'}
          </PrimaryBtn>
          <GhostBtn onClick={closeDrawer}>Cancel</GhostBtn>
        </div>
      </Drawer>
    </div>
  );
};

export default CalendarTab;
