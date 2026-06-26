import React, { useState, useEffect } from 'react';
import { theme as T } from '@/theme';
import { Icon, ICONS } from './Icon';
import {
  GlassChip,
  GlassPanel,
  GlassCubeCalendar,
  GlassCubeBlocks,
  GlassCapsuleSparkle,
  GlassOrb,
  GlassDishWithCylinders,
} from './glass';

/* ═══════════════════════════════════════════════════════════════
   NAV — refined typography, deeper glass
   ═══════════════════════════════════════════════════════════════ */
export const Nav = ({ onLogin, onSignUp }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      padding: '14px 28px',
      background: scrolled ? 'rgba(238, 240, 245, 0.72)' : 'transparent',
      backdropFilter: scrolled ? 'blur(18px) saturate(160%)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(18px) saturate(160%)' : 'none',
      borderBottom: scrolled ? `1px solid ${T.border}` : '1px solid transparent',
      transition: 'all 0.3s ' + T.ease,
    }}>
      <div style={{
        maxWidth: 1240, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px ' + T.accentGlow + ', 0 1px 0 rgba(255,255,255,0.25) inset',
            color: 'white',
          }}>
            <Icon d={ICONS.calendar} size={16} sw={2} />
          </div>
          <span style={{
            fontWeight: 700, fontSize: 17, letterSpacing: '-0.025em', color: T.text,
          }}>
            Schedula
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
          <a className="lp-link">Features</a>
          <a className="lp-link">How it works</a>
          <a className="lp-link">For educators</a>
          <a className="lp-link">Roadmap</a>
          <a className="lp-link" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            More <Icon d={ICONS.arrow} size={12} />
          </a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onLogin}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: T.text2, fontWeight: 500, fontSize: 13.5,
              fontFamily: 'inherit', padding: '8px 14px',
              letterSpacing: '-0.005em',
            }}>
            Sign In
          </button>
          <button onClick={onSignUp} className="lp-btn-dark">
            Sign Up
            <Icon d={ICONS.arrow} size={12} sw={2.2} />
          </button>
        </div>
      </div>
    </nav>
  );
};

/* ═══════════════════════════════════════════════════════════════
   HERO — refined typography, layered glass elements
   ═══════════════════════════════════════════════════════════════ */
