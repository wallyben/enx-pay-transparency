/**
 * Synthetic enterprise demo only — not production pilot evidence.
 * Invokes existing @enx/* packages from the repo (intake → snapshot → job norm → category → EU metrics → reporting pack).
 */
import * as fs from 'fs';
import type {
  CategoryOverrideRecord,
  EqualValueRuleset,
  EuCoreVariablePayRowInput,
} from '@enx/contracts';
import { ActorType, InMemoryAuditWriter } from '@enx/audit';
import {
  InMemoryIntakeFileStore,
  InMemorySealedIntakeSnapshotStore,
  registerIntakeFile,
  runStoredIntakeSnapshotCreation,
} from '@enx/intake-engine';
import { runJobNormalizationOnSealedSnapshot } from '@enx/job-architecture';
import { runExtendedCategoryAssignmentOnJobNormalization } from '@enx/category-engine';
import { runEuCoreMetrics } from '@enx/metrics-engine';
import { assembleReportingPack, evaluateReportingPackExportBlockers } from '@enx/reporting-engine';
import { MOCK_ENTERPRISE_INTAKE_LAYOUT, MOCK_ENTERPRISE_MAPPING_PROFILE } from './mock-intake-profile';

interface EngineMeta {
  readonly methodologyVersion: string;
  readonly rulePackVersion: string;
  readonly variablePayRows?: readonly EuCoreVariablePayRowInput[] | null;
  readonly governedOverrides?: readonly CategoryOverrideRecord[] | null;
  readonly equalValueRuleset?: EqualValueRuleset | null;
}

function argValue(flag: string): string | undefined {
  const raw = process.argv.find((a) => a.startsWith(`${flag}=`));
  return raw === undefined ? undefined : raw.slice(flag.length + 1);
}

async function main(): Promise<void> {
  const csvPath = argValue('--csv');
  const metaPath = argValue('--meta');
  const outPath = argValue('--out');
  const categoryDetailOut = argValue('--categoryDetailOut');
  if (!csvPath || !metaPath || !outPath) {
    // eslint-disable-next-line no-console
    console.error(
      'Usage: tsx run_engines.ts --csv=... --meta=... --out=... [--categoryDetailOut=...]',
    );
    process.exit(2);
  }

  const bytes = fs.readFileSync(csvPath);
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8')) as EngineMeta;

  const auditWriter = new InMemoryAuditWriter();
  const store = new InMemoryIntakeFileStore();
  const sealedStore = new InMemorySealedIntakeSnapshotStore();

  const actor = {
    actorId: 'mock-enterprise-demo',
    actorType: ActorType.SERVICE,
    displayName: 'Mock Enterprise Demo',
  };

  const intakeRecord = await registerIntakeFile({
    bytes,
    originalFilename: 'engine_intake_subset.csv',
    contentType: 'text/csv',
    actor,
    auditWriter,
    store,
    layout: MOCK_ENTERPRISE_INTAKE_LAYOUT,
  });

  const snapResult = await runStoredIntakeSnapshotCreation({
    intakeFileId: intakeRecord.intakeFileId,
    store,
    sealedSnapshotStore: sealedStore,
    auditWriter,
    actor,
    methodologyVersion: meta.methodologyVersion,
    rulePackVersion: meta.rulePackVersion,
    profile: MOCK_ENTERPRISE_MAPPING_PROFILE,
  });

  if (!snapResult.ok) {
    const out = {
      status: 'SNAPSHOT_BLOCKED' as const,
      blockedReasons: snapResult.error.blockedReasons,
      intakeFileId: intakeRecord.intakeFileId,
    };
    fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
    return;
  }

  const snapshot = snapResult.value;
  const jobNorm = runJobNormalizationOnSealedSnapshot(snapshot);

  const category = runExtendedCategoryAssignmentOnJobNormalization({
    jobNormalization: jobNorm,
    methodologyVersion: meta.methodologyVersion,
    rulePackVersion: meta.rulePackVersion,
    equalValueRuleset: meta.equalValueRuleset ?? null,
    governedOverrides: meta.governedOverrides ?? null,
  });

  const euCore = runEuCoreMetrics({
    snapshotId: snapshot.snapshotId,
    methodologyVersion: meta.methodologyVersion,
    rulePackVersion: meta.rulePackVersion,
    categoryAssignment: category,
    normalizedIntakeRows: snapshot.normalizedRows,
    variablePayRows: meta.variablePayRows ?? null,
  });

  const pack = assembleReportingPack({
    assembledAtIso: new Date().toISOString(),
    euCoreMetrics: euCore,
    categoryAssignment: category,
    intakeSnapshotRef: {
      intakeFileId: intakeRecord.intakeFileId,
      contentSha256Hex: intakeRecord.contentSha256,
    },
  });

  const exportBlockers = evaluateReportingPackExportBlockers(euCore, category);

  const out = {
    status: 'OK' as const,
    intakeFileId: intakeRecord.intakeFileId,
    snapshot: {
      snapshotId: snapshot.snapshotId,
      manifestDigest: snapshot.manifestDigest,
      rowCount: snapshot.normalizedRows.length,
    },
    jobNormalization: {
      ok: jobNorm.ok,
      rowIssueCount: jobNorm.rowIssueCount,
      jobNormalizationRulesVersion: jobNorm.jobNormalizationRulesVersion,
    },
    categoryAssignment: {
      assignedCount: category.assignedCount,
      reviewRequiredCount: category.reviewRequiredCount,
      unassignedCount: category.unassignedCount,
      metricsCalculationBlockedCount: category.metricsCalculationBlockedCount,
    },
    euCoreMetrics: euCore,
    reportingPack: {
      reportRunId: pack.manifest.run.reportRunId,
      completeness: pack.manifest.completeness,
      exportBlockers,
    },
  };

  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');

  if (categoryDetailOut) {
    const detail = {
      snapshotId: snapshot.snapshotId,
      methodologyVersion: meta.methodologyVersion,
      rulePackVersion: meta.rulePackVersion,
      jobNormalizationRows: jobNorm.rows,
      categoryRows: category.rows,
    };
    fs.writeFileSync(categoryDetailOut, JSON.stringify(detail, null, 2), 'utf8');
  }
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
