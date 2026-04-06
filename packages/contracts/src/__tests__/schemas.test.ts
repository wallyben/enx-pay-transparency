import {
  ApiErrorSchema,
  CaseworkStatusSchema,
  ContractTypeSchema,
  CountryCodeSchema,
  EmploymentTypeSchema,
  GenderSchema,
  IntakeFileRecordSchema,
  PaginationQuerySchema,
  PayComponentSchema,
  RemediationStatusSchema,
  ReviewStatusSchema,
  SnapshotStatusSchema,
  StructuralValidationResultSchema,
  WorkerStatusSchema,
} from '../schemas';
import { CaseworkStatus } from '../enums/casework-status';
import { ContractType } from '../enums/contract-type';
import { CountryCode } from '../enums/country-code';
import { EmploymentType } from '../enums/employment-type';
import { Gender } from '../enums/gender';
import { PayComponent } from '../enums/pay-component';
import { RemediationStatus } from '../enums/remediation-status';
import { ReviewStatus } from '../enums/review-status';
import { SnapshotStatus } from '../enums/snapshot-status';
import { IntakeFileStatus } from '../enums/intake-file-status';
import { StructuralIssueCode } from '../enums/structural-issue-code';
import { WorkerStatus } from '../enums/worker-status';

describe('Enum schemas — accept valid values', () => {
  it('WorkerStatusSchema accepts valid enum value', () => {
    expect(WorkerStatusSchema.parse(WorkerStatus.Active)).toBe('ACTIVE');
    expect(WorkerStatusSchema.parse('TERMINATED')).toBe('TERMINATED');
  });

  it('WorkerStatusSchema rejects invalid value', () => {
    expect(() => WorkerStatusSchema.parse('UNKNOWN')).toThrow();
  });

  it('EmploymentTypeSchema accepts valid values', () => {
    expect(EmploymentTypeSchema.parse(EmploymentType.FullTime)).toBe('FULL_TIME');
    expect(EmploymentTypeSchema.parse(EmploymentType.PartTime)).toBe('PART_TIME');
  });

  it('ContractTypeSchema accepts valid values', () => {
    expect(ContractTypeSchema.parse(ContractType.Permanent)).toBe('PERMANENT');
    expect(ContractTypeSchema.parse(ContractType.FixedTerm)).toBe('FIXED_TERM');
  });

  it('GenderSchema accepts all valid values', () => {
    expect(GenderSchema.parse(Gender.Male)).toBe('MALE');
    expect(GenderSchema.parse(Gender.Female)).toBe('FEMALE');
    expect(GenderSchema.parse(Gender.NonBinary)).toBe('NON_BINARY');
    expect(GenderSchema.parse(Gender.Undisclosed)).toBe('UNDISCLOSED');
  });

  it('GenderSchema rejects invalid value', () => {
    expect(() => GenderSchema.parse('UNKNOWN_GENDER')).toThrow();
  });

  it('PayComponentSchema accepts valid values', () => {
    expect(PayComponentSchema.parse(PayComponent.BaseSalary)).toBe('BASE_SALARY');
    expect(PayComponentSchema.parse(PayComponent.Bonus)).toBe('BONUS');
  });

  it('SnapshotStatusSchema accepts valid values', () => {
    expect(SnapshotStatusSchema.parse(SnapshotStatus.Draft)).toBe('DRAFT');
    expect(SnapshotStatusSchema.parse(SnapshotStatus.Sealed)).toBe('SEALED');
  });

  it('CaseworkStatusSchema accepts valid values', () => {
    expect(CaseworkStatusSchema.parse(CaseworkStatus.Open)).toBe('OPEN');
    expect(CaseworkStatusSchema.parse(CaseworkStatus.Overdue)).toBe('OVERDUE');
  });

  it('RemediationStatusSchema accepts valid values', () => {
    expect(RemediationStatusSchema.parse(RemediationStatus.Open)).toBe('OPEN');
    expect(RemediationStatusSchema.parse(RemediationStatus.Closed)).toBe('CLOSED');
  });

  it('ReviewStatusSchema accepts valid values', () => {
    expect(ReviewStatusSchema.parse(ReviewStatus.Pending)).toBe('PENDING');
    expect(ReviewStatusSchema.parse(ReviewStatus.Approved)).toBe('APPROVED');
    expect(ReviewStatusSchema.parse(ReviewStatus.Rejected)).toBe('REJECTED');
  });

  it('CountryCodeSchema accepts all 12 in-scope codes', () => {
    for (const code of Object.values(CountryCode)) {
      expect(CountryCodeSchema.parse(code)).toBe(code);
    }
  });

  it('CountryCodeSchema rejects an out-of-scope code', () => {
    expect(() => CountryCodeSchema.parse('US')).toThrow();
    expect(() => CountryCodeSchema.parse('XX')).toThrow();
  });
});

