import {
  IntakeSnapshotBlockedReason,
  type IntakeMappingProfile,
  type MappingNormalizationResult,
} from '@enx/contracts';

export function collectIntakeSnapshotBlockedReasons(
  mapping: MappingNormalizationResult,
  profile: IntakeMappingProfile,
): IntakeSnapshotBlockedReason[] {
  const reasons = new Set<IntakeSnapshotBlockedReason>();
  if (mapping.gated) reasons.add(IntakeSnapshotBlockedReason.MAPPING_GATED);
  if (!mapping.ok) reasons.add(IntakeSnapshotBlockedReason.MAPPING_NOT_OK);
  if (mapping.fileIssues.length > 0) reasons.add(IntakeSnapshotBlockedReason.FILE_ISSUES_PRESENT);
  if (mapping.rows.length === 0) reasons.add(IntakeSnapshotBlockedReason.NO_NORMALIZED_ROWS);

  for (const row of mapping.rows) {
    if (row.issues.length > 0) {
      reasons.add(IntakeSnapshotBlockedReason.INCOMPLETE_ROW_MAPPING);
      break;
    }
    for (const field of profile.requiredLogicalFields) {
      if (row.values[field] === undefined) {
        reasons.add(IntakeSnapshotBlockedReason.INCOMPLETE_ROW_MAPPING);
        break;
      }
    }
  }

  return [...reasons];
}
