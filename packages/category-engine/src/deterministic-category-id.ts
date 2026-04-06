import { createHash } from 'crypto';

export function canonicalJsonStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return '[' + value.map((item) => canonicalJsonStringify(item)).join(',') + ']';
  }
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonicalJsonStringify(record[k])).join(',') + '}';
}

export type CategoryIdBasis =
  | 'EXACT'
  | 'NORMALIZED_EQUIVALENT'
  | 'EQUAL_VALUE'
  | 'OVERRIDE';

export function deterministicCategoryId(input: {
  readonly categoryEngineRulesVersion: string;
  readonly basis: CategoryIdBasis;
  readonly keyPayload: Record<string, string>;
}): string {
  const envelope = {
    categoryEngineRulesVersion: input.categoryEngineRulesVersion,
    basis: input.basis,
    key: input.keyPayload,
  };
  const json = canonicalJsonStringify(envelope);
  const digest = createHash('sha256').update(json, 'utf8').digest('hex');
  return `cat_${digest}`;
}
