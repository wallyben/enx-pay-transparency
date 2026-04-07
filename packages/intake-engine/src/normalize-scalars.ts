import {
  Gender,
  LogicalIntakeField,
  MappingNormalizationIssue,
  MappingNormalizationIssueCode,
  type NormalizedScalar,
} from '@enx/contracts';

const DECIMAL_RE = /^-?\d+(\.\d+)?$/;

function baseIssue(
  code: MappingNormalizationIssueCode,
  ctx: {
    rowIndex: number;
    logicalField: LogicalIntakeField;
    sourceColumn: string;
    expected?: string;
    actual?: string;
  },
): MappingNormalizationIssue {
  return {
    code,
    logicalField: ctx.logicalField,
    sourceColumn: ctx.sourceColumn,
    rowIndex: ctx.rowIndex,
    expected: ctx.expected,
    actual: ctx.actual,
  };
}

export function normalizeWorkerExternalId(
  raw: string,
  ctx: { rowIndex: number; sourceColumn: string },
): { ok: true; value: NormalizedScalar } | { ok: false; issue: MappingNormalizationIssue } {
  const value = raw.trim();
  if (value.length === 0) {
    return {
      ok: false as const,
      issue: baseIssue(MappingNormalizationIssueCode.ROW_EMPTY_REQUIRED_VALUE, {
        rowIndex: ctx.rowIndex,
        logicalField: LogicalIntakeField.WORKER_EXTERNAL_ID,
        sourceColumn: ctx.sourceColumn,
        expected: 'non_empty_trimmed_string',
        actual: raw,
      }),
    };
  }
  return { ok: true as const, value: { kind: 'STRING', value } };
}

export function normalizeBasePayDecimal(
  raw: string,
  ctx: { rowIndex: number; sourceColumn: string },
): { ok: true; value: NormalizedScalar } | { ok: false; issue: MappingNormalizationIssue } {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return {
      ok: false as const,
      issue: baseIssue(MappingNormalizationIssueCode.ROW_EMPTY_REQUIRED_VALUE, {
        rowIndex: ctx.rowIndex,
        logicalField: LogicalIntakeField.BASE_PAY_AMOUNT,
        sourceColumn: ctx.sourceColumn,
        expected: 'non_empty_decimal_string',
        actual: raw,
      }),
    };
  }
  if (!DECIMAL_RE.test(trimmed)) {
    return {
      ok: false as const,
      issue: baseIssue(MappingNormalizationIssueCode.ROW_INVALID_DECIMAL_VALUE, {
        rowIndex: ctx.rowIndex,
        logicalField: LogicalIntakeField.BASE_PAY_AMOUNT,
        sourceColumn: ctx.sourceColumn,
        expected: 'decimal_string',
        actual: trimmed,
      }),
    };
  }
  return { ok: true as const, value: { kind: 'DECIMAL', value: trimmed } };
}

export function normalizeGenderValue(
  raw: string,
  ctx: { rowIndex: number; sourceColumn: string },
): { ok: true; value: NormalizedScalar } | { ok: false; issue: MappingNormalizationIssue } {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return {
      ok: false as const,
      issue: baseIssue(MappingNormalizationIssueCode.ROW_EMPTY_REQUIRED_VALUE, {
        rowIndex: ctx.rowIndex,
        logicalField: LogicalIntakeField.GENDER,
        sourceColumn: ctx.sourceColumn,
        expected: 'non_empty_gender_token',
        actual: raw,
      }),
    };
  }

  const token = trimmed.toUpperCase().replace(/[\s-]+/g, '_');

  const map: Record<string, Gender> = {
    MALE: Gender.Male,
    M: Gender.Male,
    FEMALE: Gender.Female,
    F: Gender.Female,
    NON_BINARY: Gender.NonBinary,
    NONBINARY: Gender.NonBinary,
    NB: Gender.NonBinary,
    UNDISCLOSED: Gender.Undisclosed,
    NOT_DISCLOSED: Gender.Undisclosed,
    PREFER_NOT_TO_SAY: Gender.Undisclosed,
    PREFER_NOT_TO_DISCLOSE: Gender.Undisclosed,
  };

  const gender = map[token];
  if (gender === undefined) {
    return {
      ok: false as const,
      issue: baseIssue(MappingNormalizationIssueCode.ROW_INVALID_GENDER_VALUE, {
        rowIndex: ctx.rowIndex,
        logicalField: LogicalIntakeField.GENDER,
        sourceColumn: ctx.sourceColumn,
        expected: 'known_gender_token',
        actual: trimmed,
      }),
    };
  }

  return { ok: true as const, value: { kind: 'GENDER', value: gender } };
}

export type LogicalStringNormalizeResult =
  | { ok: true; value: NormalizedScalar }
  | { ok: true; absent: true }
  | { ok: false; issue: MappingNormalizationIssue };

export function normalizeLogicalStringField(
  logicalField: LogicalIntakeField,
  raw: string,
  ctx: { rowIndex: number; sourceColumn: string },
  options: { readonly required: boolean },
): LogicalStringNormalizeResult {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    if (options.required) {
      return {
        ok: false as const,
        issue: baseIssue(MappingNormalizationIssueCode.ROW_EMPTY_REQUIRED_VALUE, {
          rowIndex: ctx.rowIndex,
          logicalField,
          sourceColumn: ctx.sourceColumn,
          expected: 'non_empty_trimmed_string',
          actual: raw,
        }),
      };
    }
    return { ok: true as const, absent: true };
  }
  return { ok: true as const, value: { kind: 'STRING', value: trimmed } };
}
