import { z } from 'zod';
import { LogicalIntakeField } from '../enums/logical-intake-field';
import { GenderSchema, LogicalIntakeFieldSchema, MappingNormalizationIssueCodeSchema } from './enums';

export const MappingNormalizationIssueSchema = z.object({
  code: MappingNormalizationIssueCodeSchema,
  logicalField: LogicalIntakeFieldSchema.optional(),
  sourceColumn: z.string().min(1).optional(),
  rowIndex: z.number().int().nonnegative().optional(),
  expected: z.string().optional(),
  actual: z.string().optional(),
});

export const NormalizedScalarSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('STRING'), value: z.string() }),
  z.object({ kind: z.literal('DECIMAL'), value: z.string().min(1) }),
  z.object({ kind: z.literal('GENDER'), value: GenderSchema }),
]);

const NormalizedRowValuesSchema = z
  .object({
    [LogicalIntakeField.WORKER_EXTERNAL_ID]: NormalizedScalarSchema.optional(),
    [LogicalIntakeField.BASE_PAY_AMOUNT]: NormalizedScalarSchema.optional(),
    [LogicalIntakeField.GENDER]: NormalizedScalarSchema.optional(),
  })
  .strict();

const ColumnByLogicalFieldSchema = z
  .object({
    [LogicalIntakeField.WORKER_EXTERNAL_ID]: z.string().min(1).optional(),
    [LogicalIntakeField.BASE_PAY_AMOUNT]: z.string().min(1).optional(),
    [LogicalIntakeField.GENDER]: z.string().min(1).optional(),
  })
  .strict();

export const NormalizedIntakeRowResultSchema = z.object({
  rowIndex: z.number().int().nonnegative(),
  values: NormalizedRowValuesSchema,
  issues: z.array(MappingNormalizationIssueSchema),
});

export const IntakeMappingProfileSchema = z.object({
  profileId: z.string().min(1),
  version: z.string().min(1),
  columnByLogicalField: ColumnByLogicalFieldSchema,
  requiredLogicalFields: z.array(LogicalIntakeFieldSchema).min(1),
});

export const MappingNormalizationResultSchema = z.object({
  intakeFileId: z.string().uuid(),
  profileId: z.string().min(1),
  profileVersion: z.string().min(1),
  gated: z.boolean(),
  gateIssue: MappingNormalizationIssueSchema.optional(),
  ok: z.boolean(),
  fileIssues: z.array(MappingNormalizationIssueSchema),
  rows: z.array(NormalizedIntakeRowResultSchema),
});
