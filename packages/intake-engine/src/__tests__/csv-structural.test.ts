import { IntakeColumnType, StructuralIssueCode } from '@enx/contracts';
import { parseCsvUtf8, validateCsvStructure } from '../csv-structural';

const layout = {
  columns: [
    { name: 'a', type: IntakeColumnType.STRING, requiredNonEmpty: true },
    { name: 'b', type: IntakeColumnType.NUMBER, requiredNonEmpty: true },
  ],
} as const;

describe('parseCsvUtf8', () => {
  it('returns EMPTY_FILE for empty buffer', () => {
    const r = parseCsvUtf8(Buffer.alloc(0));
    expect(r.kind).toBe('err');
    if (r.kind === 'err') {
      const first = r.validation.issues[0];
      expect(first).toBeDefined();
      expect(first?.code).toBe(StructuralIssueCode.EMPTY_FILE);
    }
  });

  it('parses a simple table', () => {
    const r = parseCsvUtf8(Buffer.from('a,b\n1,2\n', 'utf8'));
    expect(r.kind).toBe('ok');
    if (r.kind === 'ok') {
      expect(r.table.headers).toEqual(['a', 'b']);
      expect(r.table.rows).toEqual([['1', '2']]);
    }
  });
});

describe('validateCsvStructure', () => {
  it('flags empty required field', () => {
    const table = { headers: ['a', 'b'], rows: [['', '3']] };
    const v = validateCsvStructure(table, layout);
    expect(v.ok).toBe(false);
    expect(v.issues.some((i) => i.code === StructuralIssueCode.EMPTY_REQUIRED_FIELD)).toBe(true);
  });
});
