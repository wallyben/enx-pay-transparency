import {
  CategoryAssignmentBasis,
  CategoryAssignmentIssueCode,
  CategoryAssignmentStatus,
  type CategoryAssignmentRowResult,
  type CategoryAssignmentTraceability,
  type JobNormalizationRowResult,
} from '@enx/contracts';
import { DEFAULT_CATEGORY_ENGINE_RULES_VERSION } from './category-assignment-rules-version';
import { deterministicCategoryId } from './deterministic-category-id';

function traceForRow(
  row: JobNormalizationRowResult,
  methodologyVersion: string,
  rulePackVersion: string,
  categoryEngineRulesVersion: string,
): CategoryAssignmentTraceability {
  return {
    methodologyVersion,
    rulePackVersion,
    jobNormalizationRulesVersion: row.descriptor.jobNormalizationRulesVersion,
    categoryEngineRulesVersion,
  };
}

export function assignCategoryToJobNormalizationRow(input: {
  readonly row: JobNormalizationRowResult;
  readonly methodologyVersion: string;
  readonly rulePackVersion: string;
  readonly categoryEngineRulesVersion?: string;
}): CategoryAssignmentRowResult {
  const categoryEngineRulesVersion =
    input.categoryEngineRulesVersion ?? DEFAULT_CATEGORY_ENGINE_RULES_VERSION;
  const traceability = traceForRow(
    input.row,
    input.methodologyVersion,
    input.rulePackVersion,
    categoryEngineRulesVersion,
  );

  const jobCodes = input.row.issues.map((i) => i.code);
  if (input.row.issues.length > 0) {
    return {
      rowIndex: input.row.rowIndex,
      workerExternalId: input.row.workerExternalId,
      status: CategoryAssignmentStatus.REVIEW_REQUIRED,
      traceability,
      categoryId: null,
      basis: null,
      issues: [
        {
          code: CategoryAssignmentIssueCode.CAT_ASN_JOB_NORMALIZATION_ISSUES_PRESENT,
          detail: jobCodes.join(','),
        },
      ],
      jobNormalizationIssueCodes: jobCodes,
    };
  }

  const n = input.row.descriptor.normalized;
  const titleOk = n.titleNormalized !== null && n.titleNormalized.length > 0;
  const familyOk = n.familyCodeNormalized !== null && n.familyCodeNormalized.length > 0;
  const subOk = n.subfamilyCodeNormalized !== null && n.subfamilyCodeNormalized.length > 0;
  const gradeOk = n.gradeOrLevelNormalized !== null && n.gradeOrLevelNormalized.length > 0;

  if (titleOk && familyOk && subOk && gradeOk) {
    const categoryId = deterministicCategoryId({
      categoryEngineRulesVersion,
      basis: 'EXACT',
      keyPayload: {
        titleNormalized: n.titleNormalized as string,
        familyCodeNormalized: n.familyCodeNormalized as string,
        subfamilyCodeNormalized: n.subfamilyCodeNormalized as string,
        gradeOrLevelNormalized: n.gradeOrLevelNormalized as string,
      },
    });
    return {
      rowIndex: input.row.rowIndex,
      workerExternalId: input.row.workerExternalId,
      status: CategoryAssignmentStatus.ASSIGNED,
      traceability,
      categoryId,
      basis: CategoryAssignmentBasis.EXACT,
      issues: [],
      jobNormalizationIssueCodes: [],
    };
  }

  if (familyOk && subOk && gradeOk) {
    const categoryId = deterministicCategoryId({
      categoryEngineRulesVersion,
      basis: 'NORMALIZED_EQUIVALENT',
      keyPayload: {
        familyCodeNormalized: n.familyCodeNormalized as string,
        subfamilyCodeNormalized: n.subfamilyCodeNormalized as string,
        gradeOrLevelNormalized: n.gradeOrLevelNormalized as string,
      },
    });
    return {
      rowIndex: input.row.rowIndex,
      workerExternalId: input.row.workerExternalId,
      status: CategoryAssignmentStatus.ASSIGNED,
      traceability,
      categoryId,
      basis: CategoryAssignmentBasis.NORMALIZED_EQUIVALENT,
      issues: [],
      jobNormalizationIssueCodes: [],
    };
  }

  const allEmpty = !titleOk && !familyOk && !subOk && !gradeOk;
  if (allEmpty) {
    return {
      rowIndex: input.row.rowIndex,
      workerExternalId: input.row.workerExternalId,
      status: CategoryAssignmentStatus.UNASSIGNED,
      traceability,
      categoryId: null,
      basis: null,
      issues: [{ code: CategoryAssignmentIssueCode.CAT_ASN_DESCRIPTOR_EMPTY }],
      jobNormalizationIssueCodes: [],
    };
  }

  return {
    rowIndex: input.row.rowIndex,
    workerExternalId: input.row.workerExternalId,
    status: CategoryAssignmentStatus.REVIEW_REQUIRED,
    traceability,
    categoryId: null,
    basis: null,
    issues: [{ code: CategoryAssignmentIssueCode.CAT_ASN_INSUFFICIENT_JOB_DESCRIPTOR }],
    jobNormalizationIssueCodes: [],
  };
}
