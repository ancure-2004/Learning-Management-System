/* ═══════════════════════════════════════════════════════════════
   Lightweight zod validation helper.

   validate(schema, data) -> { success, errors }
   where `errors` is a { field: message } map built from zod's
   error.issues. Framework-agnostic — no React dependency.
   ═══════════════════════════════════════════════════════════════ */

export function validate(schema, data) {
  const r = schema.safeParse(data);
  if (r.success) return { success: true, errors: {} };

  const errors = {};
  for (const i of r.error.issues) {
    const key = i.path[0] ?? '_';
    // Keep the first message per field.
    if (!errors[key]) errors[key] = i.message;
  }
  return { success: false, errors };
}
