import { createHash } from 'crypto';
import type {
  AssembleReportingPackInput,
  CategoryAssignmentSnapshotResult,
  ReportingAttestationShell,
  ReportingCategorySummarySection,
  ReportingEvidencePack,
  ReportingPackMethodologyReferences,
  ReportingPackTraceabilityRefs,
} from '@enx/contracts';
import {
  CategoryAssignmentStatus,
  ReportingPackCompletenessStatus,
} from '@enx/contracts';
import { stableJsonStringify } from './canonical-json';
import { buildReportingDataQualityNotes } from './data-quality-notes';
import { evaluateReportingPackExportBlockers } from './pack-completeness';

function buildMethodologyReferences(
  categoryAssignment: CategoryAssignmentSnapshotResult,
): ReportingPackMethodologyReferences {
  const t = categoryAssignment.traceability;
  return {
    methodologyVersion: t.methodologyVersion,
    rulePackVersion: t.rulePackVersion,
    categoryEngineRulesVersion: t.categoryEngineRulesVersion,
    jobNormalizationRulesVersion: t.jobNormalizationRulesVersion,
    equalValueMethodologyVersion: t.equalValueMethodologyVersion,
    equalValueRulesVersion: t.equalValueRulesVersion,
  };
}

function buildCategorySummary(
  categoryAssignment: CategoryAssignmentSnapshotResult,
): ReportingCategorySummarySection {
  const assignedRows = categoryAssignment.rows.filter(
    (r) => r.status === CategoryAssignmentStatus.ASSIGNED && r.categoryId !== null,
  );
  const distinct = new Set(assignedRows.map((r) => r.categoryId!));
  return {
    snapshotId: categoryAssignment.snapshotId,
    assignedCount: categoryAssignment.assignedCount,
    reviewRequiredCount: categoryAssignment.reviewRequiredCount,
    unassignedCount: categoryAssignment.unassignedCount,
    metricsCalculationBlockedCount: categoryAssignment.metricsCalculationBlockedCount,
    distinctAssignedCategoryCount: distinct.size,
  };
}

function buildAttestationShell(): ReportingAttestationShell {
  const slot = {
    status: 'PENDING' as const,
    actorId: null,
    attestedAtIso: null,
    statement: null,
  };
  return { reviewer: slot, management: { ...slot } };
}

function buildContentDigest(input: AssembleReportingPackInput): string {
  const categorySummary = buildCategorySummary(input.categoryAssignment);
  const payload = {
    euCoreMetrics: input.euCoreMetrics,
    categorySummary,
    intakeSnapshotRef: input.intakeSnapshotRef ?? null,
  };
  const body = stableJsonStringify(payload);
  return createHash('sha256').update(body, 'utf8').digest('hex');
}

export function assembleReportingPack(input: AssembleReportingPackInput): ReportingEvidencePack {
  const exportBlockedReasons = evaluateReportingPackExportBlockers(
    input.euCoreMetrics,
    input.categoryAssignment,
  );
  const completeness = {
    status:
      exportBlockedReasons.length === 0
        ? ReportingPackCompletenessStatus.Complete
        : ReportingPackCompletenessStatus.Incomplete,
    exportBlockedReasons,
  };

  const contentDigestSha256Hex = buildContentDigest(input);
  const reportRunId = `rpr_${contentDigestSha256Hex}`;

  const methodologyReferences = buildMethodologyReferences(input.categoryAssignment);
  const traceability: ReportingPackTraceabilityRefs = {
    snapshotId: input.euCoreMetrics.traceability.snapshotId,
    methodologyReferences,
    euCoreMetricsTraceability: input.euCoreMetrics.traceability,
    categoryAssignmentSnapshotId: input.categoryAssignment.snapshotId,
    intakeSnapshotRef: input.intakeSnapshotRef,
  };

  const categorySummary = buildCategorySummary(input.categoryAssignment);
  const dataQualityNotes = buildReportingDataQualityNotes(input.euCoreMetrics);

  return {
    schemaId: 'enx.reporting_evidence_pack.v1',
    manifest: {
      schemaId: 'enx.reporting_evidence_pack.manifest.v1',
      run: {
        reportRunId,
        contentDigestSha256Hex,
        assembledAtIso: input.assembledAtIso,
      },
      completeness,
      traceability,
      rendering: {
        primaryStructuredEvidence: { format: 'application/json', role: 'EVIDENCE' },
        pdf: {
          format: 'application/pdf',
          productionStatus: 'NOT_PRODUCED',
          note:
            'Structured PDF rendering is intentionally not produced in S12; this slot reserves a future renderer without implying a final regulatory layout.',
        },
      },
    },
    evidence: {
      snapshotSummary: {
        snapshotId: input.euCoreMetrics.traceability.snapshotId,
        methodologyVersion: input.euCoreMetrics.traceability.methodologyVersion,
        rulePackVersion: input.euCoreMetrics.traceability.rulePackVersion,
      },
      euCoreMetricsRun: input.euCoreMetrics,
      categorySummary,
      dataQualityNotes,
    },
    attestation: buildAttestationShell(),
  };
}

export function assertReportingPackExportable(pack: ReportingEvidencePack): void {
  if (pack.manifest.completeness.exportBlockedReasons.length > 0) {
    throw new Error(
      `Reporting pack export blocked: ${pack.manifest.completeness.exportBlockedReasons.join(', ')}`,
    );
  }
}
