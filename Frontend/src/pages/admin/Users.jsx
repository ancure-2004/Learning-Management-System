/**
 * Users.jsx — Chronos Admin
 * Full user management: create / edit / activate / deactivate / delete
 * Roles: admin · teacher · student
 */
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import authService from '@/services/authService';
import { useUsers, useDepartments, usePrograms } from '@/hooks/queries';
import AdminLayout, {
  T, ChIcon, Card,
  PrimaryBtn, GhostBtn, EditBtn, DangerBtn,
  Field, Input, Select, Textarea,
  Toast, Drawer, EmptyState, SearchInput, ConfirmModal, Badge,
} from '@/layouts/AdminLayout';

/* ── Helpers ─────────────────────────────────────────────────── */
const ROLE_CFG = {
  admin:   { color: T.red,    bg: T.redSoft,    label: 'Admin'   },
  teacher: { color: T.blue,   bg: T.blueSoft,   label: 'Teacher' },
  student: { color: T.green,  bg: T.greenSoft,  label: 'Student' },
};

const AVATAR_GRADIENTS = [
  `linear-gradient(135deg,${T.accent2},${T.accent})`,
  `linear-gradient(135deg,#60a5fa,${T.blue})`,
  `linear-gradient(135deg,#34d399,${T.green})`,
  `linear-gradient(135deg,#fbbf24,${T.amber})`,
  `linear-gradient(135deg,#f472b6,#ec4899)`,
  `linear-gradient(135deg,#22d3ee,#06b6d4)`,
  `linear-gradient(135deg,#fb923c,#f97316)`,
];
const avatarGrad = (str = '') => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return AVATAR_GRADIENTS[Math.abs(h) % AVATAR_GRADIENTS.length];
};

const initials = (first = '', last = '') =>
  ((first[0] || '') + (last[0] || '')).toUpperCase() || '?';

const BLANK = {
  email: '', password: '', firstName: '', lastName: '', phone: '',
  department: '', specialization: '',
  enrollmentNumber: '', program: '', semester: '', section: '',
};

