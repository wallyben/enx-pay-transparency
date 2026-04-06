import type { IntakeSnapshotBlockedReason } from '../enums/intake-snapshot-blocked-reason';

export interface CreateIntakeSnapshotRequest {
  readonly methodologyVersion: string;
  readonly rulePackVersion: string;
}

export interface IntakeSnapshotCreationError {
  readonly blockedReasons: readonly IntakeSnapshotBlockedReason[];
}
