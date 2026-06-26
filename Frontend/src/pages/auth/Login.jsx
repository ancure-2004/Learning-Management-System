import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  T, Icon, ICONS,
  AUTH_STYLES, AuthSplitLayout,
} from '@/pages/auth/AuthShared';
import { loginSchema } from '@/validation/schemas';
import { validate } from '@/validation/useFormValidation';

/* ═══════════════════════════════════════════════════════════════
   LOGIN — split-screen with serif typography.

   Public-facing roles (Student, Teacher) are shown as a segmented
   control at the top of the form. Admin is intentionally hidden:
   it lives behind a tiny "Administrator? Sign in here" link at the
   bottom of the form. Clicking it transforms the form in place
   (no page change) into "administrator access" mode — same email/
   password fields, slightly different visual treatment.

   ═══════════════════════════════════════════════════════════════ */

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // 'student' | 'teacher' | 'admin'
  // Default to 'student' — the most common public role.
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdminMode = role === 'admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Pre-submit validation gate — block invalid input before hitting the API.
    const { success, errors } = validate(loginSchema, { email, password });
    if (!success) {
      setError(errors.email || errors.password || 'Please check your details.');
      return;
    }

    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Sign in failed. Please check your credentials.');
    }
    setLoading(false);
  };

  // One-click demo sign-in (works offline — falls back to seeded dummy data).
  const demoLogin = async (demoEmail) => {
    setError('');
    setLoading(true);
    const result = await login(demoEmail, 'demo123');
    if (result.success) navigate('/dashboard');
    else setError(result.error || 'Demo sign-in failed.');
    setLoading(false);
  };

  return (
    <>
      <style>{AUTH_STYLES}</style>
      <AuthSplitLayout
        idSeed="lg"
        tagline="Smart schedules,"
        taglineAccent="simply done."
        body="Generate conflict-free timetables for your entire institution. Welcome back to your dashboard."
      >
        <div style={{ width: '100%', maxWidth: 460, margin: '0 auto' }}>
          {/* ── Top link: Don't have an account? ── */}
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 8,
            marginBottom: 20,
          }}>
            <span className="auth-italic">Don't have an account?</span>
            <a className="auth-link" onClick={() => navigate('/register')}>
              Sign up
            </a>
          </div>

          {/* ── Heading ── */}
          <h1 className="auth-display auth-fade-up" style={{
            fontSize: 'clamp(34px, 3.6vw, 46px)',
            margin: '0 0 6px',
          }}>
            Welcome back<span style={{ color: T.accent }}>.</span>
          </h1>
          <p className="auth-italic auth-fade-up" style={{
            margin: '0 0 20px',
            animationDelay: '0.05s',
          }}>
            {isAdminMode
              ? 'Administrator access — proceed with care.'
              : "Let's get you signed in to your dashboard."}
          </p>

          {/* ── Role selector OR Admin badge ── */}
          {isAdminMode ? (
            <AdminBadge onSwitch={() => setRole('student')} />
          ) : (
            <RoleTabs role={role} onChange={setRole} />
          )}

          {/* ── Error ── */}
          {error && (
            <div className="auth-error" style={{ marginBottom: 14 }}>
              {error}
            </div>
          )}

          {/* ── Demo quick-login (works offline with seeded dummy data) ── */}
          <div style={{
            marginBottom: 16, padding: '12px 14px', borderRadius: 12,
            background: T.accentSoft, border: `1px solid ${T.accentBorder}`,
          }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: T.accent, marginBottom: 8, letterSpacing: '0.01em' }}>
              Explore the demo — no backend needed
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { label: 'Admin', email: 'admin@college.edu' },
                { label: 'Teacher', email: 'rajesh.kumar@college.edu' },
                { label: 'Student', email: 'aarav.sharma@student.college.edu' },
              ].map((d) => (
                <button
                  key={d.label}
                  type="button"
                  disabled={loading}
                  onClick={() => demoLogin(d.email)}
                  style={{
                    flex: '1 1 0', minWidth: 90, padding: '9px 12px', borderRadius: 9,
                    background: T.surface, border: `1px solid ${T.accentBorder}`,
                    color: T.accent, fontSize: 12.5, fontWeight: 600, cursor: loading ? 'default' : 'pointer',
                    fontFamily: 'inherit', opacity: loading ? 0.6 : 1, transition: 'transform 150ms ease',
                  }}
                  onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  Login as {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                className="auth-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isAdminMode ? 'Administrator email' : 'Email address'}
              />

              {/* Password with reveal toggle */}
              <div style={{ position: 'relative' }}>
                <input
                  className="auth-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: T.text4,
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = T.text2)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = T.text4)}
                >
                  <Icon d={showPassword ? ICONS.eyeOff : ICONS.eye} size={17} />
                </button>
              </div>
            </div>

            {/* Remember me + Forgot password */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              margin: '16px 0 20px',
            }}>
              <div
                className="auth-check"
                onClick={() => setRemember((r) => !r)}
                role="button"
                tabIndex={0}
              >
                <span className={`auth-check-box ${remember ? 'checked' : ''}`}>
                  {remember && <Icon d={ICONS.check} size={11} sw={3} fill="none" />}
                </span>
                <span className="auth-check-text">Remember me</span>
              </div>
              <a className="auth-link-muted">Forgot password?</a>
            </div>

            <button
              className="auth-btn-primary"
              type="submit"
              disabled={loading}
              style={isAdminMode ? {
                background: `linear-gradient(180deg, ${T.text2} 0%, ${T.text} 100%)`,
                boxShadow: '0 6px 18px rgba(15, 23, 42, 0.18), 0 1px 0 rgba(255,255,255,0.10) inset',
              } : undefined}
            >
              {loading
                ? 'Signing in…'
                : isAdminMode
                  ? 'Sign in as administrator'
                  : `Sign In${role === 'teacher' ? ' as Teacher' : ' as Student'}`}
            </button>
          </form>

          {/* Tiny admin link — only visible when not already in admin mode */}
          {!isAdminMode && (
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <a
                className="auth-link-muted"
                onClick={() => setRole('admin')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
              >
                <Icon d={ICONS.shield} size={11} sw={1.8} />
                Administrator? Sign in here
              </a>
            </div>
          )}
        </div>
      </AuthSplitLayout>
    </>
  );
};

