import {
  IntakeFileStatus,
  LogicalIntakeField,
  MappingNormalizationIssueCode,
  type IntakeFileRecord,
  type IntakeMappingProfile,
  type MappingNormalizationIssue,
  type MappingNormalizationResult,
  type NormalizedIntakeRowResult,
  type NormalizedScalar,
} from '@enx/contracts';
import { parseCsvUtf8 } from './csv-structural';
import {
  normalizeBasePayDecimal,
  normalizeGenderValue,
  normalizeLogicalStringField,
  normalizeWorkerExternalId,
} from './normalize-scalars';

function compareIssues(a: MappingNormalizationIssue, b: MappingNormalizationIssue): number {
  const byCode = a.code.localeCompare(b.code);
  if (byCode !== 0) return byCode;
  const aField = a.logicalField ?? '';
  const bField = b.logicalField ?? '';
  const byField = aField.localeCompare(bField);
  if (byField !== 0) return byField;
  const aRow = a.rowIndex ?? -1;
  const bRow = b.rowIndex ?? -1;
  if (aRow !== bRow) return aRow - bRow;
  const aCol = a.sourceColumn ?? '';
  const bCol = b.sourceColumn ?? '';
  return aCol.localeCompare(bCol);
}

function sortIssues(issues: readonly MappingNormalizationIssue[]): MappingNormalizationIssue[] {
  return [...issues].sort(compareIssues);
}

function normalizeField(
  logicalField: LogicalIntakeField,
  raw: string,
  ctx: { rowIndex: number; sourceColumn: string },
  required: boolean,
):
  | { ok: true; value: NormalizedScalar }
  | { ok: true; absent: true }
  | { ok: false; issue: MappingNormalizationIssue } {
  switch (logicalField) {
    case LogicalIntakeField.WORKER_EXTERNAL_ID:
      return normalizeWorkerExternalId(raw, ctx);
    case LogicalIntakeField.BASE_PAY_AMOUNT:
      return normalizeBasePayDecimal(raw, ctx);
    case LogicalIntakeField.GENDER:
      return normalizeGenderValue(raw, ctx);
    case LogicalIntakeField.JOB_TITLE:
    case LogicalIntakeField.JOB_FAMILY_CODE:
    case LogicalIntakeField.JOB_SUBFAMILY_CODE:
    case LogicalIntakeField.JOB_GRADE_OR_LEVEL:
      return normalizeLogicalStringField(logicalField, raw, ctx, { required });
    default: {
      const _exhaustive: never = logicalField;
      return _exhaustive;
    }
  }
}

