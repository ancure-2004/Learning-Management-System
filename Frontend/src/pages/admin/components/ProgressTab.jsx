/**
 * ProgressTab.jsx — Chronos Admin / Insights
 * ─────────────────────────────────────────────────────────────────────────
 * Class-wise syllabus coverage tracking.
 * ─────────────────────────────────────────────────────────────────────────
 */
import React, { useState, useEffect } from 'react';
import { theme as T } from '@/theme';
import progressService from '@/services/progressService';
import classService from '@/services/classService';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, PieChart, Pie, Legend,
} from 'recharts';
import { Field, Select, EmptyState, TH, TD } from '@/layouts/AdminLayout';
import { ChartTooltip, ChartCard, Spinner, StatusBadge } from './insightsUi';

const CHART_FONT = { fontFamily: T.font, fontSize: 11, fill: T.text3 };

const ProgressTab = () => {
  const [classes,    setClasses]    = useState([]);
  const [selectedCl, setSelectedCl]= useState('');
  const [data,       setData]       = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [loadingCls, setLoadingCls] = useState(true);
  const [error,      setError]      = useState('');
  const [summary,    setSummary]    = useState({ total:0, ahead:0, on_track:0, at_risk:0, behind:0, averageCompletion:0 });

  useEffect(() => {
    classService.getAll().then(data => setClasses(data)).catch(()=>{}).finally(()=>setLoadingCls(false));
  }, []);

  useEffect(() => {
    if (!selectedCl) return;
    setLoading(true); setError('');
    progressService.getByClass(selectedCl)
      .then(data => {
        const subjects = data?.subjects || [];
        setData(subjects);
        if (data?.statistics) {
          const s = data.statistics;
          setSummary({ total:s.totalSubjects||0, ahead:s.statusCount?.ahead||0, on_track:s.statusCount?.on_track||0, at_risk:s.statusCount?.at_risk||0, behind:s.statusCount?.behind||0, averageCompletion:s.averageCompletion||0 });
        } else {
          let total=0; const cnt={ahead:0,on_track:0,at_risk:0,behind:0};
          subjects.forEach(s=>{ cnt[s.complianceStatus]=(cnt[s.complianceStatus]||0)+1; total+=s.completionPercentage||0; });
          setSummary({ total:subjects.length,...cnt, averageCompletion:subjects.length?(total/subjects.length).toFixed(1):0 });
        }
      })
      .catch(err => setError(err.response?.data?.message||'Failed to load progress'))
      .finally(() => setLoading(false));
  }, [selectedCl]);

  /* donut data */
  const donutData = [
    { name:'Ahead',    value:summary.ahead,    fill:T.green },
    { name:'On Track', value:summary.on_track, fill:T.blue  },
    { name:'At Risk',  value:summary.at_risk,  fill:T.amber },
    { name:'Behind',   value:summary.behind,   fill:T.red   },
  ].filter(d => d.value > 0);

  return (
    <div style={{ padding:'0 28px', display:'flex', flexDirection:'column', gap:16 }}>
      {/* Class selector */}
      <div style={{ display:'flex', alignItems:'flex-end', gap:14 }}>
        <Field label="Select Class" style={{ flex:1, maxWidth:380 }}>
          <Select value={selectedCl} onChange={e=>setSelectedCl(e.target.value)}>
            <option value="">Choose a class…</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name} — {c.code} (Sem {c.semester}, Sec {c.section})</option>)}
          </Select>
        </Field>
      </div>

      {error && (
        <div style={{ padding:'12px 16px', borderRadius:12, background:T.redSoft, border:`1px solid ${T.red}33`, color:T.red, fontSize:13, fontWeight:500 }}>{error}</div>
      )}

      {loading && (
        <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:20, boxShadow:T.shadowCard }}>
          <Spinner text="Loading progress data…" />
        </div>
      )}

      {/* Summary */}
      {!loading && selectedCl && data.length > 0 && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:12 }}>
            {[
              { label:'Subjects',   value:summary.total,              color:T.text2  },
              { label:'Ahead',      value:summary.ahead,              color:T.green  },
              { label:'On Track',   value:summary.on_track,           color:T.blue   },
              { label:'At Risk',    value:summary.at_risk,            color:T.amber  },
              { label:'Behind',     value:summary.behind,             color:T.red    },
              { label:'Avg Progress', value:`${summary.averageCompletion}%`, color:T.accent },
            ].map((s,i) => (
              <div key={i} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:18, padding:'14px 18px', boxShadow:T.shadowCard, animation:`admin-fade-up 500ms cubic-bezier(0.16,1,0.3,1) ${i*50}ms both` }}>
                <div style={{ fontSize:11, fontWeight:600, color:T.text3, marginBottom:6 }}>{s.label}</div>
                <div style={{ fontSize:26, fontWeight:700, color:s.color, letterSpacing:'-0.04em', lineHeight:1, fontVariantNumeric:'tabular-nums' }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1.6fr', gap:16 }}>
            <ChartCard title="Compliance Overview" subtitle="Subject distribution by status">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={donutData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={80} innerRadius={46} paddingAngle={3}>
                    {donutData.map((e,i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle"
                    style={{ fontSize:22, fontWeight:700, fill:T.text, fontFamily:T.font, fontVariantNumeric:'tabular-nums' }}>
                    {summary.averageCompletion}%
                  </text>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize:11, fontFamily:T.font, color:T.text3, paddingTop:8 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Subject Completion" subtitle="Percentage of syllabus covered">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data} barSize={14}>
                  <CartesianGrid strokeDasharray="2 4" stroke={T.divider} vertical={false} />
                  <XAxis dataKey="subjectName" tick={{ ...CHART_FONT, fontSize:9 }} angle={-15} height={48} axisLine={false} tickLine={false} />
                  <YAxis unit="%" domain={[0,100]} tick={CHART_FONT} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip formatter={(v) => `${parseFloat(v).toFixed(1)}%`} />} />
                  <Bar dataKey="completionPercentage" radius={[6,6,0,0]} name="Completion">
                    {data.map((e,i) => <Cell key={i} fill={e.complianceStatus==='behind'?T.red:e.complianceStatus==='at_risk'?T.amber:e.complianceStatus==='ahead'?T.green:T.blue} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Subject table */}
          <ChartCard title="Subject-wise Progress" subtitle="Detailed view with hours and urgency score">
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr>
                    <TH style={{ paddingLeft:16 }}>Subject</TH>
                    <TH>Teacher</TH>
                    <TH>Hours</TH>
                    <TH>Completion</TH>
                    <TH>Status</TH>
                    <TH style={{ paddingRight:16 }}>Urgency</TH>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item,i) => {
                    const urgency = item.urgencyScore || 0;
                    const urgColor = urgency>5?T.red:urgency>3?T.amber:urgency>1?T.blue:T.green;
                    return (
                      <tr key={i} className="ch-admin-row" style={{ background:'transparent' }}>
                        <TD style={{ paddingLeft:16 }}>
                          <div style={{ fontWeight:600, color:T.text }}>{item.subjectName}</div>
                          <div style={{ fontSize:11, color:T.text3 }}>{item.subjectCode}</div>
                        </TD>
                        <TD>{item.teacherName}</TD>
                        <TD>
                          <span style={{ fontWeight:700, color:T.text, fontVariantNumeric:'tabular-nums' }}>{item.conductedHours||0}</span>
                          <span style={{ color:T.text3 }}> / {item.totalRequiredHours||60}</span>
                        </TD>
                        <TD>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div style={{ width:64, height:6, borderRadius:99, background:T.surfaceMuted, overflow:'hidden' }}>
                              <div style={{ height:'100%', borderRadius:99, width:`${Math.min(item.completionPercentage||0,100)}%`, background:item.complianceStatus==='behind'?T.red:item.complianceStatus==='at_risk'?T.amber:item.complianceStatus==='ahead'?T.green:T.blue }}/>
                            </div>
                            <span style={{ fontSize:12, fontWeight:700, color:T.text, fontVariantNumeric:'tabular-nums', minWidth:36 }}>
                              {(item.completionPercentage||0).toFixed(1)}%
                            </span>
                          </div>
                        </TD>
                        <TD><StatusBadge status={item.complianceStatus} /></TD>
                        <TD style={{ paddingRight:16 }}>
                          <span style={{ fontSize:14, fontWeight:700, color:urgColor, fontVariantNumeric:'tabular-nums' }}>
                            {urgency.toFixed(2)}
                          </span>
                        </TD>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </>
      )}

      {!loading && selectedCl && data.length === 0 && !error && (
        <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:20, boxShadow:T.shadowCard }}>
          <EmptyState icon="progress" message="No progress data yet" subtext="Teachers need to log sessions before progress appears here." />
        </div>
      )}

      {!loading && !selectedCl && (
        <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:20, boxShadow:T.shadowCard }}>
          <EmptyState icon="class" message="Select a class to view progress" subtext="Choose a class from the dropdown above." />
        </div>
      )}
    </div>
  );
};

export default ProgressTab;
