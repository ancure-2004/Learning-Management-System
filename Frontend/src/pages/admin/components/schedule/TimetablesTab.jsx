/**
 * TimetablesTab.jsx — Chronos Admin / Schedule
 * ──────────────────────────────────────────────────────────────────────────
 * List · Generate (one-click) · Edit (drag-drop) · Publish · History.
 *
 * Bundles the tightly-coupled editor stack:
 *   SlotEditDrawer · TimetableCell · TimetableEditor · GenerateDrawer
 * plus the TimetablesTab root that composes them.
 * ──────────────────────────────────────────────────────────────────────────
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { theme as T } from '@/theme';
import { useAuth } from '@/context/AuthContext';
import classService from '@/services/classService';
import classSubjectService from '@/services/classSubjectService';
import timetableService from '@/services/timetableService';
import {
  ChIcon, Card,
  PrimaryBtn, GhostBtn,
  Field, Input, Select,
  Toast, Drawer, EmptyState, SearchInput, ConfirmModal,
  Badge,
} from '@/layouts/AdminLayout';
import {
  subjectColor, Spinner,
  isDemoId, getDemoTimetables, getDemoTimetable, deleteDemoTT,
  publishDemoTT, saveDemoEdit, revertDemoVersion, buildDemoTT, DEMO_CLASSES,
} from './helpers';

/* ═══════════════════════════════════════════════════════════════
   SHARED CONSTANTS (Timetables tab)
   ═══════════════════════════════════════════════════════════════ */
const DAY_NAMES  = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DAY_SHORTS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const SLOT_TIMES = [
  '09:00 – 10:00', '10:00 – 11:00', '11:00 – 12:00', '12:00 – 13:00',
  '13:00 – 14:00', '14:00 – 15:00', '15:00 – 16:00', '16:00 – 17:00',
];
const LUNCH_SLOT = 4;

/* Status colors for timetables */
const TT_STATUS = {
  draft:     { label: 'Draft',     color: T.amber, bg: T.amberSoft },
  published: { label: 'Published', color: T.green, bg: T.greenSoft },
  archived:  { label: 'Archived',  color: T.text3, bg: T.surfaceMuted },
};

/* Local CSS for drag-drop animations (injected once) */
const SCHEDULE_STYLES = `
@keyframes slot-pulse-valid {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.0), 0 0 0 0 rgba(16,185,129,0); }
  50%      { box-shadow: 0 0 0 5px rgba(16,185,129,0.18), inset 0 0 0 2px rgba(16,185,129,0.6); }
}
@keyframes slot-pulse-conflict {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.0), 0 0 0 0 rgba(239,68,68,0); }
  50%      { box-shadow: 0 0 0 5px rgba(239,68,68,0.18), inset 0 0 0 2px rgba(239,68,68,0.5); }
}
@keyframes slot-drop-bounce {
  0%   { transform: scale(0.90); }
  55%  { transform: scale(1.05); }
  100% { transform: scale(1); }
}
@keyframes slot-fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes drag-card-float {
  0%, 100% { transform: rotate(-1deg) scale(1.03); }
  50%       { transform: rotate(0.5deg) scale(1.05); }
}
.tt-slot-valid    { animation: slot-pulse-valid    1.4s ease-in-out infinite !important; }
.tt-slot-conflict { animation: slot-pulse-conflict 1.4s ease-in-out infinite !important; }
.tt-slot-bounce   { animation: slot-drop-bounce    300ms cubic-bezier(0.16,1,0.3,1); }
.tt-card-fade-in  { animation: slot-fade-in        300ms cubic-bezier(0.16,1,0.3,1); }
.tt-drag-source   { opacity: 0.35 !important; }
.tt-drag-overlay  {
  position: fixed; inset: 0; z-index: 500;
  background: rgba(10,10,30,0.45);
  backdrop-filter: blur(2px);
  pointer-events: none;
  animation: admin-overlay-in 150ms ease both;
}
`;