export const Hero = ({ onGetStarted }) => (
  <section style={{
    position: 'relative',
    padding: '40px 28px 36px',
    overflow: 'hidden',
  }}>
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse 70% 50% at 70% 30%, rgba(167,139,250,0.18), transparent 60%), radial-gradient(ellipse 50% 40% at 20% 60%, rgba(196,181,253,0.12), transparent 60%)',
      pointerEvents: 'none',
    }} />

    <div style={{
      position: 'relative',
      maxWidth: 1240, margin: '0 auto',
      background: 'linear-gradient(180deg, #fafbff 0%, #f0eef9 100%)',
      borderRadius: 32,
      padding: '64px 56px',
      minHeight: 640,
      display: 'grid',
      gridTemplateColumns: '1.05fr 1fr',
      gap: 40,
      alignItems: 'center',
      boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 30px 80px rgba(124,58,237,0.10)',
      border: '1px solid rgba(255,255,255,0.7)',
      overflow: 'hidden',
    }}>

      {/* Glass "+" floating button */}
      <div style={{
        position: 'absolute', top: 32, right: 36,
        width: 46, height: 46, borderRadius: '50%',
        background: T.accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white',
        boxShadow: '0 8px 22px ' + T.accentGlow + ', 0 1px 0 rgba(255,255,255,0.18) inset',
        cursor: 'pointer', zIndex: 5,
        transition: 'transform 0.2s ' + T.ease,
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08) rotate(90deg)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}>
        <Icon d={ICONS.plus} size={18} sw={2.4} />
      </div>

      {/* LEFT — copy */}
      <div className="lp-fade-up" style={{ position: 'relative', zIndex: 2 }}>
        {/* Eyebrow */}
        <div style={{ marginBottom: 24 }}>
          <span className="lp-eyebrow">
            <span className="lp-eyebrow-dot" />
            For modern campuses
          </span>
        </div>

        <h1 className="lp-display" style={{
          fontSize: 'clamp(40px, 5.4vw, 68px)',
          fontWeight: 600,
          lineHeight: 1.02,
          letterSpacing: '-0.045em',
          color: T.text,
          margin: '0 0 26px',
        }}>
          Build smarter<br />
          timetables with{' '}
          <span className="lp-serif" style={{
            color: T.accent,
            fontSize: '1.05em',
            paddingRight: '0.05em',
          }}>
            AI
          </span><br />
          in seconds.
        </h1>

        <p style={{
          fontSize: 17,
          lineHeight: 1.6,
          color: T.text3,
          maxWidth: 460,
          margin: '0 0 36px',
          fontWeight: 400,
          letterSpacing: '-0.005em',
        }}>
          Generate conflict-free schedules for your entire institution.
          Manage faculty, classes, and students from one elegant platform —
          built for modern colleges.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
          <button onClick={onGetStarted} className="lp-btn-primary">
            <Icon d={ICONS.bolt} size={15} sw={2} />
            Get Started Free
          </button>
          <button className="lp-btn-glass">
            <Icon d={ICONS.play} size={13} sw={2} fill="currentColor" />
            Watch demo
          </button>
        </div>

        {/* Trust line — minimal stat row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 18,
          paddingTop: 6,
        }}>
          <div style={{ display: 'flex', marginRight: -2 }}>
            {['#a78bfa', '#67e8f9', '#34d399', '#fb7185'].map((c, i) => (
              <div key={i} style={{
                width: 26, height: 26, borderRadius: '50%',
                background: c, marginLeft: i === 0 ? 0 : -8,
                border: '2px solid white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }} />
            ))}
          </div>
          <div>
            <div className="lp-tnum" style={{ fontSize: 13, fontWeight: 700, color: T.text, letterSpacing: '-0.01em' }}>
              240+ institutions
            </div>
            <div style={{ fontSize: 11.5, color: T.text3, fontWeight: 500 }}>
              already scheduling smarter
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — 3D scene with floating glass annotations */}
      <div style={{ position: 'relative', height: 500 }}>
        {/* Floating cube — calendar */}
        <div style={{
          position: 'absolute', top: 24, left: 14,
          animation: 'float-slow 6s ease-in-out infinite',
          filter: 'drop-shadow(0 16px 30px rgba(15,23,42,0.18))',
          zIndex: 3,
        }}>
          <div style={{ transform: 'rotate(-6deg)' }}>
            <GlassCubeCalendar size={108} />
          </div>
        </div>

        {/* Glass notification chip — top-left annotation */}
        <div style={{
          position: 'absolute', top: 6, left: 110,
          animation: 'float-med 5.5s ease-in-out infinite',
          animationDelay: '0.3s',
          zIndex: 4,
        }}>
          <GlassChip dot dotColor={T.green} style={{ padding: '7px 12px' }}>
            <span style={{ color: T.text2, fontWeight: 500 }}>
              Just generated · <span className="lp-tnum" style={{ fontWeight: 700, color: T.text }}>312 slots</span>
            </span>
          </GlassChip>
        </div>

        {/* Floating cube — blocks */}
        <div style={{
          position: 'absolute', top: 8, left: '46%',
          animation: 'float-med 7s ease-in-out infinite',
          animationDelay: '0.3s',
          filter: 'drop-shadow(0 20px 40px rgba(124,58,237,0.20))',
          zIndex: 3,
        }}>
          <div style={{ transform: 'rotate(8deg)' }}>
            <GlassCubeBlocks size={140} />
          </div>
        </div>

        {/* Capsule — sparkle */}
        <div style={{
          position: 'absolute', top: 30, right: -6,
          animation: 'float-fast 6.5s ease-in-out infinite',
          animationDelay: '0.6s',
          filter: 'drop-shadow(0 18px 36px rgba(124,58,237,0.22))',
          zIndex: 3,
        }}>
          <div style={{ transform: 'rotate(12deg)' }}>
            <GlassCapsuleSparkle size={150} />
          </div>
        </div>

        {/* Small glass orbs — pure decoration */}
        <div style={{
          position: 'absolute', top: 170, right: 30,
          animation: 'float-slow 5s ease-in-out infinite',
          animationDelay: '0.4s',
          zIndex: 4,
        }}>
          <GlassOrb size={42} />
        </div>
        <div style={{
          position: 'absolute', top: 280, left: 40,
          animation: 'float-fast 4.5s ease-in-out infinite',
          animationDelay: '1s',
          zIndex: 4,
        }}>
          <GlassOrb size={28} />
        </div>

        {/* Centerpiece dish */}
        <div style={{
          position: 'absolute', bottom: -20, left: '50%',
          transform: 'translateX(-50%)',
          filter: 'drop-shadow(0 30px 50px rgba(15,23,42,0.16))',
          zIndex: 2,
        }}>
          <GlassDishWithCylinders width={540} height={420} />
        </div>

        {/* Glass annotation panel — bottom-right */}
        <div style={{
          position: 'absolute', bottom: 30, right: 0,
          animation: 'float-med 7s ease-in-out infinite',
          animationDelay: '0.8s',
          zIndex: 5,
        }}>
          <GlassPanel style={{ padding: '12px 14px', minWidth: 170 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, color: T.text3,
              textTransform: 'uppercase', letterSpacing: '0.12em',
              marginBottom: 6,
            }}>
              Conflict check
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: T.green, color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon d={ICONS.check} size={14} sw={3} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
                  All clear
                </div>
                <div className="lp-tnum" style={{ fontSize: 10.5, color: T.text3 }}>
                  0 of 1,284 conflicts
                </div>
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* Glass annotation chip — left side, mid */}
        <div style={{
          position: 'absolute', top: 240, left: -10,
          animation: 'float-fast 6s ease-in-out infinite',
          animationDelay: '0.5s',
          zIndex: 5,
        }}>
          <GlassChip dot dotColor={T.amber}>
            <span className="lp-tnum" style={{ fontWeight: 700, color: T.text }}>8.4s</span>
            <span style={{ color: T.text3, fontWeight: 500 }}>gen time</span>
          </GlassChip>
        </div>
      </div>
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════════════════
   DEMO CARD — dark with translucent overlay
   ═══════════════════════════════════════════════════════════════ */
