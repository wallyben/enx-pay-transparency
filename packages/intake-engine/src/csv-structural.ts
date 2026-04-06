import {
  IntakeColumnType,
  IntakeLayoutSpec,
  StructuralIssue,
  StructuralIssueCode,
  StructuralValidationResult,
} from '@enx/contracts';

export interface ParsedCsvTable {
  readonly headers: readonly string[];
  readonly rows: readonly (readonly string[])[];
}

export type ParseCsvOutcome =
  | { readonly kind: 'ok'; readonly table: ParsedCsvTable }
  | { readonly kind: 'err'; readonly validation: StructuralValidationResult };

function trimCell(value: string): string {
  return value.trim();
}

export function parseCsvUtf8(bytes: Buffer): ParseCsvOutcome {
  const text = bytes.toString('utf8').replace(/^\uFEFF/, '');
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) {
    return {
      kind: 'err',
      validation: {
        ok: false,
        issues: [{ code: StructuralIssueCode.EMPTY_FILE }],
      },
    };
  }

  const headerLine = lines[0];
  if (headerLine === undefined) {
    return {
      kind: 'err',
      validation: {
        ok: false,
        issues: [{ code: StructuralIssueCode.MISSING_HEADER_ROW }],
      },
    };
  }

  const headers = headerLine.split(',').map(trimCell);
  if (headers.length === 0 || headers.every((h) => h.length === 0)) {
    return {
      kind: 'err',
      validation: {
        ok: false,
        issues: [{ code: StructuralIssueCode.MISSING_HEADER_ROW }],
      },
    };
  }

  const seen = new Set<string>();
  for (const h of headers) {
    if (seen.has(h)) {
      return {
        kind: 'err',
        validation: {
          ok: false,
          issues: [{ code: StructuralIssueCode.DUPLICATE_HEADER, column: h }],
        },
      };
    }
    seen.add(h);
  }

  const rows: string[][] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line === undefined) continue;
    rows.push(line.split(',').map(trimCell));
  }

  return { kind: 'ok', table: { headers, rows } };
}

function matchesNumber(value: string): boolean {
  return /^-?\d+(\.\d+)?$/.test(value.trim());
}

export function validateCsvStructure(
  table: ParsedCsvTable,
  layout: IntakeLayoutSpec,
): StructuralValidationResult {
  const issues: StructuralIssue[] = [];
  const headerIndex = new Map<string, number>();
  table.headers.forEach((h, idx) => headerIndex.set(h, idx));

  for (const col of layout.columns) {
    if (!headerIndex.has(col.name)) {
      issues.push({
        code: StructuralIssueCode.MISSING_REQUIRED_COLUMN,
        column: col.name,
        expected: 'present',
        actual: 'absent',
      });
    }
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  for (let r = 0; r < table.rows.length; r++) {
    const row = table.rows[r];
    if (!row) continue;
    for (const col of layout.columns) {
      const idx = headerIndex.get(col.name);
      if (idx === undefined) continue;
      const raw = row[idx] ?? '';
      if (col.requiredNonEmpty && raw.length === 0) {
        issues.push({
          code: StructuralIssueCode.EMPTY_REQUIRED_FIELD,
          column: col.name,
          rowIndex: r,
        });
        continue;
      }
      if (raw.length === 0) continue;

      if (col.type === IntakeColumnType.NUMBER && !matchesNumber(raw)) {
        issues.push({
          code: StructuralIssueCode.TYPE_MISMATCH,
          column: col.name,
          rowIndex: r,
          expected: IntakeColumnType.NUMBER,
          actual: raw,
        });
      }
    }
  }

  return issues.length === 0 ? { ok: true, issues: [] } : { ok: false, issues };
}

export function runStructuralValidation(
  bytes: Buffer,
  layout: IntakeLayoutSpec,
): StructuralValidationResult {
  const parsed = parseCsvUtf8(bytes);
  if (parsed.kind === 'err') {
    return parsed.validation;
  }
  return validateCsvStructure(parsed.table, layout);
}
