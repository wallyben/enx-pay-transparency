import { z } from 'zod';
import { JobNormalizationIssueCodeSchema } from './enums';

export const JobNormalizationIssueSchema = z.object({
  code: JobNormalizationIssueCodeSchema,
  rowIndex: z.number().int().nonnegative(),
  detail: z.string().min(1).optional(),
});

export const NormalizedJobRawInputsSchema = z.object({
  jobTitle: z.string().min(1).optional(),
  jobFamilyCode: z.string().min(1).optional(),
  jobSubfamilyCode: z.string().min(1).optional(),
  jobGradeOrLevel: z.string().min(1).optional(),
});

export const NormalizedJobShapeSchema = z.object({
  titleNormalized: z.string().min(1).nullable(),
  familyCodeNormalized: z.string().min(1).nullable(),
  subfamilyCodeNormalized: z.string().min(1).nullable(),
  gradeOrLevelNormalized: z.string().min(1).nullable(),
});

export const NormalizedJobDescriptorSchema = z.object({
  jobNormalizationRulesVersion: z.string().min(1),
  raw: NormalizedJobRawInputsSchema,
  normalized: NormalizedJobShapeSchema,
});

export const JobNormalizationRowResultSchema = z.object({
  rowIndex: z.number().int().nonnegative(),
  workerExternalId: z.string().min(1).nullable(),
  issues: z.array(JobNormalizationIssueSchema),
  descriptor: NormalizedJobDescriptorSchema,
});

export const JobNormalizationSnapshotResultSchema = z.object({
  snapshotId: z.string().min(1),
  jobNormalizationRulesVersion: z.string().min(1),
  rows: z.array(JobNormalizationRowResultSchema),
  rowIssueCount: z.number().int().nonnegative(),
  ok: z.boolean(),
});
