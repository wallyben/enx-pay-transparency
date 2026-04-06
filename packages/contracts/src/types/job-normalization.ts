import type { JobNormalizationIssueCode } from '../enums/job-normalization-issue-code';

export interface JobNormalizationIssue {
  readonly code: JobNormalizationIssueCode;
  readonly rowIndex: number;
  readonly detail?: string;
}

export interface NormalizedJobRawInputs {
  readonly jobTitle?: string;
  readonly jobFamilyCode?: string;
  readonly jobSubfamilyCode?: string;
  readonly jobGradeOrLevel?: string;
}

export interface NormalizedJobShape {
  readonly titleNormalized: string | null;
  readonly familyCodeNormalized: string | null;
  readonly subfamilyCodeNormalized: string | null;
  readonly gradeOrLevelNormalized: string | null;
}

export interface NormalizedJobDescriptor {
  readonly jobNormalizationRulesVersion: string;
  readonly raw: NormalizedJobRawInputs;
  readonly normalized: NormalizedJobShape;
}

export interface JobNormalizationRowResult {
  readonly rowIndex: number;
  readonly workerExternalId: string | null;
  readonly issues: readonly JobNormalizationIssue[];
  readonly descriptor: NormalizedJobDescriptor;
}

export interface JobNormalizationSnapshotResult {
  readonly snapshotId: string;
  readonly jobNormalizationRulesVersion: string;
  readonly rows: readonly JobNormalizationRowResult[];
  readonly rowIssueCount: number;
  readonly ok: boolean;
}