/* ─── Role tabs (segmented control) ──────────────────────────── */
const RoleTabs = ({ role, onChange }) => (
  <div className="auth-tabs" style={{ marginBottom: 20 }}>
    <div
      className="auth-tab-indicator"
      style={{
        transform: role === 'student' ? 'translateX(0)' : 'translateX(100%)',
      }}
    />
    <button
      type="button"
      className={`auth-tab ${role === 'student' ? 'active' : ''}`}
      onClick={() => onChange('student')}
    >
      <Icon d={ICONS.user} size={14} sw={1.8} />
      Student
    </button>
    <button
      type="button"
      className={`auth-tab ${role === 'teacher' ? 'active' : ''}`}
      onClick={() => onChange('teacher')}
    >
      <Icon d={ICONS.teacher} size={14} sw={1.8} />
      Teacher
    </button>
  </div>
);

/* ─── Admin mode badge (replaces tabs when admin link is clicked) ── */
const AdminBadge = ({ onSwitch }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 14px',
    background: 'rgba(15, 23, 42, 0.05)',
    border: '1px solid rgba(15, 23, 42, 0.10)',
    borderRadius: 12,
    marginBottom: 20,
  }}>
    <div style={{
      width: 30, height: 30, borderRadius: 8,
      background: T.text,
      color: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon d={ICONS.shield} size={14} sw={2} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontWeight: 700, fontSize: 14.5, color: T.text,
        letterSpacing: '-0.005em',
      }}>
        Administrator access
      </div>
      <div style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontStyle: 'italic',
        fontSize: 12.5, color: T.text3,
      }}>
        Restricted area — proceed with care.
      </div>
    </div>
    <a className="auth-link-muted" onClick={onSwitch}>
      Switch to user
    </a>
  </div>
);

export default Login;
