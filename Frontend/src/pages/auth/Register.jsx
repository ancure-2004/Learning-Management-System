import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  T, Icon, ICONS,
  AUTH_STYLES, AuthSplitLayout,
} from '@/pages/auth/AuthShared';
import { registerSchema } from '@/validation/schemas';
import { validate } from '@/validation/useFormValidation';

/* ═══════════════════════════════════════════════════════════════
   REGISTER — student-only signup.

   By design, only students can self-register from this page.
   Teachers and admins are created internally by an administrator,
   so we don't expose a role selector. A small note at the bottom
   tells faculty to contact their administrator.

   Form mirrors the reference: 6 fields in a 2-column grid (First/
   Last, Phone/Email, Password/Confirm), two checkboxes (newsletter
   consent + terms acceptance), and a full-width Sign Up button.
   The role is hardcoded as 'student' on submit.
   ═══════════════════════════════════════════════════════════════ */

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [marketing, setMarketing] = useState(false);
  const [terms, setTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setField = (name) => (e) => {
    setForm({ ...form, [name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Pre-submit validation gate (zod) — mirrors backend rules, blocks
    // invalid input before hitting the API.
    const { success, errors } = validate(registerSchema, {
      role: 'student',
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      email: form.email,
      password: form.password,
      confirmPassword: form.confirmPassword,
    });
    if (!success) {
      setError(
        errors.firstName || errors.lastName || errors.email ||
        errors.password || errors.confirmPassword || 'Please check your details.'
      );
      return;
    }

    // Terms acceptance is a UI consent gate, not a backend field.
    if (!terms) {
      setError('Please agree to the Terms & Privacy Policy to continue.');
      return;
    }

    setLoading(true);

    // Role is locked to 'student' — outsiders cannot self-register
    // as teacher/admin. Those are created by the administrator.
    const payload = {
      role: 'student',
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      password: form.password,
      // Backend may require these for student records — admin can fill them
      // in later from the user-management screen. Sending empty defaults.
      enrollmentNumber: '',
      program: '',
      semester: 1,
      section: '',
      marketingConsent: marketing,
    };

    const result = await register(payload);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <>
      <style>{AUTH_STYLES}</style>
      <AuthSplitLayout
        idSeed="rg"
        tagline="Smart schedules,"
        taglineAccent="simply done."
        body="Join your campus on Schedula. Get a personalised timetable, live updates, and zero conflicts — all in one place."
      >
        <div style={{ width: '100%', maxWidth: 520, margin: '0 auto' }}>
          {/* ── Top link: Already have an account? ── */}
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 8,
            marginBottom: 32,
          }}>
            <span className="auth-italic">Already have an account?</span>
            <a className="auth-link" onClick={() => navigate('/login')}>
              Log in
            </a>
          </div>

          {/* ── Heading ── */}
          <h1 className="auth-display auth-fade-up" style={{
            fontSize: 'clamp(34px, 3.6vw, 46px)',
            margin: '0 0 6px',
          }}>
            Welcome to Schedula<span style={{ color: T.accent }}>.</span>
          </h1>
          <p className="auth-italic auth-fade-up" style={{
            margin: '0 0 28px',
            animationDelay: '0.05s',
          }}>
            Let's help you get started.
          </p>

          {/* ── Error ── */}
          {error && (
            <div className="auth-error" style={{ marginBottom: 14 }}>
              {error}
            </div>
          )}

          {/* ── Form ── */}
          <form onSubmit={handleSubmit}>
            {/* Row 1 — First Name, Last Name */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: 12, marginBottom: 12,
            }}>
              <input
                className="auth-input"
                type="text"
                required
                value={form.firstName}
                onChange={setField('firstName')}
                placeholder="First Name"
              />
              <input
                className="auth-input"
                type="text"
                required
                value={form.lastName}
                onChange={setField('lastName')}
                placeholder="Last Name"
              />
            </div>

            {/* Row 2 — Phone, Email */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: 12, marginBottom: 12,
            }}>
              <input
                className="auth-input"
                type="tel"
                value={form.phone}
                onChange={setField('phone')}
                placeholder="Phone"
              />
              <input
                className="auth-input"
                type="email"
                required
                value={form.email}
                onChange={setField('email')}
                placeholder="Email"
              />
            </div>

            {/* Row 3 — Password, Confirm Password */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: 12, marginBottom: 18,
            }}>
              {/* Password with reveal toggle */}
              <div style={{ position: 'relative' }}>
                <input
                  className="auth-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={setField('password')}
                  placeholder="Password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: 12,
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
                  <Icon d={showPassword ? ICONS.eyeOff : ICONS.eye} size={16} />
                </button>
              </div>

              <input
                className="auth-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={form.confirmPassword}
                onChange={setField('confirmPassword')}
                placeholder="Confirm Password"
              />
            </div>

            {/* Checkboxes */}
            <div style={{
              display: 'flex', flexDirection: 'column',
              gap: 12, marginBottom: 22,
            }}>
              <div
                className="auth-check"
                onClick={() => setMarketing((m) => !m)}
                role="button"
                tabIndex={0}
              >
                <span className={`auth-check-box ${marketing ? 'checked' : ''}`}>
                  {marketing && <Icon d={ICONS.check} size={11} sw={3} fill="none" />}
                </span>
                <span className="auth-check-text">
                  I want to receive product updates and academic-resource emails from Schedula.
                </span>
              </div>

              <div
                className="auth-check"
                onClick={() => setTerms((t) => !t)}
                role="button"
                tabIndex={0}
              >
                <span className={`auth-check-box ${terms ? 'checked' : ''}`}>
                  {terms && <Icon d={ICONS.check} size={11} sw={3} fill="none" />}
                </span>
                <span className="auth-check-text">
                  I agree to the{' '}
                  <a className="auth-link" style={{ fontSize: 14 }}>
                    Terms &amp; Privacy Policy
                  </a>.
                </span>
              </div>
            </div>

            <button
              className="auth-btn-primary"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating account…' : 'Sign Up'}
            </button>
          </form>

          {/* ── Faculty notice ── */}
          <div style={{
            marginTop: 20,
            padding: '12px 14px',
            background: 'rgba(124, 58, 237, 0.04)',
            border: '1px solid rgba(124, 58, 237, 0.12)',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: 6,
              background: T.accentSoft, color: T.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, marginTop: 1,
            }}>
              <Icon d={ICONS.teacher} size={11} sw={1.8} />
            </div>
            <div>
              <div style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontWeight: 700, fontSize: 13.5, color: T.text,
                letterSpacing: '-0.005em',
              }}>
                Faculty &amp; Staff
              </div>
              <div style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontStyle: 'italic',
                fontSize: 13, color: T.text3, marginTop: 1,
              }}>
                Teacher accounts are created by your administrator. Please contact them to get access.
              </div>
            </div>
          </div>
        </div>
      </AuthSplitLayout>
    </>
  );
};

export default Register;
