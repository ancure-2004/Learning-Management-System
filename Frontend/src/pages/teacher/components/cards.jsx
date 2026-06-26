import React from 'react';
import { theme as T } from '@/theme';
import I from '@/components/Icon';
import { Card, FilterPill, CardTitle, KpiTile, SyllabusRing } from './ui';

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   HERO STRIP
   This is the teacher's signature element. Unlike the admin's
   greeting + KPIs split or the student's compact KPI capsules,
   the teacher gets a full-width hero with the next class front
   and center, plus action buttons (Mark Attendance, Log Session).
   The teacher's day is anchored by lectures, so the lecture is
   the focal element of the dashboard.
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export const HeroStrip = ({ teacher, nextClass, kpis }) => {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="ch-hero" style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1.8fr) minmax(280px, 1fr)',
      gap: 14, marginBottom: 14,
    }}>
      {/* LEFT: Up Next lecture â€” a striking dark gradient card.
         Inverts the surface palette to make the day's focus pop
         against the rest of the white card grid below. */}
      <div style={{
        position: 'relative',
        borderRadius: 28,
        padding: '22px 26px',
        background: `linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)`,
        color: '#fff',
        boxShadow: '0 4px 14px rgba(76, 29, 149, 0.20), 0 18px 44px rgba(30, 27, 75, 0.30), 0 1px 0 rgba(255,255,255,0.10) inset',
        overflow: 'hidden',
        minHeight: 168,
      }}>
        {/* Decorative sparkles in the corner â€” subtle visual interest */}
        <div style={{ position: 'absolute', top: 16, right: 22, color: '#a78bfa' }}>
          <span className="ch-sparkle" style={{ display: 'inline-block' }}>
            <I name="sparkle" size={20} />
          </span>
        </div>
        {/* Soft radial glow behind text */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(167,139,250,0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative' }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: '#c4b5fd',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            marginBottom: 8,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span className="ch-pulse-dot" style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#a78bfa',
              boxShadow: '0 0 8px rgba(167,139,250,0.8)',
            }} />
            {greeting}, {teacher?.firstName || 'Professor'}
          </div>

          {nextClass ? (
            <>
              <div style={{
                fontSize: 12, fontWeight: 600, color: '#a78bfa',
                marginBottom: 4, letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>
                Up next Â· in {nextClass.startsIn}
              </div>
              <h1 style={{
                margin: 0, marginBottom: 8,
                fontSize: 28, fontWeight: 700,
                letterSpacing: '-0.04em', lineHeight: 1.1,
              }}>
                {nextClass.subject}
              </h1>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 16,
                fontSize: 13, color: '#c4b5fd',
                fontWeight: 500, letterSpacing: '-0.005em',
                marginBottom: 16,
                flexWrap: 'wrap',
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <I name="clock" size={13} /> {nextClass.time} â€“ {nextClass.endTime}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <I name="class" size={13} /> {nextClass.className}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <I name="room" size={13} /> {nextClass.room}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <I name="teacher" size={13} /> {nextClass.studentCount} students
                </span>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="ch-cta-btn" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '9px 16px',
                  background: '#fff',
                  color: T.text,
                  border: 'none', borderRadius: 10,
                  fontSize: 13, fontWeight: 700,
                  letterSpacing: '-0.015em',
                  cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.20), 0 1px 0 rgba(255,255,255,0.2) inset',
                }}
                  onClick={() => window.location.href = '/mark-attendance'}
                >
                  <I name="check" size={14} />
                  Mark Attendance
                </button>
                <button className="ch-cta-btn" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '9px 16px',
                  background: 'rgba(255,255,255,0.12)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: 10,
                  fontSize: 13, fontWeight: 700,
                  letterSpacing: '-0.015em',
                  cursor: 'pointer', fontFamily: 'inherit',
                  backdropFilter: 'blur(8px)',
                }}>
                  <I name="log" size={14} />
                  Log Session
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 style={{
                margin: 0, marginBottom: 6,
                fontSize: 26, fontWeight: 700,
                letterSpacing: '-0.04em', lineHeight: 1.1,
              }}>
                No more classes today
              </h1>
              <div style={{
                fontSize: 13, color: '#c4b5fd', fontWeight: 500,
              }}>
                Time to grade some assignments or update syllabus coverage.
              </div>
            </>
          )}
        </div>
      </div>

      {/* RIGHT: stacked KPI tiles â€” vertical instead of capsules.
         Three small white cards stacked with metric + trend.
         A different shape than student's horizontal capsules so
         the dashboards don't feel templated. */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <KpiTile
          icon="class"
          label="My Classes"
          value={kpis.classes}
          color={T.accent}
        />
        <KpiTile
          icon="grade"
          label="To Grade"
          value={kpis.toGrade}
          color={T.amber}
          urgent={kpis.toGrade > 5}
        />
        <KpiTile
          icon="star"
          label="Avg Rating"
          value={kpis.rating}
          suffix=" / 5"
          color={T.green}
        />
      </div>
    </div>
  );
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   TODAY'S SCHEDULE â€” horizontal timeline (different from student's
   vertical list). Each lecture is a mini card in a horizontal
   strip, scrollable if needed. Visual emphasis on the time block.
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export const TodayScheduleCard = ({ classes }) => {
  const statusStyles = {
    completed: { bg: T.surfaceMuted, fg: T.text3, border: T.border, label: 'Done' },
    current:   { bg: T.accentSoft,   fg: T.accent, border: T.accentBorder, label: 'In progress' },
    upcoming:  { bg: T.blueSoft,     fg: T.blue,   border: T.blue + '40', label: 'Upcoming' },
  };

  return (
    <Card style={{ flex: 1, padding: '18px 20px' }}>
      <CardTitle
        right={
          <span style={{
            fontSize: 11.5, color: T.text3, fontWeight: 500,
            letterSpacing: '-0.005em',
          }}>
            {classes.length} {classes.length === 1 ? 'lecture' : 'lectures'} today
          </span>
        }
      >
        Today's Schedule
      </CardTitle>

      {/* Horizontal scrolling strip â€” different from student's vertical list */}
      <div style={{
        display: 'flex', gap: 10,
        overflowX: 'auto',
        paddingBottom: 4,
        margin: '0 -2px', padding: '0 2px 4px',
      }}>
        {classes.length === 0 ? (
          <div style={{
            padding: '30px', textAlign: 'center', color: T.text3,
            fontSize: 13, fontWeight: 500, width: '100%',
          }}>
            No lectures scheduled today
          </div>
        ) : classes.map((c, i) => {
          const s = statusStyles[c.status] || statusStyles.upcoming;
          const isCurrent = c.status === 'current';
          return (
            <div key={i} className="ch-class-tile" style={{
              minWidth: 200, flex: '0 0 200px',
              background: isCurrent ? T.accentSoft + '60' : T.surface,
              border: `1px solid ${isCurrent ? T.accentBorder : T.border}`,
              borderRadius: 16,
              padding: '12px 14px',
              cursor: 'pointer',
              opacity: c.status === 'completed' ? 0.65 : 1,
              boxShadow: isCurrent
                ? `0 4px 14px ${T.accent}28, 0 1px 0 rgba(255,255,255,0.7) inset`
                : T.shadowSoft,
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              {/* Time + status pill row */}
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{
                  fontSize: 14, fontWeight: 700, color: T.text,
                  letterSpacing: '-0.03em',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {c.time}
                  <span style={{
                    fontSize: 11, color: T.text3, fontWeight: 500,
                    marginLeft: 5, letterSpacing: '0',
                  }}>
                    â€“ {c.endTime}
                  </span>
                </div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '3px 7px', borderRadius: 99,
                  background: s.bg, color: s.fg,
                  fontSize: 9.5, fontWeight: 700, letterSpacing: '0.005em',
                  border: `1px solid ${s.border}`,
                  textTransform: 'uppercase',
                }}>
                  {isCurrent && (
                    <span className="ch-pulse-dot" style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: s.fg,
                    }} />
                  )}
                  {s.label}
                </span>
              </div>

              {/* Subject â€” title */}
              <div style={{
                fontSize: 13.5, fontWeight: 700, color: T.text,
                letterSpacing: '-0.025em',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                textDecoration: c.status === 'completed' ? 'line-through' : 'none',
                textDecorationColor: T.text4,
              }}>
                {c.subject}
              </div>

              {/* Class + room footer */}
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 11, color: T.text3, fontWeight: 500,
                letterSpacing: '-0.005em',
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <I name="class" size={11} /> {c.className}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <I name="room" size={11} /> {c.room}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MY CLASSES GRID â€” a teacher's classes as compact cards with
   syllabus-coverage rings. Different visual primitive entirely:
   each class card has a colored avatar circle, name, students,
   and a circular progress ring showing syllabus completion.
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export const MyClassesCard = ({ classes }) => (
  <Card style={{ flex: 1, padding: '18px 20px' }}>
    <CardTitle
      right={<FilterPill label="This term" />}
      subtitle={`${classes.length} active sections`}
    >
      My Classes
    </CardTitle>

    {/* 2-column grid of class tiles â€” tighter than admin/student lists */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 10,
      flex: 1, minHeight: 0,
      overflowY: 'auto',
    }}>
      {classes.map((c, i) => {
        // Per-class color, rotated through palette so each tile is distinguishable
        const colors = [T.accent, T.blue, T.green, T.amber];
        const color = colors[i % colors.length];
        return (
          <button key={i} className="ch-class-tile" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px',
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 16,
            cursor: 'pointer',
            textAlign: 'left', fontFamily: 'inherit',
            boxShadow: T.shadowSoft,
            minWidth: 0,
          }}>
            {/* Subject avatar â€” colored circle with initials */}
            <div style={{
              width: 38, height: 38, borderRadius: 11,
              background: `linear-gradient(135deg, ${color}, ${color}cc)`,
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              fontSize: 13, fontWeight: 700, letterSpacing: '-0.02em',
              boxShadow: `0 4px 10px ${color}40, 0 1px 0 rgba(255,255,255,0.4) inset`,
            }}>
              {c.subjectInitials}
            </div>

            {/* Subject + class meta */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 12.5, fontWeight: 700, color: T.text,
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {c.subject}
              </div>
              <div style={{
                fontSize: 10.5, color: T.text3, marginTop: 1,
                fontWeight: 500, letterSpacing: '-0.005em',
              }}>
                {c.className} Â· {c.studentCount} students
              </div>
            </div>

            {/* Syllabus coverage ring */}
            <SyllabusRing percent={c.syllabusPercent} size={42} color={color} />
          </button>
        );
      })}
    </div>
  </Card>
);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   GRADING QUEUE â€” list of submissions waiting for teacher review.
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export const GradingQueueCard = ({ items }) => (
  <Card style={{ flex: 1, padding: '18px 20px' }}>
    <CardTitle
      right={
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '4px 9px', borderRadius: 99,
          background: T.amberSoft, color: T.amber,
          fontSize: 11, fontWeight: 700, letterSpacing: '-0.005em',
          border: `1px solid ${T.amber}38`,
        }}>
          {items.reduce((sum, it) => sum + it.count, 0)} submissions
        </span>
      }
    >
      Grading Queue
    </CardTitle>

    <div style={{
      flex: 1, overflowY: 'auto',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      {items.length === 0 ? (
        <div style={{
          padding: '30px 20px', textAlign: 'center',
          color: T.text3, fontSize: 13, fontWeight: 500,
        }}>
          <I name="check" size={22} />
          <div style={{ marginTop: 8 }}>No pending submissions</div>
        </div>
      ) : items.map((item, i) => (
        <button key={i} className="ch-row-btn" style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 12px', borderRadius: 12,
          background: 'transparent', border: 'none',
          cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
        }}>
          {/* Count badge â€” number front and center, this is the headline */}
          <div style={{
            width: 44, flexShrink: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center',
          }}>
            <div style={{
              fontSize: 18, fontWeight: 700, color: T.text,
              letterSpacing: '-0.04em', lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {item.count}
            </div>
            <div style={{
              fontSize: 9, fontWeight: 600, color: T.text4,
              letterSpacing: '0.05em',
              marginTop: 3, textTransform: 'uppercase',
            }}>
              {item.count === 1 ? 'item' : 'items'}
            </div>
          </div>

          {/* Title + class */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 13, fontWeight: 600, color: T.text,
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {item.title}
            </div>
            <div style={{
              fontSize: 11, color: T.text3, marginTop: 1,
              fontWeight: 500,
            }}>
              {item.className} Â· {item.type}
            </div>
          </div>

          {/* Days ago + grade pill */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{
              fontSize: 11, color: T.text3, fontWeight: 600,
              letterSpacing: '-0.005em',
            }}>
              {item.daysAgo}d ago
            </div>
          </div>

          <div className="ch-pill-btn" style={{
            padding: '5px 10px', borderRadius: 99,
            background: T.accentSoft, color: T.accent,
            fontSize: 11, fontWeight: 700, letterSpacing: '-0.005em',
            border: `1px solid ${T.accentBorder}`,
            flexShrink: 0,
          }}>Grade</div>
        </button>
      ))}
    </div>
  </Card>
);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   STUDENT WATCHLIST â€” at-risk students from teacher's classes.
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export const WatchlistCard = ({ students }) => {
  const statusColor = (status) => ({
    critical: T.red,
    warning:  T.amber,
    info:     T.blue,
  }[status] || T.text3);

  return (
    <Card style={{ flex: 1, padding: '18px 20px' }}>
      <CardTitle
        right={<FilterPill label="All risks" />}
        subtitle="Students needing attention"
      >
        Watchlist
      </CardTitle>

      <div style={{
        flex: 1, overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: 2,
      }}>
        {students.length === 0 ? (
          <div style={{
            padding: '30px 20px', textAlign: 'center',
            color: T.text3, fontSize: 13, fontWeight: 500,
          }}>All students are on track</div>
        ) : students.map((s, i) => {
          const c = statusColor(s.status);
          return (
            <button key={i} className="ch-row-btn" style={{
              display: 'flex', alignItems: 'center', gap: 11,
              padding: '9px 10px', borderRadius: 12,
              background: 'transparent', border: 'none',
              cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
            }}>
              {/* Student avatar â€” initial circle, colored by risk level */}
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: `linear-gradient(135deg, ${c}, ${c}cc)`,
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                fontSize: 11, fontWeight: 700, letterSpacing: '-0.02em',
                boxShadow: `0 3px 8px ${c}40, 0 1px 0 rgba(255,255,255,0.4) inset`,
              }}>
                {s.initials}
              </div>

              {/* Name + reason */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12.5, fontWeight: 600, color: T.text,
                  letterSpacing: '-0.02em',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {s.name}
                </div>
                <div style={{
                  fontSize: 10.5, color: T.text3, marginTop: 1,
                  fontWeight: 500,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {s.reason}
                </div>
              </div>

              {/* Metric */}
              <div style={{
                fontSize: 13, fontWeight: 700, color: c,
                letterSpacing: '-0.025em',
                fontVariantNumeric: 'tabular-nums',
                flexShrink: 0,
              }}>
                {s.metric}
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   TEACHING LOAD HEATMAP â€” a unique-to-teacher visualization.
   Shows the week (Mon-Fri Ã— 8 periods) with cell intensity = how
   loaded that slot is. Helps the teacher see their week at a glance.
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export const LoadHeatmap = ({ load }) => {
  // load is a 5x8 grid: load[day][period] = 0 (free), 1 (single class), 2 (lab), 3 (busy)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const periods = ['9', '10', '11', '12', '13', '14', '15', '16'];

  // Flatten and find max for normalization
  const maxLoad = Math.max(1, ...load.flat());

  const cellColor = (val) => {
    if (val === 0) return T.surfaceMuted;
    const intensity = val / maxLoad;
    // Lerp between accentSoft and accent based on intensity
    if (intensity <= 0.33) return T.accent + '24';
    if (intensity <= 0.66) return T.accent + '60';
    return T.accent;
  };

  return (
    <Card style={{ flex: 1, padding: '18px 20px' }}>
      <CardTitle
        right={<FilterPill label="This week" />}
        subtitle="Lectures per period"
      >
        Teaching Load
      </CardTitle>

      {/* Grid wrapper â€” flex:1 + minHeight:0 lets it claim remaining
         vertical space inside the card. The grid itself uses fixed-height
         rows so 5 days always fit cleanly without overflow. */}
      <div className="keep-grid" style={{
        flex: 1, minHeight: 0,
        display: 'grid',
        gridTemplateColumns: '36px repeat(8, 1fr)',
        gridTemplateRows: 'auto repeat(5, 1fr)',
        gap: 4,
        alignContent: 'start',
      }}>
        {/* Header row: empty + period labels */}
        <div />
        {periods.map((p, i) => (
          <div key={i} style={{
            fontSize: 9.5, fontWeight: 700, color: T.text4,
            letterSpacing: '0.05em', textAlign: 'center',
            padding: '4px 0',
          }}>{p}</div>
        ))}

        {/* Each row: day label + 8 cells */}
        {days.map((d, dayIdx) => (
          <React.Fragment key={d}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: T.text3,
              letterSpacing: '-0.005em',
              display: 'flex', alignItems: 'center',
              padding: '0 4px',
            }}>{d}</div>
            {periods.map((_, periodIdx) => {
              const val = load[dayIdx]?.[periodIdx] || 0;
              const color = cellColor(val);
              return (
                <div key={periodIdx} title={val ? `${val} lecture${val > 1 ? 's' : ''}` : 'Free'} style={{
                  /* No aspectRatio â€” cells stretch to fill the available
                     row height instead of forcing the grid taller than
                     the card. Caps via maxHeight as a safety. */
                  minHeight: 0, maxHeight: 38,
                  borderRadius: 7,
                  background: color,
                  border: val === 0 ? `1px solid ${T.border}` : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700,
                  color: val / maxLoad > 0.66 ? '#fff' : T.text2,
                  letterSpacing: '-0.02em',
                  cursor: 'default',
                  transition: 'transform 200ms ease',
                }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {val > 0 ? val : ''}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginTop: 12, paddingTop: 10,
        borderTop: `1px solid ${T.divider}`,
        fontSize: 10.5, color: T.text3, fontWeight: 500,
        letterSpacing: '-0.005em',
      }}>
        <span style={{ marginRight: 'auto' }}>Less</span>
        {[T.surfaceMuted, T.accent + '24', T.accent + '60', T.accent].map((color, i) => (
          <span key={i} style={{
            width: 12, height: 12, borderRadius: 4,
            background: color,
            border: i === 0 ? `1px solid ${T.border}` : 'none',
          }} />
        ))}
        <span>More</span>
      </div>
    </Card>
  );
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   RECENT FEEDBACK â€” student ratings/comments.
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export const FeedbackCard = ({ feedback, avgRating }) => {
  const stars = Math.round(avgRating);
  return (
    <Card style={{ flex: 1, padding: '18px 20px' }}>
      <CardTitle
        right={<FilterPill label="Recent" />}
        subtitle={`${feedback.length} new this week`}
      >
        Student Feedback
      </CardTitle>

      {/* Big rating display */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '12px 0',
        borderBottom: `1px solid ${T.divider}`,
        marginBottom: 12,
      }}>
        <div style={{
          fontSize: 36, fontWeight: 700, color: T.text,
          letterSpacing: '-0.05em', lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {avgRating.toFixed(1)}
        </div>
        <div>
          <div style={{
            display: 'flex', gap: 1, color: T.amber,
          }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} style={{
                opacity: i < stars ? 1 : 0.25,
              }}>
                <I name="star" size={14} />
              </span>
            ))}
          </div>
          <div style={{
            fontSize: 11, color: T.text3, fontWeight: 500,
            marginTop: 2, letterSpacing: '-0.005em',
          }}>
            Avg from {feedback.length * 5} ratings
          </div>
        </div>
      </div>

      {/* Comments list */}
      <div style={{
        flex: 1, overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {feedback.slice(0, 3).map((f, i) => (
          <div key={i} style={{
            padding: '10px 12px',
            background: T.surfaceMuted,
            borderRadius: 12,
            border: `1px solid ${T.border}`,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 5,
            }}>
              <div style={{ display: 'flex', gap: 1, color: T.amber }}>
                {Array.from({ length: 5 }).map((_, si) => (
                  <span key={si} style={{ opacity: si < f.rating ? 1 : 0.2 }}>
                    <I name="star" size={11} />
                  </span>
                ))}
              </div>
              <span style={{
                fontSize: 10.5, color: T.text4, fontWeight: 500,
              }}>{f.daysAgo}d ago</span>
            </div>
            <div style={{
              fontSize: 12, color: T.text2, fontWeight: 500,
              letterSpacing: '-0.005em', lineHeight: 1.4,
              fontStyle: f.comment ? 'italic' : 'normal',
            }}>
              {f.comment || 'No comment'}
            </div>
            <div style={{
              fontSize: 10, color: T.text3, fontWeight: 600,
              letterSpacing: '0.02em', marginTop: 4,
              textTransform: 'uppercase',
            }}>
              {f.className}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
