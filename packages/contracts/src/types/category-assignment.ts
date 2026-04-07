import type { CategoryAssignmentBasis } from '../enums/category-assignment-basis';
import type { CategoryAssignmentIssueCode } from '../enums/category-assignment-issue-code';
import type { CategoryAssignmentStatus } from '../enums/category-assignment-status';
import type { CategoryOverrideStatus } from '../enums/category-override-status';
import type { JobNormalizationIssueCode } from '../enums/job-normalization-issue-code';

export interface CategoryAssignmentTraceability {
  readonly methodologyVersion: string;
  readonly rulePackVersion: string;
  readonly jobNormalizationRulesVersion: string;
  readonly categoryEngineRulesVersion: string;
  /** Present when assignment used explicit equal-value methodology (S10). */
  readonly equalValueMethodologyVersion?: string;
  /** Equal-value rules pack version used for the row (S10). */
  readonly equalValueRulesVersion?: string;
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
  /** True when downstream pay-gap style calculations must not treat the row as complete (S10 gate for S11+). */
  readonly metricsCalculationBlocked: boolean;
  /** Equal-value group key when basis is EQUAL_VALUE (S10). */
  readonly equalValueGroupKey: string | null;
  /** Override record id when an override was evaluated for the row (S10). */
  readonly governedOverrideId: string | null;
  /** Decision status of the governed override, if any (S10). */
  readonly governedOverrideStatus: CategoryOverrideStatus | null;
}

export interface CategoryAssignmentSnapshotResult {
  readonly snapshotId: string;
  readonly traceability: CategoryAssignmentTraceability;
  readonly rows: readonly CategoryAssignmentRowResult[];
  readonly assignedCount: number;
  readonly reviewRequiredCount: number;
  readonly unassignedCount: number;
  readonly metricsCalculationBlockedCount: number;
}

/**
 * Partial job dimensions for explicit equal-value membership (S10). Only specified fields must match the row.
 */
export interface EqualValueMemberKey {
  readonly familyCodeNormalized?: string;
  readonly subfamilyCodeNormalized?: string;
  readonly gradeOrLevelNormalized?: string;
  readonly titleNormalized?: string;
}

export interface EqualValueGroupDefinition {
  readonly groupKey: string;
  readonly members: readonly EqualValueMemberKey[];
}

export interface EqualValueRuleset {
  readonly methodologyVersion: string;
  readonly rulesVersion: string;
  readonly groups: readonly EqualValueGroupDefinition[];
}

/**
 * First-class governed override proposal (S10). Approval state is enforced by the category engine; no auto-approval.
 */
export interface CategoryOverrideRecord {
  readonly overrideId: string;
  readonly rowIndex: number;
  readonly proposedCategoryId: string;
  readonly status: CategoryOverrideStatus;
  readonly proposedAtIso: string;
  readonly decidedAtIso?: string;
  readonly reviewerActorId?: string;
}
