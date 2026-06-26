/**
 * AcademicResources.jsx  — Chronos Admin
 * ─────────────────────────────────────────────────────────────────────
 * Three tabs in one page:
 *   Subjects   — CRUD for academic subjects (theory / lab / practical)
 *   Classes    — CRUD for class sections (program, semester, section)
 *   Classrooms — CRUD for physical rooms / labs with capacity bars
 *
 * All three routes (/subjects, /classes, /classrooms) render this
 * component with a different defaultTab so bookmarks still work.
 * ─────────────────────────────────────────────────────────────────────
 */
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import subjectService from '@/services/subjectService';
import classService from '@/services/classService';
import classroomService from '@/services/classroomService';
import {
  useSubjects, useDepartments, useClasses, usePrograms, useClassrooms,
} from '@/hooks/queries';
import AdminLayout, {
  T, ChIcon, Card,
  PrimaryBtn, GhostBtn, EditBtn, DangerBtn,
  Field, Input, Select, Textarea,
  Toast, Drawer, EmptyState,
  TH, TD, Badge, Tabs, SearchInput, ConfirmModal,
} from '@/layouts/AdminLayout';

/* ═══════════════════════════════════════════════════════════════
   SHARED HELPERS
   ═══════════════════════════════════════════════════════════════ */
const Spinner = () => (
  <div style={{ padding:56, display:'flex', justifyContent:'center', alignItems:'center', gap:12 }}>
    <div style={{
      width:24, height:24, borderRadius:'50%',
      border:`3px solid ${T.accentSoft}`, borderTopColor:T.accent,
      animation:'spin 0.7s linear infinite',
    }}/>
    <span style={{ color:T.text3, fontSize:13, fontWeight:500 }}>Loading…</span>
  </div>
);

