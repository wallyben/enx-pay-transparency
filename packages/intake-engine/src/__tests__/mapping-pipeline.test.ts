import {
  Gender,
  IntakeFileStatus,
  LogicalIntakeField,
  MappingNormalizationIssueCode,
  type IntakeFileRecord,
  type IntakeMappingProfile,
} from '@enx/contracts';
import { DEFAULT_INTAKE_MAPPING_PROFILE } from '../default-mapping-profile';
import { runMappingNormalization } from '../mapping-pipeline';

function baseRecord(overrides: Partial<IntakeFileRecord> = {}): IntakeFileRecord {
  return {
    intakeFileId: '550e8400-e29b-41d4-a716-446655440000',
    originalFilename: 't.csv',
    contentType: 'text/csv',
    byteLength: 1,
    status: IntakeFileStatus.STRUCTURALLY_VALID,
    validation: { ok: true, issues: [] },
    createdAt: new Date().toISOString(),
    contentSha256: 'abc',
    ...overrides,
  };
}

describe('runMappingNormalization', () => {
  it('gates quarantined files before any mapping work', () => {
    const csv = Buffer.from('worker_id,base_pay,gender\nw1,1,X\n', 'utf8');
    const result = runMappingNormalization({
      record: baseRecord({ status: IntakeFileStatus.QUARANTINED }),
      bytes: csv,
      profile: DEFAULT_INTAKE_MAPPING_PROFILE,
    });
    expect(result.gated).toBe(true);
    expect(result.rows).toHaveLength(0);
    expect(result.fileIssues[0]?.code).toBe(
      MappingNormalizationIssueCode.GATING_FILE_NOT_STRUCTURALLY_VALID,
    );
    expect(result.ok).toBe(false);
  });

  it('fails when a required logical field is not mapped in the profile', () => {
    const profile: IntakeMappingProfile = {
      profileId: 'broken',
      version: '1',
      columnByLogicalField: {
        [LogicalIntakeField.WORKER_EXTERNAL_ID]: 'worker_id',
        [LogicalIntakeField.BASE_PAY_AMOUNT]: 'base_pay',
      },
      requiredLogicalFields: [
        LogicalIntakeField.WORKER_EXTERNAL_ID,
        LogicalIntakeField.BASE_PAY_AMOUNT,
        LogicalIntakeField.GENDER,
      ],
    };
    const csv = Buffer.from('worker_id,base_pay,gender\nw1,50000,MALE\n', 'utf8');
    const result = runMappingNormalization({
      record: baseRecord(),
      bytes: csv,
      profile,
    });
    expect(result.ok).toBe(false);
    expect(result.rows).toHaveLength(0);
    expect(
      result.fileIssues.some(
        (i) => i.code === MappingNormalizationIssueCode.PROFILE_MISSING_REQUIRED_FIELD_MAPPING,
      ),
    ).toBe(true);
  });

  it('fails when profile maps to a column missing from the file', () => {
    const profile: IntakeMappingProfile = {
      profileId: 'missing-col',
      version: '1',
      columnByLogicalField: {
        ...DEFAULT_INTAKE_MAPPING_PROFILE.columnByLogicalField,
        [LogicalIntakeField.GENDER]: 'gender_code',
      },
      requiredLogicalFields: DEFAULT_INTAKE_MAPPING_PROFILE.requiredLogicalFields,
    };
    const csv = Buffer.from('worker_id,base_pay,gender\nw1,50000,MALE\n', 'utf8');
    const result = runMappingNormalization({
      record: baseRecord(),
      bytes: csv,
      profile,
    });
    expect(result.ok).toBe(false);
    expect(result.rows).toHaveLength(0);
    expect(
      result.fileIssues.some(
        (i) => i.code === MappingNormalizationIssueCode.PROFILE_SOURCE_COLUMN_NOT_IN_FILE,
      ),
    ).toBe(true);
  });

  it('surfaces row-level normalization issues for bad gender values', () => {
    const csv = Buffer.from('worker_id,base_pay,gender\nw1,50000,NOT_A_GENDER\n', 'utf8');
    const result = runMappingNormalization({
      record: baseRecord(),
      bytes: csv,
      profile: DEFAULT_INTAKE_MAPPING_PROFILE,
    });
    expect(result.gated).toBe(false);
    expect(result.fileIssues).toHaveLength(0);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.issues[0]?.code).toBe(
      MappingNormalizationIssueCode.ROW_INVALID_GENDER_VALUE,
    );
    expect(result.ok).toBe(false);
  });

  it('produces deterministic normalized output for a valid file', () => {
    const csv = Buffer.from('worker_id,base_pay,gender\n w1 ,50000,male\n', 'utf8');
    const a = runMappingNormalization({
      record: baseRecord(),
      bytes: csv,
      profile: DEFAULT_INTAKE_MAPPING_PROFILE,
    });
    const b = runMappingNormalization({
      record: baseRecord(),
      bytes: csv,
      profile: DEFAULT_INTAKE_MAPPING_PROFILE,
    });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    expect(a.ok).toBe(true);
    expect(a.rows[0]?.values.WORKER_EXTERNAL_ID).toEqual({ kind: 'STRING', value: 'w1' });
    expect(a.rows[0]?.values.BASE_PAY_AMOUNT).toEqual({ kind: 'DECIMAL', value: '50000' });
    expect(a.rows[0]?.values.GENDER).toEqual({ kind: 'GENDER', value: Gender.Male });
  });
});
