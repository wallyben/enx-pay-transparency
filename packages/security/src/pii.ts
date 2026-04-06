// ---------------------------------------------------------------------------
// PII Field Tagging and Masking Utilities
// ---------------------------------------------------------------------------

export type PiiTag = 'PII' | 'SENSITIVE' | 'ENCRYPTED';

export interface PiiField<T> {
  readonly value: T;
  readonly tags: ReadonlyArray<PiiTag>;
}

// ---------------------------------------------------------------------------
// Constructors
// ---------------------------------------------------------------------------

export function tagAsPii<T>(value: T): PiiField<T> {
  return { value, tags: ['PII'] };
}

export function tagAsSensitive<T>(value: T): PiiField<T> {
  return { value, tags: ['SENSITIVE'] };
}

export function tagAsPiiAndSensitive<T>(value: T): PiiField<T> {
  return { value, tags: ['PII', 'SENSITIVE'] };
}

// ---------------------------------------------------------------------------
// Guard
// ---------------------------------------------------------------------------

export function isPiiField<T>(value: unknown): value is PiiField<T> {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  if (!Array.isArray(v['tags'])) return false;
  const validTags: PiiTag[] = ['PII', 'SENSITIVE', 'ENCRYPTED'];
  return (
    'value' in v &&
    (v['tags'] as unknown[]).every((t) => validTags.includes(t as PiiTag))
  );
}

// ---------------------------------------------------------------------------
// Masking
// ---------------------------------------------------------------------------

const DEFAULT_STRING_MASK = '[REDACTED]';

export function maskPiiField<T>(field: PiiField<T>, mask: T): PiiField<T> {
  if (field.tags.includes('PII') || field.tags.includes('SENSITIVE')) {
    return { ...field, value: mask };
  }
  return field;
}

export function maskPiiString(field: PiiField<string>): PiiField<string> {
  return maskPiiField(field, DEFAULT_STRING_MASK);
}

// ---------------------------------------------------------------------------
// Object-level PII extraction
// Produces a shallow copy with PII fields replaced by their masked version.
// Only works on PiiField<string> properties for now.
// ---------------------------------------------------------------------------

export type PiiMasked<T extends Record<string, unknown>> = {
  [K in keyof T]: T[K] extends PiiField<string> ? PiiField<string> : T[K];
};

export function maskAllPiiFields<T extends Record<string, unknown>>(
  obj: T,
): PiiMasked<T> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (isPiiField<string>(val)) {
      result[key] = maskPiiString(val as PiiField<string>);
    } else {
      result[key] = val;
    }
  }
  return result as PiiMasked<T>;
}

export function extractPiiFieldKeys<T extends Record<string, unknown>>(
  obj: T,
): Array<keyof T> {
  return (Object.keys(obj) as Array<keyof T>).filter((key) =>
    isPiiField(obj[key]),
  );
}
