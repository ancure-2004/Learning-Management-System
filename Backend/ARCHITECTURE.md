# Backend Architecture

A consistent **route → controller → service** layering. Every domain (subjects,
teachers, timetables, …) follows the same shape, so adding a new one is quick
and predictable.

## Layers — what goes where

| Layer | File | Responsibility | Must NOT |
|-------|------|----------------|----------|
| **Route** | `routes/<plural>.js` | Map HTTP path + middleware → controller action. | Contain logic. |
| **Controller** | `controllers/<name>.controller.js` | Read `req` (params/body/query/user), call the service, shape the `res`. Wrapped in `asyncHandler`. | Touch the DB or hold business logic. |
| **Service** | `services/<name>.service.js` | Business logic + Mongoose data access. Throw `ApiError` for expected failures. | Touch `req`/`res`. |

Data flow: `request → route → middleware (verifyToken/authorize) → controller → service → model`.

## Shared building blocks (`utils/`, `middleware/`, `config/`)

- **`config/index.js`** — validated env (fails fast if `ATLAS_URI` / `JWT_SECRET` missing). Read config from here, never `process.env` directly.
- **`utils/asyncHandler.js`** — wrap every async controller action so rejected promises reach the error handler.
- **`utils/ApiError.js`** — typed operational errors: `ApiError.badRequest(msg)`, `.notFound(msg)`, `.unauthorized()`, `.forbidden()`, or `new ApiError(409, msg)`.
- **`middleware/errorHandler.js`** — the single place that formats errors → `{ status:'error', message, details? }` and maps Mongoose/JWT errors. Mounted last in `index.js`.
- **`utils/crudService.js`** / **`utils/crudController.js`** — factories that give you standard `list/getById/create/update/remove` so a plain CRUD domain is ~3 lines per layer.
- **`services/solver.service.js`** — client for the Python OR-Tools solver.
- **`services/notificationService.js`** — Socket.IO push (infra; distinct from the `notification.service.js` CRUD domain).

## Error handling convention

Don't write `try/catch` + `res.status(500).json(...)` in routes/controllers.
Instead, in the service:

```js
if (!name) throw ApiError.badRequest('name is required');
const doc = await Model.findById(id);
if (!doc) throw ApiError.notFound('Widget not found');
```

`asyncHandler` forwards it to `errorHandler`, which returns a consistent JSON
error. Identity comes from the verified token (`req.user._id`) — never trust an
id sent in the body.

## Adding a new domain

### Fast path — scaffold

```bash
npm run scaffold widget
```

Generates `models/widget.model.js`, `services/widget.service.js`,
`controllers/widget.controller.js`, `routes/widgets.js` (won't overwrite
existing files), then prints the one line to add to `index.js`:

```js
app.use('/widgets', require('./routes/widgets'));
```

Fill in the model fields, and you have full CRUD with auth, validation errors,
and consistent responses. Done.

### Custom logic

A standard CRUD service is just:

```js
// services/widget.service.js
const createCrudService = require('../utils/crudService');
const Widget = require('../models/widget.model');
module.exports = createCrudService(Widget, { resourceName: 'Widget', populate: 'owner' });
```

Need extra behavior? Spread the base and add methods:

```js
const base = createCrudService(Widget, { resourceName: 'Widget' });
module.exports = {
  ...base,
  async publish(id) {
    const w = await Widget.findByIdAndUpdate(id, { status: 'published' }, { new: true });
    if (!w) throw require('../utils/ApiError').notFound('Widget not found');
    return w;
  },
};
```

Then add the controller action + route line for `publish`. The 17 existing
domains (which predate the factories) hand-write their services for the same
shape — use `services/subject.service.js` as the canonical reference.

## Conventions checklist for a new endpoint

- [ ] Route is thin; logic lives in the service.
- [ ] Controller action wrapped in `asyncHandler`.
- [ ] Expected failures `throw ApiError`, not `res.status().json()`.
- [ ] Auth via `verifyToken` + `authorize('admin'|'teacher'|'student')` as needed.
- [ ] Identity from `req.user._id`, not the request body.
- [ ] List endpoints should paginate (`?page`, `?limit`) for large collections.
