import { z } from 'zod';
import {
  CategoryAssignmentBasisSchema,
  CategoryAssignmentIssueCodeSchema,
  CategoryAssignmentStatusSchema,
  CategoryOverrideStatusSchema,
  JobNormalizationIssueCodeSchema,
} from './enums';

export const CategoryAssignmentTraceabilitySchema = z.object({
  methodologyVersion: z.string().min(1),
  rulePackVersion: z.string().min(1),
  jobNormalizationRulesVersion: z.string().min(1),
  categoryEngineRulesVersion: z.string().min(1),
  equalValueMethodologyVersion: z.string().min(1).optional(),
  equalValueRulesVersion: z.string().min(1).optional(),
});

export const CategoryAssignmentIssueSchema = z.object({
  code: CategoryAssignmentIssueCodeSchema,
  detail: z.string().min(1).optional(),
});

export const CategoryAssignmentRowResultSchema = z.object({
  rowIndex: z.number().int().nonnegative(),
  workerExternalId: z.string().min(1).nullable(),
  status: CategoryAssignmentStatusSchema,
  traceability: CategoryAssignmentTraceabilitySchema,
  categoryId: z.string().min(1).nullable(),
  basis: CategoryAssignmentBasisSchema.nullable(),
  issues: z.array(CategoryAssignmentIssueSchema),
  jobNormalizationIssueCodes: z.array(JobNormalizationIssueCodeSchema),
  metricsCalculationBlocked: z.boolean(),
  equalValueGroupKey: z.string().min(1).nullable(),
  governedOverrideId: z.string().min(1).nullable(),
  governedOverrideStatus: CategoryOverrideStatusSchema.nullable(),
});

export const CategoryAssignmentSnapshotResultSchema = z.object({
  snapshotId: z.string().min(1),
  traceability: CategoryAssignmentTraceabilitySchema,
  rows: z.array(CategoryAssignmentRowResultSchema),
  assignedCount: z.number().int().nonnegative(),
  reviewRequiredCount: z.number().int().nonnegative(),
  unassignedCount: z.number().int().nonnegative(),
  metricsCalculationBlockedCount: z.number().int().nonnegative(),
});

export const EqualValueMemberKeySchema = z
  .object({
    familyCodeNormalized: z.string().min(1).optional(),
    subfamilyCodeNormalized: z.string().min(1).optional(),
    gradeOrLevelNormalized: z.string().min(1).optional(),
    titleNormalized: z.string().min(1).optional(),
  })
  .refine(
    (v) =>
      v.familyCodeNormalized !== undefined ||
      v.subfamilyCodeNormalized !== undefined ||
      v.gradeOrLevelNormalized !== undefined ||
      v.titleNormalized !== undefined,
    { message: 'EqualValueMemberKey must specify at least one dimension' },
  );

export const EqualValueGroupDefinitionSchema = z.object({
  groupKey: z.string().min(1),
  members: z.array(EqualValueMemberKeySchema).min(1),
});

export const EqualValueRulesetSchema = z.object({
  methodologyVersion: z.string().min(1),
  rulesVersion: z.string().min(1),
  groups: z.array(EqualValueGroupDefinitionSchema),
});

export const CategoryOverrideRecordSchema = z.object({
  overrideId: z.string().min(1),
  rowIndex: z.number().int().nonnegative(),
  proposedCategoryId: z.string().min(1),
  status: CategoryOverrideStatusSchema,
  proposedAtIso: z.string().min(1),
  decidedAtIso: z.string().min(1).optional(),
  reviewerActorId: z.string().min(1).optional(),
});