/* ── Slot edit drawer (replacement for SlotEditModal) ─────────── */
const SlotEditDrawer = ({ open, onClose, slotInfo, timetable, allClasses, onSave }) => {
  const [mode,    setMode]    = useState('class'); // 'class' | 'event' | 'free'
  const [subject, setSubject] = useState('');
  const [teacher, setTeacher] = useState('');
  const [room,    setRoom]    = useState('');
  const [event,   setEvent]   = useState('');

  /* Build subject/teacher/room option lists from existing timetable cells */
  const allEntries = useMemo(() => {
    if (!timetable?.schedule) return [];
    const arr = [];
    timetable.schedule.forEach(day => day.forEach(slot => slot?.forEach(e => { if (!e.event) arr.push(e); })));
    return arr;
  }, [timetable]);

  const subjects = useMemo(() => Array.from(new Set(allEntries.map(e => e.subject))).filter(Boolean), [allEntries]);
  const teachers = useMemo(() => Array.from(new Set(allEntries.map(e => e.teacher))).filter(Boolean), [allEntries]);
  const rooms    = useMemo(() => Array.from(new Set(allEntries.map(e => e.classroom))).filter(Boolean), [allEntries]);

  /* Hydrate form when opened */
  useEffect(() => {
    if (!open || !slotInfo) return;
    const cur = slotInfo.currentContent?.[0];
    if (!cur) {
      setMode('free'); setSubject(''); setTeacher(''); setRoom(''); setEvent('');
    } else if (cur.event) {
      setMode('event'); setEvent(cur.event); setSubject(''); setTeacher(''); setRoom('');
    } else {
      setMode('class');
      setSubject(cur.subject || '');
      setTeacher(cur.teacher || '');
      setRoom(cur.classroom || '');
      setEvent('');
    }
  }, [open, slotInfo]);

  if (!open || !slotInfo) return null;

  const handleSave = () => {
    let content = [];
    if (mode === 'class' && subject && teacher) {
      content = [{ subject, teacher, classroom: room || 'TBD' }];
    } else if (mode === 'event' && event) {
      content = [{ event }];
    }
    onSave({ day: slotInfo.day, slot: slotInfo.slot, content });
    onClose();
  };

  return (
    <Drawer open={open} onClose={onClose} title={`Edit · ${slotInfo.dayName} · ${slotInfo.timeSlot}`}>
      {/* Mode switcher */}
      <div style={{
        display: 'flex', gap: 4, padding: 4,
        background: T.surfaceMuted, border: `1px solid ${T.border}`,
        borderRadius: 12,
      }}>
        {[
          { id: 'class', label: 'Class',  icon: 'subject' },
          { id: 'event', label: 'Event',  icon: 'calendar' },
          { id: 'free',  label: 'Free',   icon: 'close' },
        ].map(opt => {
          const active = mode === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setMode(opt.id)}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 9,
                border: 'none', cursor: 'pointer',
                background: active ? T.surface : 'transparent',
                color: active ? T.text : T.text3,
                fontSize: 12.5, fontWeight: active ? 700 : 500,
                fontFamily: 'inherit', letterSpacing: '-0.01em',
                boxShadow: active ? T.shadowCard : 'none',
                transition: `all 220ms ${T.ease}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <ChIcon name={opt.icon} size={12} />
              {opt.label}
            </button>
          );
        })}
      </div>

      {mode === 'class' && (
        <>
          <Field label="Subject" required>
            <Input value={subject} onChange={e=>setSubject(e.target.value)} list="subjects-list" placeholder="e.g., Data Structures" />
            <datalist id="subjects-list">{subjects.map(s => <option key={s} value={s} />)}</datalist>
          </Field>
          <Field label="Teacher" required>
            <Input value={teacher} onChange={e=>setTeacher(e.target.value)} list="teachers-list" placeholder="e.g., Dr. Sharma" />
            <datalist id="teachers-list">{teachers.map(t => <option key={t} value={t} />)}</datalist>
          </Field>
          <Field label="Classroom">
            <Input value={room} onChange={e=>setRoom(e.target.value)} list="rooms-list" placeholder="e.g., Room 101" />
            <datalist id="rooms-list">{rooms.map(r => <option key={r} value={r} />)}</datalist>
          </Field>
        </>
      )}

      {mode === 'event' && (
        <Field label="Event Description" required hint="e.g., 'Holiday', 'Exam Block', 'Faculty Meeting'">
          <Input value={event} onChange={e=>setEvent(e.target.value)} placeholder="Event name" />
        </Field>
      )}

      {mode === 'free' && (
        <div style={{
          padding: '14px 16px', borderRadius: 12,
          background: T.surfaceMuted, border: `1px solid ${T.border}`,
          fontSize: 13, color: T.text3, fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <ChIcon name="info" size={14} />
          This slot will be cleared.
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
        <PrimaryBtn onClick={handleSave} style={{ flex: 1, justifyContent: 'center' }}>Save Slot</PrimaryBtn>
        <GhostBtn onClick={onClose}>Cancel</GhostBtn>
      </div>
    </Drawer>
  );
};

/* ── Single timetable cell (drag source + drop target) ────────── */
const TimetableCell = ({
  dayIndex, slotIndex, content, isLunch, isEditable,
  isDragging, isSourceCell, dragOver, dropState, // dropState: 'valid'|'conflict'|null
  onDragStart, onDragEnd,
  onDragOver, onDragLeave, onDrop, onClick, justDropped,
}) => {
  const hasContent = content?.length > 0;
  const entry      = hasContent ? content[0] : null;
  const isEvent    = entry?.event;

  /* CSS class for glow animation */
  let glowCls = '';
  if (isDragging && !isSourceCell && !isLunch) {
    if (dragOver && dropState === 'valid')    glowCls = 'tt-slot-valid';
    if (dragOver && dropState === 'conflict') glowCls = 'tt-slot-conflict';
    if (!dragOver && dropState === 'valid')   glowCls = 'tt-slot-valid';
    if (!dragOver && dropState === 'conflict') glowCls = 'tt-slot-conflict';
  }

  /* Background tint when dragging */
  let bgOverride = null;
  if (isDragging && !isSourceCell && !isLunch) {
    if (dropState === 'valid')    bgOverride = dragOver ? 'rgba(16,185,129,0.18)' : 'rgba(16,185,129,0.06)';
    if (dropState === 'conflict') bgOverride = dragOver ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.05)';
    if (!dropState)               bgOverride = 'rgba(15,23,42,0.04)'; // neutral dim
  }

  const baseStyle = {
    border: isDragging && !isSourceCell && !isLunch
      ? `1.5px solid ${
          dropState === 'valid'    ? (dragOver ? T.green : T.green+'55') :
          dropState === 'conflict' ? (dragOver ? T.red   : T.red+'55')   :
          T.border
        }`
      : `1px solid ${T.border}`,
    background: isLunch
      ? T.amberSoft + '88'
      : bgOverride || T.surface,
    borderRadius: 10,
    padding: 8,
    minHeight: 70,
    cursor: isLunch ? 'not-allowed' : isEditable ? 'pointer' : 'default',
    opacity: isSourceCell ? 0.3 : 1,
    transform: isSourceCell ? 'scale(0.96)' : dragOver && !isSourceCell ? 'scale(1.02)' : 'scale(1)',
    transition: `transform 200ms ${T.ease}, opacity 180ms ${T.ease}, border-color 180ms ${T.ease}, background 180ms ${T.ease}`,
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <td
      style={{ padding: 4, verticalAlign: 'top', zIndex: isDragging && !isSourceCell ? 600 : 'auto', position: 'relative' }}
      onDragOver={isEditable && !isLunch ? (e) => onDragOver(e, dayIndex, slotIndex) : undefined}
      onDragLeave={isEditable && !isLunch ? onDragLeave : undefined}
      onDrop={isEditable && !isLunch ? (e) => onDrop(e, dayIndex, slotIndex) : undefined}
      onClick={isEditable && !isLunch ? () => onClick(dayIndex, slotIndex) : undefined}
    >
      <div className={`${glowCls} ${justDropped ? 'tt-slot-bounce' : ''}`} style={baseStyle}
        draggable={isEditable && hasContent && !isLunch}
        onDragStart={hasContent ? (e) => onDragStart(e, dayIndex, slotIndex) : undefined}
        onDragEnd={onDragEnd}
      >
        {isLunch ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: T.amber, fontSize: 11.5, fontWeight: 700, letterSpacing: '-0.005em',
            height: '100%', minHeight: 54,
          }}>
            Lunch Break
          </div>
        ) : !hasContent ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            height: '100%', minHeight: 54, gap: 4,
          }}>
            {isDragging && dragOver && dropState === 'valid' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: T.green, fontWeight: 700, fontSize: 11.5 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                Drop here
              </div>
            )}
            {isDragging && dragOver && dropState === 'conflict' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: T.red, fontWeight: 700, fontSize: 11 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                Conflict
              </div>
            )}
            {(!isDragging || !dragOver) && (
              <span style={{ color: T.text4, fontSize: 11.5, fontWeight: 500 }}>Free</span>
            )}
          </div>
        ) : isEvent ? (
          <div style={{
            background: entry.event.toLowerCase().includes('holiday') ? T.redSoft : T.amberSoft,
            color: entry.event.toLowerCase().includes('holiday') ? T.red : T.amber,
            border: `1px solid ${entry.event.toLowerCase().includes('holiday') ? T.red : T.amber}33`,
            borderRadius: 8, padding: '6px 8px',
            fontSize: 11.5, fontWeight: 700, textAlign: 'center',
            letterSpacing: '-0.005em',
          }}>
            {entry.event}
          </div>
        ) : (
          (() => {
            const sColor = subjectColor(entry.subject);
            return (
              <div style={{
                background: sColor.bg, border: `1px solid ${sColor.border}`,
                borderLeft: `3px solid ${sColor.fg}`,
                borderRadius: 8, padding: '6px 8px',
                position: 'relative',
              }}>
                {/* Drag handle hint on hover */}
                {isEditable && (
                  <div style={{
                    position: 'absolute', top: 4, right: 4,
                    opacity: 0, transition: 'opacity 150ms',
                    color: sColor.fg, display: 'flex',
                  }} className="tt-drag-handle">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="9" cy="19" r="2"/><circle cx="15" cy="5" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="15" cy="19" r="2"/></svg>
                  </div>
                )}
                <div style={{
                  fontWeight: 700, fontSize: 12, color: sColor.fg,
                  letterSpacing: '-0.015em', lineHeight: 1.25,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  marginBottom: 2,
                }}>
                  {entry.subject}
                </div>
                <div style={{
                  fontSize: 10.5, color: T.text2, fontWeight: 500,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  letterSpacing: '-0.005em',
                }}>
                  {entry.teacher}
                </div>
                <div style={{
                  fontSize: 10, color: T.text3, marginTop: 1,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {entry.classroom}
                </div>
              </div>
            );
          })()
        )}
      </div>
    </td>
  );
};

/* ── Timetable Editor (full-screen-like takeover within tab) ──── */
const TimetableEditor = ({ timetableId, onClose, classes, onPublishUpdate }) => {
  const { user } = useAuth();
  const [timetable,     setTimetable]     = useState(null);
  const [original,      setOriginal]      = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [hasChanges,    setHasChanges]    = useState(false);
  const [isEditable,    setIsEditable]    = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [toast,         setToast]         = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  /* Drag state */
  const [draggedSlot,  setDraggedSlot]  = useState(null);
  const [dragOverSlot, setDragOverSlot] = useState(null);
  const [justDropped,  setJustDropped]  = useState(null);
  /* Pre-computed conflict map: { 'day-slot': 'valid'|'conflict' } */
  const [dropZoneMap,  setDropZoneMap]  = useState({});

  /* Compute which slots conflict when dragging starts.
     Rule: if the source slot has a teacher assigned, any OTHER slot in the
     same time-slot (same slotIndex, different day) that also has that same
     teacher is a conflict. Additionally, lunch is always blocked. */
  const buildDropZoneMap = useCallback((sourceDay, sourceSlot, schedule) => {
    const sourceEntry = schedule[sourceDay][sourceSlot]?.[0];
    const sourceTeacher = sourceEntry?.teacher || null;
    const map = {};
    for (let day = 0; day < 5; day++) {
      for (let slot = 0; slot < 8; slot++) {
        const key = `${day}-${slot}`;
        if (day === sourceDay && slot === sourceSlot) { map[key] = 'source'; continue; }
        if (slot === LUNCH_SLOT) { map[key] = 'lunch'; continue; }
        if (!sourceTeacher) { map[key] = 'valid'; continue; }
        // Check if same teacher is busy at this slot on any OTHER day
        let conflict = false;
        for (let d = 0; d < 5; d++) {
          if (d === sourceDay) continue; // source day will be freed
          const entry = schedule[d]?.[slot]?.[0];
          if (entry && !entry.event && entry.teacher === sourceTeacher && d === day) {
            conflict = true; break;
          }
        }
        map[key] = conflict ? 'conflict' : 'valid';
      }
    }
    return map;
  }, []);

  /* Slot edit drawer */
  const [editSlot, setEditSlot] = useState(null);

  /* History drawer */
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history,     setHistory]     = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  /* Load timetable */
  const loadTimetable = useCallback(async () => {
    setLoading(true);
    try {
      if (isDemoId(timetableId)) {
        const tt = getDemoTimetable(timetableId);
        if (tt) { setTimetable(tt); setOriginal(JSON.parse(JSON.stringify(tt))); setIsEditable(tt.status !== 'published'); setHasChanges(false); }
        else setToast({ msg: 'Demo timetable not found', type: 'error' });
      } else {
        const data = await timetableService.getOne(timetableId);
        setTimetable(data);
        setOriginal(JSON.parse(JSON.stringify(data)));
        setIsEditable(data.status !== 'published');
        setHasChanges(false);
      }
    } catch (err) {
      setToast({ msg: 'Failed to load timetable', type: 'error' });
    }
    setLoading(false);
  }, [timetableId]);

  useEffect(() => { loadTimetable(); }, [loadTimetable]);

  /* Drag-drop handlers */
  const handleDragStart = (e, day, slot) => {
    if (!isEditable) return;
    const content = timetable.schedule[day][slot];
    if (!content?.length) { e.preventDefault(); return; }
    setDraggedSlot({ day, slot, content });
    /* Build drop-zone map synchronously before browser starts drag */
    const map = buildDropZoneMap(day, slot, timetable.schedule);
    setDropZoneMap(map);
    e.dataTransfer.effectAllowed = 'move';
    /* Hide the default drag image */
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragEnd = () => {
    setDraggedSlot(null);
    setDragOverSlot(null);
    setDropZoneMap({});
  };

  const handleDragOver = (e, day, slot) => {
    e.preventDefault();
    if (slot === LUNCH_SLOT) { e.dataTransfer.dropEffect = 'none'; return; }
    if (draggedSlot && draggedSlot.day === day && draggedSlot.slot === slot) {
      e.dataTransfer.dropEffect = 'none'; return;
    }
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot({ day, slot });
  };

  const handleDragLeave = () => setDragOverSlot(null);

  const handleDrop = (e, targetDay, targetSlot) => {
    e.preventDefault();
    if (!draggedSlot) return;
    if (targetSlot === LUNCH_SLOT) {
      setToast({ msg: 'Cannot drop on lunch break', type: 'error' });
      setDragOverSlot(null); return;
    }
    if (draggedSlot.day === targetDay && draggedSlot.slot === targetSlot) {
      setDragOverSlot(null); return;
    }

    const updated = JSON.parse(JSON.stringify(timetable.schedule));
    const targetContent = updated[targetDay][targetSlot];
    /* Swap if both occupied, else move */
    if (targetContent?.length) {
      updated[targetDay][targetSlot]              = draggedSlot.content;
      updated[draggedSlot.day][draggedSlot.slot]  = targetContent;
    } else {
      updated[targetDay][targetSlot]              = draggedSlot.content;
      updated[draggedSlot.day][draggedSlot.slot]  = [];
    }
    setTimetable({ ...timetable, schedule: updated });
    setHasChanges(true);
    setJustDropped(`${targetDay}-${targetSlot}`);
    setDragOverSlot(null);
    setTimeout(() => setJustDropped(null), 320);
  };

  /* Cell click → open slot edit drawer */
  const handleCellClick = (day, slot) => {
    setEditSlot({
      day, slot,
      dayName: DAY_NAMES[day],
      timeSlot: SLOT_TIMES[slot],
      currentContent: timetable.schedule[day][slot] || [],
    });
  };

  const handleSlotSave = ({ day, slot, content }) => {
    const updated = JSON.parse(JSON.stringify(timetable.schedule));
    updated[day][slot] = content;
    setTimetable({ ...timetable, schedule: updated });
    setHasChanges(true);
    setJustDropped(`${day}-${slot}`);
    setTimeout(() => setJustDropped(null), 320);
  };

  /* Save changes */
  const handleSave = async () => {
    setSaving(true);
    if (isDemoId(timetableId)) {
      const updated = saveDemoEdit(timetableId, timetable.schedule, 'Manual edits via editor');
      if (updated) { setTimetable(updated); setOriginal(JSON.parse(JSON.stringify(updated))); setHasChanges(false); setToast({ msg: `Saved as v${updated.currentVersion} (demo)`, type: 'success' }); }
      setSaving(false); return;
    }
    try {
      const data = await timetableService.saveEdit(timetableId, {
        schedule: timetable.schedule,
        changes: 'Manual edits via timetable editor',
        userId: user?._id,
      });
      setTimetable(data.timetable);
      setOriginal(JSON.parse(JSON.stringify(data.timetable)));
      setHasChanges(false);
      setToast({ msg: `Saved as v${data.timetable.currentVersion}`, type: 'success' });
    } catch (err) {
      setToast({ msg: err.response?.data?.message || 'Save failed', type: 'error' });
    }
    setSaving(false);
  };

  const handleRevert = () => {
    setTimetable(JSON.parse(JSON.stringify(original)));
    setHasChanges(false);
    setToast({ msg: 'Changes reverted', type: 'success' });
  };

  /* Publish */
  const handlePublish = async () => {
    if (isDemoId(timetableId)) {
      publishDemoTT(timetableId);
      setToast({ msg: 'Timetable published (demo)', type: 'success' });
      loadTimetable(); onPublishUpdate?.(); return;
    }
    try {
      await timetableService.publish(timetableId);
      setToast({ msg: 'Timetable published', type: 'success' });
      loadTimetable();
      onPublishUpdate?.();
    } catch (err) {
      setToast({ msg: err.response?.data?.message || 'Publish failed', type: 'error' });
    }
  };

  /* Delete */
  const handleDelete = async () => {
    if (isDemoId(timetableId)) {
      deleteDemoTT(timetableId);
      setToast({ msg: 'Timetable deleted (demo)', type: 'success' });
      onPublishUpdate?.(); onClose(); setConfirmDelete(false); return;
    }
    try {
      await timetableService.remove(timetableId);
      setToast({ msg: 'Timetable deleted', type: 'success' });
      onPublishUpdate?.();
      onClose();
    } catch (err) {
      setToast({ msg: err.response?.data?.message || 'Delete failed', type: 'error' });
    }
    setConfirmDelete(false);
  };

  /* History */
  const loadHistory = async () => {
    setHistoryLoading(true);
    if (isDemoId(timetableId)) {
      const tt = getDemoTimetable(timetableId);
      setHistory(tt?.history || []);
      setHistoryLoading(false); return;
    }
    try {
      const data = await timetableService.getHistory(timetableId);
      setHistory(data.history || []);
    } catch {}
    setHistoryLoading(false);
  };

  const openHistory = () => { setHistoryOpen(true); loadHistory(); };

  const handleRevertVersion = async (versionNumber) => {
    if (isDemoId(timetableId)) {
      const updated = revertDemoVersion(timetableId, versionNumber);
      if (updated) { setTimetable(updated); setOriginal(JSON.parse(JSON.stringify(updated))); setHasChanges(false); setHistoryOpen(false); setToast({ msg: `Reverted to v${versionNumber} (demo)`, type: 'success' }); }
      return;
    }
    try {
      const data = await timetableService.revert(timetableId, versionNumber, {
        userId: user?._id,
      });
      setTimetable(data.timetable);
      setOriginal(JSON.parse(JSON.stringify(data.timetable)));
      setHasChanges(false);
      setHistoryOpen(false);
      setToast({ msg: `Reverted to v${versionNumber}`, type: 'success' });
    } catch (err) {
      setToast({ msg: 'Revert failed', type: 'error' });
    }
  };

  if (loading) return <div style={{ padding: '0 28px' }}><Card><Spinner text="Loading timetable…" /></Card></div>;
  if (!timetable) return null;

  const status = TT_STATUS[timetable.status] || TT_STATUS.draft;
  const isDragging = !!draggedSlot;

  return (
    <div style={{ padding: '0 28px', display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0, maxWidth: '100%' }}>
      <style dangerouslySetInnerHTML={{ __html: SCHEDULE_STYLES }} />
      {/* Full-page dim overlay while dragging */}
      {isDragging && <div className="tt-drag-overlay" />}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}
      <ConfirmModal
        open={confirmDelete}
        onCancel={()=>setConfirmDelete(false)}
        onConfirm={handleDelete}
        message="This will permanently delete this timetable and all its version history."
      />

      {/* Header bar */}
      <div style={{
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: 18, padding: '16px 20px', boxShadow: T.shadowCard,
        display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
      }}>
        <button onClick={onClose} style={{
          width: 36, height: 36, borderRadius: 10,
          background: T.surfaceMuted, border: `1px solid ${T.border}`,
          color: T.text2, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'inherit', flexShrink: 0,
        }}>
          <ChIcon name="chev" size={14} />
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text, letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: 10 }}>
            {timetable.class?.name || 'Timetable'}
            <Badge color={status.color} bg={status.bg}>{status.label}</Badge>
            {isDemoId(timetableId) && <Badge color={T.blue} bg={T.blueSoft}>Demo</Badge>}
            {hasChanges && <Badge color={T.amber} bg={T.amberSoft}>Unsaved</Badge>}
            <Badge color={T.text3} bg={T.surfaceMuted}>v{timetable.currentVersion || 1}</Badge>
          </div>
          <div style={{ fontSize: 12, color: T.text3, marginTop: 3, fontWeight: 500 }}>
            {timetable.class?.code} · Sem {timetable.semester} · Sec {timetable.class?.section} · {timetable.academicYear}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <GhostBtn icon="progress" onClick={openHistory}>History</GhostBtn>
          {hasChanges && <GhostBtn icon="close" onClick={handleRevert}>Revert</GhostBtn>}
          {hasChanges && (
            <PrimaryBtn icon="check" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </PrimaryBtn>
          )}
          {!hasChanges && timetable.status === 'draft' && (
            <PrimaryBtn icon="check" onClick={handlePublish}>Publish</PrimaryBtn>
          )}
          <button onClick={()=>setConfirmDelete(true)} title="Delete" style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'transparent', border: `1px solid ${T.border}`,
            color: T.text3, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'inherit',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = T.redSoft; e.currentTarget.style.color = T.red; e.currentTarget.style.borderColor = T.red+'33'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.text3; e.currentTarget.style.borderColor = T.border; }}
          >
            <ChIcon name="trash" size={14} />
          </button>
        </div>
      </div>

      {/* Hint banner */}
      {isEditable && (
        <div style={{
          padding: '10px 14px', borderRadius: 12,
          background: T.accentSoft, border: `1px solid ${T.accentBorder}`,
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 12, color: T.accent, fontWeight: 500, letterSpacing: '-0.005em',
        }}>
          <ChIcon name="info" size={13} />
          <span>
            <strong>Click</strong> any slot to edit · <strong>Drag</strong> to move or swap classes · Lunch break is locked
          </span>
        </div>
      )}

      {!isEditable && (
        <div style={{
          padding: '10px 14px', borderRadius: 12,
          background: T.greenSoft, border: `1px solid ${T.green}33`,
          fontSize: 12, color: T.green, fontWeight: 600, letterSpacing: '-0.005em',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <ChIcon name="check" size={13} />
          This timetable is published and read-only. Unpublish via delete &amp; regenerate to make edits.
        </div>
      )}

      {/* Timetable grid — horizontally scrollable on small screens */}
      <style dangerouslySetInnerHTML={{ __html: `
        .tt-scroll-outer {
          background: ${T.surface};
          border: 1px solid ${T.border};
          border-radius: 20px;
          box-shadow: ${T.shadowCard};
          overflow-x: auto;
          overflow-y: visible;
          -webkit-overflow-scrolling: touch;
          max-width: 100%;
          width: 100%;
          min-width: 0;
        }
        .tt-scroll-outer::-webkit-scrollbar { height: 8px; }
        .tt-scroll-outer::-webkit-scrollbar-track { background: transparent; }
        .tt-scroll-outer::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.30); border-radius: 99px; }
        .tt-scroll-outer::-webkit-scrollbar-thumb:hover { background: rgba(124,58,237,0.55); }
        .tt-scroll-inner {
          padding: 18px;
          width: max-content;
          min-width: 100%;
          box-sizing: border-box;
        }
        .tt-scroll-hint { display: none; }
        @media (max-width: 900px) { .tt-scroll-hint { display: flex !important; } }
      `}} />
      <div className="tt-scroll-outer">
        <div className="tt-scroll-inner">
        <table style={{ borderCollapse: 'separate', borderSpacing: 0, tableLayout: 'fixed', width: 720 }}>
          <colgroup>
            <col style={{ width: 100 }} />
            {DAY_NAMES.map((_, i) => <col key={i} style={{ width: 124 }} />)}
          </colgroup>
          <thead>
            <tr>
              <th style={{ padding: 8, textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Time
              </th>
              {DAY_NAMES.map((d, i) => (
                <th key={i} style={{ padding: 8, textAlign: 'center', fontSize: 12, fontWeight: 700, color: T.text2, letterSpacing: '-0.015em' }}>
                  <div>{DAY_SHORTS[i]}</div>
                  <div style={{ fontSize: 10, color: T.text3, fontWeight: 500, marginTop: 2 }}>{d}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SLOT_TIMES.map((time, slotIdx) => (
              <tr key={slotIdx}>
                <td style={{ padding: 4, verticalAlign: 'top' }}>
                  <div style={{
                    padding: 8, fontSize: 11, fontWeight: 600, color: T.text3,
                    fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.005em',
                    background: T.surfaceMuted, borderRadius: 8,
                    minHeight: 70, display: 'flex', alignItems: 'center',
                  }}>
                    {time}
                  </div>
                </td>
                {timetable.schedule.map((daySchedule, dayIdx) => {
                  const isSourceCell = isDragging && draggedSlot.day === dayIdx && draggedSlot.slot === slotIdx;
                  const dragOver = dragOverSlot && dragOverSlot.day === dayIdx && dragOverSlot.slot === slotIdx;
                  const dropState = dropZoneMap[`${dayIdx}-${slotIdx}`] || null;
                  return (
                    <TimetableCell
                      key={dayIdx}
                      dayIndex={dayIdx}
                      slotIndex={slotIdx}
                      content={daySchedule[slotIdx]}
                      isLunch={slotIdx === LUNCH_SLOT}
                      isEditable={isEditable}
                      isDragging={isDragging}
                      isSourceCell={isSourceCell}
                      dragOver={dragOver}
                      dropState={dropState}
                      justDropped={justDropped === `${dayIdx}-${slotIdx}`}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={handleCellClick}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Purple scroll indicator strip — shows on narrow screens, OUTSIDE the scroll container */}
      <div className="tt-scroll-hint" style={{
        padding: '8px 14px',
        alignItems: 'center', justifyContent: 'center', gap: 8,
        fontSize: 11.5, fontWeight: 600, color: T.accent,
        background: T.accentSoft,
        border: `1px solid ${T.accentBorder}`,
        borderRadius: 12,
        marginTop: -8,
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
        Scroll sideways to see all days
      </div>

      {/* Slot edit drawer */}
      <SlotEditDrawer
        open={!!editSlot}
        onClose={()=>setEditSlot(null)}
        slotInfo={editSlot}
        timetable={timetable}
        allClasses={classes}
        onSave={handleSlotSave}
      />

      {/* History drawer */}
      <Drawer open={historyOpen} onClose={()=>setHistoryOpen(false)} title="Version History">
        {historyLoading ? <Spinner text="Loading history…" /> : history.length === 0 ? (
          <EmptyState icon="progress" message="No edit history yet" subtext="Versions will appear here when you save changes." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {history.map((v, i) => {
              const isCurrent = v.versionNumber === timetable.currentVersion;
              return (
                <div key={v._id || i} style={{
                  position: 'relative',
                  background: isCurrent ? T.accentSoft : T.surface,
                  border: `1px solid ${isCurrent ? T.accentBorder : T.border}`,
                  borderRadius: 14, padding: '14px 16px',
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                    background: isCurrent ? `linear-gradient(135deg,${T.accent2},${T.accent})` : T.surfaceMuted,
                    color: isCurrent ? '#fff' : T.text3,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, letterSpacing: '-0.01em',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    v{v.versionNumber}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: T.text, letterSpacing: '-0.015em' }}>
                        Version {v.versionNumber}
                      </span>
                      {isCurrent && <Badge color={T.green}>Current</Badge>}
                    </div>
                    <div style={{ fontSize: 12, color: T.text2, marginTop: 4, fontWeight: 500 }}>
                      {v.changeDescription || 'No description'}
                    </div>
                    <div style={{ fontSize: 11, color: T.text3, marginTop: 4, display: 'flex', gap: 12, fontWeight: 500 }}>
                      <span>{v.editedBy?.firstName} {v.editedBy?.lastName}</span>
                      <span>·</span>
                      <span>{new Date(v.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {!isCurrent && (
                      <button onClick={()=>handleRevertVersion(v.versionNumber)} style={{
                        marginTop: 8, padding: '5px 10px', borderRadius: 8,
                        background: T.accent, border: 'none', color: '#fff',
                        fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                        letterSpacing: '-0.005em',
                      }}>
                        Revert to this version
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Drawer>
    </div>
  );
};

/* ── Generate Drawer (one-click flow) ─────────────────────────── */
const GenerateDrawer = ({ open, onClose, classes, onGenerated }) => {
  const { user }     = useAuth();
  const [acYear,     setAcYear]     = useState(new Date().getFullYear() + '-' + ((new Date().getFullYear()+1)%100).toString().padStart(2,'0'));
  const [adaptive,   setAdaptive]   = useState(false);
  const [classData,  setClassData]  = useState({}); /* { classId: { assignments:[], hasTimetable:bool } } */
  const [loading,    setLoading]    = useState(false);
  const [generating, setGenerating] = useState(null); /* classId being generated */
  const [search,     setSearch]     = useState('');
  const [toast,      setToast]      = useState(null);

  /* Load assignment counts for all classes */
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    Promise.allSettled([
      ...classes.map(c => classSubjectService.getByClass(c._id).then(data => ({ classId: c._id, assignments: data }))),
      timetableService.getAll(),
    ]).then(results => {
      const ttRes = results[results.length - 1];
      const ttList = ttRes.status === 'fulfilled' ? ttRes.value : [];
      const ttClasses = new Set(ttList.map(t => t.class?._id || t.class));
      const data = {};
      results.slice(0, -1).forEach(r => {
        if (r.status === 'fulfilled') {
          const { classId, assignments } = r.value;
          data[classId] = {
            assignments,
            hasTimetable: ttClasses.has(classId),
            slotsTotal: assignments.reduce((s, a) => s + (a.subject?.lectures_per_week || 0), 0),
          };
        }
      });
      setClassData(data);
    }).finally(() => setLoading(false));
  }, [open, classes]);

  const handleGenerate = async (classId) => {
    setGenerating(classId);
    try {
      const data = await timetableService.generate(classId, {
        academicYear: acYear,
        userId: user?._id,
        adaptiveMode: adaptive,
      });
      if (data.status === 'success') {
        setToast({ msg: 'Timetable generated', type: 'success' });
        const ttList = await timetableService.getAll();
        const newTT = ttList.find(t => (t.class?._id || t.class) === classId);
        if (newTT) onGenerated(newTT._id);
        onClose();
      } else {
        setToast({ msg: data.message || 'Generation failed', type: 'error' });
      }
    } catch (err) {
      // Solver offline — create a demo timetable instead
      const cls = classes.find(c => c._id === classId)
        || classData[classId]?.assignments?.[0]?.class
        || { _id: classId, name: 'New Class', code: 'NEW', semester: 1, section: 'A', program: { name: 'Program', department: { name: 'Department' } } };
      const demoTT = buildDemoTT(cls, acYear);
      setToast({ msg: 'Solver offline — demo timetable created', type: 'success' });
      onGenerated(demoTT._id);
      onClose();
    }
    setGenerating(null);
  };

  /* Filter classes:
     - Has assignments (else can't generate)
     - Match search */
  const filtered = classes.filter(c => {
    const data = classData[c._id];
    if (!data || data.assignments.length === 0) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
  });

  return (
    <Drawer open={open} onClose={onClose} title="Generate Timetable">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}

      {/* Options */}
      <div style={{
        background: T.surfaceMuted, border: `1px solid ${T.border}`,
        borderRadius: 12, padding: '14px 16px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <Field label="Academic Year">
          <Input value={acYear} onChange={e=>setAcYear(e.target.value)} placeholder="2025-26" />
        </Field>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <div onClick={()=>setAdaptive(!adaptive)} style={{
            width: 36, height: 20, borderRadius: 99, position: 'relative',
            background: adaptive ? T.accent : T.text4,
            transition: `background 220ms ${T.ease}`, flexShrink: 0,
          }}>
            <div style={{
              position: 'absolute', top: 2, left: adaptive ? 18 : 2,
              width: 16, height: 16, borderRadius: '50%', background: '#fff',
              transition: `left 220ms ${T.easeOut}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
            }}/>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text, letterSpacing: '-0.01em' }}>Adaptive mode</div>
            <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>
              Allocate more slots to subjects falling behind
            </div>
          </div>
        </label>
      </div>

      {/* Class list */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search classes…" />
        <span style={{ fontSize: 11, color: T.text3, fontWeight: 600 }}>
          {filtered.length} ready
        </span>
      </div>

      {loading ? <Spinner text="Loading classes…" /> : filtered.length === 0 ? (
        <EmptyState icon="syllabus" message="No classes ready" subtext="Add subject-teacher assignments first." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {filtered.map(c => {
            const data = classData[c._id];
            const overload = data.slotsTotal > 35;
            const isGen = generating === c._id;
            return (
              <button key={c._id}
                onClick={() => handleGenerate(c._id)}
                disabled={overload || isGen || generating !== null}
                style={{
                  background: T.surface, border: `1px solid ${T.border}`,
                  borderRadius: 12, padding: '12px 14px',
                  cursor: overload || isGen ? 'not-allowed' : 'pointer',
                  opacity: overload ? 0.5 : 1,
                  display: 'flex', alignItems: 'center', gap: 12,
                  textAlign: 'left', fontFamily: T.font,
                  transition: `all 200ms ${T.ease}`,
                }}
                onMouseEnter={e => { if (!overload && !isGen) { e.currentTarget.style.borderColor = T.accent + '55'; e.currentTarget.style.transform = 'translateX(2px)'; } }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = ''; }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: T.accentSoft, color: T.accent,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${T.accentBorder}`,
                  fontSize: 10, fontWeight: 800, letterSpacing: '0.04em',
                }}>
                  {c.code.slice(-3)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: T.text, letterSpacing: '-0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: 11, color: T.text3, marginTop: 2, fontWeight: 500 }}>
                    {data.assignments.length} subjects · {data.slotsTotal}/35 slots
                    {data.hasTimetable && <span style={{ color: T.amber, fontWeight: 700 }}> · Will replace existing</span>}
                    {overload && <span style={{ color: T.red, fontWeight: 700 }}> · Overloaded</span>}
                  </div>
                </div>
                {isGen ? (
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2.5px solid ${T.accentSoft}`, borderTopColor: T.accent, animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                ) : (
                  <ChIcon name="bolt" size={14} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </Drawer>
  );
};

/* ── TimetablesTab root ───────────────────────────────────────── */
const TimetablesTab = ({ initialEditId, onEditClose }) => {
  const navigate = useNavigate();
  const [timetables, setTimetables] = useState([]);
  const [classes,    setClasses]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [generateOpen, setGenerateOpen] = useState(false);
  const [editingId,  setEditingId]  = useState(initialEditId || null);

  const load = useCallback(async () => {
    try {
      const [tRes, cRes] = await Promise.all([
        timetableService.getAll(),
        classService.getAll(),
      ]);
      const real = tRes || [];
      // Merge: show real timetables + demo ones that don't clash by _id
      const demos = getDemoTimetables();
      const realIds = new Set(real.map(t => t._id));
      const mergedTTs = [...real, ...demos.filter(d => !realIds.has(d._id))];
      setTimetables(mergedTTs);
      const realClasses = cRes || [];
      const demoClassIds = new Set(realClasses.map(c => c._id));
      setClasses([...realClasses, ...DEMO_CLASSES.filter(c => !demoClassIds.has(c._id))]);
    } catch {
      // Backend fully offline — fall back to demo-only
      setTimetables(getDemoTimetables());
      setClasses(DEMO_CLASSES);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (initialEditId) setEditingId(initialEditId); }, [initialEditId]);

  const filtered = timetables.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      (t.class?.name || '').toLowerCase().includes(q) ||
      (t.class?.code || '').toLowerCase().includes(q);
    const matchStatus = !filterStatus || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (editingId) {
    return (
      <TimetableEditor
        timetableId={editingId}
        classes={classes}
        onClose={() => { setEditingId(null); onEditClose?.(); }}
        onPublishUpdate={load}
      />
    );
  }

  /* Stats */
  const totalCount     = timetables.length;
  const draftCount     = timetables.filter(t => t.status === 'draft').length;
  const publishedCount = timetables.filter(t => t.status === 'published').length;

  return (
    <div style={{ padding: '0 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {[
          { label: 'Total',     value: totalCount,     color: T.accent, icon: 'timetable' },
          { label: 'Draft',     value: draftCount,     color: T.amber,  icon: 'edit' },
          { label: 'Published', value: publishedCount, color: T.green,  icon: 'check' },
        ].map((s, i) => (
          <div key={i} style={{
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 18, padding: '16px 20px', boxShadow: T.shadowCard,
            animation: `admin-fade-up 500ms cubic-bezier(0.16,1,0.3,1) ${i*60}ms both`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.text3 }}>{s.label}</span>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `${s.color}18`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChIcon name={s.icon} size={13} />
              </div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: T.text, letterSpacing: '-0.05em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              {String(s.value).padStart(2, '0')}
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search timetables…" />
        <Select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{ width: 140, padding: '8px 12px' }}>
          <option value="">All status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </Select>
        {(search || filterStatus) && <GhostBtn onClick={()=>{setSearch('');setFilterStatus('');}} icon="close">Clear</GhostBtn>}
        <div style={{ marginLeft: 'auto' }}>
          <PrimaryBtn icon="bolt" onClick={()=>setGenerateOpen(true)}>Generate Timetable</PrimaryBtn>
        </div>
      </div>

      {/* Grid */}
      {loading ? <Card style={{ padding: 0 }}><Spinner text="Loading timetables…" /></Card> :
       filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon="timetable"
            message={search || filterStatus ? 'No matching timetables' : 'No timetables yet'}
            subtext="Click 'Generate Timetable' to create your first one."
          />
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {filtered.map((tt, i) => {
            const status = TT_STATUS[tt.status] || TT_STATUS.draft;
            return (
              <button key={tt._id}
                onClick={() => setEditingId(tt._id)}
                className="tt-card-fade-in"
                style={{
                  background: T.surface, border: `1px solid ${T.border}`,
                  borderRadius: 18, padding: '18px 20px', boxShadow: T.shadowCard,
                  cursor: 'pointer', textAlign: 'left', fontFamily: T.font,
                  display: 'flex', flexDirection: 'column', gap: 12,
                  transition: `all 220ms ${T.ease}`,
                  animationDelay: `${(i % 6) * 50}ms`, animationFillMode: 'both',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = T.shadowLift; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = T.shadowCard; }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: T.text, letterSpacing: '-0.025em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tt.class?.name || 'Unnamed'}
                    </div>
                    <div style={{ fontSize: 11.5, color: T.text3, marginTop: 3, fontWeight: 500 }}>
                      {tt.class?.code} · Sem {tt.semester} · Sec {tt.class?.section || 'A'}
                    </div>
                  </div>
                  <Badge color={status.color} bg={status.bg}>{status.label}</Badge>
                </div>

                <div style={{ height: 1, background: T.divider }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 11, color: T.text3, fontWeight: 500 }}>
                    {tt.class?.program?.name || 'Program'}
                  </div>
                  <div style={{ fontSize: 11, color: T.text3, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                    v{tt.currentVersion || 1}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: T.accent, fontWeight: 600, letterSpacing: '-0.005em' }}>
                  <ChIcon name="edit" size={11} />
                  <span>Open editor</span>
                  <ChIcon name="arrow" size={11} />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Generate drawer */}
      <GenerateDrawer
        open={generateOpen}
        onClose={()=>setGenerateOpen(false)}
        classes={classes}
        onGenerated={(id) => { load(); setEditingId(id); }}
      />
    </div>
  );
};

export default TimetablesTab;
