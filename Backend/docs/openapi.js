/**
 * Auto-generated OpenAPI 3.0 spec — the ASP.NET/Swashbuckle-style experience.
 * Statically SCANS index.js (for route mounts) and routes/*.js (for endpoints)
 * — no `require`, no DB — so it runs anywhere and is always in sync with the code.
 *
 * Used by index.js to serve Swagger UI at /api-docs, and by scripts/gen-openapi.js
 * to emit a static docs/openapi.json.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// Pretty tag name + description per route file (domain).
const DOMAIN_META = {
  auth: 'Authentication & user accounts',
  subjects: 'Subjects', teachers: 'Teachers', classrooms: 'Classrooms',
  departments: 'Departments', programs: 'Programs', classes: 'Classes',
  classSubjects: 'Class–subject assignments', timetables: 'Timetables (generation, editing, conflict-free)',
  progress: 'Teaching progress & session logs', syllabus: 'Syllabi',
  ratings: 'Teacher ratings', reports: 'Reports & analytics', calendar: 'Academic calendar',
  notifications: 'Notifications', attendance: 'Attendance', leave: 'Leave management',
};

function titleCase(s) {
  return s.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim();
}

// Map mount path → route file by parsing index.js: app.use('/x', require('./routes/y'))
function parseMounts() {
  const src = fs.readFileSync(path.join(ROOT, 'index.js'), 'utf8');
  const re = /app\.use\(\s*'([^']+)'\s*,\s*require\('\.\/routes\/([^']+)'\)\)/g;
  const mounts = [];
  let m;
  while ((m = re.exec(src)) !== null) mounts.push({ mount: m[1], file: m[2] });
  return mounts;
}

// Scan a route file for `router.<method>('<path>', ...middleware..., ctrl.action)`
function parseRoutes(file) {
  const src = fs.readFileSync(path.join(ROOT, 'routes', `${file}.js`), 'utf8');
  const re = /router\.(get|post|put|delete|patch)\(\s*'([^']*)'([^\n]*)/g;
  const out = [];
  let m;
  while ((m = re.exec(src)) !== null) {
    const [, method, routePath, rest] = m;
    const secured = /verifyToken/.test(rest);
    const roleMatch = rest.match(/authorize\(([^)]*)\)/);
    const roles = roleMatch
      ? [...roleMatch[1].matchAll(/'([^']+)'/g)].map((r) => r[1])
      : [];
    const hasBody = /validate\(\s*\{[^}]*body/.test(rest);
    out.push({ method, routePath, secured, roles, hasBody });
  }
  return out;
}

function toOpenApiPath(mount, routePath) {
  let p = mount + (routePath === '/' ? '' : routePath);
  if (!p.startsWith('/')) p = '/' + p;
  // :id → {id}
  return p.replace(/:([A-Za-z0-9_]+)/g, '{$1}');
}

function pathParams(openapiPath) {
  return [...openapiPath.matchAll(/\{([A-Za-z0-9_]+)\}/g)].map((m) => ({
    name: m[1], in: 'path', required: true, schema: { type: 'string' },
  }));
}

function buildOpenApiSpec({ serverUrl = 'http://localhost:5000' } = {}) {
  const mounts = parseMounts();
  const tags = [];
  const paths = {};

  for (const { mount, file } of mounts) {
    const tag = titleCase(file);
    tags.push({ name: tag, description: DOMAIN_META[file] || tag });

    for (const ep of parseRoutes(file)) {
      const oaPath = toOpenApiPath(mount, ep.routePath);
      paths[oaPath] = paths[oaPath] || {};

      const params = pathParams(oaPath);
      // Collection GETs support opt-in pagination
      if (ep.method === 'get' && params.length === 0) {
        params.push(
          { name: 'page', in: 'query', required: false, schema: { type: 'integer', minimum: 1 } },
          { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 100 } },
        );
      }

      const op = {
        tags: [tag],
        summary: `${ep.method.toUpperCase()} ${oaPath}`,
        operationId: `${ep.method}_${oaPath.replace(/[^A-Za-z0-9]+/g, '_')}`,
        ...(params.length ? { parameters: params } : {}),
        responses: {
          200: { description: 'Success' },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          ...(ep.secured ? { 401: { description: 'Unauthenticated' } } : {}),
          ...(ep.roles.length ? { 403: { description: `Requires role: ${ep.roles.join(' / ')}` } } : {}),
        },
      };

      if (ep.roles.length) op.summary += `  ·  (admin-only: ${ep.roles.join(', ')})`;
      if (ep.secured) op.security = [{ bearerAuth: [] }];
      if (['post', 'put', 'patch'].includes(ep.method)) {
        op.requestBody = {
          required: ep.hasBody,
          content: { 'application/json': { schema: { type: 'object' } } },
        };
      }

      paths[oaPath][ep.method] = op;
    }
  }

  return {
    openapi: '3.0.3',
    info: {
      title: 'AI Timetable Generator API',
      version: '1.0.0',
      description: 'Auto-generated from the Express routes. Authenticate via `POST /auth/login`, then click **Authorize** and paste the JWT.',
    },
    servers: [{ url: serverUrl }],
    tags,
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string' },
            details: {},
          },
        },
      },
    },
    paths,
  };
}

module.exports = { buildOpenApiSpec };
