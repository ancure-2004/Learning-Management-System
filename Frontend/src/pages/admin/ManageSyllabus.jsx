/**
 * ManageSyllabus.jsx — Chronos Admin
 * Create and manage subject syllabus structures
 */
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSubjects } from '@/hooks/queries';
import syllabusService from '@/services/syllabusService';
import AdminLayout, {
  T, ChIcon, Card,
  PrimaryBtn, GhostBtn,
  Field, Input, Select, Textarea,
  Toast, EmptyState,
} from '@/layouts/AdminLayout';

const BLANK = {
  subjectId: '',
  academicYear: new Date().getFullYear().toString(),
  semester: '',
  totalRequiredHours: '',
  theoryHours: '',
  labHours: '',
  midtermWeight: 30,
  endsemWeight: 50,
  assignmentWeight: 20,
};

/* Small inline stat tile */
const StatTile = ({ label, value, unit = '', color = T.accent, warning = false }) => (
  <div style={{
    flex: 1, background: warning ? T.redSoft : T.surfaceMuted,
    border: `1px solid ${warning ? T.red + '33' : T.border}`,
    borderRadius: 14, padding: '12px 16px',
  }}>
    <div style={{ fontSize: 11, fontWeight: 600, color: warning ? T.red : T.text3, marginBottom: 4 }}>{label}</div>
    <div style={{
      fontSize: 26, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1,
      color: warning ? T.red : value === 0 ? T.green : color,
      fontVariantNumeric: 'tabular-nums',
    }}>
      {value}{unit}
    </div>
  </div>
);

