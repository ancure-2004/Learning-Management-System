/**
 * ReportsTab.jsx — Chronos Admin / Insights
 * ─────────────────────────────────────────────────────────────────────────
 * Generate & visualize 6 report types (Recharts-powered).
 * ─────────────────────────────────────────────────────────────────────────
 */
import React, { useState, useEffect, useCallback } from 'react';
import { theme as T } from '@/theme';
import reportService from '@/services/reportService';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, PieChart, Pie, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, Area, AreaChart,
} from 'recharts';
import {
  ChIcon, PrimaryBtn, GhostBtn, Field, Input, Select, Badge,
  Toast, EmptyState, TH, TD,
} from '@/layouts/AdminLayout';
import {
  ChartTooltip, ChartCard, MetricTile, Spinner, StatusBadge,
  chartColor, CHART_COLORS,
} from './insightsUi';

/* ═══ CHART PALETTE (drawn from T tokens) ═══════════════════════════════ */
const C = {
  accent: T.accent,   // purple
  blue:   T.blue,
  green:  T.green,
  amber:  T.amber,
  red:    T.red,
  pink:   '#ec4899',
  teal:   '#14b8a6',
  indigo: '#6366f1',
};

const CHART_FONT = { fontFamily: T.font, fontSize: 11, fill: T.text3 };

const REPORT_TYPES = [
  { key: 'timetable_utilization', label: 'Timetable',   icon: 'timetable', color: C.accent },
  { key: 'teacher_workload',      label: 'Workload',    icon: 'teacher',   color: C.blue   },
  { key: 'room_usage',            label: 'Rooms',       icon: 'room',      color: C.teal   },
  { key: 'progress_tracking',     label: 'Progress',    icon: 'progress',  color: C.green  },
  { key: 'attendance_analytics',  label: 'Attendance',  icon: 'calendar',  color: C.amber  },
  { key: 'performance_overview',  label: 'Performance', icon: 'rating',    color: C.pink   },
];

