import { Gender, LogicalIntakeField } from '../enums';
import {
  IntakeMappingProfileSchema,
  MappingNormalizationResultSchema,
  NormalizedIntakeRowResultSchema,
} from '../schemas';

describe('mapping normalization schemas', () => {
  it('parses a valid mapping profile', () => {
    const parsed = IntakeMappingProfileSchema.parse({
      profileId: 'p1',
      version: '1',
      columnByLogicalField: {
        [LogicalIntakeField.WORKER_EXTERNAL_ID]: 'worker_id',
        [LogicalIntakeField.BASE_PAY_AMOUNT]: 'base_pay',
        [LogicalIntakeField.GENDER]: 'gender',
      },
      requiredLogicalFields: [
        LogicalIntakeField.WORKER_EXTERNAL_ID,
        LogicalIntakeField.BASE_PAY_AMOUNT,
        LogicalIntakeField.GENDER,
      ],
    });
    expect(parsed.profileId).toBe('p1');
  });

  it('parses a normalized row result', () => {
    const row = NormalizedIntakeRowResultSchema.parse({
      rowIndex: 0,
      values: {
        [LogicalIntakeField.GENDER]: { kind: 'GENDER', value: Gender.Male },
        [LogicalIntakeField.BASE_PAY_AMOUNT]: { kind: 'DECIMAL', value: '50000' },
        [LogicalIntakeField.WORKER_EXTERNAL_ID]: { kind: 'STRING', value: 'w1' },
      },
      issues: [],
    });
    expect(row.rowIndex).toBe(0);
  });

  it('parses a full mapping normalization result', () => {
    const res = MappingNormalizationResultSchema.parse({
      intakeFileId: '550e8400-e29b-41d4-a716-446655440000',
      profileId: 'p1',
      profileVersion: '1',
      gated: false,
      ok: true,
      fileIssues: [],
      rows: [
        {
          rowIndex: 0,
          values: {
            [LogicalIntakeField.WORKER_EXTERNAL_ID]: { kind: 'STRING', value: 'w1' },
          },
          issues: [],
        },
      ],
    });
    expect(res.ok).toBe(true);
  });
});