/* Weight bar indicator */
const WeightBar = ({ label, value, color, bg }) => {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: T.text2 }}>{label}</span>
        <span style={{ fontSize: 16, fontWeight: 700, color, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
          {value}%
        </span>
      </div>
      <div style={{ height: 8, borderRadius: 99, background: T.surfaceMuted, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 99, width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}99, ${color})`,
          transition: `width 400ms cubic-bezier(0.16,1,0.3,1)`,
        }} />
      </div>
    </div>
  );
};

const ManageSyllabus = () => {
  const { user } = useAuth();
  const { data: subjects = [] } = useSubjects();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState(BLANK);

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  /* Derived values */
  const total    = parseInt(form.totalRequiredHours) || 0;
  const theory   = parseInt(form.theoryHours) || 0;
  const lab      = parseInt(form.labHours) || 0;
  const remaining = total - theory - lab;
  const hoursOk   = remaining >= 0;

  const mid    = parseInt(form.midtermWeight) || 0;
  const end    = parseInt(form.endsemWeight) || 0;
  const asgn   = parseInt(form.assignmentWeight) || 0;
  const wTotal = mid + end + asgn;
  const weightsOk = wTotal === 100;

  /* Submit */
  const handleSubmit = async () => {
    if (!form.subjectId || !form.academicYear || !form.semester || !form.totalRequiredHours) {
      setToast({ msg: 'Please fill all required fields', type: 'error' }); return;
    }
    if (!hoursOk) {
      setToast({ msg: 'Theory + Lab hours exceed total hours', type: 'error' }); return;
    }
    if (!weightsOk) {
      setToast({ msg: 'Assessment weights must add up to 100%', type: 'error' }); return;
    }

    setLoading(true);
    try {
      await syllabusService.create({
        subjectId: form.subjectId,
        academicYear: form.academicYear,
        semester: parseInt(form.semester),
        totalRequiredHours: total,
        theoryHours: theory,
        labHours: lab,
        midtermWeight: mid,
        endsemWeight: end,
        assignmentWeight: asgn,
        createdBy: user?._id,
      });
      setToast({ msg: 'Syllabus created successfully', type: 'success' });
      setForm(BLANK);
    } catch (err) {
      setToast({ msg: err.response?.data?.message || 'Failed to create syllabus', type: 'error' });
    }
    setLoading(false);
  };

  return (
    <AdminLayout
      title="Manage Syllabus"
      subtitle="Create subject syllabus structures with hours breakdown and assessment weights"
    >
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{ padding: '0 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Info banner ── */}
        <div style={{
          padding: '12px 16px', borderRadius: 14,
          background: T.accentSoft, border: `1px solid ${T.accentBorder}`,
          display: 'flex', alignItems: 'flex-start', gap: 10,
          fontSize: 13, color: T.accent, fontWeight: 500,
          animation: 'admin-fade-up 400ms cubic-bezier(0.16,1,0.3,1) both',
        }}>
          <ChIcon name="info" size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <span style={{ fontWeight: 700 }}>Quick setup: </span>
            This creates the basic syllabus structure. You can add detailed topics, units, and learning
            outcomes later by updating the syllabus through the API.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

          {/* ── Left: Form ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Subject + Year + Semester */}
            <div style={{
              background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 22, padding: '22px 24px', boxShadow: T.shadowCard,
              display: 'flex', flexDirection: 'column', gap: 16,
              animation: 'admin-fade-up 450ms cubic-bezier(0.16,1,0.3,1) 60ms both',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: T.accentSoft, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChIcon name="subject" size={13} />
                </div>
                Subject & Period
              </div>

              <Field label="Subject" required>
                <Select value={form.subjectId} onChange={f('subjectId')}>
                  <option value="">— Select a subject —</option>
                  {subjects.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                  ))}
                </Select>
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="Academic Year" required hint="e.g., 2025 or 2025-26">
                  <Input value={form.academicYear} onChange={f('academicYear')} placeholder="2025-26" />
                </Field>
                <Field label="Semester" required>
                  <Select value={form.semester} onChange={f('semester')}>
                    <option value="">— Semester —</option>
                    {[1,2,3,4,5,6,7,8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </Select>
                </Field>
              </div>
            </div>

            {/* Hours breakdown */}
            <div style={{
              background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 22, padding: '22px 24px', boxShadow: T.shadowCard,
              display: 'flex', flexDirection: 'column', gap: 16,
              animation: 'admin-fade-up 450ms cubic-bezier(0.16,1,0.3,1) 120ms both',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: T.blueSoft, color: T.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChIcon name="timetable" size={13} />
                </div>
                Hours Breakdown
              </div>

              <Field label="Total Required Hours" required hint="Total number of hours needed to complete this subject">
                <Input type="number" value={form.totalRequiredHours} onChange={f('totalRequiredHours')} min="1" placeholder="e.g., 60" />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="Theory Hours">
                  <Input type="number" value={form.theoryHours} onChange={f('theoryHours')} min="0" max={form.totalRequiredHours || undefined} placeholder="e.g., 40" />
                </Field>
                <Field label="Lab Hours">
                  <Input type="number" value={form.labHours} onChange={f('labHours')} min="0" max={form.totalRequiredHours || undefined} placeholder="e.g., 20" />
                </Field>
              </div>

              {/* Live hours summary */}
              {total > 0 && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <StatTile label="Theory" value={theory} unit=" hrs" color={T.blue} />
                  <StatTile label="Lab" value={lab} unit=" hrs" color={T.accent} />
                  <StatTile
                    label="Remaining"
                    value={remaining}
                    unit=" hrs"
                    color={remaining === 0 ? T.green : T.text}
                    warning={remaining < 0}
                  />
                </div>
              )}
            </div>

            {/* Assessment weights */}
            <div style={{
              background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 22, padding: '22px 24px', boxShadow: T.shadowCard,
              display: 'flex', flexDirection: 'column', gap: 16,
              animation: 'admin-fade-up 450ms cubic-bezier(0.16,1,0.3,1) 180ms both',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: T.amberSoft, color: T.amber, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChIcon name="rating" size={13} />
                </div>
                Assessment Weights
                <span style={{ marginLeft: 'auto', fontSize: 11, color: T.text3, fontWeight: 500 }}>Must total 100%</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                <Field label="Midterm %" hint="e.g., 30">
                  <Input type="number" value={form.midtermWeight} onChange={f('midtermWeight')} min="0" max="100" />
                </Field>
                <Field label="End Semester %" hint="e.g., 50">
                  <Input type="number" value={form.endsemWeight} onChange={f('endsemWeight')} min="0" max="100" />
                </Field>
                <Field label="Assignments %" hint="e.g., 20">
                  <Input type="number" value={form.assignmentWeight} onChange={f('assignmentWeight')} min="0" max="100" />
                </Field>
              </div>

              {/* Total weight pill */}
              <div style={{
                padding: '10px 16px', borderRadius: 12,
                background: weightsOk ? T.greenSoft : T.redSoft,
                border: `1px solid ${weightsOk ? T.green + '33' : T.red + '33'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 600, color: weightsOk ? T.green : T.red }}>
                  <ChIcon name={weightsOk ? 'check' : 'alert'} size={14} />
                  Total weight
                </div>
                <span style={{ fontSize: 20, fontWeight: 700, color: weightsOk ? T.green : T.red, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
                  {wTotal}%
                </span>
              </div>
            </div>

            {/* Action row */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <GhostBtn onClick={() => setForm(BLANK)} icon="close">Reset</GhostBtn>
              <PrimaryBtn icon="check" onClick={handleSubmit} disabled={loading} style={{ paddingLeft: 22, paddingRight: 22 }}>
                {loading ? 'Creating…' : 'Create Syllabus'}
              </PrimaryBtn>
            </div>
          </div>

          {/* ── Right: Live preview ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 20 }}>

            {/* Assessment visual */}
            <div style={{
              background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 22, padding: '20px 22px', boxShadow: T.shadowCard,
              animation: 'admin-fade-up 450ms cubic-bezier(0.16,1,0.3,1) 200ms both',
            }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: T.text, letterSpacing: '-0.02em', marginBottom: 16 }}>
                Assessment Preview
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <WeightBar label="Midterm"      value={mid}  color={T.blue}   bg={T.blueSoft}  />
                <WeightBar label="End Semester" value={end}  color={T.accent} bg={T.accentSoft} />
                <WeightBar label="Assignments"  value={asgn} color={T.green}  bg={T.greenSoft}  />
              </div>
              <div style={{
                marginTop: 16, padding: '10px 14px', borderRadius: 10,
                background: weightsOk ? T.greenSoft : T.surfaceMuted,
                border: `1px solid ${weightsOk ? T.green + '33' : T.border}`,
                fontSize: 12, fontWeight: 700,
                color: weightsOk ? T.green : T.text3,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <ChIcon name={weightsOk ? 'check' : 'info'} size={12} />
                {weightsOk ? 'Weights balanced' : `${100 - wTotal > 0 ? `${100 - wTotal}% remaining to allocate` : `${wTotal - 100}% over limit`}`}
              </div>
            </div>

            {/* Hours donut summary */}
            {total > 0 && (
              <div style={{
                background: T.surface, border: `1px solid ${T.border}`,
                borderRadius: 22, padding: '20px 22px', boxShadow: T.shadowCard,
              }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: T.text, letterSpacing: '-0.02em', marginBottom: 16 }}>
                  Hours Preview
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { label: 'Theory', hrs: theory, color: T.blue },
                    { label: 'Lab',    hrs: lab,    color: T.accent },
                    { label: 'Other',  hrs: Math.max(0, remaining), color: T.text4 },
                  ].map(({ label, hrs, color }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: T.text2, flex: 1 }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{hrs} hrs</span>
                      {total > 0 && (
                        <span style={{ fontSize: 11, color: T.text4, width: 34, textAlign: 'right' }}>
                          {Math.round((hrs / total) * 100)}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <div style={{ marginTop: 14, height: 10, borderRadius: 99, overflow: 'hidden', display: 'flex', gap: 2 }}>
                  {[
                    { hrs: theory, color: T.blue },
                    { hrs: lab, color: T.accent },
                    { hrs: Math.max(0, remaining), color: T.surfaceMuted },
                  ].map(({ hrs, color }, i) => (
                    <div key={i} style={{
                      flex: hrs, background: color, borderRadius: 99,
                      transition: `flex 400ms cubic-bezier(0.16,1,0.3,1)`,
                    }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: T.text3, fontWeight: 500 }}>
                  <span>0</span>
                  <span>{total} hrs total</span>
                </div>

                {!hoursOk && (
                  <div style={{
                    marginTop: 10, padding: '8px 12px', borderRadius: 10,
                    background: T.redSoft, border: `1px solid ${T.red}33`,
                    fontSize: 11.5, color: T.red, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <ChIcon name="alert" size={12} />
                    Theory + Lab exceed total by {Math.abs(remaining)} hrs
                  </div>
                )}
              </div>
            )}

            {/* Checklist */}
            <div style={{
              background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 22, padding: '20px 22px', boxShadow: T.shadowCard,
            }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: T.text, letterSpacing: '-0.02em', marginBottom: 14 }}>
                Readiness Check
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Subject selected',   ok: !!form.subjectId },
                  { label: 'Academic year set',  ok: !!form.academicYear },
                  { label: 'Semester set',        ok: !!form.semester },
                  { label: 'Total hours > 0',    ok: total > 0 },
                  { label: 'Hours balanced',      ok: hoursOk && total > 0 },
                  { label: 'Weights = 100%',      ok: weightsOk },
                ].map(({ label, ok }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                      background: ok ? T.greenSoft : T.surfaceMuted,
                      border: `1px solid ${ok ? T.green + '44' : T.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {ok && <ChIcon name="check" size={9} style={{ color: T.green }} />}
                    </div>
                    <span style={{ fontSize: 12, color: ok ? T.text2 : T.text4, fontWeight: ok ? 600 : 400 }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageSyllabus;
