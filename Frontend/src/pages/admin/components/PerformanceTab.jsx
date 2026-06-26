/**
 * PerformanceTab.jsx — Chronos Admin / Insights
 * ─────────────────────────────────────────────────────────────────────────
 * Teacher rating analytics.
 * ─────────────────────────────────────────────────────────────────────────
 */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { theme as T } from '@/theme';
import { useAuth } from '@/context/AuthContext';
import teacherService from '@/services/teacherService';
import ratingService from '@/services/ratingService';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, Area, AreaChart,
} from 'recharts';
import { ChIcon, GhostBtn, EmptyState, SearchInput } from '@/layouts/AdminLayout';
import { ChartTooltip, ChartCard, Spinner, StarDisplay } from './insightsUi';

const CHART_FONT = { fontFamily: T.font, fontSize: 11, fill: T.text3 };

const PerformanceTab = () => {
  const { user } = useAuth();
  const { teacherId: paramTeacherId } = useParams();

  const [allTeachers,    setAllTeachers]    = useState([]);
  const [selectedId,     setSelectedId]     = useState(null);
  const [resolvedId,     setResolvedId]     = useState(null);
  const [aggregate,      setAggregate]      = useState(null);
  const [trends,         setTrends]         = useState([]);
  const [recent,         setRecent]         = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [loadingData,    setLoadingData]    = useState(false);
  const [search,         setSearch]         = useState('');

  const viewingId = paramTeacherId || selectedId || resolvedId;
  const isAdmin   = user?.role === 'admin';

  /* Resolve teacher for non-admin */
  useEffect(() => {
    if (!isAdmin && !paramTeacherId) {
      const resolve = async () => {
        try {
          const data = await teacherService.getByUser(user._id);
          if (data?._id) { setResolvedId(data._id); return; }
        } catch {}
        try {
          const name = `${user.firstName} ${user.lastName}`.trim();
          const data = await teacherService.getByName(name);
          if (data?._id) setResolvedId(data._id);
        } catch {}
        setLoading(false);
      };
      resolve();
    }
  }, [user, isAdmin, paramTeacherId]);

  useEffect(() => {
    if (isAdmin && !paramTeacherId) {
      teacherService.getAll().then(data => setAllTeachers(data)).catch(()=>{}).finally(()=>setLoading(false));
    }
  }, [isAdmin, paramTeacherId]);

  useEffect(() => {
    if (!viewingId) return;
    setLoadingData(true);
    Promise.allSettled([
      ratingService.getAggregate(viewingId),
      ratingService.getTrends(viewingId, { limit: 8 }),
      ratingService.getForTeacher(viewingId, { page: 1, limit: 10 }),
    ]).then(([aggR, trendR, recentR]) => {
      if (aggR.status==='fulfilled') setAggregate(aggR.value);
      if (trendR.status==='fulfilled') setTrends(trendR.value.trends||[]);
      if (recentR.status==='fulfilled') setRecent(recentR.value.ratings||[]);
    }).finally(() => setLoadingData(false));
  }, [viewingId]);

  if (!viewingId && isAdmin) {
    const filtered = allTeachers.filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()));
    const aColor = (i) => [T.accent,T.blue,T.green,T.amber,'#ec4899','#06b6d4'][i%6];
    const ini = (name='') => { const p=name.trim().split(/\s+/); return p.length===1?p[0].slice(0,2).toUpperCase():(p[0][0]+p[p.length-1][0]).toUpperCase(); };

    return (
      <div style={{ padding:'0 28px', display:'flex', flexDirection:'column', gap:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, justifyContent:'space-between' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search teachers…" />
          <span style={{ fontSize:12, color:T.text3, fontWeight:600 }}>{filtered.length} teacher{filtered.length!==1?'s':''}</span>
        </div>
        {loading ? <Spinner /> : filtered.length === 0 ? (
          <EmptyState icon="teacher" message="No teachers found" subtext="Add teachers via Academic Resources → Teachers first." />
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:12 }}>
            {filtered.map((t,i) => (
              <button key={t._id} onClick={()=>setSelectedId(t._id)} style={{
                background:T.surface, border:`1px solid ${T.border}`, borderRadius:20,
                padding:'18px 20px', boxShadow:T.shadowCard,
                display:'flex', alignItems:'center', gap:12,
                cursor:'pointer', fontFamily:T.font, textAlign:'left',
                transition:`all 200ms ${T.ease}`, animation:`admin-fade-up 500ms cubic-bezier(0.16,1,0.3,1) ${(i%4)*50}ms both`,
              }}
                onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=T.shadowLift; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=T.shadowCard; }}>
                <div style={{ width:44, height:44, borderRadius:14, flexShrink:0, background:`linear-gradient(135deg,${aColor(i)}cc,${aColor(i)})`, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, boxShadow:`0 4px 10px ${aColor(i)}40` }}>
                  {ini(t.name)}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, fontSize:13.5, color:T.text, letterSpacing:'-0.02em', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.name}</div>
                  <div style={{ marginTop:4, display:'flex', alignItems:'center', gap:4 }}>
                    <ChIcon name="rating" size={11} />
                    <span style={{ fontSize:11, color:T.text3, fontWeight:500 }}>View performance</span>
                  </div>
                </div>
                <ChIcon name="chev" size={14} />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!viewingId) return <div style={{ padding:'0 28px' }}><EmptyState icon="teacher" message="Performance data unavailable" /></div>;

  const displayTeacher = allTeachers.find(t => t._id === viewingId);
  const avgRating = aggregate?.overallAverage || 0;

  /* Build category bar data */
  const catData = Object.entries(aggregate?.categoryAverages || {}).map(([k,v]) => ({
    name: k.replace(/([A-Z])/g,' $1').trim(),
    value: parseFloat((v/5*100).toFixed(1)),
    raw: v,
  }));

  /* Trend for recharts */
  const trendChartData = trends.map(d => ({ period:d.period, rating:parseFloat((d.averageRating||0).toFixed(2)) }));

  /* Distribution */
  const distData = [5,4,3,2,1].map(stars => {
    const count   = aggregate?.distribution?.[stars] || 0;
    const total   = aggregate?.totalRatings || 0;
    const pct     = total > 0 ? parseFloat(((count/total)*100).toFixed(1)) : 0;
    return { stars:`${stars}★`, count, pct };
  });

  return (
    <div style={{ padding:'0 28px', display:'flex', flexDirection:'column', gap:16 }}>
      {/* Back button (admin) */}
      {isAdmin && selectedId && (
        <div>
          <GhostBtn icon="arrow" onClick={()=>setSelectedId(null)} style={{ transform:'scaleX(-1)' }}>
            <span style={{ transform:'scaleX(-1)', display:'inline-block' }}>Back to Teachers</span>
          </GhostBtn>
        </div>
      )}

      {/* Teacher header */}
      <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:20, padding:'20px 24px', boxShadow:T.shadowCard, display:'flex', alignItems:'center', gap:16 }}>
        <div style={{ width:56, height:56, borderRadius:16, background:`linear-gradient(135deg,${T.accent2},${T.accent})`, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, flexShrink:0, boxShadow:`0 6px 16px ${T.accent}40` }}>
          {displayTeacher?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:18, fontWeight:700, color:T.text, letterSpacing:'-0.03em' }}>
            {isAdmin && !paramTeacherId ? 'Teacher Performance' : displayTeacher?.name || 'My Performance'}
          </div>
          {displayTeacher && <div style={{ fontSize:13, color:T.text3, marginTop:3 }}>{displayTeacher.name}{displayTeacher.specialization && ` · ${displayTeacher.specialization}`}</div>}
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:36, fontWeight:700, color:T.text, letterSpacing:'-0.05em', lineHeight:1, fontVariantNumeric:'tabular-nums' }}>{avgRating.toFixed(1)}</div>
          <StarDisplay value={avgRating} />
          <div style={{ fontSize:11, color:T.text3, marginTop:4 }}>{aggregate?.totalRatings||0} ratings</div>
        </div>
      </div>

      {loadingData && <Spinner text="Loading performance data…" />}

      {!loadingData && (
        <>
          {/* Charts row */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            {/* Category breakdown */}
            <ChartCard title="Performance by Category" subtitle="Score out of 5 per category">
              {catData.length === 0 ? (
                <EmptyState icon="rating" message="No category data yet" />
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(180, catData.length*36)}>
                  <BarChart data={catData} layout="vertical" barSize={12}>
                    <CartesianGrid strokeDasharray="2 4" stroke={T.divider} horizontal={false} />
                    <XAxis type="number" domain={[0,100]} unit="%" tick={CHART_FONT} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" width={110} tick={{ ...CHART_FONT, fontSize:10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={(props) => <ChartTooltip {...props} formatter={(v,n,p) => `${p?.payload?.raw?.toFixed(1) ?? v} / 5`} />} />
                    <Bar dataKey="value" radius={[0,6,6,0]} name="Score">
                      {catData.map((e,i) => <Cell key={i} fill={e.value>=90?T.green:e.value>=70?T.blue:e.value>=50?T.amber:T.red} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* Rating distribution */}
            <ChartCard title="Rating Distribution" subtitle="How students rated this teacher">
              {(aggregate?.totalRatings||0) === 0 ? (
                <EmptyState icon="rating" message="No ratings yet" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={distData} barSize={36}>
                    <CartesianGrid strokeDasharray="2 4" stroke={T.divider} vertical={false} />
                    <XAxis dataKey="stars" tick={CHART_FONT} axisLine={false} tickLine={false} />
                    <YAxis unit="%" tick={CHART_FONT} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip formatter={(v) => `${v}% (${distData.find(d=>d.pct===v)?.count||0} ratings)`} />} />
                    <Bar dataKey="pct" radius={[6,6,0,0]} name="% of ratings">
                      {distData.map((e,i) => <Cell key={i} fill={[T.green,T.blue,T.amber,T.amber,T.red][i]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          {/* Trend chart */}
          {trendChartData.length > 1 && (
            <ChartCard title="Rating Trend" subtitle={`Over the last ${trendChartData.length} periods`}>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trendChartData}>
                  <defs>
                    <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={T.accent} stopOpacity={0.2} />
                      <stop offset="100%" stopColor={T.accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 4" stroke={T.divider} vertical={false} />
                  <XAxis dataKey="period" tick={CHART_FONT} axisLine={false} tickLine={false} />
                  <YAxis domain={[0,5]} ticks={[1,2,3,4,5]} tick={CHART_FONT} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip formatter={(v) => `${v} / 5`} />} />
                  <Area type="monotone" dataKey="rating" stroke={T.accent} strokeWidth={2.5} fill="url(#ratingGrad)" name="Avg Rating" dot={{ r:4, fill:T.accent, strokeWidth:0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {/* Recent feedback */}
          <ChartCard title="Recent Feedback" subtitle={`${recent.length} most recent ratings`}>
            {recent.length === 0 ? (
              <EmptyState icon="rating" message="No feedback yet" subtext="Students haven't rated this teacher yet." />
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {recent.map(r => (
                  <div key={r._id} style={{ border:`1px solid ${T.border}`, borderRadius:14, padding:'14px 16px', display:'flex', flexDirection:'column', gap:8 }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <StarDisplay value={r.overallRating} />
                        <span style={{ fontSize:20, fontWeight:700, color:T.text, letterSpacing:'-0.04em', fontVariantNumeric:'tabular-nums' }}>{r.overallRating?.toFixed(1)}</span>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:11, color:T.text3 }}>{new Date(r.createdAt).toLocaleDateString('en-US',{day:'numeric',month:'short',year:'numeric'})}</div>
                        {r.subject && <div style={{ fontSize:12, color:T.text2, fontWeight:500, marginTop:2 }}>{r.subject.name}</div>}
                      </div>
                    </div>
                    {r.feedback && (
                      <div style={{ fontSize:13, color:T.text2, fontStyle:'italic', lineHeight:1.55, padding:'8px 12px', background:T.surfaceMuted, borderRadius:9, letterSpacing:'-0.01em' }}>
                        "{r.feedback}"
                      </div>
                    )}
                    {r.categories && Object.values(r.categories).some(v=>v>0) && (
                      <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                        {Object.entries(r.categories).filter(([,v])=>v>0).map(([k,v]) => (
                          <span key={k} style={{ padding:'3px 8px', borderRadius:99, background:T.surfaceMuted, color:T.text3, fontSize:11, fontWeight:600 }}>
                            {k.replace(/([A-Z])/g,' $1').trim()}: {v}/5
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ChartCard>
        </>
      )}
    </div>
  );
};

export default PerformanceTab;
