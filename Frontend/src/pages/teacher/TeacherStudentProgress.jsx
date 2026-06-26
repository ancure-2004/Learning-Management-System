/**
 * TeacherStudentProgress.jsx — Chronos Teacher
 * Teacher's view of student progress in their assigned classes.
 * Route: /student-progress (teacher role)
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import TeacherLayout, {
  TeacherCard, TeacherEmptyState, TeacherSpinner, TeacherIcon,
} from '@/layouts/TeacherLayout';
import { T } from '@/layouts/AdminLayout';
import progressService from '@/services/progressService';
import { useTeacherByUser, useClassSubjectsByTeacher, useClasses } from '@/hooks/queries';

const CHART_FONT = { fontFamily: T.font, fontSize: 11, fill: T.text3 };

const STATUS_CFG = {
  ahead:    { label: 'Ahead',    color: T.green, bg: T.greenSoft },
  on_track: { label: 'On Track', color: T.blue,  bg: T.blueSoft  },
  at_risk:  { label: 'At Risk',  color: T.amber, bg: T.amberSoft },
  behind:   { label: 'Behind',   color: T.red,   bg: T.redSoft   },
};

const StatusPill = ({ status }) => {
  const cfg = STATUS_CFG[status] || { label: status || 'Unknown', color: T.text3, bg: T.surfaceMuted };
  return (
    <span style={{
      padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 700,
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}28`,
    }}>
      {cfg.label}
    </span>
  );
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`,
      borderRadius: 10, padding: '10px 14px',
      boxShadow: '0 8px 24px rgba(15,23,42,0.12)', fontFamily: T.font,
    }}>
      {label && <div style={{ fontSize: 11, color: T.text3, marginBottom: 6, fontWeight: 600 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.fill || T.accent }} />
          <span style={{ fontSize: 12, color: T.text, fontWeight: 700 }}>
            {typeof p.value === 'number' ? `${p.value.toFixed(1)}%` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const TeacherStudentProgress = () => {
  const { user } = useAuth();
  const [selectedCl, setSelectedCl] = useState('');
  const [data,       setData]       = useState([]);
  const [summary,    setSummary]    = useState({ total: 0, ahead: 0, on_track: 0, at_risk: 0, behind: 0, averageCompletion: 0 });
  const [loadingPrg, setLoadingPrg] = useState(false);
  const [error,      setError]      = useState('');

  // Resolve the teacher record from the logged-in user. On failure (no teacher
  // record) we fall back to listing all classes, admin-style.
  const teacherQuery     = useTeacherByUser(user?._id);
  const teacherRecord    = teacherQuery.data;
  const teacherResolved  = teacherQuery.isSuccess && !!teacherRecord?._id;
  const useFallbackClasses = !user?._id ? false : (teacherQuery.isError || (teacherQuery.isSuccess && !teacherRecord?._id));

  // GET /class-subjects/teacher/:teacherId — assignments carrying class info.
  const assignmentsQuery = useClassSubjectsByTeacher(teacherResolved ? teacherRecord._id : undefined);
  // Fallback: all classes, only when the teacher record can't be resolved.
  const fallbackQuery    = useClasses();

  const classes = useMemo(() => {
    if (teacherResolved) {
      const seen = new Set();
      const uniqueClasses = [];
      (assignmentsQuery.data || []).forEach(a => {
        if (a.class?._id && !seen.has(a.class._id)) {
          seen.add(a.class._id);
          uniqueClasses.push(a.class);
        }
      });
      return uniqueClasses;
    }
    if (useFallbackClasses) return fallbackQuery.data || [];
    return [];
  }, [teacherResolved, assignmentsQuery.data, useFallbackClasses, fallbackQuery.data]);

  const loading =
    !user?._id ||
    teacherQuery.isLoading ||
    (teacherResolved && assignmentsQuery.isLoading) ||
    (useFallbackClasses && fallbackQuery.isLoading);

  useEffect(() => {
    if (!selectedCl) return;

    setLoadingPrg(true); setError('');
    progressService.getByClass(selectedCl)
      .then(data => {
        const subjects = data?.subjects || [];
        setData(subjects);
        if (data?.statistics) {
          const s = data.statistics;
          setSummary({
            total:              s.totalSubjects       || 0,
            ahead:              s.statusCount?.ahead  || 0,
            on_track:           s.statusCount?.on_track || 0,
            at_risk:            s.statusCount?.at_risk  || 0,
            behind:             s.statusCount?.behind   || 0,
            averageCompletion:  s.averageCompletion     || 0,
          });
        } else {
          const cnt = { ahead: 0, on_track: 0, at_risk: 0, behind: 0 };
          let totalPct = 0;
          subjects.forEach(s => {
            cnt[s.complianceStatus] = (cnt[s.complianceStatus] || 0) + 1;
            totalPct += s.completionPercentage || 0;
          });
          setSummary({
            total: subjects.length, ...cnt,
            averageCompletion: subjects.length ? (totalPct / subjects.length).toFixed(1) : 0,
          });
        }
      })
      .catch(() => setError('Failed to load progress data for this class.'))
      .finally(() => setLoadingPrg(false));
  }, [selectedCl]);

  const donutData = [
    { name: 'Ahead',    value: summary.ahead,    fill: T.green },
    { name: 'On Track', value: summary.on_track, fill: T.blue  },
    { name: 'At Risk',  value: summary.at_risk,  fill: T.amber },
    { name: 'Behind',   value: summary.behind,   fill: T.red   },
  ].filter(d => d.value > 0);

  return (
    <TeacherLayout
      title="Student Progress"
      subtitle="Syllabus coverage and compliance for your classes"
    >
      <div style={{ padding: '0 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Class selector */}
        <TeacherCard style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 8 }}>
            Select Class
          </div>
          {loading ? (
            <div style={{ fontSize: 13, color: T.text3 }}>Loading your classes…</div>
          ) : classes.length === 0 ? (
            <div style={{ fontSize: 13, color: T.text3 }}>
              No classes assigned yet. Contact your admin to get classes assigned.
            </div>
          ) : (
            <select
              value={selectedCl}
              onChange={e => setSelectedCl(e.target.value)}
              style={{
                width: '100%', maxWidth: 420,
                padding: '9px 12px', borderRadius: 10,
                border: `1px solid ${T.border}`,
                background: T.surfaceMuted, color: T.text,
                fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
                outline: 'none', cursor: 'pointer',
              }}
            >
              <option value="">Choose a class…</option>
              {classes.map(c => (
                <option key={c._id} value={c._id}>
                  {c.name}{c.code ? ` — ${c.code}` : ''}{c.semester ? ` (Sem ${c.semester})` : ''}{c.section ? `, Sec ${c.section}` : ''}
                </option>
              ))}
            </select>
          )}
        </TeacherCard>

        {error && (
          <div style={{ padding: '12px 16px', borderRadius: 12, background: T.redSoft, border: `1px solid ${T.red}33`, color: T.red, fontSize: 13, fontWeight: 500 }}>
            {error}
          </div>
        )}

        {loadingPrg && (
          <TeacherCard>
            <TeacherSpinner text="Loading progress data…" />
          </TeacherCard>
        )}

        {/* Summary stats */}
        {!loadingPrg && selectedCl && data.length > 0 && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 12 }}>
              {[
                { label: 'Subjects',      value: summary.total,              color: T.text2  },
                { label: 'Ahead',         value: summary.ahead,              color: T.green  },
                { label: 'On Track',      value: summary.on_track,           color: T.blue   },
                { label: 'At Risk',       value: summary.at_risk,            color: T.amber  },
                { label: 'Behind',        value: summary.behind,             color: T.red    },
                { label: 'Avg Coverage',  value: `${summary.averageCompletion}%`, color: T.accent },
              ].map((s, i) => (
                <div key={i} style={{
                  background: T.surface, border: `1px solid ${T.border}`,
                  borderRadius: 18, padding: '14px 18px', boxShadow: T.shadowCard,
                  animation: `teacher-fade-up 500ms cubic-bezier(0.16,1,0.3,1) ${i * 50}ms both`,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: T.text3, marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: s.color, letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 16 }}>
              <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: '20px 22px', boxShadow: T.shadowCard }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>Compliance Overview</div>
                <div style={{ fontSize: 11.5, color: T.text3, marginBottom: 16 }}>Subject distribution by status</div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={donutData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={75} innerRadius={42} paddingAngle={3}>
                      {donutData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Pie>
                    <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle"
                      style={{ fontSize: 20, fontWeight: 700, fill: T.text, fontFamily: T.font }}>
                      {summary.averageCompletion}%
                    </text>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, fontFamily: T.font, color: T.text3, paddingTop: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: '20px 22px', boxShadow: T.shadowCard }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>Subject Completion</div>
                <div style={{ fontSize: 11.5, color: T.text3, marginBottom: 16 }}>Coverage % per subject</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data} barSize={16}>
                    <CartesianGrid strokeDasharray="2 4" stroke={T.divider} vertical={false} />
                    <XAxis dataKey="subjectName" tick={{ ...CHART_FONT, fontSize: 9 }} angle={-15} height={48} axisLine={false} tickLine={false} />
                    <YAxis unit="%" domain={[0, 100]} tick={CHART_FONT} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="completionPercentage" radius={[6, 6, 0, 0]} name="Completion">
                      {data.map((e, i) => (
                        <Cell key={i} fill={
                          e.complianceStatus === 'behind'   ? T.red   :
                          e.complianceStatus === 'at_risk'  ? T.amber :
                          e.complianceStatus === 'ahead'    ? T.green : T.blue
                        } />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Subject table */}
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: '20px 22px', boxShadow: T.shadowCard }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>Subject-wise Progress</div>
              <div style={{ fontSize: 11.5, color: T.text3, marginBottom: 16 }}>Detailed coverage with hours</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Subject', 'Hours', 'Coverage', 'Status'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: `1px solid ${T.divider}` }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, i) => (
                      <tr key={i} className="ch-teacher-row" style={{ background: 'transparent' }}>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: T.text, borderBottom: `1px solid ${T.divider}`, verticalAlign: 'middle' }}>
                          <div style={{ fontWeight: 600 }}>{item.subjectName}</div>
                          {item.subjectCode && <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{item.subjectCode}</div>}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: T.text, borderBottom: `1px solid ${T.divider}`, verticalAlign: 'middle', fontVariantNumeric: 'tabular-nums' }}>
                          <span style={{ fontWeight: 700 }}>{item.conductedHours || 0}</span>
                          <span style={{ color: T.text3 }}> / {item.totalRequiredHours || 60}</span>
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${T.divider}`, verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 72, height: 6, borderRadius: 99, background: T.surfaceMuted, overflow: 'hidden' }}>
                              <div style={{
                                height: '100%', borderRadius: 99,
                                width: `${Math.min(item.completionPercentage || 0, 100)}%`,
                                background: item.complianceStatus === 'behind' ? T.red : item.complianceStatus === 'at_risk' ? T.amber : item.complianceStatus === 'ahead' ? T.green : T.blue,
                              }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: T.text, fontVariantNumeric: 'tabular-nums', minWidth: 36 }}>
                              {(item.completionPercentage || 0).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${T.divider}`, verticalAlign: 'middle' }}>
                          <StatusPill status={item.complianceStatus} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {!loadingPrg && selectedCl && data.length === 0 && !error && (
          <TeacherCard>
            <TeacherEmptyState icon="progress" message="No progress data yet" subtext="Log sessions to start tracking syllabus coverage." />
          </TeacherCard>
        )}

        {!loadingPrg && !selectedCl && !loading && (
          <TeacherCard>
            <TeacherEmptyState icon="class" message="Select a class to view progress" subtext="Choose one of your assigned classes from the dropdown above." />
          </TeacherCard>
        )}
      </div>
    </TeacherLayout>
  );
};

export default TeacherStudentProgress;
