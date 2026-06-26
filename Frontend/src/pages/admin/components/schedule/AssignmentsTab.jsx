/**
 * AssignmentsTab.jsx — Chronos Admin / Schedule
 * ──────────────────────────────────────────────────────────────────────────
 * Pick a class → see/edit teacher↔subject mappings.
 * ──────────────────────────────────────────────────────────────────────────
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { theme as T } from '@/theme';
import classService from '@/services/classService';
import subjectService from '@/services/subjectService';
import teacherService from '@/services/teacherService';
import classroomService from '@/services/classroomService';
import classSubjectService from '@/services/classSubjectService';
import {
  ChIcon, Card,
  PrimaryBtn, GhostBtn, EditBtn, DangerBtn,
  Field, Select,
  Toast, Drawer, EmptyState, ConfirmModal,
} from '@/layouts/AdminLayout';
import { subjectColor, Spinner } from './helpers';

const AssignmentsTab = () => {
  const [classes,    setClasses]    = useState([]);
  const [subjects,   setSubjects]   = useState([]);
  const [teachers,   setTeachers]   = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [assignments,setAssignments]= useState([]);
  const [selectedCl, setSelectedCl] = useState('');
  const [loading,    setLoading]    = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId,  setEditingId]  = useState(null);
  const [confirmId,  setConfirmId]  = useState(null);
  const [toast,      setToast]      = useState(null);
  const [saving,     setSaving]     = useState(false);

  const BLANK = { subjectId: '', teacherId: '', preferredRoom: '' };
  const [form, setForm] = useState(BLANK);

  /* Initial load */
  useEffect(() => {
    Promise.allSettled([
      classService.getAll(),
      subjectService.getAll(),
      teacherService.getAll(),
      classroomService.getAll(),
    ]).then(([cR, sR, tR, rR]) => {
      if (cR.status === 'fulfilled') setClasses(cR.value);
      if (sR.status === 'fulfilled') setSubjects(sR.value);
      if (tR.status === 'fulfilled') setTeachers(tR.value);
      if (rR.status === 'fulfilled') setClassrooms(rR.value);
    }).finally(() => setLoading(false));
  }, []);

  /* Load assignments for selected class */
  const loadAssignments = useCallback(async () => {
    if (!selectedCl) return;
    try {
      const data = await classSubjectService.getByClass(selectedCl);
      setAssignments(data);
    } catch {}
  }, [selectedCl]);

  useEffect(() => { loadAssignments(); }, [loadAssignments]);

  const totalSlots = useMemo(
    () => assignments.reduce((s, a) => s + (a.subject?.lectures_per_week || 0), 0),
    [assignments]
  );
  const availableSlots = 35; // 5 days × 7 slots (excluding lunch)
  const slotsPercent   = Math.min(100, (totalSlots / availableSlots) * 100);

  /* Subjects not yet assigned to this class */
  const unassignedSubjects = useMemo(() => {
    const used = new Set(assignments.map(a => a.subject?._id));
    return subjects.filter(s => !used.has(s._id));
  }, [subjects, assignments]);

  const openAdd = () => { setForm(BLANK); setEditingId(null); setDrawerOpen(true); };
  const openEdit = (a) => {
    setForm({
      subjectId: a.subject?._id || '',
      teacherId: a.teacher?._id || '',
      preferredRoom: a.preferredRoom?._id || '',
    });
    setEditingId(a._id);
    setDrawerOpen(true);
  };
  const closeDrawer = () => { setDrawerOpen(false); setEditingId(null); };

  const handleSave = async () => {
    if (!form.subjectId || !form.teacherId) {
      setToast({ msg: 'Subject and teacher are required', type: 'error' }); return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await classSubjectService.update(editingId, {
          teacherId: form.teacherId,
          preferredRoom: form.preferredRoom || null,
        });
        setToast({ msg: 'Assignment updated', type: 'success' });
      } else {
        await classSubjectService.create({
          classId: selectedCl,
          subjectId: form.subjectId,
          teacherId: form.teacherId,
          preferredRoom: form.preferredRoom || null,
        });
        setToast({ msg: 'Assignment added', type: 'success' });
      }
      closeDrawer(); loadAssignments();
    } catch (err) {
      setToast({ msg: err.response?.data?.message || 'Save failed', type: 'error' });
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    try {
      await classSubjectService.remove(confirmId);
      setToast({ msg: 'Assignment removed', type: 'success' });
      loadAssignments();
    } catch (err) {
      setToast({ msg: err.response?.data?.message || 'Delete failed', type: 'error' });
    }
    setConfirmId(null);
  };

  return (
    <div style={{ padding: '0 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}
      <ConfirmModal
        open={!!confirmId}
        onCancel={()=>setConfirmId(null)}
        onConfirm={handleDelete}
        message="Remove this assignment? You can add it back any time."
      />

      {/* Class selector + stats card */}
      <div style={{
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: 20, padding: '20px 24px', boxShadow: T.shadowCard,
        display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
        animation: 'admin-fade-up 400ms cubic-bezier(0.16,1,0.3,1) both',
      }}>
        <Field label="Select Class" style={{ flex: 1, minWidth: 280 }}>
          <Select value={selectedCl} onChange={e => setSelectedCl(e.target.value)}>
            <option value="">— Choose a class —</option>
            {classes.map(c => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.code}) · Sem {c.semester} · Sec {c.section}
              </option>
            ))}
          </Select>
        </Field>

        {selectedCl && (
          <>
            <div style={{ minWidth: 160 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.text3, marginBottom: 4 }}>
                Subjects assigned
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: T.text, letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                {assignments.length}
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.text3 }}>Weekly slots</span>
                <span>
                  <span style={{ fontSize: 22, fontWeight: 700, color: totalSlots > availableSlots ? T.red : T.text, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{totalSlots}</span>
                  <span style={{ fontSize: 13, color: T.text3, fontWeight: 500 }}> / {availableSlots}</span>
                </span>
              </div>
              <div style={{ height: 8, borderRadius: 99, background: T.surfaceMuted, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  width: `${slotsPercent}%`,
                  background: totalSlots > availableSlots
                    ? `linear-gradient(90deg,${T.red}99,${T.red})`
                    : `linear-gradient(90deg,${T.accent2},${T.accent})`,
                  transition: 'width 600ms cubic-bezier(0.16,1,0.3,1)',
                }} />
              </div>
            </div>

            <PrimaryBtn icon="plus" onClick={openAdd} disabled={unassignedSubjects.length === 0}>
              Add Assignment
            </PrimaryBtn>
          </>
        )}
      </div>

      {/* Empty-state if no class picked */}
      {!selectedCl && !loading && (
        <Card>
          <EmptyState icon="class" message="Pick a class to begin" subtext="Select a class from the dropdown above to view and manage its subject assignments." />
        </Card>
      )}

      {loading && (
        <Card style={{ padding: 0 }}><Spinner text="Loading classes…" /></Card>
      )}

      {/* Warning if exceeding slots */}
      {selectedCl && totalSlots > availableSlots && (
        <div style={{
          padding: '12px 16px', borderRadius: 12,
          background: T.redSoft, border: `1px solid ${T.red}33`,
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 13, color: T.red, fontWeight: 500,
        }}>
          <ChIcon name="alert" size={15} />
          Too many lectures: {totalSlots} requested but only {availableSlots} slots available per week. Remove some or reduce lectures-per-week.
        </div>
      )}

      {/* Assignments grid */}
      {selectedCl && assignments.length === 0 && !loading && (
        <Card>
          <EmptyState
            icon="syllabus"
            message="No assignments yet"
            subtext="Add the first subject-teacher mapping using the button above."
          />
        </Card>
      )}

      {selectedCl && assignments.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 12,
        }}>
          {assignments.map((a, i) => {
            const sCode = a.subject?.code || '';
            const color = subjectColor(sCode);
            return (
              <div key={a._id} className="tt-card-fade-in" style={{
                background: T.surface, border: `1px solid ${T.border}`,
                borderRadius: 18, padding: '16px 18px', boxShadow: T.shadowCard,
                display: 'flex', flexDirection: 'column', gap: 12,
                animationDelay: `${(i % 4) * 60}ms`, animationFillMode: 'both',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: color.bg, color: color.fg,
                    border: `1px solid ${color.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, letterSpacing: '0.04em',
                  }}>
                    {sCode.slice(0, 3) || 'SUB'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: T.text, letterSpacing: '-0.025em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.subject?.name || '—'}
                    </div>
                    <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>
                      {sCode} · <span style={{ fontWeight: 600 }}>{a.subject?.lectures_per_week || 0}</span> lec/wk
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 3 }}>
                    <EditBtn onClick={()=>openEdit(a)} />
                    <DangerBtn onClick={()=>setConfirmId(a._id)} />
                  </div>
                </div>

                <div style={{ height: 1, background: T.divider }} />

                <div>
                  <div style={{ fontSize: 11, color: T.text3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                    Teacher
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: `linear-gradient(135deg,${T.accent2},${T.accent})`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                      {(a.teacher?.name || '?')[0].toUpperCase()}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.text2, letterSpacing: '-0.015em' }}>
                      {a.teacher?.name || '—'}
                    </span>
                  </div>
                </div>

                {a.preferredRoom && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.text3, fontWeight: 500 }}>
                    <ChIcon name="room" size={11} />
                    Preferred room: <span style={{ color: T.text2, fontWeight: 600 }}>{a.preferredRoom.name}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Drawer */}
      <Drawer open={drawerOpen} onClose={closeDrawer} title={editingId ? 'Edit Assignment' : 'Add Assignment'}>
        <Field label="Subject" required>
          <Select value={form.subjectId} onChange={e=>setForm({...form, subjectId:e.target.value})} disabled={!!editingId}>
            <option value="">— Select Subject —</option>
            {(editingId ? subjects : unassignedSubjects).map(s => (
              <option key={s._id} value={s._id}>
                {s.name} ({s.code}) · {s.lectures_per_week} lec/wk
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Teacher" required>
          <Select value={form.teacherId} onChange={e=>setForm({...form, teacherId:e.target.value})}>
            <option value="">— Select Teacher —</option>
            {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
          </Select>
        </Field>
        <Field label="Preferred Room" hint="Optional — solver will respect when possible">
          <Select value={form.preferredRoom} onChange={e=>setForm({...form, preferredRoom:e.target.value})}>
            <option value="">No preference</option>
            {classrooms.map(r => <option key={r._id} value={r._id}>{r.name} (cap: {r.capacity})</option>)}
          </Select>
        </Field>
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <PrimaryBtn onClick={handleSave} disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
            {saving ? 'Saving…' : editingId ? 'Update Assignment' : 'Add Assignment'}
          </PrimaryBtn>
          <GhostBtn onClick={closeDrawer}>Cancel</GhostBtn>
        </div>
      </Drawer>
    </div>
  );
};

export default AssignmentsTab;
