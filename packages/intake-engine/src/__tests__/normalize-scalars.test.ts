import { Gender, LogicalIntakeField, MappingNormalizationIssueCode } from '@enx/contracts';
import { normalizeBasePayDecimal, normalizeGenderValue, normalizeWorkerExternalId } from '../normalize-scalars';

describe('normalizeWorkerExternalId', () => {
  it('trims and accepts non-empty strings', () => {
    const r = normalizeWorkerExternalId('  abc  ', { rowIndex: 0, sourceColumn: 'worker_id' });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value).toEqual({ kind: 'STRING', value: 'abc' });
    }
  });

  it('rejects empty after trim', () => {
    const r = normalizeWorkerExternalId('   ', { rowIndex: 1, sourceColumn: 'worker_id' });
    expect('issue' in r).toBe(true);
    if ('issue' in r) {
      expect(r.issue.code).toBe(MappingNormalizationIssueCode.ROW_EMPTY_REQUIRED_VALUE);
      expect(r.issue.logicalField).toBe(LogicalIntakeField.WORKER_EXTERNAL_ID);
      expect(r.issue.rowIndex).toBe(1);
    }
  });
});

describe('normalizeBasePayDecimal', () => {
  it('accepts structurally valid decimal strings', () => {
    const r = normalizeBasePayDecimal('50000', { rowIndex: 0, sourceColumn: 'base_pay' });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value).toEqual({ kind: 'DECIMAL', value: '50000' });
    }
  });

  it('rejects invalid decimals', () => {
    const r = normalizeBasePayDecimal('12abc', { rowIndex: 2, sourceColumn: 'base_pay' });
    expect('issue' in r).toBe(true);
    if ('issue' in r) {
      expect(r.issue.code).toBe(MappingNormalizationIssueCode.ROW_INVALID_DECIMAL_VALUE);
    }
  });
});

describe('normalizeGenderValue', () => {
  it('maps common tokens deterministically', () => {
    expect(
      normalizeGenderValue('male', { rowIndex: 0, sourceColumn: 'gender' }),
    ).toEqual({ ok: true, value: { kind: 'GENDER', value: Gender.Male } });
    expect(
      normalizeGenderValue('NON-BINARY', { rowIndex: 0, sourceColumn: 'gender' }),
    ).toEqual({ ok: true, value: { kind: 'GENDER', value: Gender.NonBinary } });
  });

  it('rejects unknown gender tokens', () => {
    const r = normalizeGenderValue('alien', { rowIndex: 3, sourceColumn: 'gender' });
    expect('issue' in r).toBe(true);
    if ('issue' in r) {
      expect(r.issue.code).toBe(MappingNormalizationIssueCode.ROW_INVALID_GENDER_VALUE);
      expect(r.issue.rowIndex).toBe(3);
    }
  });
});
