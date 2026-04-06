import {
  CategoryAssignmentBasis,
  CategoryAssignmentIssueCode,
  CategoryAssignmentStatus,
  CategoryOverrideStatus,
  type CategoryAssignmentRowResult,
  type CategoryOverrideRecord,
} from '@enx/contracts';

export function applyGovernedCategoryOverride(input: {
  readonly rowIndex: number;
  readonly baseRowResult: CategoryAssignmentRowResult;
  readonly override: CategoryOverrideRecord;
}): CategoryAssignmentRowResult {
  const { baseRowResult, override } = input;
  if (override.rowIndex !== input.rowIndex) return baseRowResult;

  if (override.status === CategoryOverrideStatus.PENDING) {
    return {
      ...baseRowResult,
      status: CategoryAssignmentStatus.REVIEW_REQUIRED,
      categoryId: null,
      basis: null,
      metricsCalculationBlocked: true,
      governedOverrideId: override.overrideId,
      governedOverrideStatus: CategoryOverrideStatus.PENDING,
      issues: [
        ...baseRowResult.issues,
        {
          code: CategoryAssignmentIssueCode.CAT_ASN_GOVERNED_OVERRIDE_PENDING,
          detail: override.overrideId,
        },
      ],
    };
  }

  if (override.status === CategoryOverrideStatus.REJECTED) {
    return {
      ...baseRowResult,
      governedOverrideId: override.overrideId,
      governedOverrideStatus: CategoryOverrideStatus.REJECTED,
      issues: [
        ...baseRowResult.issues,
        {
          code: CategoryAssignmentIssueCode.CAT_ASN_GOVERNED_OVERRIDE_REJECTED,
          detail: override.overrideId,
        },
      ],
      metricsCalculationBlocked: baseRowResult.status !== CategoryAssignmentStatus.ASSIGNED,
    };
  }

  return {
    ...baseRowResult,
    status: CategoryAssignmentStatus.ASSIGNED,
    categoryId: override.proposedCategoryId,
    basis: CategoryAssignmentBasis.OVERRIDE,
    metricsCalculationBlocked: false,
    governedOverrideId: override.overrideId,
    governedOverrideStatus: CategoryOverrideStatus.APPROVED,
    issues: baseRowResult.issues.filter(
      (i) => i.code !== CategoryAssignmentIssueCode.CAT_ASN_GOVERNED_OVERRIDE_PENDING,
    ),
  };
}