export const DemoCard = () => (
  <section style={{ padding: '0 28px 28px' }}>
    <div style={{
      maxWidth: 1240, margin: '0 auto',
      background: T.surfaceDark,
      borderRadius: 24,
      padding: 28,
      color: 'white',
      display: 'grid',
      gridTemplateColumns: '320px 1fr 240px',
      gap: 28,
      alignItems: 'center',
      boxShadow: T.shadowDark,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Soft purple glow */}
      <div style={{
        position: 'absolute', left: -100, top: -80,
        width: 380, height: 380, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.32), transparent 65%)',
        pointerEvents: 'none',
      }} />
      {/* second glow far right */}
      <div style={{
        position: 'absolute', right: -100, bottom: -100,
        width: 340, height: 340, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(103,232,249,0.16), transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Left: identity */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'rgba(167,139,250,0.18)',
            border: '1px solid rgba(167,139,250,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: T.accent2,
          }}>
            <Icon d={ICONS.spark} size={17} sw={2} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: T.textInv2, letterSpacing: '-0.01em' }}>
              Schedula AI
            </div>
            <div style={{ fontSize: 11, color: T.textInv3, fontWeight: 500 }}>
              Engine v2.0 · live
            </div>
          </div>
          <GlassChip dark dot dotColor="#34d399" style={{ padding: '4px 10px', fontSize: 10.5 }}>
            <span style={{ color: '#34d399' }}>Active</span>
          </GlassChip>
        </div>

        <div style={{
          padding: 16,
          background: 'rgba(124,58,237,0.14)',
          border: '1px solid rgba(167,139,250,0.22)',
          borderRadius: 14,
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{
            fontSize: 10.5, fontWeight: 700, color: T.textInv3,
            marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.12em',
          }}>
            Conflict-free rate
          </div>
          <div className="lp-tnum" style={{
            fontSize: 32, fontWeight: 800, letterSpacing: '-0.035em', color: 'white',
            lineHeight: 1,
          }}>
            98.7<span style={{ fontSize: 22, color: T.textInv2 }}>%</span>
          </div>
          <div style={{ fontSize: 11.5, color: T.textInv2, marginTop: 6, fontWeight: 500 }}>
            <span className="lp-tnum">Across 2,847 schedules</span> generated this week
          </div>
        </div>
      </div>

      {/* Center: live mini chart */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{
            fontSize: 10.5, fontWeight: 700, color: T.textInv3,
            textTransform: 'uppercase', letterSpacing: '0.12em',
          }}>
            Last 12 hrs · schedules / hour
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <span style={{ fontSize: 11.5, color: T.textInv3, fontWeight: 500 }}>
              Peak <span className="lp-tnum" style={{ color: 'white', fontWeight: 700 }}>312</span>
            </span>
            <span style={{ fontSize: 11.5, color: T.textInv3, fontWeight: 500 }}>
              Avg <span className="lp-tnum" style={{ color: 'white', fontWeight: 700 }}>237</span>
            </span>
          </div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 8,
          height: 100,
        }}>
          {[42, 68, 55, 82, 70, 90, 76, 95, 88, 100, 84, 92].map((h, i) => (
            <div key={i} style={{
              flex: 1, height: `${h}%`,
              background: i === 9 ? `linear-gradient(180deg, ${T.accent2}, ${T.accent})`
                                  : 'rgba(167,139,250,0.26)',
              borderRadius: 5,
              transformOrigin: 'bottom',
              animation: `bar-grow 0.8s ${T.easeOut} ${i * 0.04}s both`,
              boxShadow: i === 9 ? '0 6px 18px rgba(124,58,237,0.5)' : 'none',
            }} />
          ))}
        </div>
      </div>

      {/* Right: glass overlay panel — recent activity */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <GlassPanel dark style={{ padding: 14 }}>
          <div style={{
            fontSize: 10.5, fontWeight: 700, color: T.textInv3,
            marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.12em',
          }}>
            Just generated
          </div>
          {[
            { name: 'CSE Sem-3 · Sec A', time: '12s ago', color: T.accent2 },
            { name: 'ECE Sem-5 · Sec B', time: '38s ago', color: T.cyan },
            { name: 'MBA · Year 2',      time: '1m ago',  color: T.green },
          ].map((a, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '7px 0',
              borderBottom: i < 2 ? `1px solid ${T.borderDark}` : 'none',
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: a.color, flexShrink: 0,
                boxShadow: `0 0 0 3px ${a.color}33`,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {a.name}
                </div>
              </div>
              <div className="lp-tnum" style={{ fontSize: 10, color: T.textInv3, fontWeight: 500 }}>
                {a.time}
              </div>
            </div>
          ))}
        </GlassPanel>
      </div>
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════════════════
   METRICS ROW — refined typographic stats
   ═══════════════════════════════════════════════════════════════ */
const MetricCard = ({ value, suffix, label }) => (
  <div className="lp-card-hover" style={{
    background: T.surface,
    borderRadius: 18,
    padding: '22px 24px',
    boxShadow: T.shadowCard,
    border: `1px solid ${T.border}`,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  }}>
    <div>
      <div style={{
        fontSize: 10.5, fontWeight: 700, color: T.text3,
        textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8,
      }}>
        {label}
      </div>
      <div className="lp-tnum" style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
        <span style={{
          fontSize: 32, fontWeight: 700, letterSpacing: '-0.035em', color: T.text,
          lineHeight: 1,
        }}>
          {value}
        </span>
        {suffix && (
          <span style={{
            fontSize: 16, fontWeight: 600, color: T.text3,
            letterSpacing: '-0.02em',
          }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
    <button style={{
      width: 36, height: 36, borderRadius: '50%',
      background: T.accent, color: 'white', border: 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', boxShadow: '0 4px 12px ' + T.accentGlow,
      transition: 'transform 0.2s ' + T.ease,
    }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateX(2px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}>
      <Icon d={ICONS.arrow} size={13} sw={2.2} />
    </button>
  </div>
);

export const MetricsRow = () => (
  <section style={{ padding: '0 28px 56px' }}>
    <div style={{
      maxWidth: 1240, margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 16,
    }}>
      <MetricCard value="12.4" suffix="k" label="Schedules made" />
      <MetricCard value="240" suffix="+" label="Institutions" />
      <MetricCard value="89"  suffix="%" label="Time saved" />
      <MetricCard value="15"  suffix="s" label="Avg gen time" />
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════════════════
   FEATURES GRID — glass overlays on cards
   ═══════════════════════════════════════════════════════════════ */

const TeacherIllustration = () => (
  <svg viewBox="0 0 240 240" style={{ width: '100%', height: '100%', display: 'block' }}>
    <defs>
      <linearGradient id="bg-illu-1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#e9eaf6" />
        <stop offset="100%" stopColor="#c8c0e8" />
      </linearGradient>
      <linearGradient id="hair-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#5b3a1f" />
        <stop offset="100%" stopColor="#3d2614" />
      </linearGradient>
      <linearGradient id="jacket-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#a8b3c5" />
        <stop offset="100%" stopColor="#7989a3" />
      </linearGradient>
      <linearGradient id="shirt-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#e2e8f0" />
      </linearGradient>
    </defs>
    <rect width="240" height="240" fill="url(#bg-illu-1)" />
    <path d="M40 240 L 40 200 Q 60 170 120 165 Q 180 170 200 200 L 200 240 Z" fill="url(#jacket-grad)" />
    <path d="M100 240 L 100 175 Q 120 170 140 175 L 140 240 Z" fill="url(#shirt-grad)" />
    <rect x="108" y="142" width="24" height="30" rx="6" fill="#e8c4a8" />
    <ellipse cx="120" cy="118" rx="42" ry="48" fill="#f0d2b8" />
    <path d="M78 100 Q 78 60 120 56 Q 162 60 162 100 Q 162 92 145 90 Q 130 84 120 84 Q 110 84 95 90 Q 78 92 78 100 Z" fill="url(#hair-grad)" />
    <path d="M78 96 Q 80 130 84 138 Q 80 110 88 96 Z" fill="url(#hair-grad)" />
    <path d="M162 96 Q 160 130 156 138 Q 160 110 152 96 Z" fill="url(#hair-grad)" />
    <circle cx="106" cy="118" r="11" fill="none" stroke="#0f172a" strokeWidth="2" />
    <circle cx="134" cy="118" r="11" fill="none" stroke="#0f172a" strokeWidth="2" />
    <line x1="117" y1="118" x2="123" y2="118" stroke="#0f172a" strokeWidth="2" />
    <ellipse cx="106" cy="118" rx="2.5" ry="3" fill="#0f172a" />
    <ellipse cx="134" cy="118" rx="2.5" ry="3" fill="#0f172a" />
    <path d="M120 124 Q 119 132 116 137" fill="none" stroke="#c89878" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M114 144 Q 120 147 126 144" fill="none" stroke="#a8624a" strokeWidth="1.6" strokeLinecap="round" />
    <ellipse cx="92"  cy="130" rx="6" ry="3" fill="#e8b8a0" opacity="0.5" />
    <ellipse cx="148" cy="130" rx="6" ry="3" fill="#e8b8a0" opacity="0.5" />
  </svg>
);

const FeatureDarkCard = () => (
  <div className="lp-card-hover" style={{
    background: T.surfaceDark,
    color: 'white',
    borderRadius: 22,
    padding: '26px 24px',
    boxShadow: T.shadowDark,
    display: 'flex', flexDirection: 'column',
    minHeight: 340,
    position: 'relative',
    overflow: 'hidden',
  }}>
    {/* Glass eyebrow chip */}
    <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 3 }}>
      <GlassChip dark style={{ padding: '4px 10px', fontSize: 10 }}>
        <span style={{
          color: T.accent2, fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase',
        }}>
          For Admins
        </span>
      </GlassChip>
    </div>

    <div style={{
      position: 'absolute', bottom: -40, left: -40,
      width: 220, height: 220, borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(124,58,237,0.35), transparent 65%)',
    }} />

    <div style={{ position: 'relative', zIndex: 2, marginTop: 'auto' }}>
      <h3 className="lp-display" style={{
        fontSize: 24, fontWeight: 600, lineHeight: 1.15,
        letterSpacing: '-0.035em', margin: '0 0 12px',
      }}>
        Generate timetables<br />
        <span className="lp-serif" style={{ color: T.accent2, fontSize: '1.05em' }}>
          in one click.
        </span>
      </h3>
      <p style={{
        fontSize: 13.5, lineHeight: 1.6, color: T.textInv2,
        margin: '0 0 20px', fontWeight: 400,
      }}>
        Our AI engine respects every teacher availability, room capacity,
        and curriculum constraint — clash-free in under 15 seconds.
      </p>
      <button style={{
        background: T.accent, color: 'white', border: 'none',
        padding: '10px 18px', borderRadius: 999,
        fontFamily: 'inherit', fontWeight: 600, fontSize: 12.5, cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 8,
        boxShadow: '0 4px 14px ' + T.accentGlow,
        letterSpacing: '-0.005em',
      }}>
        Try the engine
        <Icon d={ICONS.arrow} size={12} sw={2.2} />
      </button>
    </div>
  </div>
);

const FeatureImageCard = () => (
  <div className="lp-card-hover" style={{
    background: T.surface,
    borderRadius: 22,
    overflow: 'hidden',
    boxShadow: T.shadowCard,
    border: `1px solid ${T.border}`,
    minHeight: 340,
    position: 'relative',
  }}>
    <div style={{ height: '100%', position: 'relative' }}>
      <TeacherIllustration />

      {/* Floating glass star rating chip — top */}
      <div style={{ position: 'absolute', top: 14, left: 14, zIndex: 3 }}>
        <GlassChip>
          <Icon d={ICONS.star} size={11} sw={1.5} fill={T.amber} />
          <span className="lp-tnum" style={{ fontWeight: 700, color: T.text }}>4.9</span>
          <span style={{ color: T.text3, fontWeight: 500 }}>· 248 reviews</span>
        </GlassChip>
      </div>

      {/* Glass profile chip — bottom */}
      <div style={{
        position: 'absolute', bottom: 14, left: 14, right: 14, zIndex: 3,
      }}>
        <GlassPanel style={{ padding: '12px 14px' }}>
          <div style={{
            fontSize: 10, color: T.text3, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.12em',
            marginBottom: 4,
          }}>
            Faculty profile
          </div>
          <div style={{
            fontSize: 14.5, fontWeight: 700, color: T.text,
            letterSpacing: '-0.015em',
          }}>
            Dr. Priya Mehta
          </div>
          <div style={{ fontSize: 11, color: T.text3, fontWeight: 500, marginTop: 2 }}>
            Computer Science · 12 yrs
          </div>
        </GlassPanel>
      </div>
    </div>
  </div>
);

const FeatureToggleCard = () => {
  const [on, setOn] = useState(true);
  return (
    <div className="lp-card-hover" style={{
      background: T.surface,
      borderRadius: 22,
      padding: '24px 24px',
      boxShadow: T.shadowCard,
      border: `1px solid ${T.border}`,
      minHeight: 340,
      display: 'flex', flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle wash */}
      <div style={{
        position: 'absolute', top: -60, right: -60,
        width: 200, height: 200, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.10), transparent 65%)',
      }} />

      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 11,
          background: T.accentSoft, color: T.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 18,
          border: '1px solid ' + T.accentBorder,
        }}>
          <Icon d={ICONS.chart} size={18} sw={2} />
        </div>

        <h3 className="lp-display" style={{
          fontSize: 21, fontWeight: 600, lineHeight: 1.2,
          letterSpacing: '-0.025em', margin: '0 0 10px', color: T.text,
        }}>
          Live syllabus tracking
        </h3>
        <p style={{
          fontSize: 13.5, lineHeight: 1.6, color: T.text3,
          margin: '0 0 20px', fontWeight: 400,
        }}>
          Faculty log every session in seconds. Coverage rolls up to admin
          dashboards in real time.
        </p>
      </div>

      <div style={{
        position: 'relative', zIndex: 2,
        marginTop: 'auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 14px',
        background: 'rgba(255, 255, 255, 0.6)',
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        backdropFilter: 'blur(10px)',
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text, letterSpacing: '-0.01em' }}>
            Auto-sync
          </div>
          <div style={{ fontSize: 11, color: T.text3, fontWeight: 500 }}>
            <span className="lp-tnum">Updates every 30s</span>
          </div>
        </div>
        <div onClick={() => setOn(!on)} style={{
          width: 42, height: 24, borderRadius: 999,
          background: on ? T.accent : '#cbd5e1',
          position: 'relative', cursor: 'pointer',
          transition: 'background 0.2s ' + T.ease,
        }}>
          <div style={{
            position: 'absolute', top: 2, left: on ? 20 : 2,
            width: 20, height: 20, borderRadius: '50%',
            background: 'white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            transition: 'left 0.2s ' + T.ease,
          }} />
        </div>
      </div>
    </div>
  );
};

