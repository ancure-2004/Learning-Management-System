/**
 * Schedule.jsx — Chronos Admin
 * ──────────────────────────────────────────────────────────────────────────
 * Three Scheduling tabs merged in one page:
 *   Assignments  — Teacher↔Class↔Subject mapping (one-time setup)
 *   Timetables   — Generate (one-click) · Drag-drop edit · Publish · History
 *   Calendar     — Academic calendar (holidays / exams / events)
 *
 * Routes /assign-subjects, /view-timetables, /academic-calendar, /schedule
 * all render this component with the matching defaultTab prop.
 *
 * Streamlined generation flow:
 *   Old → Pick class → Form → Click → Form → View → Edit → Publish (7 steps)
 *   New → Click "Generate" → Pick class card → Done (3 steps, then drag-drop edit)
 *
 * The three tabs live in ./components/schedule/* — this file is the tab router.
 * ──────────────────────────────────────────────────────────────────────────
 */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import classSubjectService from '@/services/classSubjectService';
import timetableService from '@/services/timetableService';
import calendarService from '@/services/calendarService';
import AdminLayout, { Tabs } from '@/layouts/AdminLayout';
import AssignmentsTab from './components/schedule/AssignmentsTab';
import TimetablesTab from './components/schedule/TimetablesTab';
import CalendarTab from './components/schedule/CalendarTab';

/* ═══════════════════════════════════════════════════════════════
   PAGE ROOT
   ═══════════════════════════════════════════════════════════════ */
const Schedule = ({ defaultTab = 'timetables' }) => {
  const params   = useParams();
  const [activeTab, setActiveTab] = useState(defaultTab);
  /* Pick up timetable id from URL (legacy /edit-timetable/:id) */
  const editId = params.id || null;
  const [pendingEditId, setPendingEditId] = useState(editId);

  /* Live counts for tab badges */
  const [counts, setCounts] = useState({ assignments: null, timetables: null, calendar: null });
  useEffect(() => {
    Promise.allSettled([
      classSubjectService.getAll(),
      timetableService.getAll(),
      calendarService.getAll(),
    ]).then(([a, t, c]) => {
      setCounts({
        assignments: a.status === 'fulfilled' ? a.value.length : null,
        timetables:  t.status === 'fulfilled' ? t.value.length : null,
        calendar:    c.status === 'fulfilled' ? c.value.length : null,
      });
    });
  }, []);

  /* If we entered via /edit-timetable/:id, open Timetables tab and clear URL */
  useEffect(() => {
    if (editId) {
      setActiveTab('timetables');
      setPendingEditId(editId);
    }
  }, [editId]);

  return (
    <AdminLayout
      title="Schedule"
      subtitle="Assignments, timetables and academic calendar in one place"
    >
      {/* Tabs */}
      <div style={{ padding: '0 28px 22px' }}>
        <Tabs
          active={activeTab}
          onChange={(id) => { setActiveTab(id); setPendingEditId(null); }}
          tabs={[
            { id: 'assignments', label: 'Assignments', icon: 'syllabus',  count: counts.assignments },
            { id: 'timetables',  label: 'Timetables',  icon: 'timetable', count: counts.timetables  },
            { id: 'calendar',    label: 'Calendar',    icon: 'calendar',  count: counts.calendar    },
          ]}
        />
      </div>

      {activeTab === 'assignments' && <AssignmentsTab />}
      {activeTab === 'timetables'  && <TimetablesTab initialEditId={pendingEditId} onEditClose={()=>setPendingEditId(null)} />}
      {activeTab === 'calendar'    && <CalendarTab />}
    </AdminLayout>
  );
};

export default Schedule;
