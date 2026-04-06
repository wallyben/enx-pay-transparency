export type GradeNormalizeResult =
  | { kind: 'ok'; value: string }
  | { kind: 'ambiguous' }
  | { kind: 'unmapped' };

/**
 * Rule-based grade / level parsing. Deliberately small; extend in later slices if needed.
 */
export function normalizeGradeOrLevelRaw(raw: string): GradeNormalizeResult {
  const token = raw.normalize('NFC').trim().toUpperCase().replace(/\s+/g, '_');
  if (token.length === 0) return { kind: 'unmapped' };

  if (/[\/|]/.test(raw)) {
    return { kind: 'ambiguous' };
  }

  const lMatch = /^L(\d+)$/.exec(token);
  if (lMatch) {
    return { kind: 'ok', value: `L${lMatch[1]}` };
  }

  const levelMatch = /^LEVEL_?(\d+)$/.exec(token);
  if (levelMatch) {
    return { kind: 'ok', value: `L${levelMatch[1]}` };
  }

  const seniorMatch = /^SENIOR_?(\d+)$/.exec(token);
  if (seniorMatch) {
    return { kind: 'ok', value: `L${seniorMatch[1]}` };
  }

  if (/^[A-Z][A-Z0-9_-]{0,31}$/.test(token)) {
    return { kind: 'ok', value: token.replace(/-/g, '_') };
  }

  return { kind: 'unmapped' };
}
