import type { IntakeSealedSnapshot } from '@enx/canonical-model';
import type { JobNormalizationSnapshotResult } from '@enx/contracts';
import { DEFAULT_JOB_NORMALIZATION_RULES_VERSION } from './job-normalization-rules-version';
import { normalizeJobRow } from './normalize-job-row';

export function runJobNormalizationOnSealedSnapshot(
  snapshot: IntakeSealedSnapshot,
  jobNormalizationRulesVersion: string = DEFAULT_JOB_NORMALIZATION_RULES_VERSION,
): JobNormalizationSnapshotResult {
  const sortedRows = [...snapshot.normalizedRows].sort((a, b) => a.rowIndex - b.rowIndex);
  const rows = sortedRows.map((row) => normalizeJobRow(row, jobNormalizationRulesVersion));
  const rowIssueCount = rows.reduce((acc, r) => acc + r.issues.length, 0);
  const ok = rows.every((r) => r.issues.length === 0);
  return {
    snapshotId: snapshot.snapshotId,
    jobNormalizationRulesVersion,
    rows,
    rowIssueCount,
    ok,
  };
}
