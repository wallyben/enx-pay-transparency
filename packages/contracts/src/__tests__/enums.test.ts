import {
  CaseworkStatus,
  ContractType,
  CountryCode,
  EmploymentType,
  Gender,
  IntakeSnapshotBlockedReason,
  PayComponent,
  RemediationStatus,
  ReviewStatus,
  SnapshotStatus,
  WorkerStatus,
} from '../enums';

describe('WorkerStatus', () => {
  it('has the expected string values', () => {
    expect(WorkerStatus.Active).toBe('ACTIVE');
    expect(WorkerStatus.Inactive).toBe('INACTIVE');
    expect(WorkerStatus.OnLeave).toBe('ON_LEAVE');
    expect(WorkerStatus.Terminated).toBe('TERMINATED');
  });

  it('has exactly 4 members', () => {
    expect(Object.values(WorkerStatus)).toHaveLength(4);
  });
});

describe('EmploymentType', () => {
  it('has the expected string values', () => {
    expect(EmploymentType.FullTime).toBe('FULL_TIME');
    expect(EmploymentType.PartTime).toBe('PART_TIME');
  });
});

describe('ContractType', () => {
  it('has the expected string values', () => {
    expect(ContractType.Permanent).toBe('PERMANENT');
    expect(ContractType.FixedTerm).toBe('FIXED_TERM');
    expect(ContractType.TemporaryAgency).toBe('TEMPORARY_AGENCY');
  });
});

describe('Gender', () => {
  it('has the expected string values', () => {
    expect(Gender.Male).toBe('MALE');
    expect(Gender.Female).toBe('FEMALE');
    expect(Gender.NonBinary).toBe('NON_BINARY');
    expect(Gender.Undisclosed).toBe('UNDISCLOSED');
  });

  it('has exactly 4 members', () => {
    expect(Object.values(Gender)).toHaveLength(4);
  });
});

describe('PayComponent', () => {
  it('has the expected string values', () => {
    expect(PayComponent.BaseSalary).toBe('BASE_SALARY');
    expect(PayComponent.Variable).toBe('VARIABLE');
    expect(PayComponent.Bonus).toBe('BONUS');
    expect(PayComponent.BenefitInKind).toBe('BENEFIT_IN_KIND');
    expect(PayComponent.Allowance).toBe('ALLOWANCE');
    expect(PayComponent.Overtime).toBe('OVERTIME');
  });
});

describe('SnapshotStatus', () => {
  it('has the expected string values', () => {
    expect(SnapshotStatus.Draft).toBe('DRAFT');
    expect(SnapshotStatus.Sealed).toBe('SEALED');
    expect(SnapshotStatus.Published).toBe('PUBLISHED');
    expect(SnapshotStatus.Archived).toBe('ARCHIVED');
  });
});

describe('CaseworkStatus', () => {
  it('has the expected string values', () => {
    expect(CaseworkStatus.Open).toBe('OPEN');
    expect(CaseworkStatus.InProgress).toBe('IN_PROGRESS');
    expect(CaseworkStatus.Responded).toBe('RESPONDED');
    expect(CaseworkStatus.Closed).toBe('CLOSED');
    expect(CaseworkStatus.Overdue).toBe('OVERDUE');
  });
});

describe('RemediationStatus', () => {
  it('has the expected string values', () => {
    expect(RemediationStatus.Open).toBe('OPEN');
    expect(RemediationStatus.InProgress).toBe('IN_PROGRESS');
    expect(RemediationStatus.Resolved).toBe('RESOLVED');
    expect(RemediationStatus.Closed).toBe('CLOSED');
  });
});

describe('ReviewStatus', () => {
  it('has the expected string values', () => {
    expect(ReviewStatus.Pending).toBe('PENDING');
    expect(ReviewStatus.Approved).toBe('APPROVED');
    expect(ReviewStatus.Rejected).toBe('REJECTED');
  });
});

describe('IntakeSnapshotBlockedReason', () => {
  it('has stable string values', () => {
    expect(IntakeSnapshotBlockedReason.MAPPING_GATED).toBe('MAPPING_GATED');
    expect(IntakeSnapshotBlockedReason.INCOMPLETE_ROW_MAPPING).toBe('INCOMPLETE_ROW_MAPPING');
  });
});

describe('CountryCode', () => {
  it('contains all 12 countries in scope', () => {
    const codes = Object.values(CountryCode);
    expect(codes).toContain('BE');
    expect(codes).toContain('DK');
    expect(codes).toContain('FR');
    expect(codes).toContain('DE');
    expect(codes).toContain('IE');
    expect(codes).toContain('IT');
    expect(codes).toContain('NL');
    expect(codes).toContain('NO');
    expect(codes).toContain('PT');
    expect(codes).toContain('ES');
    expect(codes).toContain('SE');
    expect(codes).toContain('GB');
  });

  it('has exactly 12 members', () => {
    expect(Object.values(CountryCode)).toHaveLength(12);
  });
});

describe('Enum values are unique strings', () => {
  const allEnums = [
    WorkerStatus,
    EmploymentType,
    ContractType,
    Gender,
    PayComponent,
    SnapshotStatus,
    CaseworkStatus,
    RemediationStatus,
    ReviewStatus,
    CountryCode,
    IntakeSnapshotBlockedReason,
  ];

  it('every enum has no duplicate values', () => {
    for (const e of allEnums) {
      const values = Object.values(e);
      const unique = new Set(values);
      expect(unique.size).toBe(values.length);
    }
  });
});
