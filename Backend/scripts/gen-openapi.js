#!/usr/bin/env node
/**
 * Emit a static docs/openapi.json from the live routes.  `npm run docs`
 * Runs fully offline (no DB) — handy for CI, sharing, or importing into Postman.
 */
const fs = require('fs');
const path = require('path');
const { buildOpenApiSpec } = require('../docs/openapi');

const spec = buildOpenApiSpec({ serverUrl: process.env.API_URL || 'http://localhost:5000' });
const out = path.join(__dirname, '..', 'docs', 'openapi.json');
fs.writeFileSync(out, JSON.stringify(spec, null, 2), 'utf8');

const count = Object.values(spec.paths).reduce((n, p) => n + Object.keys(p).length, 0);
console.log(`✅ Wrote ${out}`);
console.log(`   ${Object.keys(spec.paths).length} paths, ${count} operations, ${spec.tags.length} tags.`);