describe('ApiErrorSchema', () => {
  it('parses a valid ApiError', () => {
    const result = ApiErrorSchema.parse({
      code: 'NOT_FOUND',
      message: 'Resource not found',
    });
    expect(result.code).toBe('NOT_FOUND');
    expect(result.message).toBe('Resource not found');
    expect(result.details).toBeUndefined();
  });

  it('parses an ApiError with details', () => {
    const result = ApiErrorSchema.parse({
      code: 'VALIDATION_ERROR',
      message: 'Invalid input',
      details: { field: 'email' },
    });
    expect(result.details).toEqual({ field: 'email' });
  });

  it('rejects an ApiError with empty code', () => {
    expect(() => ApiErrorSchema.parse({ code: '', message: 'msg' })).toThrow();
  });

  it('rejects an ApiError with empty message', () => {
    expect(() => ApiErrorSchema.parse({ code: 'ERR', message: '' })).toThrow();
  });

  it('rejects an ApiError missing required fields', () => {
    expect(() => ApiErrorSchema.parse({ code: 'ERR' })).toThrow();
    expect(() => ApiErrorSchema.parse({ message: 'msg' })).toThrow();
  });
});

describe('Intake structural schemas', () => {
  it('StructuralValidationResultSchema accepts a valid result', () => {
    const parsed = StructuralValidationResultSchema.parse({
      ok: false,
      issues: [
        {
          code: StructuralIssueCode.TYPE_MISMATCH,
          column: 'base_pay',
          rowIndex: 0,
          expected: 'NUMBER',
          actual: 'x',
        },
      ],
    });
    expect(parsed.ok).toBe(false);
    const first = parsed.issues[0];
    expect(first).toBeDefined();
    expect(first?.code).toBe(StructuralIssueCode.TYPE_MISMATCH);
  });

  it('IntakeFileRecordSchema accepts a valid record', () => {
    const parsed = IntakeFileRecordSchema.parse({
      intakeFileId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      originalFilename: 'f.csv',
      contentType: 'text/csv',
      byteLength: 12,
      status: IntakeFileStatus.QUARANTINED,
      validation: { ok: false, issues: [{ code: StructuralIssueCode.EMPTY_FILE }] },
      createdAt: new Date().toISOString(),
      contentSha256: 'abc',
    });
    expect(parsed.status).toBe(IntakeFileStatus.QUARANTINED);
  });
});

describe('PaginationQuerySchema', () => {
  it('parses a valid pagination query', () => {
    const result = PaginationQuerySchema.parse({ page: 1, pageSize: 25 });
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(25);
  });

  it('rejects page < 1', () => {
    expect(() => PaginationQuerySchema.parse({ page: 0, pageSize: 25 })).toThrow();
  });

  it('rejects pageSize < 1', () => {
    expect(() => PaginationQuerySchema.parse({ page: 1, pageSize: 0 })).toThrow();
  });

  it('rejects pageSize > 200', () => {
    expect(() => PaginationQuerySchema.parse({ page: 1, pageSize: 201 })).toThrow();
  });

  it('rejects non-integer page', () => {
    expect(() => PaginationQuerySchema.parse({ page: 1.5, pageSize: 25 })).toThrow();
  });
});
