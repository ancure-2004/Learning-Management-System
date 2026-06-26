/**
 * StudentNoticesPage.jsx — Chronos Student
 * Notice board / announcements page.
 * No backend endpoint for notices yet — shows a placeholder.
 * Route: /student-notices
 */
import React from 'react';
import StudentLayout, {
  StudentCard, StudentEmptyState, StudentIcon,
} from '@/layouts/StudentLayout';

/*
 * Tailwind pilot — this page's inline styles were migrated to utility classes
 * backed by the @theme tokens in index.css (bg-accent-soft, border-accent-border,
 * text-accent, …). Non-standard sizes use arbitrary values (e.g. rounded-[14px]).
 */
const StudentNoticesPage = () => (
  <StudentLayout
    title="Notices"
    subtitle="Important announcements from your institution"
  >
    <div className="flex flex-col gap-4 px-7">
      {/* Coming-soon info banner */}
      <div className="flex items-center gap-2.5 rounded-[14px] border border-accent-border bg-accent-soft px-[18px] py-[14px] text-[13px] font-medium text-accent">
        <StudentIcon name="info" size={15} />
        <span>
          <strong>Coming soon:</strong> The notices board will show announcements, circulars, and
          important messages from your institution once the feature is enabled by your admin.
        </span>
      </div>

      <StudentCard>
        <StudentEmptyState
          icon="bell"
          message="No notices yet"
          subtext="Institutional notices and announcements will appear here once your admin publishes them."
        />
      </StudentCard>
    </div>
  </StudentLayout>
);

export default StudentNoticesPage;