const FeatureSchedulePreview = () => (
  <div className="lp-card-hover" style={{
    background: T.surface,
    borderRadius: 22,
    padding: 18,
    boxShadow: T.shadowCard,
    border: `1px solid ${T.border}`,
    minHeight: 340,
    display: 'flex', flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  }}>
    {/* Floating glass "live" chip */}
    <div style={{
      position: 'absolute', top: 28, right: 28, zIndex: 3,
    }}>
      <GlassChip dot dotColor={T.green} style={{ fontSize: 10.5, padding: '4px 10px' }}>
        <span style={{ color: T.text2, fontWeight: 600 }}>Live</span>
      </GlassChip>
    </div>

    <div style={{
      flex: 1,
      background: 'linear-gradient(180deg, #faf9ff, #f3f0fb)',
      borderRadius: 14,
      padding: 14,
      border: `1px solid ${T.border}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.text2, letterSpacing: '-0.01em' }}>
          Mon · Sec A
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['M','T','W','T','F'].map((d, i) => (
            <div key={i} style={{
              width: 18, height: 18, borderRadius: 5,
              background: i === 0 ? T.accent : T.surface,
              border: i === 0 ? 'none' : `1px solid ${T.border}`,
              color: i === 0 ? 'white' : T.text3,
              fontSize: 9, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{d}</div>
          ))}
        </div>
      </div>
      {[
        { time: '09:00', subj: 'Data Structures', tag: 'CS-301', color: T.accent },
        { time: '10:00', subj: 'Mathematics III', tag: 'MA-201', color: T.cyan },
        { time: '11:00', subj: 'Lab Session',     tag: 'CS-L1',  color: T.green },
        { time: '12:00', subj: 'Lunch break',     tag: '',       color: '' },
        { time: '13:00', subj: 'Database Systems', tag: 'CS-302', color: T.pink },
      ].map((s, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '7px 8px', marginBottom: 4,
          background: s.color ? T.surface : 'transparent',
          borderRadius: 8,
          border: s.color ? `1px solid ${T.border}` : 'none',
          opacity: s.color ? 1 : 0.55,
        }}>
          <div style={{
            width: 3, height: 24, borderRadius: 2,
            background: s.color || 'transparent',
          }} />
          <div className="lp-tnum" style={{
            fontSize: 10, fontWeight: 700, color: T.text3, width: 36,
          }}>
            {s.time}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.text, letterSpacing: '-0.005em' }}>
              {s.subj}
            </div>
            {s.tag && <div style={{ fontSize: 9, color: T.text3, fontWeight: 500 }}>{s.tag}</div>}
          </div>
        </div>
      ))}
    </div>

    <div style={{ paddingTop: 14 }}>
      <span className="lp-eyebrow" style={{
        background: T.accentSoft, color: T.accent,
        padding: '4px 10px', fontSize: 10,
      }}>
        For Students
      </span>
      <h3 className="lp-display" style={{
        fontSize: 18, fontWeight: 600, lineHeight: 1.25,
        letterSpacing: '-0.025em', margin: '8px 0 0', color: T.text,
      }}>
        Your day, at a glance.
      </h3>
    </div>
  </div>
);

export const FeaturesGrid = () => (
  <section style={{ padding: '0 28px 64px' }}>
    <div style={{ maxWidth: 1240, margin: '0 auto' }}>
      <div style={{ marginBottom: 36, maxWidth: 720 }}>
        <span className="lp-eyebrow" style={{ marginBottom: 16 }}>
          <span className="lp-eyebrow-dot" />
          Built for every role
        </span>
        <h2 className="lp-display" style={{
          fontSize: 'clamp(28px, 3.6vw, 44px)',
          fontWeight: 600, lineHeight: 1.05,
          letterSpacing: '-0.04em', color: T.text, margin: '14px 0 0',
        }}>
          One platform.{' '}
          <span className="lp-serif" style={{ color: T.accent }}>
            Three
          </span><br />
          tailored experiences.
        </h2>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.1fr 0.9fr 1fr 1fr',
        gap: 16,
      }}>
        <FeatureDarkCard />
        <FeatureImageCard />
        <FeatureToggleCard />
        <FeatureSchedulePreview />
      </div>
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════════════════
   ANALYTICS SHOWCASE
   ═══════════════════════════════════════════════════════════════ */
const AnalyticsLightCard = () => (
  <div style={{
    background: T.surface,
    borderRadius: 22,
    padding: '32px 28px',
    boxShadow: T.shadowCard,
    border: `1px solid ${T.border}`,
    display: 'flex', flexDirection: 'column',
  }}>
    <span className="lp-eyebrow" style={{ alignSelf: 'flex-start', marginBottom: 16 }}>
      <span className="lp-eyebrow-dot" />
      Analytics
    </span>

    <h2 className="lp-display" style={{
      fontSize: 'clamp(26px, 3.2vw, 40px)',
      fontWeight: 600, lineHeight: 1.05,
      letterSpacing: '-0.04em', color: T.text, margin: '0 0 18px',
    }}>
      Take control of your{' '}
      <span className="lp-serif" style={{ color: T.accent }}>
        academic
      </span><br />
      operations.
    </h2>

    <p style={{
      fontSize: 15, lineHeight: 1.6, color: T.text3,
      margin: '0 0 26px', fontWeight: 400,
    }}>
      Real-time insight into utilisation, syllabus coverage, attendance and faculty load.
      Spot bottlenecks before they become problems — and act on them in one click.
    </p>

    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
      marginTop: 'auto',
    }}>
      {[
        { icon: ICONS.shield,   label: 'Conflict guard',   sub: 'Zero overlaps' },
        { icon: ICONS.users,    label: 'Faculty load',     sub: 'Balanced auto' },
        { icon: ICONS.clock,    label: 'Real-time sync',   sub: 'Always current' },
        { icon: ICONS.star,     label: 'Quality ratings',  sub: 'From students' },
      ].map((f, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 11,
          padding: '11px 13px',
          background: 'rgba(255, 255, 255, 0.6)',
          border: `1px solid ${T.border}`,
          backdropFilter: 'blur(10px)',
          borderRadius: 12,
          transition: 'background 0.2s ' + T.ease,
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.9)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.6)'}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: T.surface, color: T.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${T.border}`,
          }}>
            <Icon d={f.icon} size={15} sw={1.8} />
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: T.text, letterSpacing: '-0.01em' }}>
              {f.label}
            </div>
            <div style={{ fontSize: 10.5, color: T.text3, fontWeight: 500 }}>{f.sub}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AnalyticsDarkChart = () => (
  <div style={{
    background: T.surfaceDark,
    borderRadius: 22,
    padding: 26,
    boxShadow: T.shadowDark,
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
    minHeight: 380,
    display: 'flex', flexDirection: 'column',
  }}>
    <div style={{
      position: 'absolute', top: -60, right: -60,
      width: 280, height: 280, borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(124,58,237,0.32), transparent 65%)',
    }} />

    <div style={{
      position: 'relative', zIndex: 2,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      marginBottom: 18,
    }}>
      <div>
        <div style={{
          fontSize: 10.5, fontWeight: 700, color: T.textInv3,
          marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.12em',
        }}>
          Weekly utilisation
        </div>
        <div className="lp-tnum" style={{
          fontSize: 32, fontWeight: 800, letterSpacing: '-0.035em',
          lineHeight: 1,
        }}>
          +22.5<span style={{ fontSize: 22, color: T.textInv2 }}>%</span>
        </div>
      </div>
      <GlassChip dark style={{ padding: '5px 11px' }}>
        <span style={{ color: '#34d399', fontWeight: 700, letterSpacing: '0.04em' }}>
          ↑ trending
        </span>
      </GlassChip>
    </div>

    <div style={{
      flex: 1, display: 'flex', alignItems: 'flex-end', gap: 12,
      paddingBottom: 36,
    }}>
      {[
        { d: 'M', h: 42, peak: false },
        { d: 'T', h: 64, peak: false },
        { d: 'W', h: 78, peak: false },
        { d: 'T', h: 56, peak: false },
        { d: 'F', h: 92, peak: true  },
        { d: 'S', h: 38, peak: false },
        { d: 'S', h: 22, peak: false },
      ].map((b, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ width: '100%', height: 200, display: 'flex', alignItems: 'flex-end' }}>
            <div style={{
              width: '100%',
              height: `${b.h}%`,
              background: b.peak
                ? `linear-gradient(180deg, ${T.accent2}, ${T.accent})`
                : 'rgba(167,139,250,0.22)',
              borderRadius: 8,
              transformOrigin: 'bottom',
              animation: `bar-grow 0.7s ${T.easeOut} ${i * 0.06}s both`,
              boxShadow: b.peak ? '0 8px 22px rgba(124,58,237,0.5)' : 'none',
            }} />
          </div>
          <div style={{
            fontSize: 11, fontWeight: 600,
            color: b.peak ? 'white' : T.textInv3,
            letterSpacing: '0.02em',
          }}>
            {b.d}
          </div>
        </div>
      ))}
    </div>

    <div style={{
      position: 'relative', zIndex: 2,
      display: 'flex', justifyContent: 'space-between',
      paddingTop: 14, borderTop: `1px solid ${T.borderDark}`,
    }}>
      <div>
        <div style={{
          fontSize: 10, color: T.textInv3, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.12em',
        }}>
          Peak day
        </div>
        <div className="lp-tnum" style={{ fontSize: 14, fontWeight: 700, marginTop: 3, letterSpacing: '-0.01em' }}>
          Friday · 92%
        </div>
      </div>
      <div>
        <div style={{
          fontSize: 10, color: T.textInv3, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.12em',
        }}>
          Active rooms
        </div>
        <div className="lp-tnum" style={{ fontSize: 14, fontWeight: 700, marginTop: 3, letterSpacing: '-0.01em' }}>
          48 / 52
        </div>
      </div>
      <div>
        <div style={{
          fontSize: 10, color: T.textInv3, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.12em',
        }}>
          Sessions
        </div>
        <div className="lp-tnum" style={{ fontSize: 14, fontWeight: 700, marginTop: 3, letterSpacing: '-0.01em' }}>
          1,284
        </div>
      </div>
    </div>
  </div>
);