/* Small stat tile — used in each tab's header strip */
const StatTile = ({ label, value, color, icon, delay = 0 }) => (
  <div style={{
    background:T.surface, border:`1px solid ${T.border}`,
    borderRadius:18, padding:'16px 20px',
    boxShadow:T.shadowCard,
    display:'flex', flexDirection:'column', gap:8,
    animation:`admin-fade-up 500ms cubic-bezier(0.16,1,0.3,1) ${delay}ms both`,
  }}>
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <span style={{ fontSize:12, fontWeight:600, color:T.text3, letterSpacing:'-0.005em' }}>
        {label}
      </span>
      <div style={{
        width:28, height:28, borderRadius:8,
        background:`${color}18`, color,
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <ChIcon name={icon} size={13} />
      </div>
    </div>
    <div style={{
      fontSize:32, fontWeight:700, color:T.text,
      letterSpacing:'-0.05em', lineHeight:1,
      fontVariantNumeric:'tabular-nums',
    }}>
      {String(value).padStart(value > 99 ? 3 : 2, '0')}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   TAB 1 — SUBJECTS
   ═══════════════════════════════════════════════════════════════ */
const TYPE_CFG = {
  theory:    { label:'Theory',    color:T.accent, bg:T.accentSoft, border:T.accentBorder },
  lab:       { label:'Lab',       color:T.blue,   bg:T.blueSoft,  border:'rgba(59,130,246,0.22)' },
  practical: { label:'Practical', color:T.green,  bg:T.greenSoft, border:'rgba(16,185,129,0.22)' },
};
const WEEK_BAR_COLORS = [T.text3, T.blue, T.green, T.accent, T.amber, '#ec4899', '#f97316'];

const SubjectsTab = () => {
  const queryClient = useQueryClient();
  const { data: subjects = [], isLoading: subjectsLoading } = useSubjects();
  const { data: departments = [] } = useDepartments();
  const loading = subjectsLoading;

  const [search,      setSearch]      = useState('');
  const [filterType,  setFilterType]  = useState('');
  const [filterDept,  setFilterDept]  = useState('');
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [editingId,   setEditingId]   = useState(null);
  const [confirmId,   setConfirmId]   = useState(null);
  const [toast,       setToast]       = useState(null);
  const [saving,      setSaving]      = useState(false);

  const BLANK = { name:'', code:'', lectures_per_week:3, subjectType:'theory', credits:'', department:'' };
  const [form, setForm] = useState(BLANK);

  const openAdd  = () => { setForm(BLANK); setEditingId(null); setDrawerOpen(true); };
  const openEdit = (s) => {
    setForm({
      name:s.name, code:s.code,
      lectures_per_week:s.lectures_per_week || 3,
      subjectType:s.subjectType || 'theory',
      credits:s.credits || '',
      department:s.department?._id || s.department || '',
    });
    setEditingId(s._id);
    setDrawerOpen(true);
  };
  const closeDrawer = () => { setDrawerOpen(false); setEditingId(null); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.code.trim() || !form.lectures_per_week) {
      setToast({ msg:'Name, code and lectures/week are required', type:'error' }); return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await subjectService.update(editingId, form);
        setToast({ msg:'Subject updated', type:'success' });
      } else {
        await subjectService.create(form);
        setToast({ msg:'Subject added', type:'success' });
      }
      closeDrawer();
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    } catch (err) {
      setToast({ msg:err.response?.data?.message || 'Save failed', type:'error' });
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    try {
      await subjectService.remove(confirmId);
      setToast({ msg:'Subject deleted', type:'success' });
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    } catch (err) {
      setToast({ msg:err.response?.data?.message || 'Delete failed', type:'error' });
    }
    setConfirmId(null);
  };

  const filtered = subjects.filter(s => {
    const q = search.toLowerCase();
    return (
      (!search || s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)) &&
      (!filterType || (s.subjectType || 'theory') === filterType) &&
      (!filterDept || s.department?._id === filterDept || s.department === filterDept)
    );
  });

  const theoryN = subjects.filter(s => (s.subjectType || 'theory') === 'theory').length;
  const labN    = subjects.filter(s => s.subjectType === 'lab').length;
  const practN  = subjects.filter(s => s.subjectType === 'practical').length;

  return (
    <>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}
      <ConfirmModal
        open={!!confirmId}
        onCancel={()=>setConfirmId(null)}
        onConfirm={handleDelete}
        message="This permanently deletes the subject. Timetable entries referencing it may be affected."
      />

      {/* Stats */}
      <div style={{ padding:'0 28px 20px', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        <StatTile label="Total Subjects" value={subjects.length} color={T.accent} icon="subject" delay={0} />
        <StatTile label="Theory"         value={theoryN}         color={T.accent} icon="subject" delay={60} />
        <StatTile label="Lab"            value={labN}            color={T.blue}   icon="room"    delay={120} />
        <StatTile label="Practical"      value={practN}          color={T.green}  icon="check"   delay={180} />
      </div>

      {/* Filter + Add bar */}
      <div style={{ padding:'0 28px 16px', display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or code…" />
        <Select value={filterType} onChange={e=>setFilterType(e.target.value)} style={{ width:140, padding:'8px 12px' }}>
          <option value="">All types</option>
          <option value="theory">Theory</option>
          <option value="lab">Lab</option>
          <option value="practical">Practical</option>
        </Select>
        {departments.length > 0 && (
          <Select value={filterDept} onChange={e=>setFilterDept(e.target.value)} style={{ width:180, padding:'8px 12px' }}>
            <option value="">All departments</option>
            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </Select>
        )}
        {(search||filterType||filterDept) && (
          <GhostBtn onClick={()=>{setSearch('');setFilterType('');setFilterDept('');}} icon="close">Clear</GhostBtn>
        )}
        <div style={{ marginLeft:'auto' }}>
          <PrimaryBtn icon="plus" onClick={openAdd}>Add Subject</PrimaryBtn>
        </div>
      </div>

      {/* Table */}
      <div style={{ padding:'0 28px' }}>
        <Card style={{ padding:0, animation:'admin-fade-up 500ms cubic-bezier(0.16,1,0.3,1) 200ms both' }}>
          {loading ? <Spinner /> : filtered.length === 0 ? (
            <EmptyState icon="subject"
              message={search||filterType||filterDept ? 'No matching subjects' : 'No subjects yet'}
              subtext="Add your first subject using the button above." />
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr>
                    <TH style={{ paddingLeft:24 }}>Subject</TH>
                    <TH>Type</TH>
                    <TH>Lectures / Week</TH>
                    <TH>Credits</TH>
                    <TH>Department</TH>
                    <TH style={{ paddingRight:24, textAlign:'right' }}>Actions</TH>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => {
                    const cfg = TYPE_CFG[s.subjectType||'theory'] || TYPE_CFG.theory;
                    const lwk = s.lectures_per_week || 0;
                    return (
                      <tr key={s._id} className="ch-admin-row" style={{ background:'transparent' }}>
                        <TD style={{ paddingLeft:24 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{
                              width:36, height:36, borderRadius:10, flexShrink:0,
                              background:`${cfg.color}18`, color:cfg.color,
                              border:`1px solid ${cfg.border}`,
                              display:'flex', alignItems:'center', justifyContent:'center',
                              fontSize:10, fontWeight:800, letterSpacing:'0.04em',
                            }}>
                              {(s.code||'').slice(0,3)}
                            </div>
                            <div>
                              <div style={{ fontWeight:600, fontSize:13.5, color:T.text, letterSpacing:'-0.02em' }}>{s.name}</div>
                              <div style={{ fontSize:11, color:T.text3, marginTop:1 }}>{s.code}</div>
                            </div>
                          </div>
                        </TD>
                        <TD><Badge color={cfg.color} bg={cfg.bg} border={cfg.border}>{cfg.label}</Badge></TD>
                        <TD>
                          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                            {Array.from({length:Math.min(lwk,7)}).map((_,i) => (
                              <div key={i} style={{
                                width:7, height:18, borderRadius:3,
                                background:WEEK_BAR_COLORS[i]||T.accent, opacity:0.75,
                              }}/>
                            ))}
                            <span style={{ fontSize:22, fontWeight:700, color:T.text, letterSpacing:'-0.04em', marginLeft:4, fontVariantNumeric:'tabular-nums' }}>
                              {lwk}
                            </span>
                          </div>
                        </TD>
                        <TD>
                          {s.credits != null && s.credits !== '' ? (
                            <span style={{ fontSize:22, fontWeight:700, color:T.accent, letterSpacing:'-0.04em', fontVariantNumeric:'tabular-nums' }}>
                              {s.credits}
                            </span>
                          ) : <span style={{ color:T.text4 }}>—</span>}
                        </TD>
                        <TD>
                          <div style={{ fontSize:13, color:T.text2, fontWeight:500 }}>{s.department?.name||'—'}</div>
                          {s.department?.code && <div style={{ fontSize:11, color:T.text3 }}>{s.department.code}</div>}
                        </TD>
                        <TD style={{ paddingRight:24, textAlign:'right' }}>
                          <div style={{ display:'flex', gap:4, justifyContent:'flex-end' }}>
                            <EditBtn onClick={()=>openEdit(s)} />
                            <DangerBtn onClick={()=>setConfirmId(s._id)} />
                          </div>
                        </TD>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Drawer */}
      <Drawer open={drawerOpen} onClose={closeDrawer} title={editingId ? 'Edit Subject' : 'Add Subject'}>
        <Field label="Subject Name" required>
          <Input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g., Data Structures" />
        </Field>
        <Field label="Subject Code" required>
          <Input value={form.code} onChange={e=>setForm({...form,code:e.target.value.toUpperCase()})} placeholder="e.g., CS301" />
        </Field>
        <Field label="Subject Type">
          <Select value={form.subjectType} onChange={e=>setForm({...form,subjectType:e.target.value})}>
            <option value="theory">Theory</option>
            <option value="lab">Lab</option>
            <option value="practical">Practical</option>
          </Select>
        </Field>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <Field label="Lectures / Week" required hint="Slots per week">
            <Input type="number" value={form.lectures_per_week} onChange={e=>setForm({...form,lectures_per_week:parseInt(e.target.value)||1})} min="1" max="10" />
          </Field>
          <Field label="Credits" hint="Optional">
            <Input type="number" value={form.credits} onChange={e=>setForm({...form,credits:e.target.value})} min="0" step="0.5" placeholder="4" />
          </Field>
        </div>
        <Field label="Department" hint="Optional — for filtering">
          <Select value={form.department} onChange={e=>setForm({...form,department:e.target.value})}>
            <option value="">No department</option>
            {departments.map(d => <option key={d._id} value={d._id}>{d.name} ({d.code})</option>)}
          </Select>
        </Field>
        <div style={{ display:'flex', gap:10, marginTop:4 }}>
          <PrimaryBtn onClick={handleSave} disabled={saving} style={{ flex:1, justifyContent:'center' }}>
            {saving ? 'Saving…' : (editingId ? 'Update Subject' : 'Add Subject')}
          </PrimaryBtn>
          <GhostBtn onClick={closeDrawer}>Cancel</GhostBtn>
        </div>
      </Drawer>
    </>
  );
};

/* ═══════════════════════════════════════════════════════════════
   TAB 2 — CLASSES
   ═══════════════════════════════════════════════════════════════ */
const SEM_COLORS = [T.accent, T.blue, T.green, T.amber, '#ec4899', '#06b6d4', '#f97316', '#84cc16'];
const semColor   = (n) => SEM_COLORS[(n - 1) % SEM_COLORS.length];
const CLASS_BLANK = { name:'', code:'', program:'', semester:'', section:'A', assignedRoom:'', studentCount:'' };

const ClassesTab = () => {
  const queryClient = useQueryClient();
  const { data: classes = [], isLoading: classesLoading } = useClasses();
  const { data: programs = [] } = usePrograms();
  const { data: classrooms = [] } = useClassrooms();
  const loading = classesLoading;

  const [search,     setSearch]     = useState('');
  const [filterProg, setFilterProg] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId,  setEditingId]  = useState(null);
  const [confirmId,  setConfirmId]  = useState(null);
  const [toast,      setToast]      = useState(null);
  const [form,       setForm]       = useState(CLASS_BLANK);
  const [saving,     setSaving]     = useState(false);

  const openAdd  = () => { setForm(CLASS_BLANK); setEditingId(null); setDrawerOpen(true); };
  const openEdit = (c) => {
    setForm({
      name:c.name, code:c.code,
      program:c.program?._id || c.program || '',
      semester:c.semester, section:c.section || 'A',
      assignedRoom:c.assignedRoom?._id || c.assignedRoom || '',
      studentCount:c.studentCount || '',
    });
    setEditingId(c._id);
    setDrawerOpen(true);
  };
  const closeDrawer = () => { setDrawerOpen(false); setEditingId(null); };

  const handleSave = async () => {
    const { name, code, program, semester } = form;
    if (!name || !code || !program || !semester) {
      setToast({ msg:'Name, code, program and semester are required', type:'error' }); return;
    }
    setSaving(true);
    const payload = {
      ...form,
      assignedRoom: form.assignedRoom || null,
      studentCount: form.studentCount ? parseInt(form.studentCount) : 0,
    };
    try {
      if (editingId) {
        await classService.update(editingId, payload);
        setToast({ msg:'Class updated', type:'success' });
      } else {
        await classService.create(payload);
        setToast({ msg:'Class added', type:'success' });
      }
      closeDrawer();
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    } catch (err) {
      setToast({ msg:err.response?.data?.message || 'Save failed', type:'error' });
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    try {
      await classService.remove(confirmId);
      setToast({ msg:'Class deleted', type:'success' });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    } catch (err) {
      setToast({ msg:err.response?.data?.message || 'Delete failed', type:'error' });
    }
    setConfirmId(null);
  };

  const filtered = classes.filter(c => {
    const q = search.toLowerCase();
    return (
      (!search || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || (c.program?.name||'').toLowerCase().includes(q)) &&
      (!filterProg || c.program?._id === filterProg || c.program === filterProg)
    );
  });

  const totalStudents = classes.reduce((s, c) => s + (c.studentCount || 0), 0);

  return (
    <>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}
      <ConfirmModal
        open={!!confirmId}
        onCancel={()=>setConfirmId(null)}
        onConfirm={handleDelete}
        message="Deleting this class will also remove its timetable and subject assignments."
      />

      {/* Stats */}
      <div style={{ padding:'0 28px 20px', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        <StatTile label="Total Classes"  value={classes.length}  color={T.accent} icon="class"   delay={0} />
        <StatTile label="Total Students" value={totalStudents}   color={T.blue}   icon="users"   delay={60} />
        <StatTile label="Programs"       value={programs.length} color={T.green}  icon="program" delay={120} />
      </div>

      {programs.length === 0 && !loading && (
        <div style={{ padding:'0 28px 16px' }}>
          <div style={{
            padding:'12px 16px', borderRadius:12,
            background:T.amberSoft, border:`1px solid ${T.amber}33`,
            display:'flex', alignItems:'center', gap:10,
            fontSize:13, color:T.text2, fontWeight:500,
          }}>
            <ChIcon name="alert" size={15} />
            No programs found. Add programs via Academic Structure → Programs first.
          </div>
        </div>
      )}

      {/* Filter + Add bar */}
      <div style={{ padding:'0 28px 16px', display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search classes…" />
        {programs.length > 0 && (
          <Select value={filterProg} onChange={e=>setFilterProg(e.target.value)} style={{ width:200, padding:'8px 12px' }}>
            <option value="">All programs</option>
            {programs.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </Select>
        )}
        {(search||filterProg) && <GhostBtn onClick={()=>{setSearch('');setFilterProg('');}} icon="close">Clear</GhostBtn>}
        <div style={{ marginLeft:'auto' }}>
          <PrimaryBtn icon="plus" onClick={openAdd} disabled={programs.length === 0}>Add Class</PrimaryBtn>
        </div>
      </div>

      {/* Table */}
      <div style={{ padding:'0 28px' }}>
        <Card style={{ padding:0, animation:'admin-fade-up 500ms cubic-bezier(0.16,1,0.3,1) 200ms both' }}>
          {loading ? <Spinner /> : filtered.length === 0 ? (
            <EmptyState icon="class"
              message={search||filterProg ? 'No matching classes' : 'No classes yet'}
              subtext="Add your first class above." />
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr>
                    <TH style={{ paddingLeft:24 }}>Class</TH>
                    <TH>Program</TH>
                    <TH>Semester · Section</TH>
                    <TH>Room</TH>
                    <TH>Students</TH>
                    <TH style={{ paddingRight:24, textAlign:'right' }}>Actions</TH>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => {
                    const sem   = parseInt(c.semester) || 1;
                    const color = semColor(sem);
                    return (
                      <tr key={c._id} className="ch-admin-row" style={{ background:'transparent' }}>
                        <TD style={{ paddingLeft:24 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{
                              width:36, height:36, borderRadius:10, flexShrink:0,
                              background:`${color}18`, color,
                              border:`1px solid ${color}2e`,
                              display:'flex', alignItems:'center', justifyContent:'center',
                              fontSize:10, fontWeight:800,
                            }}>
                              {c.code.slice(-3)}
                            </div>
                            <div>
                              <div style={{ fontWeight:600, fontSize:13.5, color:T.text, letterSpacing:'-0.02em' }}>{c.name}</div>
                              <div style={{ fontSize:11, color:T.text3 }}>{c.code}</div>
                            </div>
                          </div>
                        </TD>
                        <TD>
                          <div style={{ fontSize:13, fontWeight:500, color:T.text2 }}>{c.program?.name||'—'}</div>
                          {c.program?.code && <div style={{ fontSize:11, color:T.text3 }}>{c.program.code}</div>}
                        </TD>
                        <TD>
                          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                            <Badge color={color}>Sem {sem}</Badge>
                            <span style={{ fontSize:13, fontWeight:600, color:T.text2 }}>· {c.section}</span>
                          </div>
                        </TD>
                        <TD>
                          {c.assignedRoom ? (
                            <div style={{ display:'flex', alignItems:'center', gap:5, color:T.text2, fontSize:13, fontWeight:500 }}>
                              <ChIcon name="room" size={12} />
                              {c.assignedRoom.name || c.assignedRoom}
                            </div>
                          ) : <span style={{ color:T.text4 }}>—</span>}
                        </TD>
                        <TD>
                          <span style={{ fontSize:22, fontWeight:700, color:T.text, letterSpacing:'-0.04em', fontVariantNumeric:'tabular-nums' }}>
                            {c.studentCount || 0}
                          </span>
                        </TD>
                        <TD style={{ paddingRight:24, textAlign:'right' }}>
                          <div style={{ display:'flex', gap:4, justifyContent:'flex-end' }}>
                            <EditBtn onClick={()=>openEdit(c)} />
                            <DangerBtn onClick={()=>setConfirmId(c._id)} />
                          </div>
                        </TD>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Drawer */}
      <Drawer open={drawerOpen} onClose={closeDrawer} title={editingId ? 'Edit Class' : 'Add Class'}>
        <Field label="Class Name" required hint="Full descriptive name">
          <Input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g., CSE 3rd Sem Section A" />
        </Field>
        <Field label="Class Code" required>
          <Input value={form.code} onChange={e=>setForm({...form,code:e.target.value.toUpperCase()})} placeholder="e.g., CSE-3A" />
        </Field>
        <Field label="Program" required>
          <Select value={form.program} onChange={e=>setForm({...form,program:e.target.value})}>
            <option value="">Select Program</option>
            {programs.map(p => <option key={p._id} value={p._id}>{p.name} ({p.code})</option>)}
          </Select>
        </Field>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <Field label="Semester" required>
            <Input type="number" value={form.semester} onChange={e=>setForm({...form,semester:e.target.value})} placeholder="3" min="1" />
          </Field>
          <Field label="Section">
            <Input value={form.section} onChange={e=>setForm({...form,section:e.target.value.toUpperCase()})} placeholder="A" maxLength={2} />
          </Field>
        </div>
        <Field label="Permanent Room" hint="Optional — leave blank for dynamic allocation">
          <Select value={form.assignedRoom} onChange={e=>setForm({...form,assignedRoom:e.target.value})}>
            <option value="">No permanent room</option>
            {classrooms.map(r => <option key={r._id} value={r._id}>{r.name} (cap: {r.capacity})</option>)}
          </Select>
        </Field>
        <Field label="Student Count" hint="Helps with room allocation">
          <Input type="number" value={form.studentCount} onChange={e=>setForm({...form,studentCount:e.target.value})} placeholder="60" min="0" />
        </Field>
        <div style={{ display:'flex', gap:10, marginTop:4 }}>
          <PrimaryBtn onClick={handleSave} disabled={saving || programs.length === 0} style={{ flex:1, justifyContent:'center' }}>
            {saving ? 'Saving…' : (editingId ? 'Update Class' : 'Add Class')}
          </PrimaryBtn>
          <GhostBtn onClick={closeDrawer}>Cancel</GhostBtn>
        </div>
      </Drawer>
    </>
  );
};

/* ═══════════════════════════════════════════════════════════════
   TAB 3 — CLASSROOMS
   ═══════════════════════════════════════════════════════════════ */
const roomType = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('lab'))  return { label:'Lab',        color:T.blue  };
  if (n.includes('hall')) return { label:'Hall',        color:T.green };
  if (n.includes('conf')) return { label:'Conference',  color:T.amber };
  return                         { label:'Classroom',   color:T.accent };
};
const capTier = (cap) => {
  if (cap >= 100) return { label:'Large',  color:T.green };
  if (cap >=  60) return { label:'Medium', color:T.blue  };
  return                 { label:'Small',  color:T.amber };
};
const ROOM_BLANK = { name:'', capacity:'' };

const ClassroomsTab = () => {
  const queryClient = useQueryClient();
  const { data: rooms = [], isLoading: loading } = useClassrooms();

  const [search,     setSearch]     = useState('');
  const [filterType, setFilterType] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId,  setEditingId]  = useState(null);
  const [confirmId,  setConfirmId]  = useState(null);
  const [toast,      setToast]      = useState(null);
  const [form,       setForm]       = useState(ROOM_BLANK);
  const [saving,     setSaving]     = useState(false);

  const openAdd  = () => { setForm(ROOM_BLANK); setEditingId(null); setDrawerOpen(true); };
  const openEdit = (r) => { setForm({ name:r.name, capacity:r.capacity }); setEditingId(r._id); setDrawerOpen(true); };
  const closeDrawer = () => { setDrawerOpen(false); setEditingId(null); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.capacity) {
      setToast({ msg:'Name and capacity are required', type:'error' }); return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await classroomService.update(editingId, form);
        setToast({ msg:'Room updated', type:'success' });
      } else {
        await classroomService.create(form);
        setToast({ msg:'Room added', type:'success' });
      }
      closeDrawer();
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
    } catch (err) {
      setToast({ msg:err.response?.data?.message || 'Save failed', type:'error' });
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    try {
      await classroomService.remove(confirmId);
      setToast({ msg:'Room deleted', type:'success' });
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
    } catch (err) {
      setToast({ msg:err.response?.data?.message || 'Delete failed', type:'error' });
    }
    setConfirmId(null);
  };

  const typeOptions = [...new Set(rooms.map(r => roomType(r.name).label))];
  const filtered = rooms.filter(r => {
    return (
      (!search || r.name.toLowerCase().includes(search.toLowerCase())) &&
      (!filterType || roomType(r.name).label === filterType)
    );
  });

  const totalCap = rooms.reduce((s, r) => s + (parseInt(r.capacity)||0), 0);
  const avgCap   = rooms.length ? Math.round(totalCap / rooms.length) : 0;
  const largeCt  = rooms.filter(r => parseInt(r.capacity) >= 100).length;

  return (
    <>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}
      <ConfirmModal
        open={!!confirmId}
        onCancel={()=>setConfirmId(null)}
        onConfirm={handleDelete}
        message="This room will be removed from all future timetable allocations."
      />

      {/* Stats */}
      <div style={{ padding:'0 28px 20px', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        <StatTile label="Total Rooms"    value={rooms.length} color={T.accent} icon="room"  delay={0} />
        <StatTile label="Total Capacity" value={totalCap}     color={T.blue}   icon="users" delay={60} />
        <StatTile label="Average Cap."   value={avgCap}       color={T.green}  icon="check" delay={120} />
        <StatTile label="Large Rooms"    value={largeCt}      color={T.amber}  icon="room"  delay={180} />
      </div>

      {/* Filter + Add bar */}
      <div style={{ padding:'0 28px 16px', display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search rooms…" />
        {typeOptions.length > 1 && (
          <Select value={filterType} onChange={e=>setFilterType(e.target.value)} style={{ width:160, padding:'8px 12px' }}>
            <option value="">All types</option>
            {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
          </Select>
        )}
        {(search||filterType) && <GhostBtn onClick={()=>{setSearch('');setFilterType('');}} icon="close">Clear</GhostBtn>}
        <div style={{ marginLeft:'auto' }}>
          <PrimaryBtn icon="plus" onClick={openAdd}>Add Room</PrimaryBtn>
        </div>
      </div>

      {/* Card grid */}
      <div style={{ padding:'0 28px' }}>
        {loading ? <Spinner /> : filtered.length === 0 ? (
          <Card>
            <EmptyState icon="room"
              message={search||filterType ? 'No matching rooms' : 'No rooms yet'}
              subtext="Add your first room above." />
          </Card>
        ) : (
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))',
            gap:14,
          }}>
            {filtered.map((room, idx) => {
              const rt      = roomType(room.name);
              const tier    = capTier(parseInt(room.capacity)||0);
              const cap     = parseInt(room.capacity)||0;
              const fillPct = Math.min(100, (cap / 150) * 100);
              return (
                <div key={room._id} style={{
                  background:T.surface, border:`1px solid ${T.border}`,
                  borderRadius:20, padding:'18px 20px',
                  boxShadow:T.shadowCard,
                  display:'flex', flexDirection:'column', gap:14,
                  animation:`admin-fade-up 500ms cubic-bezier(0.16,1,0.3,1) ${(idx%4)*60}ms both`,
                }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{
                        width:40, height:40, borderRadius:12, flexShrink:0,
                        background:`${rt.color}18`, color:rt.color,
                        border:`1px solid ${rt.color}2e`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                      }}>
                        <ChIcon name="room" size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:14, color:T.text, letterSpacing:'-0.025em' }}>{room.name}</div>
                        <Badge color={rt.color}>{rt.label}</Badge>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:3 }}>
                      <EditBtn onClick={()=>openEdit(room)} />
                      <DangerBtn onClick={()=>setConfirmId(room._id)} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:6 }}>
                      <span style={{ fontSize:11, fontWeight:600, color:T.text3 }}>Capacity</span>
                      <span style={{ fontSize:22, fontWeight:700, color:T.text, letterSpacing:'-0.04em', fontVariantNumeric:'tabular-nums' }}>
                        {cap}<span style={{ fontSize:12, color:T.text3, fontWeight:500 }}> seats</span>
                      </span>
                    </div>
                    <div style={{ height:6, borderRadius:99, background:T.surfaceMuted, overflow:'hidden' }}>
                      <div style={{
                        height:'100%', borderRadius:99,
                        background:`linear-gradient(90deg,${rt.color}99,${rt.color})`,
                        width:`${fillPct}%`,
                        transition:'width 800ms cubic-bezier(0.16,1,0.3,1)',
                      }}/>
                    </div>
                  </div>

                  <Badge color={tier.color}>{tier.label} Room</Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Drawer */}
      <Drawer open={drawerOpen} onClose={closeDrawer} title={editingId ? 'Edit Room' : 'Add Room'}>
        <Field label="Room Name" required hint="Include type for auto-tagging (e.g., Lab A, Conference Room 3)">
          <Input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g., CS Lab 101" />
        </Field>
        <Field label="Seating Capacity" required>
          <Input type="number" value={form.capacity} onChange={e=>setForm({...form,capacity:e.target.value})} placeholder="60" min="1" />
        </Field>
        {form.name && (
          <div style={{
            padding:'10px 14px', borderRadius:10,
            background:T.accentSoft, border:`1px solid ${T.accentBorder}`,
            display:'flex', alignItems:'center', gap:8,
            fontSize:12, color:T.accent, fontWeight:600,
          }}>
            <ChIcon name="info" size={13} />
            Auto-detected type: {roomType(form.name).label}
          </div>
        )}
        <div style={{ display:'flex', gap:10, marginTop:4 }}>
          <PrimaryBtn onClick={handleSave} disabled={saving} style={{ flex:1, justifyContent:'center' }}>
            {saving ? 'Saving…' : (editingId ? 'Update Room' : 'Add Room')}
          </PrimaryBtn>
          <GhostBtn onClick={closeDrawer}>Cancel</GhostBtn>
        </div>
      </Drawer>
    </>
  );
};

/* ═══════════════════════════════════════════════════════════════
   PAGE ROOT
   defaultTab: 'subjects' | 'classes' | 'classrooms'
   ═══════════════════════════════════════════════════════════════ */
const AcademicResources = ({ defaultTab = 'subjects' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  /* Live counts for tab badges — null until each entity finishes loading */
  const { data: subjectsData, isSuccess: subjectsOk } = useSubjects();
  const { data: classesData, isSuccess: classesOk } = useClasses();
  const { data: classroomsData, isSuccess: classroomsOk } = useClassrooms();
  const counts = {
    subjects:   subjectsOk   ? subjectsData.length   : null,
    classes:    classesOk    ? classesData.length    : null,
    classrooms: classroomsOk ? classroomsData.length : null,
  };

  return (
    <AdminLayout
      title="Academic Resources"
      subtitle="Manage subjects, class sections and physical rooms in one place"
    >
      {/* Tab strip */}
      <div style={{ padding:'0 28px 22px' }}>
        <Tabs
          active={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id:'subjects',    label:'Subjects',    icon:'subject',   count:counts.subjects    },
            { id:'classes',     label:'Classes',     icon:'class',     count:counts.classes     },
            { id:'classrooms',  label:'Classrooms',  icon:'room',      count:counts.classrooms  },
          ]}
        />
      </div>

      {/* Active tab */}
      {activeTab === 'subjects'   && <SubjectsTab />}
      {activeTab === 'classes'    && <ClassesTab />}
      {activeTab === 'classrooms' && <ClassroomsTab />}
    </AdminLayout>
  );
};

export default AcademicResources;
