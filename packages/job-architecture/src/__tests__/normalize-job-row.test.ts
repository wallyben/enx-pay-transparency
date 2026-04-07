import { Gender, JobNormalizationIssueCode, LogicalIntakeField } from '@enx/contracts';
import type { NormalizedIntakeRowResult } from '@enx/contracts';
import { normalizeJobRow } from '../normalize-job-row';

function row(partial: Partial<NormalizedIntakeRowResult>): NormalizedIntakeRowResult {
  return {
    rowIndex: partial.rowIndex ?? 0,
    values: partial.values ?? {},
    issues: partial.issues ?? [],
  };
}

describe('normalizeJobRow', () => {
  const rules = 'job-norm-rules@1.0.0';

  it('produces stable normalized title and grade when inputs are valid', () => {
    const r = normalizeJobRow(
      row({
        rowIndex: 0,
        values: {
          [LogicalIntakeField.WORKER_EXTERNAL_ID]: { kind: 'STRING', value: 'w1' },
          [LogicalIntakeField.JOB_TITLE]: { kind: 'STRING', value: '  Analyst ' },
          [LogicalIntakeField.JOB_GRADE_OR_LEVEL]: { kind: 'STRING', value: 'level 4' },
        },
      }),
      rules,
    );
    expect(r.issues).toHaveLength(0);
    expect(r.descriptor.normalized.titleNormalized).toBe('ANALYST');
    expect(r.descriptor.normalized.gradeOrLevelNormalized).toBe('L4');
    expect(r.workerExternalId).toBe('w1');
  });

  it('emits missing title when job title is absent', () => {
    const r = normalizeJobRow(
      row({
        rowIndex: 3,
        values: {
          [LogicalIntakeField.WORKER_EXTERNAL_ID]: { kind: 'STRING', value: 'w2' },
          [LogicalIntakeField.GENDER]: { kind: 'GENDER', value: Gender.Female },
        },
      }),
      rules,
    );
    expect(r.issues.map((i) => i.code)).toContain(JobNormalizationIssueCode.JOB_NORM_MISSING_JOB_TITLE);
    expect(r.descriptor.normalized.titleNormalized).toBeNull();
  });

  it('emits wrong scalar kind when job title is not a STRING scalar', () => {
    const r = normalizeJobRow(
      row({
        rowIndex: 1,
        values: {
          [LogicalIntakeField.WORKER_EXTERNAL_ID]: { kind: 'STRING', value: 'w9' },
          [LogicalIntakeField.JOB_TITLE]: { kind: 'DECIMAL', value: '123' },
        },
      }),
      rules,
    );
    const codes = r.issues.map((i) => i.code);
    expect(codes).toContain(JobNormalizationIssueCode.JOB_NORM_JOB_FIELD_WRONG_SCALAR_KIND);
    expect(codes).not.toContain(JobNormalizationIssueCode.JOB_NORM_MISSING_JOB_TITLE);
  });

  it('sorts issues deterministically', () => {
    const r = normalizeJobRow(
      row({
        rowIndex: 0,
        values: {
          [LogicalIntakeField.JOB_FAMILY_CODE]: { kind: 'STRING', value: '@@@' },
          [LogicalIntakeField.JOB_GRADE_OR_LEVEL]: { kind: 'STRING', value: 'a/b' },
        },
      }),
      rules,
    );
    const codes = r.issues.map((i) => i.code);
    const sorted = [...codes].sort((a, b) => a.localeCompare(b));
    expect(codes).toEqual(sorted);
  });
});
