const CODE_RE = /^[A-Z0-9_]{1,64}$/;

/**
 * Deterministic family/subfamily code shape: uppercase alphanumerics and underscores only.
 */
export function normalizeJobHierarchyCode(raw: string): { ok: true; value: string } | { ok: false } {
  const upper = raw.normalize('NFC').trim().toUpperCase();
  if (upper.length === 0) return { ok: false };
  const replaced = upper.replace(/[^A-Z0-9]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  if (replaced.length === 0 || !CODE_RE.test(replaced)) {
    return { ok: false };
  }
  return { ok: true, value: replaced };
}
