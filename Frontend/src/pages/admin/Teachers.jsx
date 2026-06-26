/**
 * Teachers.jsx  — Chronos Admin
 * Simplified teacher list with link to full User Management.
 * Keeps backward compatibility while providing the modern UI.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import teacherService from '@/services/teacherService';
import { useTeachers } from '@/hooks/queries';
import AdminLayout, {
  T, ChIcon, Card,
  PrimaryBtn, GhostBtn, EditBtn, DangerBtn,
  Field, Input,
  Toast, Drawer, EmptyState,
  TH, TD, Badge, SearchInput, ConfirmModal,
} from '@/layouts/AdminLayout';

/* Avatar colour cycling */
const AVATAR_COLORS = [T.accent,T.blue,T.green,T.amber,'#ec4899','#06b6d4','#f97316'];
const aColor = (idx) => AVATAR_COLORS[idx % AVATAR_COLORS.length];

const BLANK = { name:'' };

const Teachers = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: teachers = [], isLoading: loading } = useTeachers();
  const [search,    setSearch]    = useState('');
  const [drawerOpen,setDrawerOpen]= useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [toast,     setToast]     = useState(null);
  const [form,      setForm]      = useState(BLANK);
  const [saving,    setSaving]    = useState(false);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['teachers'] });

  const openAdd  = () => { setForm(BLANK); setEditingId(null); setDrawerOpen(true); };
  const openEdit = (t) => { setForm({ name:t.name }); setEditingId(t._id); setDrawerOpen(true); };
  const closeDrawer = () => { setDrawerOpen(false); setEditingId(null); };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setToast({ msg:'Name is required', type:'error' }); return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await teacherService.update(editingId, form);
        setToast({ msg:'Teacher updated', type:'success' });
      } else {
        await teacherService.create(form);
        setToast({ msg:'Teacher added', type:'success' });
      }
      closeDrawer(); refresh();
    } catch (err) {
      setToast({ msg:err.response?.data?.message||'Save failed', type:'error' });
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    try {
      await teacherService.remove(confirmId);
      setToast({ msg:'Teacher deleted', type:'success' });
      refresh();
    } catch (err) {
      setToast({ msg:err.response?.data?.message||'Delete failed', type:'error' });
    }
    setConfirmId(null);
  };

  const filtered = teachers.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase())
  );

  /* Derive initials from name */
  const initials = (name='') => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0,2).toUpperCase();
    return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
  };

  return (
    <AdminLayout
      title="Teachers"
      subtitle="Simplified teacher list — for full profiles use User Management"
      actions={
        <div style={{ display:'flex', gap:10 }}>
          <GhostBtn icon="users" onClick={()=>navigate('/users')}>
            Full User Management
          </GhostBtn>
          <PrimaryBtn icon="plus" onClick={openAdd}>Add Teacher</PrimaryBtn>
        </div>
      }
    >
      {toast && <Toast message={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}
      <ConfirmModal
        open={!!confirmId}
        onCancel={()=>setConfirmId(null)}
        onConfirm={handleDelete}
        message="This teacher will be removed from the simplified list. Their subject assignments may be affected."
      />

      {/* ─── INFO BANNER ────────────────────────────────────── */}
      <div style={{ padding:'0 28px 16px' }}>
        <div style={{
          padding:'12px 16px', borderRadius:12,
          background:T.accentSoft, border:`1px solid ${T.accentBorder}`,
          display:'flex', alignItems:'center', gap:10,
          fontSize:13, color:T.accent, fontWeight:500,
        }}>
          <ChIcon name="info" size={14} />
          <span>
            This is the simplified teacher model.{' '}
            <button
              onClick={()=>navigate('/users')}
              style={{ fontWeight:700, color:T.accent, background:'none', border:'none', cursor:'pointer', textDecoration:'underline', fontFamily:'inherit', fontSize:13 }}
            >
              User Management
            </button>
            {' '}provides full profiles with departments and specializations.
          </span>
        </div>
      </div>

      {/* ─── FILTER BAR ─────────────────────────────────────── */}
      <div style={{ padding:'0 28px 16px', display:'flex', alignItems:'center', gap:10 }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search teachers…" />
        {search && <GhostBtn onClick={()=>setSearch('')} icon="close">Clear</GhostBtn>}
        <div style={{ marginLeft:'auto', fontSize:12, color:T.text3, fontWeight:600 }}>
          {filtered.length} teacher{filtered.length!==1?'s':''}
        </div>
      </div>

      {/* ─── TEACHER GRID ───────────────────────────────────── */}
      <div style={{ padding:'0 28px' }}>
        {loading ? (
          <div style={{ padding:48, display:'flex', justifyContent:'center', alignItems:'center', gap:12 }}>
            <div style={{ width:24,height:24,borderRadius:'50%',border:`3px solid ${T.accentSoft}`,borderTopColor:T.accent,animation:'spin 0.7s linear infinite' }}/>
            <span style={{ color:T.text3,fontSize:13,fontWeight:500 }}>Loading teachers…</span>
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <EmptyState icon="teacher" message={search?'No teachers match your search':'No teachers yet'} subtext="Add teachers here or use User Management for richer profiles." />
          </Card>
        ) : (
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))',
            gap:14,
          }}>
            {filtered.map((t, idx) => {
              const color = aColor(idx);
              const ini   = initials(t.name);
              return (
                <div
                  key={t._id}
                  style={{
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    borderRadius: 22,
                    padding: '20px 22px',
                    boxShadow: T.shadowCard,
                    display: 'flex', alignItems: 'center', gap: 16,
                    animation: `admin-fade-up 500ms cubic-bezier(0.16,1,0.3,1) ${(idx%4)*55}ms both`,
                    transition: `transform 220ms ${T.easeOut}, box-shadow 220ms ${T.easeOut}`,
                    position: 'relative', overflow: 'hidden',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = T.shadowLift;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = T.shadowCard;
                  }}
                >
                  {/* Subtle color accent line at top */}
                  <div style={{
                    position: 'absolute', top: 0, left: 24, right: 24, height: 3,
                    background: `linear-gradient(90deg, ${color}55, ${color}dd, ${color}55)`,
                    borderRadius: '0 0 4px 4px',
                  }} />

                  {/* Avatar */}
                  <div style={{
                    width: 52, height: 52, borderRadius: 16, flexShrink: 0,
                    background: `linear-gradient(135deg, ${color}bb, ${color})`,
                    color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 15, fontWeight: 800, letterSpacing: '0.02em',
                    boxShadow: `0 6px 16px ${color}44`,
                  }}>
                    {ini}
                  </div>

                  {/* Name + badge */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 700, fontSize: 14.5, color: T.text,
                      letterSpacing: '-0.025em',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      marginBottom: 6,
                    }}>
                      {t.name}
                    </div>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '3px 10px', borderRadius: 99,
                      background: `${color}15`,
                      border: `1px solid ${color}30`,
                      color: color, fontSize: 11, fontWeight: 700,
                      letterSpacing: '0.01em',
                    }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z" />
                      </svg>
                      Teacher
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <EditBtn onClick={() => openEdit(t)} />
                    <DangerBtn onClick={() => setConfirmId(t._id)} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── DRAWER ─────────────────────────────────────────── */}
      <Drawer open={drawerOpen} onClose={closeDrawer} title={editingId?'Edit Teacher':'Add Teacher'}>
        <Field label="Teacher Name" required hint="Include title (e.g., Dr., Prof.)">
          <Input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g., Dr. John Smith" />
        </Field>
        <div style={{ display:'flex', gap:10, marginTop:4 }}>
          <PrimaryBtn onClick={handleSave} disabled={saving} style={{ flex:1, justifyContent:'center' }}>
            {saving ? 'Saving…' : (editingId ? 'Update Teacher' : 'Add Teacher')}
          </PrimaryBtn>
          <GhostBtn onClick={closeDrawer}>Cancel</GhostBtn>
        </div>
      </Drawer>
    </AdminLayout>
  );
};

export default Teachers;
