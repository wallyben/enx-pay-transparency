import type { AuditWriter } from '@enx/audit';
import { AuditAction, AuditEventCategory, AuditOutcome, type ActorIdentity } from '@enx/audit';
import {
  sealIntakeSnapshot,
  type IntakeSealedSnapshot,
  type IntakeSnapshotLineage,
} from '@enx/canonical-model';
import type { IntakeMappingProfile, IntakeSnapshotCreationError } from '@enx/contracts';
import { fail, ok, type Result } from '@enx/contracts';
import { DEFAULT_INTAKE_MAPPING_PROFILE } from './default-mapping-profile';
import { runMappingNormalization } from './mapping-pipeline';
import type { IntakeFileStore } from './memory-store';
import { collectIntakeSnapshotBlockedReasons } from './snapshot-creation';
import type { SealedIntakeSnapshotStore } from './snapshot-store';
import { IntakeFileNotFoundError } from './mapping-service';

export interface RunStoredIntakeSnapshotCreationInput {
  readonly intakeFileId: string;
  readonly store: IntakeFileStore;
  readonly sealedSnapshotStore: SealedIntakeSnapshotStore;
  readonly auditWriter: AuditWriter;
  readonly actor: ActorIdentity;
  readonly methodologyVersion: string;
  readonly rulePackVersion: string;
  readonly profile?: IntakeMappingProfile;
  readonly sealedAt?: string;
  readonly correlationId?: string;
}

export async function runStoredIntakeSnapshotCreation(
  input: RunStoredIntakeSnapshotCreationInput,
): Promise<Result<IntakeSealedSnapshot, IntakeSnapshotCreationError>> {
  const profile = input.profile ?? DEFAULT_INTAKE_MAPPING_PROFILE;
  const entry = await input.store.get(input.intakeFileId);
  if (entry === undefined) {
    throw new IntakeFileNotFoundError(input.intakeFileId);
  }

  const mapping = runMappingNormalization({
    record: entry.record,
    bytes: entry.bytes,
    profile,
  });

  const blockedReasons = collectIntakeSnapshotBlockedReasons(mapping, profile);
  if (blockedReasons.length > 0) {
    await input.auditWriter.write({
      correlationId: input.correlationId,
      category: AuditEventCategory.DATA,
      action: AuditAction.SEAL,
      actor: input.actor,
      targetEntityType: 'INTAKE_FILE',
      targetEntityId: input.intakeFileId,
      outcome: AuditOutcome.FAILURE,
      metadata: {
        intakeSnapshotBlockedReasons: blockedReasons.join('|'),
        mappingGated: mapping.gated ? 'true' : 'false',
        mappingOk: mapping.ok ? 'true' : 'false',
        mappingFileIssueCount: String(mapping.fileIssues.length),
        mappingRowCount: String(mapping.rows.length),
      },
    });
    return fail({ blockedReasons });
  }

  const sealedAt = input.sealedAt ?? new Date().toISOString();
  const lineage: IntakeSnapshotLineage = {
    intakeFileId: entry.record.intakeFileId,
    intakeContentSha256: entry.record.contentSha256,
    intakeOriginalFilename: entry.record.originalFilename,
    intakeFileCreatedAt: entry.record.createdAt,
    intakeFileStatusAtSeal: entry.record.status,
    mappingProfileId: profile.profileId,
    mappingProfileVersion: profile.version,
    methodologyVersion: input.methodologyVersion,
    rulePackVersion: input.rulePackVersion,
  };

  const snapshot = sealIntakeSnapshot({
    sealedAt,
    sealedByActorId: input.actor.actorId,
    lineage,
    normalizedRows: mapping.rows,
  });

  await input.sealedSnapshotStore.put(snapshot);

  await input.auditWriter.write({
    correlationId: input.correlationId,
    category: AuditEventCategory.DATA,
    action: AuditAction.SEAL,
    actor: input.actor,
    targetEntityType: 'INTAKE_SNAPSHOT',
    targetEntityId: snapshot.snapshotId,
    snapshotId: snapshot.snapshotId,
    outcome: AuditOutcome.SUCCESS,
    metadata: {
      intakeFileId: entry.record.intakeFileId,
      methodologyVersion: input.methodologyVersion,
      rulePackVersion: input.rulePackVersion,
      manifestDigest: snapshot.manifestDigest,
      normalizedRowCount: String(snapshot.normalizedRows.length),
      mappingProfileId: profile.profileId,
      mappingProfileVersion: profile.version,
    },
  });

  return ok(snapshot);
}