export function runMappingNormalization(input: {
  readonly record: IntakeFileRecord;
  readonly bytes: Buffer;
  readonly profile: IntakeMappingProfile;
}): MappingNormalizationResult {
  const { record, bytes, profile } = input;

  if (record.status !== IntakeFileStatus.STRUCTURALLY_VALID) {
    const gateIssue: MappingNormalizationIssue = {
      code: MappingNormalizationIssueCode.GATING_FILE_NOT_STRUCTURALLY_VALID,
      expected: IntakeFileStatus.STRUCTURALLY_VALID,
      actual: record.status,
    };
    return {
      intakeFileId: record.intakeFileId,
      profileId: profile.profileId,
      profileVersion: profile.version,
      gated: true,
      gateIssue,
      ok: false,
      fileIssues: sortIssues([gateIssue]),
      rows: [],
    };
  }

  const parsed = parseCsvUtf8(bytes);
  if (parsed.kind === 'err') {
    const issue: MappingNormalizationIssue = {
      code: MappingNormalizationIssueCode.PARSE_ERROR_UNEXPECTED_EMPTY_TABLE,
      expected: 'parseable_csv',
      actual: 'parse_failed_after_structural_gate',
    };
    return {
      intakeFileId: record.intakeFileId,
      profileId: profile.profileId,
      profileVersion: profile.version,
      gated: false,
      ok: false,
      fileIssues: sortIssues([issue]),
      rows: [],
    };
  }

  const table = parsed.table;
  const headerIndex = new Map<string, number>();
  table.headers.forEach((h, idx) => headerIndex.set(h, idx));

  const fileIssues: MappingNormalizationIssue[] = [];

  for (const logicalField of profile.requiredLogicalFields) {
    const mapped = profile.columnByLogicalField[logicalField];
    if (mapped === undefined || mapped.trim().length === 0) {
      fileIssues.push({
        code: MappingNormalizationIssueCode.PROFILE_MISSING_REQUIRED_FIELD_MAPPING,
        logicalField,
        expected: 'mapped_source_column',
        actual: 'missing',
      });
    }
  }

  const resolvedColumns = new Map<LogicalIntakeField, string>();
  for (const logicalField of profile.requiredLogicalFields) {
    const sourceColumn = profile.columnByLogicalField[logicalField];
    if (sourceColumn === undefined || sourceColumn.trim().length === 0) {
      continue;
    }
    if (!headerIndex.has(sourceColumn)) {
      fileIssues.push({
        code: MappingNormalizationIssueCode.PROFILE_SOURCE_COLUMN_NOT_IN_FILE,
        logicalField,
        sourceColumn,
        expected: 'header_present',
        actual: 'absent',
      });
    } else {
      resolvedColumns.set(logicalField, sourceColumn);
    }
  }

  const optionalResolvedColumns = new Map<LogicalIntakeField, string>();
  const requiredSet = new Set(profile.requiredLogicalFields);
  for (const logicalField of Object.values(LogicalIntakeField)) {
    if (requiredSet.has(logicalField)) continue;
    const sourceColumn = profile.columnByLogicalField[logicalField];
    if (sourceColumn === undefined || sourceColumn.trim().length === 0) continue;
    if (headerIndex.has(sourceColumn)) {
      optionalResolvedColumns.set(logicalField, sourceColumn);
    }
  }

  const sortedFileIssues = sortIssues(fileIssues);
  if (sortedFileIssues.length > 0) {
    return {
      intakeFileId: record.intakeFileId,
      profileId: profile.profileId,
      profileVersion: profile.version,
      gated: false,
      ok: false,
      fileIssues: sortedFileIssues,
      rows: [],
    };
  }

  const rows: NormalizedIntakeRowResult[] = [];

  for (let r = 0; r < table.rows.length; r++) {
    const row = table.rows[r];
    const values: Partial<Record<LogicalIntakeField, NormalizedScalar>> = {};
    const rowIssues: MappingNormalizationIssue[] = [];

    for (const logicalField of profile.requiredLogicalFields) {
      const sourceColumn = resolvedColumns.get(logicalField);
      if (sourceColumn === undefined) {
        continue;
      }
      const colIdx = headerIndex.get(sourceColumn);
      if (colIdx === undefined) {
        continue;
      }
      const raw = row?.[colIdx] ?? '';
      const normalized = normalizeField(logicalField, raw, { rowIndex: r, sourceColumn }, true);
      if ('issue' in normalized) {
        rowIssues.push(normalized.issue);
        continue;
      }
      if ('absent' in normalized && normalized.absent === true) {
        continue;
      }
      if ('value' in normalized) {
        values[logicalField] = normalized.value;
      }
    }

    for (const logicalField of optionalResolvedColumns.keys()) {
      const sourceColumn = optionalResolvedColumns.get(logicalField);
      if (sourceColumn === undefined) continue;
      const colIdx = headerIndex.get(sourceColumn);
      if (colIdx === undefined) continue;
      const raw = row?.[colIdx] ?? '';
      const normalized = normalizeField(logicalField, raw, { rowIndex: r, sourceColumn }, false);
      if ('issue' in normalized) {
        rowIssues.push(normalized.issue);
        continue;
      }
      if ('absent' in normalized && normalized.absent === true) {
        continue;
      }
      if ('value' in normalized) {
        values[logicalField] = normalized.value;
      }
    }

    rows.push({
      rowIndex: r,
      values,
      issues: sortIssues(rowIssues),
    });
  }

  const rowHasIssues = rows.some((row) => row.issues.length > 0);
  const ok = !rowHasIssues;

  return {
    intakeFileId: record.intakeFileId,
    profileId: profile.profileId,
    profileVersion: profile.version,
    gated: false,
    ok,
    fileIssues: [],
    rows,
  };
}
