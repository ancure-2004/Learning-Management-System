/**
 * TeacherClassPerformance.jsx — Chronos Teacher
 * Teacher's view of class-level performance analytics.
 * Route: /class-performance (teacher role)
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import TeacherLayout, {
  TeacherCard, TeacherEmptyState, TeacherSpinner, TeacherIcon,
} from '@/layouts/TeacherLayout';
import { T } from '@/layouts/AdminLayout';
import progressService from '@/services/progressService';
import { useTeacherByUser, useClassSubjectsByTeacher, useClasses } from '@/hooks/queries';

const CHART_FONT = { fontFamily: T.font, fontSize: 11, fill: T.text3 };

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px', boxShadow: '0 8px 24px rgba(15,23,42,0.12)', fontFamily: T.font }}>
      {label && <div style={{ fontSize: 11, color: T.text3, marginBottom: 6, fontWeight: 600 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.fill || T.accent }} />
          <span style={{ fontSize: 12, color: T.text, fontWeight: 700 }}>{p.value}%</span>
        </div>
      ))}
    </div>
  );
};

const TeacherClassPerformance = () => {
  const { user } = useAuth();
  const [selectedCl, setSelectedCl] = useState('');
  const [perfData,   setPerfData]   = useState(null);
  const [loadingPerf,setLoadingPerf]= useState(false);
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
      const unique = [];
      (assignmentsQuery.data || []).forEach(a => {
        if (a.class?._id && !seen.has(a.class._id)) {
          seen.add(a.class._id);
          unique.push(a.class);
        }
      });
      return unique;
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

    setLoadingPerf(true); setError('');
    // No dedicated class-performance endpoint yet — use progress as a proxy
    progressService.getByClass(selectedCl)
      .then(data => {
        // Shape progress data into a "performance" shape the UI expects
        const subjects = data?.subjects || [];
        const stat = data?.statistics || {};
        const passRate = stat.averageCompletion ? Math.min(100, Math.round(stat.averageCompletion)) : 0;
        setPerfData({
          avgAttendance:   0, // attendance not tracked yet
          avgCompletion:   stat.averageCompletion ? parseFloat(stat.averageCompletion.toFixed(1)) : 0,
          passRate,
          submissionRate:  0, // not tracked yet
          engagementScore: 0,
          subjectBreakdown: subjects.map(s => ({
            name: s.subjectName || s.subjectCode || '',
            passRate: s.completionPercentage ? Math.min(100, Math.round(s.completionPercentage)) : 0,
          })),
        });
      })
      .catch(() => setError('Could not load performance data for this class.'))
      .finally(() => setLoadingPerf(false));
  }, [selectedCl]);

  /* Build radar data from performance metrics if available */
  const radarData = perfData ? [
    { m: 'Attendance', v: perfData.avgAttendance || 0 },
    { m: 'Completion', v: perfData.avgCompletion || 0 },
    { m: 'Submission', v: perfData.submissionRate || 0 },
    { m: 'Pass Rate',  v: perfData.passRate || 0 },
    { m: 'Engagement', v: perfData.engagementScore || 0 },
  ] : [];

  const subjectBars = perfData?.subjectBreakdown || [];

  return (
    <TeacherLayout
      title="Class Performance"
      subtitle="Performance analytics for your assigned classes"
    >
      <div style={{ padding: '0 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Class selector */}
        <TeacherCard style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.text2, marginBottom: 8 }}>Select Class</div>
          {loading ? (
            <div style={{ fontSize: 13, color: T.text3 }}>Loading your classes…</div>
          ) : classes.length === 0 ? (
            <div style={{ fontSize: 13, color: T.text3 }}>No classes assigned yet.</div>
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
                  {c.name}{c.code ? ` — ${c.code}` : ''}{c.semester ? ` (Sem ${c.semester})` : ''}
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

        {loadingPerf && <TeacherCard><TeacherSpinner text="Loading performance data…" /></TeacherCard>}

        {!loadingPerf && selectedCl && perfData && (
          <>
            {/* KPI row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { label: 'Avg Attendance', value: `${perfData.avgAttendance || 0}%`, color: T.green  },
                { label: 'Avg Completion', value: `${perfData.avgCompletion || 0}%`, color: T.blue   },
                { label: 'Pass Rate',      value: `${perfData.passRate || 0}%`,      color: T.accent },
                { label: 'Submissions',    value: `${perfData.submissionRate || 0}%`, color: T.amber },
              ].map((k, i) => (
                <div key={i} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: '16px 20px', boxShadow: T.shadowCard }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: T.text3, marginBottom: 8 }}>{k.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: k.color, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>
                    {k.value}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Radar */}
              {radarData.length > 0 && (
                <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: '20px 22px', boxShadow: T.shadowCard }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>Performance Overview</div>
                  <div style={{ fontSize: 11.5, color: T.text3, marginBottom: 16 }}>Key metrics at a glance</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke={T.divider} />
                      <PolarAngleAxis dataKey="m" tick={{ ...CHART_FONT, fontSize: 10 }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={{ ...CHART_FONT, fontSize: 9 }} />
                      <Radar dataKey="v" stroke={T.accent} fill={T.accent} fillOpacity={0.18} name="Score" />
                      <Tooltip content={<ChartTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Subject breakdown */}
              {subjectBars.length > 0 && (
                <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: '20px 22px', boxShadow: T.shadowCard }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>Subject Performance</div>
                  <div style={{ fontSize: 11.5, color: T.text3, marginBottom: 16 }}>Pass rate by subject</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={subjectBars} barSize={22}>
                      <CartesianGrid strokeDasharray="2 4" stroke={T.divider} vertical={false} />
                      <XAxis dataKey="name" tick={{ ...CHART_FONT, fontSize: 9 }} angle={-15} height={48} axisLine={false} tickLine={false} />
                      <YAxis unit="%" domain={[0, 100]} tick={CHART_FONT} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="passRate" radius={[6, 6, 0, 0]} name="Pass Rate">
                        {subjectBars.map((e, i) => (
                          <Cell key={i} fill={e.passRate >= 75 ? T.green : e.passRate >= 50 ? T.amber : T.red} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </>
        )}

        {!loadingPerf && selectedCl && !perfData && !error && (
          <TeacherCard>
            <TeacherEmptyState icon="rating" message="No performance data yet" subtext="Performance metrics will appear as students submit assignments and attend classes." />
          </TeacherCard>
        )}

        {!loadingPerf && !selectedCl && !loading && (
          <TeacherCard>
            <TeacherEmptyState icon="rating" message="Select a class to view performance" subtext="Choose one of your assigned classes from the dropdown above." />
          </TeacherCard>
        )}
      </div>
    </TeacherLayout>
  );
};

export default TeacherClassPerformance;
