/**
 * TeacherMyRatings.jsx — Chronos Teacher
 * Teacher's own performance ratings — auto-resolved to the logged-in teacher.
 * Route: /teacher-performance (teacher role)
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  AreaChart, Area,
} from 'recharts';
import TeacherLayout, {
  TeacherCard, TeacherEmptyState, TeacherSpinner, TeacherIcon,
} from '@/layouts/TeacherLayout';
import { T } from '@/layouts/AdminLayout';
import teacherService from '@/services/teacherService';
import ratingService from '@/services/ratingService';

const CHART_FONT = { fontFamily: T.font, fontSize: 11, fill: T.text3 };

const ChartTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px', boxShadow: '0 8px 24px rgba(15,23,42,0.12)', fontFamily: T.font }}>
      {label && <div style={{ fontSize: 11, color: T.text3, marginBottom: 6, fontWeight: 600 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color || p.fill || T.accent }} />
          <span style={{ fontSize: 12, color: T.text, fontWeight: 700 }}>
            {formatter ? formatter(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const StarRow = ({ value = 0, max = 5 }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', display: 'inline-flex' }}>
        <div style={{ display: 'flex', gap: 3, color: T.text4 }}>
          {Array.from({ length: max }).map((_, i) => (
            <svg key={i} width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>
        <div style={{ position: 'absolute', top: 0, left: 0, overflow: 'hidden', width: `${pct}%`, display: 'flex', gap: 3, color: T.amber }}>
          {Array.from({ length: max }).map((_, i) => (
            <svg key={i} width={16} height={16} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: T.text, fontVariantNumeric: 'tabular-nums' }}>
        {value.toFixed(1)} / {max}
      </span>
    </div>
  );
};

const TeacherMyRatings = () => {
  const { user } = useAuth();
  const [teacherId,  setTeacherId]  = useState(null);
  const [aggregate,  setAggregate]  = useState(null);
  const [trends,     setTrends]     = useState([]);
  const [recent,     setRecent]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  /* Step 1: resolve teacher _id from auth user */
  useEffect(() => {
    if (!user) return;

    const resolve = async () => {
      try {
        const t = await teacherService.getByUser(user._id);
        if (t?._id) { setTeacherId(t._id); return; }
      } catch {}
      try {
        const name = `${user.firstName} ${user.lastName}`.trim();
        const t = await teacherService.getByName(name);
        if (t?._id) { setTeacherId(t._id); return; }
      } catch {}
      setLoading(false);
      setError('Could not find your teacher profile. Contact your admin.');
    };

    resolve();
  }, [user]);

  /* Step 2: once we have teacherId, load ratings */
  useEffect(() => {
    if (!teacherId) return;

    Promise.allSettled([
      ratingService.getAggregate(teacherId),
      ratingService.getTrends(teacherId, { limit: 8 }),
      ratingService.getForTeacher(teacherId, { page: 1, limit: 10 }),
    ]).then(([aggR, trendR, recentR]) => {
      if (aggR.status   === 'fulfilled') setAggregate(aggR.value);
      if (trendR.status === 'fulfilled') setTrends(trendR.value.trends || []);
      if (recentR.status=== 'fulfilled') setRecent(recentR.value.ratings || []);
    }).catch(() => setError('Failed to load ratings data.'))
      .finally(() => setLoading(false));
  }, [teacherId]);

  const avgRating = aggregate?.overallAverage || 0;

  /* Category bar data */
  const catData = Object.entries(aggregate?.categoryAverages || {}).map(([k, v]) => ({
    name: k.replace(/([A-Z])/g, ' $1').trim(),
    value: parseFloat(((v / 5) * 100).toFixed(1)),
    raw: v,
  }));

  /* Rating distribution */
  const distData = [5, 4, 3, 2, 1].map(stars => {
    const count = aggregate?.distribution?.[stars] || 0;
    const total = aggregate?.totalRatings || 0;
    const pct   = total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0;
    return { stars: `${stars}★`, count, pct };
  });

  /* Trend chart */
  const trendChartData = trends.map(d => ({
    period: d.period,
    rating: parseFloat((d.averageRating || 0).toFixed(2)),
  }));

  return (
    <TeacherLayout
      title="My Ratings"
      subtitle="Student feedback and performance analytics for your teaching"
    >
      <div style={{ padding: '0 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {loading && (
          <TeacherCard>
            <TeacherSpinner text="Loading your ratings…" />
          </TeacherCard>
        )}

        {!loading && error && (
          <div style={{ padding: '14px 18px', borderRadius: 14, background: T.amberSoft, border: `1px solid ${T.amber}33`, fontSize: 13, color: T.amber, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TeacherIcon name="alert" size={14} />
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Hero stats card */}
            <TeacherCard style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '22px 28px' }}>
              <div style={{
                width: 64, height: 64, borderRadius: 18, flexShrink: 0,
                background: `linear-gradient(135deg,${T.accent2},${T.accent})`,
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 700, boxShadow: `0 6px 18px ${T.accent}40`,
              }}>
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 4 }}>
                  {user?.firstName} {user?.lastName}
                </div>
                <StarRow value={avgRating} />
                <div style={{ fontSize: 12, color: T.text3, marginTop: 6 }}>
                  Based on {aggregate?.totalRatings || 0} student ratings
                </div>
              </div>

              {/* Quick KPIs */}
              {[
                { label: 'Total Ratings', value: aggregate?.totalRatings || 0, color: T.blue },
                { label: 'Avg Score',     value: avgRating.toFixed(1) + '/5', color: T.amber },
                { label: 'This Month',    value: aggregate?.recentCount || '—', color: T.green },
              ].map((k, i) => (
                <div key={i} style={{
                  textAlign: 'center', padding: '12px 20px',
                  borderLeft: `1px solid ${T.divider}`,
                  flexShrink: 0,
                }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: k.color, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>
                    {k.value}
                  </div>
                  <div style={{ fontSize: 11, color: T.text3, fontWeight: 500, marginTop: 3 }}>{k.label}</div>
                </div>
              ))}
            </TeacherCard>

            {(aggregate?.totalRatings || 0) === 0 ? (
              <TeacherCard>
                <TeacherEmptyState
                  icon="star"
                  message="No ratings yet"
                  subtext="Students will be able to rate your classes through the platform. Ratings will appear here once submitted."
                />
              </TeacherCard>
            ) : (
              <>
                {/* Charts row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {/* Category breakdown */}
                  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: '20px 22px', boxShadow: T.shadowCard }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>Performance by Category</div>
                    <div style={{ fontSize: 11.5, color: T.text3, marginBottom: 16 }}>Score out of 5 per category</div>
                    {catData.length === 0 ? (
                      <TeacherEmptyState icon="rating" message="No category data" />
                    ) : (
                      <ResponsiveContainer width="100%" height={Math.max(180, catData.length * 36)}>
                        <BarChart data={catData} layout="vertical" barSize={12}>
                          <CartesianGrid strokeDasharray="2 4" stroke={T.divider} horizontal={false} />
                          <XAxis type="number" domain={[0, 100]} unit="%" tick={CHART_FONT} axisLine={false} tickLine={false} />
                          <YAxis type="category" dataKey="name" width={110} tick={{ ...CHART_FONT, fontSize: 10 }} axisLine={false} tickLine={false} />
                          <Tooltip content={<ChartTooltip formatter={v => `${catData.find(d => d.value === v)?.raw?.toFixed(1) ?? v} / 5`} />} />
                          <Bar dataKey="value" radius={[0, 6, 6, 0]} name="Score">
                            {catData.map((e, i) => (
                              <Cell key={i} fill={e.value >= 90 ? T.green : e.value >= 70 ? T.blue : e.value >= 50 ? T.amber : T.red} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Rating distribution */}
                  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: '20px 22px', boxShadow: T.shadowCard }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>Rating Distribution</div>
                    <div style={{ fontSize: 11.5, color: T.text3, marginBottom: 16 }}>How students rated you</div>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={distData} barSize={36}>
                        <CartesianGrid strokeDasharray="2 4" stroke={T.divider} vertical={false} />
                        <XAxis dataKey="stars" tick={CHART_FONT} axisLine={false} tickLine={false} />
                        <YAxis unit="%" tick={CHART_FONT} axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTooltip formatter={v => `${v}%`} />} />
                        <Bar dataKey="pct" radius={[6, 6, 0, 0]} name="% of ratings">
                          {distData.map((_, i) => (
                            <Cell key={i} fill={[T.green, T.blue, T.amber, T.amber, T.red][i]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Trend */}
                {trendChartData.length > 1 && (
                  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: '20px 22px', boxShadow: T.shadowCard }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>Rating Trend</div>
                    <div style={{ fontSize: 11.5, color: T.text3, marginBottom: 16 }}>Your average rating over time</div>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={trendChartData}>
                        <defs>
                          <linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={T.accent} stopOpacity={0.2} />
                            <stop offset="100%" stopColor={T.accent} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="2 4" stroke={T.divider} vertical={false} />
                        <XAxis dataKey="period" tick={CHART_FONT} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={CHART_FONT} axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTooltip formatter={v => `${v} / 5`} />} />
                        <Area type="monotone" dataKey="rating" stroke={T.accent} strokeWidth={2.5} fill="url(#rGrad)" name="Avg Rating" dot={{ r: 4, fill: T.accent, strokeWidth: 0 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Recent feedback */}
                <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: '20px 22px', boxShadow: T.shadowCard }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>Recent Feedback</div>
                  <div style={{ fontSize: 11.5, color: T.text3, marginBottom: 16 }}>Latest student comments</div>
                  {recent.length === 0 ? (
                    <TeacherEmptyState icon="rating" message="No feedback yet" />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {recent.map(r => (
                        <div key={r._id} style={{ border: `1px solid ${T.border}`, borderRadius: 14, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <StarRow value={r.overallRating || 0} />
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: 11, color: T.text3 }}>
                                {new Date(r.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </div>
                              {r.subject && <div style={{ fontSize: 12, color: T.text2, fontWeight: 500, marginTop: 2 }}>{r.subject.name}</div>}
                            </div>
                          </div>
                          {r.feedback && (
                            <div style={{ fontSize: 13, color: T.text2, fontStyle: 'italic', lineHeight: 1.55, padding: '8px 12px', background: T.surfaceMuted, borderRadius: 9 }}>
                              "{r.feedback}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </TeacherLayout>
  );
};

export default TeacherMyRatings;
