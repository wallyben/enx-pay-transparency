import { z } from 'zod';
import {
  CategoryAssignmentBasisSchema,
  CategoryAssignmentIssueCodeSchema,
  CategoryAssignmentStatusSchema,
  JobNormalizationIssueCodeSchema,
} from './enums';

export const CategoryAssignmentTraceabilitySchema = z.object({
  methodologyVersion: z.string().min(1),
  rulePackVersion: z.string().min(1),
  jobNormalizationRulesVersion: z.string().min(1),
  categoryEngineRulesVersion: z.string().min(1),
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
});

export const CategoryAssignmentSnapshotResultSchema = z.object({
  snapshotId: z.string().min(1),
  traceability: CategoryAssignmentTraceabilitySchema,
  rows: z.array(CategoryAssignmentRowResultSchema),
  assignedCount: z.number().int().nonnegative(),
  reviewRequiredCount: z.number().int().nonnegative(),
  unassignedCount: z.number().int().nonnegative(),
});
