import axios from 'axios';
import { getMock } from './mockData';

// Single source of truth for the backend base URL.
// Override per environment via Frontend/.env (VITE_API_URL).
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TOKEN_KEY = 'token';

// Demo fallback: when the backend is unreachable (e.g. no MongoDB Atlas access
// from a secured facility), serve dummy data so the whole frontend stays usable.
// Enabled by default; set VITE_DEMO_FALLBACK=false to disable.
const DEMO_FALLBACK = import.meta.env.VITE_DEMO_FALLBACK !== 'false';

/**
 * The one and only axios instance for the whole app.
 * Every service imports this — never call axios directly in components.
 */
const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach the JWT on every request ──────────────────
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: unwrap data, normalize errors, handle 401 ───────
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // ── Demo fallback ──────────────────────────────────────────────────────
    // No `error.response` means the request never reached a server (connection
    // refused, DNS failure, timeout, CORS). If demo fallback is on and we have
    // a mock for this endpoint, resolve with dummy data instead of failing.
    if (DEMO_FALLBACK && !error.response) {
      const mock = getMock(error.config?.method, error.config?.url, error.config);
      if (mock !== undefined) {
        if (import.meta.env.DEV) {
          console.info(`[demo] backend unreachable — serving mock for ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
        }
        return Promise.resolve({
          data: mock,
          status: 200,
          statusText: 'OK (demo)',
          headers: {},
          config: error.config,
        });
      }
    }

    // Auth expired / invalid → notify AuthContext (single source of truth)
    // instead of navigating from the network layer. AuthContext clears the
    // session and ProtectedRoute redirects within the SPA — no full-page
    // reload, no lost React Query cache / unsaved state, and one logout path.
    if (status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    // Normalize the error message so callers can rely on error.message
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';

    return Promise.reject(Object.assign(error, { message, status }));
  },
);

export default client;
