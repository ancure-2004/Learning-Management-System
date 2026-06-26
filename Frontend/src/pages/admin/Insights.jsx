/**
 * Insights.jsx — Chronos Admin
 * ─────────────────────────────────────────────────────────────────────────
 * Three Insights tabs merged in one page:
 *   Reports     — Generate & visualize 6 report types (Recharts-powered)
 *   Progress    — Class-wise syllabus coverage tracking
 *   Performance — Teacher rating analytics
 *
 * Routes /reports, /progress-dashboard, /teacher-performance all render
 * this component with the matching defaultTab prop.
 * ─────────────────────────────────────────────────────────────────────────
 */
import React, { useState } from 'react';
import { theme } from '@/theme';
import AdminLayout, { Tabs } from '@/layouts/AdminLayout';
import ReportsTab from './components/ReportsTab';
import ProgressTab from './components/ProgressTab';
import PerformanceTab from './components/PerformanceTab';

const T = theme;

/* ═══════════════════════════════════════════════════════════════
   PAGE ROOT
   ═══════════════════════════════════════════════════════════════ */
const Insights = ({ defaultTab = 'reports' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <AdminLayout
      title="Insights"
      subtitle="Reports, progress tracking and teacher performance analytics"
    >
      {/* Tab strip */}
      <div style={{ padding:'0 28px 22px' }}>
        <Tabs
          active={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id:'reports',     label:'Reports',     icon:'report'   },
            { id:'progress',    label:'Progress',    icon:'progress' },
            { id:'performance', label:'Performance', icon:'rating'   },
          ]}
        />
      </div>

      {activeTab === 'reports'     && <ReportsTab />}
      {activeTab === 'progress'    && <ProgressTab />}
      {activeTab === 'performance' && <PerformanceTab />}
    </AdminLayout>
  );
};

export default Insights;
