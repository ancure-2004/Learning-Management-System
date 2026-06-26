import { theme } from '@/theme';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Nav,
  Hero,
  DemoCard,
  MetricsRow,
  FeaturesGrid,
  AnalyticsShowcase,
  FooterCTA,
  Footer,
} from './components/sections';

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS — same palette as the dashboards (Plus Jakarta
   Sans, slate-on-cream, single purple accent) but tuned softer
   and lighter for a marketing surface. Shadows are subtler,
   borders thinner, and translucent glass surfaces are first-
   class citizens.
   ═══════════════════════════════════════════════════════════════ */
const T = theme;

/* ═══════════════════════════════════════════════════════════════
   GLOBAL STYLES — refined typography baseline
   ═══════════════════════════════════════════════════════════════ */
const GLOBAL_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');

*, *::before, *::after { box-sizing: border-box; }
html, body, #root { margin: 0; padding: 0; }
body {
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  background: ${T.bg};
  color: ${T.text};
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  letter-spacing: -0.011em;
  font-feature-settings: 'cv11', 'ss01', 'ss03';
}

/* Tabular numerals everywhere a stat appears */
.lp-tnum { font-variant-numeric: tabular-nums; font-feature-settings: 'tnum', 'cv11'; }

/* Display headlines — balanced wrapping for cleaner line breaks */
.lp-display { text-wrap: balance; }

/* Italic serif accent — paired with Plus Jakarta for crafted feel */
.lp-serif {
  font-family: 'Instrument Serif', 'Plus Jakarta Sans', serif;
  font-style: italic;
  font-weight: 400;
  letter-spacing: -0.01em;
}

@keyframes float-slow { 0%,100%{transform:translate3d(0,0,0)} 50%{transform:translate3d(0,-14px,0)} }
@keyframes float-med  { 0%,100%{transform:translate3d(0,0,0)} 50%{transform:translate3d(0,-10px,0)} }
@keyframes float-fast { 0%,100%{transform:translate3d(0,0,0)} 50%{transform:translate3d(0,-7px,0)} }
@keyframes fade-up    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
@keyframes fade-in    { from{opacity:0} to{opacity:1} }
@keyframes pulse-dot  { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.25);opacity:0.65} }
@keyframes bar-grow   { from{transform:scaleY(0)} to{transform:scaleY(1)} }
@keyframes shimmer    { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

.lp-fade-up { animation: fade-up 0.7s ${T.easeOut} both; }
.lp-fade-in { animation: fade-in 0.9s ${T.easeOut} both; }

.lp-link {
  color: ${T.text2};
  text-decoration: none;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: -0.005em;
  transition: color 0.15s ${T.ease};
  cursor: pointer;
}
.lp-link:hover { color: ${T.text}; }

.lp-btn-primary {
  background: ${T.accent};
  color: white;
  border: none;
  padding: 13px 26px;
  border-radius: 999px;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: -0.005em;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  box-shadow: 0 6px 18px ${T.accentGlow}, 0 1px 0 rgba(255,255,255,0.18) inset;
  transition: all 0.2s ${T.ease};
}
.lp-btn-primary:hover { background: ${T.accentDark}; transform: translateY(-1px); box-shadow: 0 10px 24px ${T.accentGlow}, 0 1px 0 rgba(255,255,255,0.18) inset; }

.lp-btn-glass {
  background: rgba(255, 255, 255, 0.55);
  color: ${T.text};
  border: 1px solid rgba(255, 255, 255, 0.7);
  padding: 12px 22px;
  border-radius: 999px;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: -0.005em;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  box-shadow: 0 1px 0 rgba(255,255,255,0.8) inset, 0 4px 12px rgba(15,23,42,0.05);
  transition: all 0.2s ${T.ease};
}
.lp-btn-glass:hover { background: rgba(255,255,255,0.75); transform: translateY(-1px); }

.lp-btn-dark {
  background: ${T.surfaceDark};
  color: white;
  border: none;
  padding: 11px 20px;
  border-radius: 999px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.005em;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ${T.ease};
}
.lp-btn-dark:hover { background: #1e293b; transform: translateY(-1px); }

.lp-card-hover { transition: transform 0.3s ${T.easeOut}, box-shadow 0.3s ${T.easeOut}; }
.lp-card-hover:hover { transform: translateY(-3px); box-shadow: ${T.shadowLift}; }

/* Eyebrow / overline label — refined small caps */
.lp-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 11px;
  border-radius: 999px;
  background: rgba(124, 58, 237, 0.08);
  color: ${T.accent};
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.lp-eyebrow-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: ${T.accent};
}

::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: ${T.bg}; }
::-webkit-scrollbar-thumb { background: ${T.borderHi}; border-radius: 999px; }
::-webkit-scrollbar-thumb:hover { background: ${T.text4}; }
`;

/* ═══════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════ */
const LandingPage = () => {
  const navigate = useNavigate();

  const goLogin    = () => navigate('/login');
  const goRegister = () => navigate('/register');

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <div style={{ background: T.bg, minHeight: '100vh' }}>
        <Nav onLogin={goLogin} onSignUp={goRegister} />
        <Hero onGetStarted={goRegister} />
        <DemoCard />
        <MetricsRow />
        <FeaturesGrid />
        <AnalyticsShowcase />
        <FooterCTA onGetStarted={goRegister} />
        <Footer />
      </div>
    </>
  );
};

export default LandingPage;