/* ── Main Component ──────────────────────────────────────────── */
const Users = () => {
  const queryClient = useQueryClient();
  const { data: users = [], isLoading: loading } = useUsers();
  const { data: departments = [] } = useDepartments();
  const { data: programs = [] } = usePrograms();

  const [search,       setSearch]       = useState('');
  const [roleFilter,   setRoleFilter]   = useState('all');

  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [drawerMode,   setDrawerMode]   = useState('create'); // 'create' | 'edit'
  const [drawerRole,   setDrawerRole]   = useState('teacher');
  const [editingUser,  setEditingUser]  = useState(null);
  const [form,         setForm]         = useState(BLANK);
  const [saving,       setSaving]       = useState(false);

  const [confirmData,  setConfirmData]  = useState(null); // { id, action: 'deactivate'|'activate'|'delete' }
  const [toast,        setToast]        = useState(null);

  /* ── Filtered list ── */
  const filtered = users.filter(u => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const q = search.toLowerCase();
    const matchSearch = !search ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.enrollmentNumber || '').toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  /* ── Counts ── */
  const counts = {
    all: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    teacher: users.filter(u => u.role === 'teacher').length,
    student: users.filter(u => u.role === 'student').length,
  };

  /* ── Drawer helpers ── */
  const openCreate = (role) => {
    setDrawerMode('create');
    setDrawerRole(role);
    setEditingUser(null);
    setForm(BLANK);
    setDrawerOpen(true);
  };

  const openEdit = (u) => {
    setDrawerMode('edit');
    setDrawerRole(u.role);
    setEditingUser(u);
    setForm({
      email: u.email, password: '',
      firstName: u.firstName, lastName: u.lastName, phone: u.phone || '',
      department: u.department || '', specialization: u.specialization || '',
      enrollmentNumber: u.enrollmentNumber || '',
      program: u.program || '', semester: u.semester || '', section: u.section || '',
    });
    setDrawerOpen(true);
  };

  const closeDrawer = () => { setDrawerOpen(false); setEditingUser(null); };

  /* ── Save ── */
  const handleSave = async () => {
    if (!form.firstName || !form.lastName) {
      setToast({ msg: 'First and last name are required', type: 'error' }); return;
    }
    if (drawerMode === 'create' && (!form.email || !form.password)) {
      setToast({ msg: 'Email and password are required', type: 'error' }); return;
    }
    setSaving(true);
    try {
      if (drawerMode === 'create') {
        const payload = {
          email: form.email, password: form.password,
          firstName: form.firstName, lastName: form.lastName,
          phone: form.phone, role: drawerRole,
        };
        if (drawerRole === 'teacher') {
          payload.department = form.department;
          payload.specialization = form.specialization;
        } else if (drawerRole === 'student') {
          payload.enrollmentNumber = form.enrollmentNumber;
          payload.program = form.program;
          payload.semester = parseInt(form.semester);
          payload.section = form.section;
        }
        await authService.register(payload);
        setToast({ msg: `${drawerRole[0].toUpperCase() + drawerRole.slice(1)} created`, type: 'success' });
      } else {
        const payload = {
          firstName: form.firstName, lastName: form.lastName, phone: form.phone,
        };
        if (drawerRole === 'teacher') {
          payload.department = form.department;
          payload.specialization = form.specialization;
        } else if (drawerRole === 'student') {
          payload.enrollmentNumber = form.enrollmentNumber;
          payload.program = form.program;
          payload.semester = parseInt(form.semester);
          payload.section = form.section;
        }
        await authService.updateUser(editingUser._id, payload);
        setToast({ msg: 'User updated', type: 'success' });
      }
      closeDrawer();
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (err) {
      setToast({ msg: err.response?.data?.error || 'Save failed', type: 'error' });
    }
    setSaving(false);
  };

  /* ── Confirm action ── */
  const confirmAction = async () => {
    const { id, action } = confirmData;
    try {
      if (action === 'deactivate')      await authService.deactivateUser(id);
      else if (action === 'activate')   await authService.activateUser(id);
      else if (action === 'delete')     await authService.deleteUser(id);
      setToast({ msg: action[0].toUpperCase() + action.slice(1) + 'd successfully', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch {
      setToast({ msg: `Failed to ${action} user`, type: 'error' });
    }
    setConfirmData(null);
  };

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  /* ── Render ── */
  return (
    <AdminLayout
      title="User Management"
      subtitle="Create and manage admin, teacher, and student accounts"
      actions={
        <div style={{ display: 'flex', gap: 10 }}>
          <GhostBtn icon="teacher" onClick={() => openCreate('teacher')}>New Teacher</GhostBtn>
          <PrimaryBtn icon="plus" onClick={() => openCreate('student')}>New Student</PrimaryBtn>
        </div>
      }
    >
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <ConfirmModal
        open={!!confirmData}
        onCancel={() => setConfirmData(null)}
        onConfirm={confirmAction}
        message={
          confirmData?.action === 'delete'
            ? 'Permanently delete this user? This cannot be undone.'
            : confirmData?.action === 'deactivate'
            ? 'Deactivate this user? They will no longer be able to log in.'
            : 'Reactivate this user and restore their access?'
        }
      />

      <div style={{ padding: '0 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {[
            { key: 'all',     label: 'Total Users', color: T.accent,  icon: 'users'   },
            { key: 'admin',   label: 'Admins',      color: T.red,     icon: 'overview' },
            { key: 'teacher', label: 'Teachers',    color: T.blue,    icon: 'teacher'  },
            { key: 'student', label: 'Students',    color: T.green,   icon: 'class'    },
          ].map((s, i) => (
            <div
              key={s.key}
              onClick={() => setRoleFilter(s.key)}
              style={{
                background: roleFilter === s.key ? `${s.color}0e` : T.surface,
                border: `1.5px solid ${roleFilter === s.key ? s.color : T.border}`,
                borderRadius: 18, padding: '16px 20px', boxShadow: T.shadowCard,
                cursor: 'pointer', transition: `all 200ms ${T.ease}`,
                animation: `admin-fade-up 500ms cubic-bezier(0.16,1,0.3,1) ${i * 60}ms both`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.text3 }}>{s.label}</span>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${s.color}18`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChIcon name={s.icon} size={13} />
                </div>
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, color: roleFilter === s.key ? s.color : T.text, letterSpacing: '-0.05em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                {String(counts[s.key]).padStart(2, '0')}
              </div>
            </div>
          ))}
        </div>

        {/* ── Search bar ── */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name, email, or enrollment…" />
          {search && <GhostBtn icon="close" onClick={() => setSearch('')}>Clear</GhostBtn>}
          <div style={{ marginLeft: 'auto', fontSize: 12, color: T.text3, fontWeight: 600 }}>
            {filtered.length} user{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* ── User Grid ── */}
        {loading ? (
          <Card style={{ padding: 56, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', border: `3px solid ${T.accentSoft}`, borderTopColor: T.accent, animation: 'spin 0.7s linear infinite' }} />
          </Card>
        ) : filtered.length === 0 ? (
          <Card>
            <EmptyState icon="users" message={search ? 'No users match your search' : 'No users found'} subtext="Try adjusting the search or role filter." />
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
            {filtered.map((u, i) => {
              const cfg = ROLE_CFG[u.role] || ROLE_CFG.student;
              const grad = avatarGrad(u._id);
              const ini = initials(u.firstName, u.lastName);
              return (
                <div
                  key={u._id}
                  style={{
                    background: T.surface, border: `1px solid ${T.border}`,
                    borderRadius: 20, padding: '18px 20px', boxShadow: T.shadowCard,
                    display: 'flex', flexDirection: 'column', gap: 14,
                    animation: `admin-fade-up 500ms cubic-bezier(0.16,1,0.3,1) ${(i % 4) * 55}ms both`,
                    position: 'relative', overflow: 'hidden',
                    transition: `transform 200ms ${T.ease}, box-shadow 200ms ${T.ease}`,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = T.shadowLift; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = T.shadowCard; }}
                >
                  {/* Color stripe */}
                  <div style={{ position: 'absolute', top: 0, left: 20, right: 20, height: 3, background: `linear-gradient(90deg,${cfg.color}44,${cfg.color}cc,${cfg.color}44)`, borderRadius: '0 0 4px 4px' }} />

                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 15, flexShrink: 0,
                      background: grad, color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 15, fontWeight: 800, letterSpacing: '0.02em',
                      boxShadow: `0 4px 12px ${cfg.color}40`,
                    }}>
                      {ini}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14.5, color: T.text, letterSpacing: '-0.025em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.firstName} {u.lastName}
                      </div>
                      <div style={{ fontSize: 11.5, color: T.text3, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.email}
                      </div>
                    </div>
                    {/* Badges */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                      <span style={{
                        padding: '2px 9px', borderRadius: 99, fontSize: 10.5, fontWeight: 700,
                        color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}25`,
                        letterSpacing: '0.01em',
                      }}>{cfg.label}</span>
                      <span style={{
                        padding: '2px 9px', borderRadius: 99, fontSize: 10.5, fontWeight: 700,
                        color: u.isActive ? T.green : T.text4,
                        background: u.isActive ? T.greenSoft : T.surfaceMuted,
                        border: `1px solid ${u.isActive ? T.green + '25' : T.border}`,
                      }}>{u.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>

                  {/* Details */}
                  {u.role !== 'admin' && (
                    <div style={{
                      background: T.surfaceMuted, borderRadius: 12, padding: '10px 12px',
                      fontSize: 12, color: T.text2, display: 'flex', flexDirection: 'column', gap: 4,
                    }}>
                      {u.role === 'teacher' && (
                        <>
                          {u.department && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <ChIcon name="dept" size={11} />
                              <span style={{ fontWeight: 600 }}>Dept:</span>
                              <span style={{ color: T.text3 }}>{u.department}</span>
                            </div>
                          )}
                          {u.specialization && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <ChIcon name="subject" size={11} />
                              <span style={{ fontWeight: 600 }}>Spec:</span>
                              <span style={{ color: T.text3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.specialization}</span>
                            </div>
                          )}
                        </>
                      )}
                      {u.role === 'student' && (
                        <>
                          {u.enrollmentNumber && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <ChIcon name="users" size={11} />
                              <span style={{ fontWeight: 600 }}>Enroll:</span>
                              <span style={{ color: T.text3 }}>{u.enrollmentNumber}</span>
                            </div>
                          )}
                          {(u.program || u.semester) && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <ChIcon name="program" size={11} />
                              <span style={{ color: T.text3 }}>{u.program}{u.semester ? ` · Sem ${u.semester}` : ''}{u.section ? ` · Sec ${u.section}` : ''}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {u.role !== 'admin' && (
                      <button onClick={() => openEdit(u)} style={{
                        flex: 1, padding: '7px 12px', borderRadius: 9,
                        background: T.accentSoft, border: `1px solid ${T.accentBorder}`,
                        color: T.accent, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                        transition: `all 180ms ${T.ease}`,
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = T.accentSoft; e.currentTarget.style.color = T.accent; }}
                      >
                        <ChIcon name="edit" size={12} /> Edit
                      </button>
                    )}
                    {u.isActive ? (
                      <button onClick={() => setConfirmData({ id: u._id, action: 'deactivate' })} style={{
                        flex: 1, padding: '7px 12px', borderRadius: 9,
                        background: T.amberSoft, border: `1px solid ${T.amber}25`,
                        color: T.amber, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                        transition: `all 180ms ${T.ease}`,
                      }}>
                        <ChIcon name="close" size={12} /> Deactivate
                      </button>
                    ) : (
                      <button onClick={() => setConfirmData({ id: u._id, action: 'activate' })} style={{
                        flex: 1, padding: '7px 12px', borderRadius: 9,
                        background: T.greenSoft, border: `1px solid ${T.green}25`,
                        color: T.green, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                        transition: `all 180ms ${T.ease}`,
                      }}>
                        <ChIcon name="check" size={12} /> Activate
                      </button>
                    )}
                    {u.role !== 'admin' && (
                      <button onClick={() => setConfirmData({ id: u._id, action: 'delete' })} style={{
                        width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                        background: 'transparent', border: `1px solid ${T.border}`,
                        color: T.text3, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'inherit', transition: `all 180ms ${T.ease}`,
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = T.redSoft; e.currentTarget.style.color = T.red; e.currentTarget.style.borderColor = T.red + '33'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.text3; e.currentTarget.style.borderColor = T.border; }}
                      >
                        <ChIcon name="trash" size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Create / Edit Drawer ── */}
      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={drawerMode === 'create'
          ? `New ${drawerRole[0].toUpperCase() + drawerRole.slice(1)}`
          : `Edit ${drawerRole[0].toUpperCase() + drawerRole.slice(1)}`
        }
      >
        {/* Role picker — only on create */}
        {drawerMode === 'create' && (
          <div style={{ display: 'flex', gap: 6 }}>
            {['teacher', 'student'].map(r => {
              const cfg = ROLE_CFG[r];
              const active = drawerRole === r;
              return (
                <button key={r} onClick={() => setDrawerRole(r)} style={{
                  flex: 1, padding: '8px 12px', borderRadius: 10,
                  border: `1.5px solid ${active ? cfg.color : T.border}`,
                  background: active ? cfg.bg : T.surface,
                  color: active ? cfg.color : T.text3,
                  fontSize: 12.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
                  transition: `all 180ms ${T.ease}`,
                }}>
                  {cfg.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Common fields */}
        {drawerMode === 'create' && (
          <Field label="Email" required>
            <Input type="email" value={form.email} onChange={f('email')} placeholder="user@example.com" />
          </Field>
        )}
        {drawerMode === 'create' && (
          <Field label="Password" required hint="Minimum 6 characters">
            <Input type="password" value={form.password} onChange={f('password')} placeholder="••••••••" />
          </Field>
        )}
        {drawerMode === 'edit' && (
          <Field label="Email (read-only)">
            <Input value={form.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
          </Field>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="First Name" required>
            <Input value={form.firstName} onChange={f('firstName')} placeholder="John" />
          </Field>
          <Field label="Last Name" required>
            <Input value={form.lastName} onChange={f('lastName')} placeholder="Smith" />
          </Field>
        </div>

        <Field label="Phone">
          <Input value={form.phone} onChange={f('phone')} placeholder="+91 9876543210" />
        </Field>

        {/* Teacher-specific */}
        {drawerRole === 'teacher' && (
          <>
            <div style={{ height: 1, background: T.divider }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Teacher Details
            </div>
            <Field label="Department">
              <Select value={form.department} onChange={f('department')}>
                <option value="">— Select Department —</option>
                {departments.map(d => <option key={d._id} value={d.code}>{d.name}</option>)}
              </Select>
            </Field>
            <Field label="Specialization">
              <Input value={form.specialization} onChange={f('specialization')} placeholder="e.g., Machine Learning" />
            </Field>
          </>
        )}

        {/* Student-specific */}
        {drawerRole === 'student' && (
          <>
            <div style={{ height: 1, background: T.divider }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Student Details
            </div>
            <Field label="Enrollment Number" required>
              <Input value={form.enrollmentNumber} onChange={f('enrollmentNumber')} placeholder="e.g., 2021CS001" />
            </Field>
            <Field label="Program" required>
              <Select value={form.program} onChange={f('program')}>
                <option value="">— Select Program —</option>
                {programs.map(p => <option key={p._id} value={p.code}>{p.name}</option>)}
              </Select>
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Semester" required>
                <Select value={form.semester} onChange={f('semester')}>
                  <option value="">— Sem —</option>
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </Select>
              </Field>
              <Field label="Section" required>
                <Input value={form.section} onChange={f('section')} placeholder="A" maxLength={2} />
              </Field>
            </div>
          </>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <PrimaryBtn onClick={handleSave} disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
            {saving ? 'Saving…' : drawerMode === 'create' ? 'Create User' : 'Update User'}
          </PrimaryBtn>
          <GhostBtn onClick={closeDrawer}>Cancel</GhostBtn>
        </div>
      </Drawer>
    </AdminLayout>
  );
};

export default Users;
