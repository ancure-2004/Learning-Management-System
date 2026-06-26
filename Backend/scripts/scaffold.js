#!/usr/bin/env node
/**
 * Scaffold a new backend domain following the route → controller → service
 * pattern. Generates a model stub, a CRUD service, a CRUD controller, and a
 * thin route — then tells you the one line to add to index.js.
 *
 *   npm run scaffold widget
 *
 * Creates (won't overwrite existing files):
 *   models/widget.model.js
 *   services/widget.service.js
 *   controllers/widget.controller.js
 *   routes/widgets.js
 */
const fs = require('fs');
const path = require('path');

const raw = process.argv[2];
if (!raw) {
  console.error('Usage: npm run scaffold <name>   (singular, e.g. "widget")');
  process.exit(1);
}

const singular = raw.replace(/[^a-zA-Z0-9]/g, '');
const Singular = singular.charAt(0).toUpperCase() + singular.slice(1);
const plural = singular.endsWith('s') ? singular : `${singular}s`;
const ROOT = path.join(__dirname, '..');

const files = [
  {
    p: `models/${singular}.model.js`,
    body: `const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ${singular}Schema = new Schema({
  name: { type: String, required: true, trim: true },
  // TODO: add fields
}, { timestamps: true });

module.exports = mongoose.model('${Singular}', ${singular}Schema);
`,
  },
  {
    p: `services/${singular}.service.js`,
    body: `const createCrudService = require('../utils/crudService');
const ${Singular} = require('../models/${singular}.model');

// Standard CRUD. Add custom methods by spreading:
//   const base = createCrudService(${Singular}, { resourceName: '${Singular}' });
//   module.exports = { ...base, async customThing(id) { ... } };
module.exports = createCrudService(${Singular}, { resourceName: '${Singular}' });
`,
  },
  {
    p: `controllers/${singular}.controller.js`,
    body: `const createCrudController = require('../utils/crudController');
const ${singular}Service = require('../services/${singular}.service');

module.exports = createCrudController(${singular}Service, { resourceName: '${Singular}' });
`,
  },
  {
    p: `routes/${plural}.js`,
    body: `const router = require('express').Router();
const { verifyToken, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/${singular}.controller');

router.get('/', verifyToken, ctrl.list);
router.get('/:id', verifyToken, ctrl.getById);
router.post('/', verifyToken, authorize('admin'), ctrl.create);
router.put('/:id', verifyToken, authorize('admin'), ctrl.update);
router.delete('/:id', verifyToken, authorize('admin'), ctrl.remove);

module.exports = router;
`,
  },
];

let created = 0;
for (const f of files) {
  const full = path.join(ROOT, f.p);
  if (fs.existsSync(full)) {
    console.log(`skip (exists)  ${f.p}`);
    continue;
  }
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, f.body, 'utf8');
  console.log(`created        ${f.p}`);
  created++;
}

console.log(`\n✅ Scaffolded "${singular}" (${created} file(s)).`);
console.log(`\n👉 Final step — register the route in index.js:\n`);
console.log(`   app.use('/${plural}', require('./routes/${plural}'));\n`);
console.log(`Then fill in the model fields and add any custom service/controller methods.`);
