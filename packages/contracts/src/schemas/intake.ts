import { z } from 'zod';
import {
  IntakeColumnTypeSchema,
  IntakeFileStatusSchema,
  StructuralIssueCodeSchema,
} from './enums';

export const IntakeColumnDefinitionSchema = z.object({
  name: z.string().min(1),
  type: IntakeColumnTypeSchema,
  requiredNonEmpty: z.boolean(),
});

export const IntakeLayoutSpecSchema = z.object({
  columns: z.array(IntakeColumnDefinitionSchema).min(1),
});

export const StructuralIssueSchema = z.object({
  code: StructuralIssueCodeSchema,
  column: z.string().min(1).optional(),
  rowIndex: z.number().int().nonnegative().optional(),
  expected: z.string().optional(),
  actual: z.string().optional(),
});

export const StructuralValidationResultSchema = z.object({
  ok: z.boolean(),
  issues: z.array(StructuralIssueSchema),
});

export const IntakeFileRecordSchema = z.object({
  intakeFileId: z.string().uuid(),
  originalFilename: z.string().min(1),
  contentType: z.string().min(1),
  byteLength: z.number().int().nonnegative(),
  status: IntakeFileStatusSchema,
  validation: StructuralValidationResultSchema,
  createdAt: z.string().min(1),
  contentSha256: z.string().min(1),
});