export const AnalyticsShowcase = () => (
  <section style={{ padding: '0 28px 80px' }}>
    <div style={{
      maxWidth: 1240, margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 16,
    }}>
      <AnalyticsLightCard />
      <AnalyticsDarkChart />
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════════════════
   FOOTER CTA — glass elements scattered
   ═══════════════════════════════════════════════════════════════ */
export const FooterCTA = ({ onGetStarted }) => (
  <section style={{ padding: '0 28px 40px' }}>
    <div style={{
      maxWidth: 1240, margin: '0 auto',
      background: 'linear-gradient(135deg, #faf9ff 0%, #ede9fe 100%)',
      borderRadius: 32,
      padding: '64px 48px',
      textAlign: 'center',
      border: '1px solid rgba(255,255,255,0.7)',
      boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 24px 60px rgba(124,58,237,0.10)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative floating glass orbs */}
      <div style={{
        position: 'absolute', top: 30, left: 60,
        animation: 'float-slow 5s ease-in-out infinite',
      }}>
        <GlassOrb size={48} />
      </div>
      <div style={{
        position: 'absolute', bottom: 40, right: 80,
        animation: 'float-med 6s ease-in-out infinite',
      }}>
        <GlassOrb size={36} />
      </div>
      <div style={{
        position: 'absolute', top: 60, right: 140,
        animation: 'float-fast 4.5s ease-in-out infinite',
      }}>
        <GlassOrb size={24} />
      </div>
      <div style={{
        position: 'absolute', bottom: 80, left: 140,
        animation: 'float-slow 7s ease-in-out infinite',
        animationDelay: '0.5s',
      }}>
        <GlassOrb size={28} />
      </div>

      <div style={{ position: 'relative', zIndex: 2 }}>
        <span className="lp-eyebrow" style={{ marginBottom: 18 }}>
          <span className="lp-eyebrow-dot" />
          Get started today
        </span>

        <h2 className="lp-display" style={{
          fontSize: 'clamp(28px, 4.2vw, 52px)',
          fontWeight: 600, lineHeight: 1.02,
          letterSpacing: '-0.045em', color: T.text,
          margin: '14px auto 16px', maxWidth: 720,
        }}>
          Ready to upgrade your{' '}
          <span className="lp-serif" style={{ color: T.accent }}>
            timetabling
          </span>?
        </h2>
        <p style={{
          fontSize: 16, color: T.text3,
          margin: '0 auto 32px', maxWidth: 480,
          fontWeight: 400, lineHeight: 1.55,
        }}>
          Join 240+ institutions that have replaced spreadsheet chaos with elegant,
          AI-driven schedules.
        </p>
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 12,
          flexWrap: 'wrap',
        }}>
          <button onClick={onGetStarted} className="lp-btn-primary">
            <Icon d={ICONS.bolt} size={15} sw={2} />
            Get Started Free
          </button>
          <button className="lp-btn-glass">
            Talk to sales
            <Icon d={ICONS.arrow} size={13} sw={2} />
          </button>
        </div>
      </div>
    </div>
  </section>
);

export const Footer = () => (
  <footer style={{
    padding: '32px 28px 28px',
    borderTop: `1px solid ${T.border}`,
  }}>
    <div style={{
      maxWidth: 1240, margin: '0 auto',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 7,
          background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white',
        }}>
          <Icon d={ICONS.calendar} size={13} sw={2} />
        </div>
        <span style={{ fontWeight: 700, fontSize: 14, color: T.text, letterSpacing: '-0.02em' }}>
          Schedula
        </span>
        <span className="lp-tnum" style={{ fontSize: 12, color: T.text3, marginLeft: 8, fontWeight: 500 }}>
          © {new Date().getFullYear()} · AI Timetable Platform
        </span>
      </div>
      <div style={{ display: 'flex', gap: 24 }}>
        <a className="lp-link" style={{ fontSize: 12.5 }}>Privacy</a>
        <a className="lp-link" style={{ fontSize: 12.5 }}>Terms</a>
        <a className="lp-link" style={{ fontSize: 12.5 }}>Security</a>
        <a className="lp-link" style={{ fontSize: 12.5 }}>Contact</a>
      </div>
    </div>
  </footer>
);
