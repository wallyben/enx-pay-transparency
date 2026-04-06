import { JobNormalizationIssueCode } from '../enums';
import {
  JobNormalizationRowResultSchema,
  JobNormalizationSnapshotResultSchema,
  NormalizedJobDescriptorSchema,
} from '../schemas';

describe('job normalization schemas', () => {
  it('parses a normalized job descriptor', () => {
    const d = NormalizedJobDescriptorSchema.parse({
      jobNormalizationRulesVersion: 'job-norm-rules@1.0.0',
      raw: { jobTitle: 'Engineer' },
      normalized: {
        titleNormalized: 'ENGINEER',
        familyCodeNormalized: null,
        subfamilyCodeNormalized: null,
        gradeOrLevelNormalized: 'L3',
      },
    });
    expect(d.normalized.titleNormalized).toBe('ENGINEER');
  });

  it('parses a row result with issues', () => {
    const row = JobNormalizationRowResultSchema.parse({
      rowIndex: 2,
      workerExternalId: 'w1',
      issues: [{ code: JobNormalizationIssueCode.JOB_NORM_MISSING_JOB_TITLE, rowIndex: 2 }],
      descriptor: {
        jobNormalizationRulesVersion: 'job-norm-rules@1.0.0',
        raw: {},
        normalized: {
          titleNormalized: null,
          familyCodeNormalized: null,
          subfamilyCodeNormalized: null,
          gradeOrLevelNormalized: null,
        },
      },
    });
    expect(row.issues).toHaveLength(1);
  });

  it('parses snapshot result', () => {
    const res = JobNormalizationSnapshotResultSchema.parse({
      snapshotId: 'snp_abcd',
      jobNormalizationRulesVersion: 'job-norm-rules@1.0.0',
      rows: [],
      rowIssueCount: 0,
      ok: true,
    });
    expect(res.ok).toBe(true);
  });
});
