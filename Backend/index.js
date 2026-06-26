const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

const config = require('./config');
const notificationService = require('./services/notificationService');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);

// CORS — restricted to configured origins (set CORS_ORIGINS in env for prod).
const corsOptions = {
  origin: config.corsOrigins.includes('*') ? '*' : config.corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
};

// Socket.IO
const io = new Server(server, { cors: corsOptions });
app.set('io', io);
notificationService.init(io);

io.on('connection', (socket) => {
  socket.on('join-user-room', (userId) => socket.join(`user-${userId}`));
});

// Core middleware
app.use(helmet());
app.use(compression());
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));

// Rate limiting — generous global cap + a strict cap on auth (anti brute-force)
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many requests, please try again later.' },
}));
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many attempts. Please wait and try again.' },
});
app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);

// Database
mongoose.connect(config.atlasUri);
const connection = mongoose.connection;
connection.once('open', () => console.log('✅ MongoDB connected'));
connection.on('error', (err) => console.error('❌ MongoDB error:', err.message));

// Health check
app.get('/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({ status: 'ok', db: states[mongoose.connection.readyState] || 'unknown', env: config.env });
});

// API docs (Swagger UI) — auto-generated from the routes, served at /api-docs.
try {
  const swaggerUi = require('swagger-ui-express');
  const { buildOpenApiSpec } = require('./docs/openapi');
  const spec = buildOpenApiSpec({ serverUrl: `http://localhost:${config.port}` });
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec, { customSiteTitle: 'AI Timetable API' }));
  console.log(`📖 API docs at http://localhost:${config.port}/api-docs`);
} catch (e) {
  console.warn('API docs unavailable:', e.message);
}

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/subjects', require('./routes/subjects'));
app.use('/teachers', require('./routes/teachers'));
app.use('/classrooms', require('./routes/classrooms'));
app.use('/departments', require('./routes/departments'));
app.use('/programs', require('./routes/programs'));
app.use('/classes', require('./routes/classes'));
app.use('/class-subjects', require('./routes/classSubjects'));
app.use('/timetables', require('./routes/timetables'));
app.use('/progress', require('./routes/progress'));
app.use('/syllabus', require('./routes/syllabus'));
app.use('/ratings', require('./routes/ratings'));
app.use('/reports', require('./routes/reports'));
app.use('/calendar', require('./routes/calendar'));
app.use('/notifications', require('./routes/notifications'));
app.use('/attendance', require('./routes/attendance'));
app.use('/leave', require('./routes/leave'));

// 404 + centralized error handling (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

server.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port} (${config.env})`);
  console.log('📢 Socket.IO ready');

  // Dev convenience: auto-open Swagger UI (ASP.NET-style). Off in prod or via OPEN_DOCS=false.
  if (!config.isProd && config.openDocs) {
    const docsUrl = `http://localhost:${config.port}/api-docs`;
    import('open')
      .then(({ default: open }) => open(docsUrl))
      .catch(() => console.log(`(Open ${docsUrl} to view the API docs.)`));
  }
});
