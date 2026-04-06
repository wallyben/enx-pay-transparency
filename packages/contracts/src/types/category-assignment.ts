import type { CategoryAssignmentBasis } from '../enums/category-assignment-basis';
import type { CategoryAssignmentIssueCode } from '../enums/category-assignment-issue-code';
import type { CategoryAssignmentStatus } from '../enums/category-assignment-status';
import type { JobNormalizationIssueCode } from '../enums/job-normalization-issue-code';

export interface CategoryAssignmentTraceability {
  readonly methodologyVersion: string;
  readonly rulePackVersion: string;
  readonly jobNormalizationRulesVersion: string;
  readonly categoryEngineRulesVersion: string;
}

export interface CategoryAssignmentIssue {
  readonly code: CategoryAssignmentIssueCode;
  readonly detail?: string;
}

export interface CategoryAssignmentRowResult {
  readonly rowIndex: number;
  readonly workerExternalId: string | null;
  readonly status: CategoryAssignmentStatus;
  readonly traceability: CategoryAssignmentTraceability;
  readonly categoryId: string | null;
  readonly basis: CategoryAssignmentBasis | null;
  readonly issues: readonly CategoryAssignmentIssue[];
  readonly jobNormalizationIssueCodes: readonly JobNormalizationIssueCode[];
}

export interface CategoryAssignmentSnapshotResult {
  readonly snapshotId: string;
  readonly traceability: CategoryAssignmentTraceability;
  readonly rows: readonly CategoryAssignmentRowResult[];
  readonly assignedCount: number;
  readonly reviewRequiredCount: number;
  readonly unassignedCount: number;
}
