/**
 * Departments.jsx
 * Tabbed page: Departments + Programs merged in one view.
 * Departments tab shows dept CRUD.
 * Programs tab shows program CRUD (programs belong to departments).
 */
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import departmentService from '@/services/departmentService';
import programService from '@/services/programService';
import { useDepartments, usePrograms } from '@/hooks/queries';
import AdminLayout, {
  T, ChIcon, Card,
  PrimaryBtn, GhostBtn, EditBtn, DangerBtn,
  Field, Input, Select, Textarea,
  Toast, Drawer, EmptyState,
  TH, TD, Badge, Tabs, SearchInput, ConfirmModal,
} from '@/layouts/AdminLayout';

/* ─── DEPARTMENT COLOR PALETTE ──────────────────────────────── */
const DEPT_COLORS = [T.accent,T.blue,T.green,T.amber,'#ec4899','#06b6d4','#f97316','#84cc16'];
const deptColor = (idx) => DEPT_COLORS[idx % DEPT_COLORS.length];

/* ════════════════════════════════════════════════════════════
   DEPARTMENTS TAB
   ════════════════════════════════════════════════════════════ */
const DepartmentsTab = () => {
  const queryClient = useQueryClient();
  const { data: list = [], isLoading: loading } = useDepartments();
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ name:'', code:'', description:'' });
  const [saving, setSaving] = useState(false);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['departments'] });

  const openAdd = () => {
    setForm({ name:'', code:'', description:'' });
    setEditingId(null);
    setDrawerOpen(true);
  };
  const openEdit = (dept) => {
    setForm({ name:dept.name, code:dept.code, description:dept.description||'' });
    setEditingId(dept._id);
    setDrawerOpen(true);
  };
  const closeDrawer = () => { setDrawerOpen(false); setEditingId(null); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      setToast({ msg:'Name and code are required', type:'error' }); return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await departmentService.update(editingId, form);
        setToast({ msg:'Department updated', type:'success' });
      } else {
        await departmentService.create(form);
        setToast({ msg:'Department added', type:'success' });
      }
      closeDrawer(); refresh();
    } catch (err) {
      setToast({ msg: err.response?.data?.message || 'Save failed', type:'error' });
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    try {
      await departmentService.remove(confirmId);
      setToast({ msg:'Department deleted', type:'success' });
      refresh();
    } catch (err) {
      setToast({ msg: err.response?.data?.message || 'Delete failed', type:'error' });
    }
    setConfirmId(null);
  };

  const filtered = list.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}
      <ConfirmModal
        open={!!confirmId}
        onCancel={()=>setConfirmId(null)}
        onConfirm={handleDelete}
        message="This will permanently delete the department and may affect linked programs."
      />

      {/* ─ CONTROLS ─ */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, marginBottom:16, padding:'0 28px' }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search departments…" />
        <PrimaryBtn icon="plus" onClick={openAdd}>Add Department</PrimaryBtn>
      </div>

      {/* ─ TABLE ─ */}
      <div style={{ padding:'0 28px' }}>
        <Card style={{ padding:0 }}>
          {loading ? (
            <div style={{ padding:48, display:'flex', justifyContent:'center', alignItems:'center', gap:12 }}>
              <div style={{
                width:24, height:24, borderRadius:'50%',
                border:`3px solid ${T.accentSoft}`, borderTopColor:T.accent,
                animation:'spin 0.7s linear infinite',
              }}/>
              <span style={{ color:T.text3, fontSize:13, fontWeight:500 }}>Loading…</span>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon="dept"
              message={search ? 'No results found' : 'No departments yet'}
              subtext={search ? 'Try a different search term.' : 'Add your first department to get started.'}
            />
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr>
                    <TH style={{ paddingLeft:24 }}>Department</TH>
                    <TH>Code</TH>
                    <TH>Description</TH>
                    <TH style={{ paddingRight:24, textAlign:'right' }}>Actions</TH>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((dept, idx) => {
                    const color = deptColor(idx);
                    return (
                      <tr key={dept._id} className="ch-admin-row" style={{ background:'transparent' }}>
                        <TD style={{ paddingLeft:24 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{
                              width:34, height:34, borderRadius:10, flexShrink:0,
                              background:`${color}18`, color,
                              display:'flex', alignItems:'center', justifyContent:'center',
                              fontSize:11, fontWeight:700, letterSpacing:'0.02em',
                              border:`1px solid ${color}2e`,
                            }}>
                              {(dept.code||'').slice(0,2)}
                            </div>
                            <span style={{ fontWeight:600, fontSize:13.5, color:T.text, letterSpacing:'-0.02em' }}>
                              {dept.name}
                            </span>
                          </div>
                        </TD>
                        <TD>
                          <Badge color={color}>{dept.code}</Badge>
                        </TD>
                        <TD style={{ color:T.text3, maxWidth:300 }}>
                          <span style={{ display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                            {dept.description || '—'}
                          </span>
                        </TD>
                        <TD style={{ paddingRight:24, textAlign:'right' }}>
                          <div style={{ display:'flex', gap:4, justifyContent:'flex-end' }}>
                            <EditBtn onClick={()=>openEdit(dept)} />
                            <DangerBtn onClick={()=>setConfirmId(dept._id)} />
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

      {/* ─ DRAWER ─ */}
      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={editingId ? 'Edit Department' : 'Add Department'}
      >
        <Field label="Department Name" required>
          <Input
            value={form.name}
            onChange={e=>setForm({...form,name:e.target.value})}
            placeholder="e.g., Computer Science"
          />
        </Field>
        <Field label="Department Code" required>
          <Input
            value={form.code}
            onChange={e=>setForm({...form,code:e.target.value.toUpperCase()})}
            placeholder="e.g., CS"
            maxLength={10}
          />
        </Field>
        <Field label="Description">
          <Textarea
            value={form.description}
            onChange={e=>setForm({...form,description:e.target.value})}
            placeholder="Brief description of the department…"
            rows={4}
          />
        </Field>
        <div style={{ display:'flex', gap:10, marginTop:4 }}>
          <PrimaryBtn onClick={handleSave} disabled={saving} style={{ flex:1, justifyContent:'center' }}>
            {saving ? 'Saving…' : (editingId ? 'Update Department' : 'Add Department')}
          </PrimaryBtn>
          <GhostBtn onClick={closeDrawer}>Cancel</GhostBtn>
        </div>
      </Drawer>
    </>
  );
};

/* ════════════════════════════════════════════════════════════
   PROGRAMS TAB
   ════════════════════════════════════════════════════════════ */
const ProgramsTab = () => {
  const queryClient = useQueryClient();
  const { data: programs = [], isLoading: loadingProgs } = usePrograms();
  const { data: departments = [], isLoading: loadingDepts } = useDepartments();
  const loading = loadingProgs || loadingDepts;
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ name:'', code:'', department:'', duration:'', totalSemesters:'' });
  const [saving, setSaving] = useState(false);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['programs'] });

  const resetForm = () => setForm({ name:'', code:'', department:'', duration:'', totalSemesters:'' });
  const openAdd  = () => { resetForm(); setEditingId(null); setDrawerOpen(true); };
  const openEdit = (prog) => {
    setForm({
      name:prog.name, code:prog.code,
      department: prog.department?._id || prog.department || '',
      duration:prog.duration, totalSemesters:prog.totalSemesters,
    });
    setEditingId(prog._id);
    setDrawerOpen(true);
  };
  const closeDrawer = () => { setDrawerOpen(false); setEditingId(null); };

  const handleSave = async () => {
    const { name, code, department, duration, totalSemesters } = form;
    if (!name||!code||!department||!duration||!totalSemesters) {
      setToast({ msg:'All fields are required', type:'error' }); return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await programService.update(editingId, form);
        setToast({ msg:'Program updated', type:'success' });
      } else {
        await programService.create(form);
        setToast({ msg:'Program added', type:'success' });
      }
      closeDrawer(); refresh();
    } catch (err) {
      setToast({ msg: err.response?.data?.message || 'Save failed', type:'error' });
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    try {
      await programService.remove(confirmId);
      setToast({ msg:'Program deleted', type:'success' });
      refresh();
    } catch (err) {
      setToast({ msg: err.response?.data?.message || 'Delete failed', type:'error' });
    }
    setConfirmId(null);
  };

  const filtered = programs.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}
      <ConfirmModal
        open={!!confirmId}
        onCancel={()=>setConfirmId(null)}
        onConfirm={handleDelete}
        message="This will permanently delete the program and may affect linked classes."
      />

      {/* ─ CONTROLS ─ */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, marginBottom:16, padding:'0 28px' }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search programs…" />
        <PrimaryBtn icon="plus" onClick={openAdd} disabled={departments.length===0}>
          Add Program
        </PrimaryBtn>
      </div>

      {departments.length === 0 && !loading && (
        <div style={{ padding:'0 28px 16px' }}>
          <div style={{
            padding:'12px 16px', borderRadius:12,
            background:T.amberSoft, border:`1px solid ${T.amber}33`,
            display:'flex', alignItems:'center', gap:10,
            fontSize:13, color:T.text2, fontWeight:500,
          }}>
            <ChIcon name="alert" size={15} />
            No departments found. Please add departments first.
          </div>
        </div>
      )}

      {/* ─ TABLE ─ */}
      <div style={{ padding:'0 28px' }}>
        <Card style={{ padding:0 }}>
          {loading ? (
            <div style={{ padding:48, display:'flex', justifyContent:'center', alignItems:'center', gap:12 }}>
              <div style={{ width:24,height:24,borderRadius:'50%',border:`3px solid ${T.accentSoft}`,borderTopColor:T.accent,animation:'spin 0.7s linear infinite' }}/>
              <span style={{ color:T.text3,fontSize:13,fontWeight:500 }}>Loading…</span>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState icon="program" message={search?'No results':'No programs yet'} subtext={search?'Try a different search.':'Add your first program above.'} />
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr>
                    <TH style={{ paddingLeft:24 }}>Program</TH>
                    <TH>Code</TH>
                    <TH>Department</TH>
                    <TH>Duration</TH>
                    <TH>Semesters</TH>
                    <TH style={{ paddingRight:24, textAlign:'right' }}>Actions</TH>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((prog, idx) => {
                    const color = deptColor(idx);
                    return (
                      <tr key={prog._id} className="ch-admin-row" style={{ background:'transparent' }}>
                        <TD style={{ paddingLeft:24 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{
                              width:34, height:34, borderRadius:10, flexShrink:0,
                              background:`${color}18`, color,
                              display:'flex', alignItems:'center', justifyContent:'center',
                              border:`1px solid ${color}2e`,
                            }}>
                              <ChIcon name="program" size={15} />
                            </div>
                            <div>
                              <div style={{ fontWeight:600, fontSize:13.5, color:T.text, letterSpacing:'-0.02em' }}>
                                {prog.name}
                              </div>
                            </div>
                          </div>
                        </TD>
                        <TD><Badge color={color}>{prog.code}</Badge></TD>
                        <TD>
                          <div style={{ fontSize:13, color:T.text2, fontWeight:500 }}>{prog.department?.name||'—'}</div>
                          <div style={{ fontSize:11, color:T.text3 }}>{prog.department?.code}</div>
                        </TD>
                        <TD>
                          <span style={{ fontSize:13, fontWeight:600, color:T.text }}>
                            {prog.duration} yr{prog.duration!==1?'s':''}
                          </span>
                        </TD>
                        <TD>
                          <span style={{ fontSize:22, fontWeight:700, color:T.accent, letterSpacing:'-0.04em', fontVariantNumeric:'tabular-nums' }}>
                            {prog.totalSemesters}
                          </span>
                          <span style={{ fontSize:11, color:T.text3, marginLeft:3 }}>sem</span>
                        </TD>
                        <TD style={{ paddingRight:24, textAlign:'right' }}>
                          <div style={{ display:'flex', gap:4, justifyContent:'flex-end' }}>
                            <EditBtn onClick={()=>openEdit(prog)} />
                            <DangerBtn onClick={()=>setConfirmId(prog._id)} />
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

      {/* ─ DRAWER ─ */}
      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={editingId ? 'Edit Program' : 'Add Program'}
      >
        <Field label="Program Name" required>
          <Input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g., Bachelor of Technology - CS" />
        </Field>
        <Field label="Program Code" required>
          <Input value={form.code} onChange={e=>setForm({...form,code:e.target.value.toUpperCase()})} placeholder="e.g., BTECH-CS" />
        </Field>
        <Field label="Department" required>
          <Select value={form.department} onChange={e=>setForm({...form,department:e.target.value})}>
            <option value="">Select Department</option>
            {departments.map(d => (
              <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
            ))}
          </Select>
        </Field>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <Field label="Duration (years)" required>
            <Input type="number" value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})} placeholder="4" min="1" />
          </Field>
          <Field label="Total Semesters" required>
            <Input type="number" value={form.totalSemesters} onChange={e=>setForm({...form,totalSemesters:e.target.value})} placeholder="8" min="1" />
          </Field>
        </div>
        <div style={{ display:'flex', gap:10, marginTop:4 }}>
          <PrimaryBtn onClick={handleSave} disabled={saving||departments.length===0} style={{ flex:1,justifyContent:'center' }}>
            {saving ? 'Saving…' : (editingId ? 'Update Program' : 'Add Program')}
          </PrimaryBtn>
          <GhostBtn onClick={closeDrawer}>Cancel</GhostBtn>
        </div>
      </Drawer>
    </>
  );
};

/* ════════════════════════════════════════════════════════════
   PAGE ROOT
   ════════════════════════════════════════════════════════════ */
const Departments = () => {
  const location = useLocation();
  const initialTab = location.state?.tab || 'departments';
  const [activeTab, setActiveTab] = useState(initialTab);

  const deptsQuery = useDepartments();
  const progsQuery = usePrograms();
  const deptCount = deptsQuery.isSuccess ? deptsQuery.data.length : null;
  const progCount = progsQuery.isSuccess ? progsQuery.data.length : null;

  return (
    <AdminLayout
      title="Academic Structure"
      subtitle="Manage departments and their associated programs"
    >
      {/* ─ Tab strip ─ */}
      <div style={{ padding:'0 28px 20px' }}>
        <Tabs
          active={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id:'departments', label:'Departments', icon:'dept',    count:deptCount },
            { id:'programs',    label:'Programs',    icon:'program', count:progCount },
          ]}
        />
      </div>

      {/* ─ Active tab content ─ */}
      {activeTab==='departments' && <DepartmentsTab />}
      {activeTab==='programs'    && <ProgramsTab />}
    </AdminLayout>
  );
};

export default Departments;
