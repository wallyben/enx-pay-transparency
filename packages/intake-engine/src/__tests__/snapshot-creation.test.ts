import {
  Gender,
  IntakeFileStatus,
  IntakeSnapshotBlockedReason,
  LogicalIntakeField,
  MappingNormalizationIssueCode,
  type IntakeFileRecord,
  type MappingNormalizationResult,
} from '@enx/contracts';
import { DEFAULT_INTAKE_MAPPING_PROFILE } from '../default-mapping-profile';
import { collectIntakeSnapshotBlockedReasons } from '../snapshot-creation';

function baseRecord(overrides: Partial<IntakeFileRecord> = {}): IntakeFileRecord {
  return {
    intakeFileId: '11111111-1111-4111-8111-111111111111',
    originalFilename: 'f.csv',
    contentType: 'text/csv',
    byteLength: 1,
    status: IntakeFileStatus.STRUCTURALLY_VALID,
    validation: { ok: true, issues: [] },
    createdAt: '2026-01-01T00:00:00.000Z',
    contentSha256: 'aa'.repeat(32),
    ...overrides,
  };
}

describe('collectIntakeSnapshotBlockedReasons', () => {
  it('returns empty when mapping is acceptable', () => {
    const mapping: MappingNormalizationResult = {
      intakeFileId: baseRecord().intakeFileId,
      profileId: DEFAULT_INTAKE_MAPPING_PROFILE.profileId,
      profileVersion: DEFAULT_INTAKE_MAPPING_PROFILE.version,
      gated: false,
      ok: true,
      fileIssues: [],
      rows: [
        {
          rowIndex: 0,
          values: {
            [LogicalIntakeField.WORKER_EXTERNAL_ID]: { kind: 'STRING', value: 'w1' },
            [LogicalIntakeField.BASE_PAY_AMOUNT]: { kind: 'DECIMAL', value: '1' },
            [LogicalIntakeField.GENDER]: { kind: 'GENDER', value: Gender.Male },
          },
          issues: [],
        },
      ],
    };
    expect(collectIntakeSnapshotBlockedReasons(mapping, DEFAULT_INTAKE_MAPPING_PROFILE)).toEqual([]);
  });

  it('blocks gated mapping results', () => {
    const mapping: MappingNormalizationResult = {
      intakeFileId: baseRecord().intakeFileId,
      profileId: DEFAULT_INTAKE_MAPPING_PROFILE.profileId,
      profileVersion: DEFAULT_INTAKE_MAPPING_PROFILE.version,
      gated: true,
      gateIssue: {
        code: MappingNormalizationIssueCode.GATING_FILE_NOT_STRUCTURALLY_VALID,
        expected: IntakeFileStatus.STRUCTURALLY_VALID,
        actual: IntakeFileStatus.QUARANTINED,
      },
      ok: false,
      fileIssues: [],
      rows: [],
    };
    const reasons = collectIntakeSnapshotBlockedReasons(mapping, DEFAULT_INTAKE_MAPPING_PROFILE);
    expect(reasons).toContain(IntakeSnapshotBlockedReason.MAPPING_GATED);
    expect(reasons).toContain(IntakeSnapshotBlockedReason.MAPPING_NOT_OK);
    expect(reasons).toContain(IntakeSnapshotBlockedReason.NO_NORMALIZED_ROWS);
  });

  it('blocks when row issues indicate incomplete mapping', () => {
    const mapping: MappingNormalizationResult = {
      intakeFileId: baseRecord().intakeFileId,
      profileId: DEFAULT_INTAKE_MAPPING_PROFILE.profileId,
      profileVersion: DEFAULT_INTAKE_MAPPING_PROFILE.version,
      gated: false,
      ok: false,
      fileIssues: [],
      rows: [
        {
          rowIndex: 0,
          values: {},
          issues: [
            {
              code: MappingNormalizationIssueCode.ROW_EMPTY_REQUIRED_VALUE,
              rowIndex: 0,
              logicalField: LogicalIntakeField.WORKER_EXTERNAL_ID,
              sourceColumn: 'worker_id',
            },
          ],
        },
      ],
    };
    expect(collectIntakeSnapshotBlockedReasons(mapping, DEFAULT_INTAKE_MAPPING_PROFILE)).toContain(
      IntakeSnapshotBlockedReason.INCOMPLETE_ROW_MAPPING,
    );
  });

  it('blocks when required logical fields are missing on a row', () => {
    const mapping: MappingNormalizationResult = {
      intakeFileId: baseRecord().intakeFileId,
      profileId: DEFAULT_INTAKE_MAPPING_PROFILE.profileId,
      profileVersion: DEFAULT_INTAKE_MAPPING_PROFILE.version,
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
    };
    expect(collectIntakeSnapshotBlockedReasons(mapping, DEFAULT_INTAKE_MAPPING_PROFILE)).toContain(
      IntakeSnapshotBlockedReason.INCOMPLETE_ROW_MAPPING,
    );
  });
});
