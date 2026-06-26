/**
 * Centralized, validated configuration.
 * Reads from process.env (loaded via dotenv) and fails fast if a required
 * value is missing — so the app never boots half-configured.
 */
require('dotenv').config();

const required = (key) => {
  const val = process.env[key];
  if (!val) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
  return val;
};

const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,

  // Database & auth (required — boot fails without them)
  atlasUri: required('ATLAS_URI'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // Python OR-Tools solver service
  solverUrl: process.env.SOLVER_URL || 'http://127.0.0.1:8000',
  solverTimeoutMs: Number(process.env.SOLVER_TIMEOUT_MS) || 60000,

  // CORS — comma-separated allowed origins; '*' allows all (dev only)
  corsOrigins: (process.env.CORS_ORIGINS || '*')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),

  // Auto-open Swagger UI in the browser on dev startup (set OPEN_DOCS=false to disable).
  openDocs: process.env.OPEN_DOCS !== 'false',
};

config.isProd = config.env === 'production';

module.exports = config;
