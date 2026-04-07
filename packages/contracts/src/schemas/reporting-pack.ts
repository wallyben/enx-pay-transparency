import { z } from 'zod';
import {
  ReportingPackCompletenessStatusSchema,
  ReportingPackExportBlockedReasonSchema,
} from './enums';
import { EuCoreMetricsRunResultSchema, EuCoreMetricsTraceabilitySchema } from './eu-core-metrics';

export const IntakeSnapshotRefForPackSchema = z.object({
  intakeFileId: z.string().min(1),
  contentSha256Hex: z.string().min(1),
});

export const ReportingPackMethodologyReferencesSchema = z.object({
  methodologyVersion: z.string().min(1),
  rulePackVersion: z.string().min(1),
  categoryEngineRulesVersion: z.string().min(1),
  jobNormalizationRulesVersion: z.string().min(1),
  equalValueMethodologyVersion: z.string().min(1).optional(),
  equalValueRulesVersion: z.string().min(1).optional(),
});

export const ReportingPackTraceabilityRefsSchema = z.object({
  snapshotId: z.string().min(1),
  methodologyReferences: ReportingPackMethodologyReferencesSchema,
  euCoreMetricsTraceability: EuCoreMetricsTraceabilitySchema,
  categoryAssignmentSnapshotId: z.string().min(1),
  intakeSnapshotRef: IntakeSnapshotRefForPackSchema.optional(),
});

export const ReportingPackRunRecordSchema = z.object({
  reportRunId: z.string().min(1),
  contentDigestSha256Hex: z.string().length(64),
  assembledAtIso: z.string().min(1),
});

export const ReportingPackCompletenessBlockSchema = z.object({
  status: ReportingPackCompletenessStatusSchema,
  exportBlockedReasons: z.array(ReportingPackExportBlockedReasonSchema),
});

export const ReportingPdfArtifactPlaceholderSchema = z.object({
  format: z.literal('application/pdf'),
  productionStatus: z.literal('NOT_PRODUCED'),
  note: z.string(),
});

export const ReportingPackManifestSchema = z.object({
  schemaId: z.literal('enx.reporting_evidence_pack.manifest.v1'),
  run: ReportingPackRunRecordSchema,
  completeness: ReportingPackCompletenessBlockSchema,
  traceability: ReportingPackTraceabilityRefsSchema,
  rendering: z.object({
    primaryStructuredEvidence: z.object({
      format: z.literal('application/json'),
      role: z.literal('EVIDENCE'),
    }),
    pdf: ReportingPdfArtifactPlaceholderSchema,
  }),
});

export const ReportingSnapshotSummarySectionSchema = z.object({
  snapshotId: z.string().min(1),
  methodologyVersion: z.string().min(1),
  rulePackVersion: z.string().min(1),
});

export const ReportingCategorySummarySectionSchema = z.object({
  snapshotId: z.string().min(1),
  assignedCount: z.number().int().nonnegative(),
  reviewRequiredCount: z.number().int().nonnegative(),
  unassignedCount: z.number().int().nonnegative(),
  metricsCalculationBlockedCount: z.number().int().nonnegative(),
  distinctAssignedCategoryCount: z.number().int().nonnegative(),
});

export const ReportingDataQualityNoteSchema = z.object({
  code: z.string().min(1),
  detail: z.string().optional(),
});

export const ReportingAttestationPartyShellSchema = z.object({
  status: z.literal('PENDING'),
  actorId: z.string().min(1).nullable(),
  attestedAtIso: z.string().min(1).nullable(),
  statement: z.string().min(1).nullable(),
});

export const ReportingAttestationShellSchema = z.object({
  reviewer: ReportingAttestationPartyShellSchema,
  management: ReportingAttestationPartyShellSchema,
});

export const ReportingEvidenceSectionsSchema = z.object({
  snapshotSummary: ReportingSnapshotSummarySectionSchema,
  euCoreMetricsRun: EuCoreMetricsRunResultSchema,
  categorySummary: ReportingCategorySummarySectionSchema,
  dataQualityNotes: z.array(ReportingDataQualityNoteSchema),
});

export const ReportingEvidencePackSchema = z.object({
  schemaId: z.literal('enx.reporting_evidence_pack.v1'),
  manifest: ReportingPackManifestSchema,
  evidence: ReportingEvidenceSectionsSchema,
  attestation: ReportingAttestationShellSchema,
});
