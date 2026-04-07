import type { ReportingPackCompletenessStatus } from '../enums/reporting-pack-completeness-status';
import type { ReportingPackExportBlockedReason } from '../enums/reporting-pack-export-blocked-reason';
import type { CategoryAssignmentSnapshotResult } from './category-assignment';
import type { EuCoreMetricsRunResult, EuCoreMetricsTraceability } from './eu-core-metrics';

/**
 * Optional sealed-intake pointer for lineage when the caller has it (S12 base pack).
 * Country-agnostic; no regulator template semantics.
 */
export interface IntakeSnapshotRefForPack {
  readonly intakeFileId: string;
  readonly contentSha256Hex: string;
}

export interface ReportingPackMethodologyReferences {
  readonly methodologyVersion: string;
  readonly rulePackVersion: string;
  readonly categoryEngineRulesVersion: string;
  readonly jobNormalizationRulesVersion: string;
  readonly equalValueMethodologyVersion?: string;
  readonly equalValueRulesVersion?: string;
}

export interface ReportingPackTraceabilityRefs {
  readonly snapshotId: string;
  readonly methodologyReferences: ReportingPackMethodologyReferences;
  readonly euCoreMetricsTraceability: EuCoreMetricsTraceability;
  readonly categoryAssignmentSnapshotId: string;
  readonly intakeSnapshotRef?: IntakeSnapshotRefForPack;
}

export interface ReportingPackRunRecord {
  /** Stable identifier derived from canonical evidence payload (see reporting-engine). */
  readonly reportRunId: string;
  readonly contentDigestSha256Hex: string;
  readonly assembledAtIso: string;
}

export interface ReportingPackCompletenessBlock {
  readonly status: ReportingPackCompletenessStatus;
  /** Sorted ascending for deterministic manifests. */
  readonly exportBlockedReasons: readonly ReportingPackExportBlockedReason[];
}

export interface ReportingPdfArtifactPlaceholder {
  readonly format: 'application/pdf';
  /** No PDF bytes are produced in S12; placeholder records intent only. */
  readonly productionStatus: 'NOT_PRODUCED';
  readonly note: string;
}

export interface ReportingPackManifest {
  readonly schemaId: 'enx.reporting_evidence_pack.manifest.v1';
  readonly run: ReportingPackRunRecord;
  readonly completeness: ReportingPackCompletenessBlock;
  readonly traceability: ReportingPackTraceabilityRefs;
  readonly rendering: {
    readonly primaryStructuredEvidence: { readonly format: 'application/json'; readonly role: 'EVIDENCE' };
    readonly pdf: ReportingPdfArtifactPlaceholder;
  };
}

export interface ReportingSnapshotSummarySection {
  readonly snapshotId: string;
  readonly methodologyVersion: string;
  readonly rulePackVersion: string;
}

export interface ReportingCategorySummarySection {
  readonly snapshotId: string;
  readonly assignedCount: number;
  readonly reviewRequiredCount: number;
  readonly unassignedCount: number;
  readonly metricsCalculationBlockedCount: number;
  readonly distinctAssignedCategoryCount: number;
}

export interface ReportingDataQualityNote {
  readonly code: string;
  readonly detail?: string;
}

export interface ReportingAttestationPartyShell {
  readonly status: 'PENDING';
  readonly actorId: string | null;
  readonly attestedAtIso: string | null;
  readonly statement: string | null;
}

export interface ReportingAttestationShell {
  readonly reviewer: ReportingAttestationPartyShell;
  readonly management: ReportingAttestationPartyShell;
}

export interface ReportingEvidenceSections {
  readonly snapshotSummary: ReportingSnapshotSummarySection;
  readonly euCoreMetricsRun: EuCoreMetricsRunResult;
  readonly categorySummary: ReportingCategorySummarySection;
  readonly dataQualityNotes: readonly ReportingDataQualityNote[];
}

export interface ReportingEvidencePack {
  readonly schemaId: 'enx.reporting_evidence_pack.v1';
  readonly manifest: ReportingPackManifest;
  readonly evidence: ReportingEvidenceSections;
  readonly attestation: ReportingAttestationShell;
}

export interface AssembleReportingPackInput {
  readonly assembledAtIso: string;
  readonly euCoreMetrics: EuCoreMetricsRunResult;
  readonly categoryAssignment: CategoryAssignmentSnapshotResult;
  readonly intakeSnapshotRef?: IntakeSnapshotRefForPack;
}