const ReportsTab = () => {
  const token = localStorage.getItem('token');
  const [reportType, setReportType]     = useState('timetable_utilization');
  const [loading,    setLoading]        = useState(false);
  const [reportData, setReportData]     = useState(null);
  const [summary,    setSummary]        = useState(null);
  const [reportId,   setReportId]       = useState(null);
  const [recent,     setRecent]         = useState([]);
  const [error,      setError]          = useState('');
  const [toast,      setToast]          = useState(null);
  const [acYear,     setAcYear]         = useState('');
  const [semester,   setSemester]       = useState('');

  const loadRecent = useCallback(async () => {
    try {
      const data = await reportService.list({ limit: 8 });
      if (data.success) setRecent(data.reports);
    } catch {}
  }, [token]);

  useEffect(() => { loadRecent(); }, [loadRecent]);

  const generate = async () => {
    setLoading(true); setError(''); setReportData(null);
    try {
      const filters = {};
      if (acYear)   filters.academicYear = acYear;
      if (semester) filters.semester     = parseInt(semester);
      const data = await reportService.generate({ reportType, filters });
      if (data.success) {
        setReportData(data.report.data);
        setSummary(data.report.summary);
        setReportId(data.report._id);
        loadRecent();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate report');
    }
    setLoading(false);
  };

  const exportReport = async (fmt) => {
    if (!reportId) return;
    try {
      const blob = await reportService.export(reportId, fmt);
      const url  = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', `${reportType}.${fmt === 'excel' ? 'xlsx' : fmt}`);
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
    } catch { setToast({ msg: 'Export failed', type: 'error' }); }
  };

  const deleteRecent = async (id) => {
    try {
      await reportService.remove(id);
      loadRecent();
    } catch {}
  };

  const loadSaved = async (id) => {
    setLoading(true);
    try {
      const r = await reportService.getOne(id);
      if (r.success) {
        const rpt = r.report;
        setReportType(rpt.reportType);
        setReportData(rpt.data);
        setSummary(rpt.summary);
        setReportId(rpt._id);
      }
    } catch { setError('Failed to load saved report'); }
    setLoading(false);
  };

  /* ── Chart renderers ── */
  const renderTimetableUtil = () => {
    const { dayChartData=[], slotChartData=[], classWiseUtilization=[], overallUtilization=0, totalUsedSlots=0, emptySlots=0, totalTimetables=0 } = reportData || {};
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
          <MetricTile label="Utilization"  value={`${overallUtilization}%`} color={T.accent} icon="timetable" delay={0} />
          <MetricTile label="Used Slots"   value={totalUsedSlots}          color={T.green}  icon="check"     delay={60} />
          <MetricTile label="Empty Slots"  value={emptySlots}              color={T.amber}  icon="alert"     delay={120} />
          <MetricTile label="Timetables"   value={totalTimetables}         color={T.blue}   icon="calendar"  delay={180} />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <ChartCard title="Day-wise Utilization" subtitle="Percentage of slots used per day">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dayChartData} barSize={32}>
                <CartesianGrid strokeDasharray="2 4" stroke={T.divider} vertical={false} />
                <XAxis dataKey="day" tick={CHART_FONT} axisLine={false} tickLine={false} />
                <YAxis unit="%" tick={CHART_FONT} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip formatter={(v) => `${v}%`} />} />
                <Bar dataKey="utilization" radius={[6,6,0,0]} name="Utilization">
                  {dayChartData.map((_,i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Slot-wise Usage" subtitle="Peak hours analysis">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={slotChartData}>
                <defs>
                  <linearGradient id="slotGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={T.accent} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={T.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke={T.divider} vertical={false} />
                <XAxis dataKey="slot" tick={CHART_FONT} axisLine={false} tickLine={false} />
                <YAxis unit="%" tick={CHART_FONT} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip formatter={(v) => `${v}%`} />} />
                <Area type="monotone" dataKey="utilization" stroke={T.accent} strokeWidth={2.5} fill="url(#slotGrad)" name="Utilization" dot={{ r:3, fill:T.accent }} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        {classWiseUtilization.length > 0 && (
          <ChartCard title="Class-wise Utilization" subtitle="Timetable coverage per class">
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr>
                    <TH style={{ paddingLeft:16 }}>Class</TH>
                    <TH>Code</TH>
                    <TH>Used / Total</TH>
                    <TH style={{ paddingRight:16 }}>Utilization</TH>
                  </tr>
                </thead>
                <tbody>
                  {classWiseUtilization.map((c,i) => (
                    <tr key={i} className="ch-admin-row" style={{ background:'transparent' }}>
                      <TD style={{ paddingLeft:16 }}>{c.className}</TD>
                      <TD><Badge color={chartColor(i)}>{c.classCode}</Badge></TD>
                      <TD>{c.usedSlots} / {c.totalSlots}</TD>
                      <TD style={{ paddingRight:16 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ flex:1, height:6, borderRadius:99, background:T.surfaceMuted, overflow:'hidden' }}>
                            <div style={{ height:'100%', borderRadius:99, width:`${c.utilizationRate}%`, background:`linear-gradient(90deg,${T.accent}99,${T.accent})` }}/>
                          </div>
                          <span style={{ fontSize:12, fontWeight:700, color:T.text, minWidth:36, textAlign:'right', fontVariantNumeric:'tabular-nums' }}>{c.utilizationRate}%</span>
                        </div>
                      </TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        )}
      </div>
    );
  };

  const renderTeacherWorkload = () => {
    const { workloadByTeacher=[], distributionChartData=[], averageHours=0, overloadedTeachers=[], totalTeachers=0 } = reportData || {};
    const workloadColor = (status) => status==='overloaded'?T.red:status==='high'?T.amber:status==='normal'?T.green:T.blue;
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
          <MetricTile label="Teachers"    value={totalTeachers}              color={T.accent} icon="teacher" delay={0} />
          <MetricTile label="Avg hrs/wk"  value={averageHours}               color={T.blue}   icon="progress" delay={60} />
          <MetricTile label="Overloaded"  value={overloadedTeachers.length}  color={T.red}    icon="alert"  delay={120} />
          <MetricTile label="Max Hours"   value={workloadByTeacher[0]?.weeklyHours||0} color={T.amber} icon="calendar" delay={180} />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr', gap:16 }}>
          <ChartCard title="Hours per Teacher" subtitle="Weekly teaching load distribution">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={workloadByTeacher.slice(0,12)} layout="vertical" barSize={14}>
                <CartesianGrid strokeDasharray="2 4" stroke={T.divider} horizontal={false} />
                <XAxis type="number" unit="h" tick={CHART_FONT} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={110} tick={{ ...CHART_FONT, fontSize:10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip formatter={(v) => `${v} hrs`} />} />
                <Bar dataKey="weeklyHours" radius={[0,6,6,0]} name="Weekly Hours">
                  {workloadByTeacher.slice(0,12).map((e,i) => <Cell key={i} fill={workloadColor(e.status)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Workload Distribution" subtitle="By load category">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={distributionChartData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={80} innerRadius={40} paddingAngle={3}>
                  {distributionChartData.map((e,i) => <Cell key={i} fill={e.color || chartColor(i)} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize:11, fontFamily:T.font, color:T.text3, paddingTop:8 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        {workloadByTeacher.length > 0 && (
          <ChartCard title="Teacher Detail">
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr>
                    <TH style={{ paddingLeft:16 }}>Teacher</TH>
                    <TH>Hrs/Wk</TH>
                    <TH>Avg/Day</TH>
                    <TH>Subjects</TH>
                    <TH>Classes</TH>
                    <TH>Max Consec.</TH>
                    <TH style={{ paddingRight:16 }}>Status</TH>
                  </tr>
                </thead>
                <tbody>
                  {workloadByTeacher.map((t,i) => (
                    <tr key={i} className="ch-admin-row" style={{ background:'transparent' }}>
                      <TD style={{ paddingLeft:16, fontWeight:600 }}>{t.name}</TD>
                      <TD><span style={{ fontSize:16, fontWeight:700, color:T.text, fontVariantNumeric:'tabular-nums' }}>{t.weeklyHours}</span></TD>
                      <TD>{t.avgDailyHours}</TD>
                      <TD>{t.subjectCount}</TD>
                      <TD>{t.classCount}</TD>
                      <TD>{t.maxConsecutive}</TD>
                      <TD style={{ paddingRight:16 }}><StatusBadge status={t.status} /></TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        )}
      </div>
    );
  };

  const renderRoomUsage = () => {
    const { chartData=[], overallUtilization=0, totalRooms=0, underutilizedRooms=[] } = reportData || {};
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
          <MetricTile label="Utilization"    value={`${overallUtilization}%`}   color={C.teal}  icon="room"    delay={0} />
          <MetricTile label="Total Rooms"    value={totalRooms}                  color={T.blue}  icon="room"    delay={60} />
          <MetricTile label="Underutilized"  value={underutilizedRooms.length}   color={T.amber} icon="alert"   delay={120} />
        </div>
        <ChartCard title="Room Utilization" subtitle="Percentage of timetable slots used per room">
          <ResponsiveContainer width="100%" height={Math.max(280, chartData.length * 28)}>
            <BarChart data={chartData} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="2 4" stroke={T.divider} horizontal={false} />
              <XAxis type="number" unit="%" domain={[0,100]} tick={CHART_FONT} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={100} tick={{ ...CHART_FONT, fontSize:10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip formatter={(v) => `${v}%`} />} />
              <Bar dataKey="utilization" radius={[0,6,6,0]} name="Utilization">
                {chartData.map((e,i) => <Cell key={i} fill={e.utilization<30?T.amber:e.utilization<60?C.teal:T.green} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    );
  };

  const renderProgressTracking = () => {
    const { progressData=[], statusDistribution=[], averageCompletion=0, totalSubjects=0, behindSchedule=[], atRisk=[] } = reportData || {};
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
          <MetricTile label="Avg Completion"  value={`${averageCompletion}%`}  color={T.green}  icon="progress" delay={0} />
          <MetricTile label="Subjects"        value={totalSubjects}             color={T.blue}   icon="subject"  delay={60} />
          <MetricTile label="Behind Schedule" value={behindSchedule.length}     color={T.red}    icon="alert"    delay={120} />
          <MetricTile label="At Risk"         value={atRisk.length}             color={T.amber}  icon="alert"    delay={180} />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1.4fr', gap:16 }}>
          <ChartCard title="Compliance Distribution" subtitle="Subject status breakdown">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusDistribution} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={80} innerRadius={40} paddingAngle={3}>
                  {statusDistribution.map((e,i) => <Cell key={i} fill={e.color || chartColor(i)} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize:11, fontFamily:T.font, color:T.text3, paddingTop:8 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Completion by Subject" subtitle="Top 10 subjects">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={progressData.slice(0,10)} barSize={18}>
                <CartesianGrid strokeDasharray="2 4" stroke={T.divider} vertical={false} />
                <XAxis dataKey="subjectName" tick={{ ...CHART_FONT, fontSize:9 }} angle={-20} height={50} axisLine={false} tickLine={false} />
                <YAxis unit="%" domain={[0,100]} tick={CHART_FONT} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip formatter={(v) => `${v}%`} />} />
                <Bar dataKey="completionPercentage" radius={[6,6,0,0]} name="Completion">
                  {progressData.slice(0,10).map((e,i) => <Cell key={i} fill={e.complianceStatus==='behind'?T.red:e.complianceStatus==='at_risk'?T.amber:e.complianceStatus==='ahead'?T.green:T.blue} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        {progressData.length > 0 && (
          <ChartCard title="Subject Progress Detail">
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr>
                    <TH style={{ paddingLeft:16 }}>Class</TH>
                    <TH>Subject</TH>
                    <TH>Teacher</TH>
                    <TH>Progress</TH>
                    <TH>Hours</TH>
                    <TH style={{ paddingRight:16 }}>Status</TH>
                  </tr>
                </thead>
                <tbody>
                  {progressData.map((p,i) => (
                    <tr key={i} className="ch-admin-row" style={{ background:'transparent' }}>
                      <TD style={{ paddingLeft:16 }}>{p.className}</TD>
                      <TD style={{ fontWeight:600 }}>{p.subjectName}</TD>
                      <TD>{p.teacherName}</TD>
                      <TD>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:80, height:6, borderRadius:99, background:T.surfaceMuted, overflow:'hidden' }}>
                            <div style={{ height:'100%', borderRadius:99, width:`${Math.min(p.completionPercentage||0,100)}%`, background:p.complianceStatus==='behind'?T.red:p.complianceStatus==='at_risk'?T.amber:p.complianceStatus==='ahead'?T.green:T.blue }}/>
                          </div>
                          <span style={{ fontSize:11, fontWeight:700, color:T.text, fontVariantNumeric:'tabular-nums' }}>{p.completionPercentage}%</span>
                        </div>
                      </TD>
                      <TD style={{ color:T.text3 }}>{p.conductedHours}/{p.totalRequiredHours}</TD>
                      <TD style={{ paddingRight:16 }}><StatusBadge status={p.complianceStatus} /></TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        )}
      </div>
    );
  };

  const renderAttendance = () => {
    const { overallAttendance=0, totalSessions=0, bySubject=[], byDay=[], trends=[], lowAttendanceSessions=[] } = reportData || {};
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
          <MetricTile label="Avg Attendance"   value={`${overallAttendance}%`}        color={T.amber} icon="calendar" delay={0} />
          <MetricTile label="Total Sessions"   value={totalSessions}                   color={T.blue}  icon="check"   delay={60} />
          <MetricTile label="Low Attendance"   value={lowAttendanceSessions.length}    color={T.red}   icon="alert"   delay={120} />
          <MetricTile label="Classes Tracked"  value={reportData?.byClass?.length||0}  color={T.green} icon="class"   delay={180} />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <ChartCard title="Attendance by Subject" subtitle="Top 10 subjects">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={bySubject.slice(0,10)} barSize={18}>
                <CartesianGrid strokeDasharray="2 4" stroke={T.divider} vertical={false} />
                <XAxis dataKey="name" tick={{ ...CHART_FONT, fontSize:9 }} angle={-20} height={50} axisLine={false} tickLine={false} />
                <YAxis unit="%" domain={[0,100]} tick={CHART_FONT} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip formatter={(v) => `${v}%`} />} />
                <Bar dataKey="attendance" radius={[6,6,0,0]} name="Attendance">
                  {bySubject.slice(0,10).map((e,i) => <Cell key={i} fill={e.attendance<75?T.red:T.green} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Attendance Trend" subtitle="Monthly trend">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={T.amber} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={T.amber} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke={T.divider} vertical={false} />
                <XAxis dataKey="month" tick={CHART_FONT} axisLine={false} tickLine={false} />
                <YAxis unit="%" domain={[0,100]} tick={CHART_FONT} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip formatter={(v) => `${v}%`} />} />
                <Area type="monotone" dataKey="attendance" stroke={T.amber} strokeWidth={2.5} fill="url(#attGrad)" name="Attendance" dot={{ r:3, fill:T.amber }} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <ChartCard title="Attendance by Day" subtitle="Weekday comparison">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byDay} barSize={36}>
              <CartesianGrid strokeDasharray="2 4" stroke={T.divider} vertical={false} />
              <XAxis dataKey="day" tick={CHART_FONT} axisLine={false} tickLine={false} />
              <YAxis unit="%" domain={[0,100]} tick={CHART_FONT} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip formatter={(v) => `${v}%`} />} />
              <Bar dataKey="attendance" radius={[6,6,0,0]} name="Attendance">
                {byDay.map((_,i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        {lowAttendanceSessions.length > 0 && (
          <ChartCard title="Low Attendance Sessions" subtitle="Sessions below 75%">
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr>
                    <TH style={{ paddingLeft:16 }}>Date</TH>
                    <TH>Class</TH>
                    <TH>Subject</TH>
                    <TH>Teacher</TH>
                    <TH style={{ paddingRight:16 }}>Attendance</TH>
                  </tr>
                </thead>
                <tbody>
                  {lowAttendanceSessions.map((s,i) => (
                    <tr key={i} className="ch-admin-row" style={{ background:'transparent' }}>
                      <TD style={{ paddingLeft:16 }}>{new Date(s.date).toLocaleDateString()}</TD>
                      <TD>{s.className}</TD>
                      <TD style={{ fontWeight:600 }}>{s.subjectName}</TD>
                      <TD>{s.teacherName}</TD>
                      <TD style={{ paddingRight:16 }}>
                        <span style={{ fontWeight:700, color:T.red }}>{s.attendance}%</span>
                        <span style={{ color:T.text4, fontSize:11 }}> ({s.present}/{s.total})</span>
                      </TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        )}
      </div>
    );
  };

  const renderPerformanceOverview = () => {
    const { performanceData=[], averageScore=0, topPerformers=[], needsImprovement=[], chartData=[], totalTeachers=0 } = reportData || {};
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
          <MetricTile label="Avg Score"         value={averageScore}           color={T.accent} icon="rating"   delay={0} />
          <MetricTile label="Teachers"          value={totalTeachers}          color={T.blue}   icon="teacher"  delay={60} />
          <MetricTile label="Top Performers"    value={topPerformers.length}   color={T.green}  icon="check"    delay={120} />
          <MetricTile label="Needs Improvement" value={needsImprovement.length}color={T.red}    icon="alert"    delay={180} />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:16 }}>
          <ChartCard title="Performance Scores" subtitle="Top 10 teachers">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData.slice(0,10)} layout="vertical" barSize={14}>
                <CartesianGrid strokeDasharray="2 4" stroke={T.divider} horizontal={false} />
                <XAxis type="number" domain={[0,100]} tick={CHART_FONT} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={120} tick={{ ...CHART_FONT, fontSize:10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="score" radius={[0,6,6,0]} name="Score">
                  {chartData.slice(0,10).map((e,i) => <Cell key={i} fill={e.score>=70?T.green:e.score>=50?T.amber:T.red} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          {topPerformers.length > 0 && (
            <ChartCard title="Top Performer Breakdown" subtitle={topPerformers[0]?.name}>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={[
                  { m:'Rating',     v:(topPerformers[0].avgRating/5)*100 },
                  { m:'Completion', v:topPerformers[0].avgCompletion },
                  { m:'Attendance', v:topPerformers[0].avgAttendance },
                  { m:'Adherence',  v:topPerformers[0].adherence },
                  { m:'Overall',    v:topPerformers[0].performanceScore },
                ]}>
                  <PolarGrid stroke={T.divider} />
                  <PolarAngleAxis dataKey="m" tick={{ ...CHART_FONT, fontSize:10 }} />
                  <PolarRadiusAxis domain={[0,100]} tick={{ ...CHART_FONT, fontSize:9 }} />
                  <Radar dataKey="v" stroke={T.accent} fill={T.accent} fillOpacity={0.18} name="Score" />
                  <Tooltip content={<ChartTooltip formatter={(v) => `${v?.toFixed(1)}`} />} />
                </RadarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </div>
        {performanceData.length > 0 && (
          <ChartCard title="All Teacher Performance">
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr>
                    <TH style={{ paddingLeft:16 }}>#</TH>
                    <TH>Teacher</TH>
                    <TH>Rating</TH>
                    <TH>Completion</TH>
                    <TH>Attendance</TH>
                    <TH>Adherence</TH>
                    <TH style={{ paddingRight:16 }}>Score</TH>
                  </tr>
                </thead>
                <tbody>
                  {performanceData.map((t,i) => (
                    <tr key={i} className="ch-admin-row" style={{ background:'transparent' }}>
                      <TD style={{ paddingLeft:16, color:T.text4 }}>{i+1}</TD>
                      <TD style={{ fontWeight:600 }}>{t.name}</TD>
                      <TD><span style={{ fontWeight:600 }}>{t.avgRating}</span><span style={{ color:T.text4, fontSize:11 }}> ★ ({t.totalRatings})</span></TD>
                      <TD>{t.avgCompletion}%</TD>
                      <TD>{t.avgAttendance}%</TD>
                      <TD>{t.adherence}%</TD>
                      <TD style={{ paddingRight:16 }}>
                        <span style={{
                          padding:'3px 10px', borderRadius:99, fontSize:12, fontWeight:700,
                          color: t.performanceScore>=70?T.green:t.performanceScore>=50?T.amber:T.red,
                          background: t.performanceScore>=70?T.greenSoft:t.performanceScore>=50?T.amberSoft:T.redSoft,
                        }}>{t.performanceScore}</span>
                      </TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (!reportData) return null;
    switch (reportType) {
      case 'timetable_utilization': return renderTimetableUtil();
      case 'teacher_workload':      return renderTeacherWorkload();
      case 'room_usage':            return renderRoomUsage();
      case 'progress_tracking':     return renderProgressTracking();
      case 'attendance_analytics':  return renderAttendance();
      case 'performance_overview':  return renderPerformanceOverview();
      default: return null;
    }
  };

  const activeCfg = REPORT_TYPES.find(r => r.key === reportType);

  return (
    <div style={{ padding:'0 28px', display:'flex', flexDirection:'column', gap:16 }}>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}

      {/* Report type selector */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {REPORT_TYPES.map(rt => {
          const active = rt.key === reportType;
          return (
            <button
              key={rt.key}
              onClick={() => { setReportType(rt.key); setReportData(null); setReportId(null); }}
              style={{
                display:'flex', alignItems:'center', gap:7,
                padding:'9px 16px', borderRadius:12,
                border: active ? 'none' : `1px solid ${T.border}`,
                background: active ? `linear-gradient(135deg,${rt.color}22,${rt.color}14)` : T.surface,
                color: active ? rt.color : T.text3,
                fontSize:12.5, fontWeight: active ? 700 : 500,
                cursor:'pointer', fontFamily:T.font, letterSpacing:'-0.01em',
                boxShadow: active ? T.shadowCard : 'none',
                transition:`all 200ms ${T.ease}`,
              }}
            >
              <ChIcon name={rt.icon} size={13} />
              {rt.label}
            </button>
          );
        })}
      </div>

      {/* Filter + Generate bar */}
      <div style={{
        background:T.surface, border:`1px solid ${T.border}`,
        borderRadius:18, padding:'16px 20px',
        boxShadow:T.shadowCard,
        display:'flex', alignItems:'flex-end', gap:14, flexWrap:'wrap',
      }}>
        <Field label="Academic Year">
          <Input value={acYear} onChange={e=>setAcYear(e.target.value)} placeholder="e.g. 2025-26" style={{ width:140 }} />
        </Field>
        <Field label="Semester">
          <Select value={semester} onChange={e=>setSemester(e.target.value)} style={{ width:140 }}>
            <option value="">All semesters</option>
            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
          </Select>
        </Field>
        <div style={{ marginLeft:'auto', display:'flex', gap:10, alignItems:'center' }}>
          {reportId && (
            <>
              <GhostBtn onClick={()=>exportReport('csv')} icon="report">CSV</GhostBtn>
              <GhostBtn onClick={()=>exportReport('excel')} icon="report">Excel</GhostBtn>
            </>
          )}
          <PrimaryBtn onClick={generate} disabled={loading} icon="bolt">
            {loading ? 'Generating…' : 'Generate Report'}
          </PrimaryBtn>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding:'12px 16px', borderRadius:12, background:T.redSoft, border:`1px solid ${T.red}33`, color:T.red, fontSize:13, fontWeight:500, display:'flex', alignItems:'center', gap:8 }}>
          <ChIcon name="alert" size={14} />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:20, boxShadow:T.shadowCard }}>
          <Spinner text="Generating report…" />
        </div>
      )}

      {/* Summary banner */}
      {!loading && reportData && summary?.keyMetrics && (
        <div style={{
          background:`linear-gradient(135deg,${T.accent}22 0%,${T.accent2}12 100%)`,
          border:`1px solid ${T.accentBorder}`,
          borderRadius:20, padding:'18px 22px',
          animation:'admin-fade-up 400ms cubic-bezier(0.16,1,0.3,1) both',
        }}>
          <div style={{ fontSize:13, fontWeight:700, color:T.accent, marginBottom:12, letterSpacing:'-0.01em', display:'flex', alignItems:'center', gap:6 }}>
            <ChIcon name={activeCfg?.icon || 'report'} size={14} />
            {activeCfg?.label} — Summary
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:12 }}>
            {Object.entries(summary.keyMetrics).map(([k,v]) => (
              <div key={k}>
                <div style={{ fontSize:10.5, color:T.text3, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>
                  {k.replace(/([A-Z])/g,' $1').trim()}
                </div>
                <div style={{ fontSize:22, fontWeight:700, color:T.text, letterSpacing:'-0.04em', fontVariantNumeric:'tabular-nums' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      {!loading && reportData && renderContent()}

      {/* Empty state */}
      {!loading && !reportData && (
        <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:20, boxShadow:T.shadowCard }}>
          <EmptyState
            icon={activeCfg?.icon || 'report'}
            message={`${activeCfg?.label} Report`}
            subtext="Configure filters above and click Generate Report to visualize your data."
          />
        </div>
      )}

      {/* Recent Reports */}
      {recent.length > 0 && (
        <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:20, padding:'18px 20px', boxShadow:T.shadowCard }}>
          <div style={{ fontSize:14, fontWeight:700, color:T.text, marginBottom:14, letterSpacing:'-0.025em' }}>Recent Reports</div>
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {recent.map(r => {
              const cfg = REPORT_TYPES.find(rt => rt.key === r.reportType);
              return (
                <div key={r._id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 8px', borderRadius:10, cursor:'pointer', transition:`background 200ms ${T.ease}` }}
                  className="ch-admin-row"
                  onClick={() => loadSaved(r._id)}>
                  <div style={{ width:32, height:32, borderRadius:9, background:`${cfg?.color||T.accent}18`, color:cfg?.color||T.accent, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <ChIcon name={cfg?.icon||'report'} size={14} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:T.text, letterSpacing:'-0.02em', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.title}</div>
                    <div style={{ fontSize:11, color:T.text3, marginTop:2 }}>
                      {new Date(r.createdAt).toLocaleString()}
                      {r.generatedBy && ` · ${r.generatedBy.firstName} ${r.generatedBy.lastName}`}
                    </div>
                  </div>
                  <button onClick={e=>{ e.stopPropagation(); deleteRecent(r._id); }} style={{ background:'none', border:'none', cursor:'pointer', color:T.text4, display:'flex', padding:4, borderRadius:6, fontFamily:'inherit' }}
                    onMouseEnter={e=>e.currentTarget.style.color=T.red}
                    onMouseLeave={e=>e.currentTarget.style.color=T.text4}>
                    <ChIcon name="trash" size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsTab;
