import type { AuditWriter } from '@enx/audit';
import { AuditAction, AuditEventCategory, AuditOutcome, type ActorIdentity } from '@enx/audit';
import type { IntakeMappingProfile, MappingNormalizationResult } from '@enx/contracts';
import { DEFAULT_INTAKE_MAPPING_PROFILE } from './default-mapping-profile';
import { runMappingNormalization } from './mapping-pipeline';
import type { IntakeFileStore } from './memory-store';

export class IntakeFileNotFoundError extends Error {
  readonly code = 'INTAKE_FILE_NOT_FOUND' as const;
  constructor(intakeFileId: string) {
    super(`Intake file not found: ${intakeFileId}`);
    this.name = 'IntakeFileNotFoundError';
  }
}

export interface RunStoredIntakeMappingInput {
  readonly intakeFileId: string;
  readonly store: IntakeFileStore;
  readonly auditWriter: AuditWriter;
  readonly actor: ActorIdentity;
  readonly profile?: IntakeMappingProfile;
  readonly correlationId?: string;
}

export async function runStoredIntakeMapping(
  input: RunStoredIntakeMappingInput,
): Promise<MappingNormalizationResult> {
  const profile = input.profile ?? DEFAULT_INTAKE_MAPPING_PROFILE;
  const entry = await input.store.get(input.intakeFileId);
  if (entry === undefined) {
    throw new IntakeFileNotFoundError(input.intakeFileId);
  }

  const result = runMappingNormalization({
    record: entry.record,
    bytes: entry.bytes,
    profile,
  });

  const rowIssueCount = result.rows.reduce((acc, row) => acc + row.issues.length, 0);

  await input.auditWriter.write({
    correlationId: input.correlationId,
    category: AuditEventCategory.DATA,
    action: AuditAction.UPDATE,
    actor: input.actor,
    targetEntityType: 'INTAKE_FILE',
    targetEntityId: input.intakeFileId,
    outcome: result.gated
      ? AuditOutcome.FAILURE
      : result.ok
        ? AuditOutcome.SUCCESS
        : AuditOutcome.PARTIAL,
    metadata: {
      mappingProfileId: profile.profileId,
      mappingProfileVersion: profile.version,
      mappingGated: result.gated ? 'true' : 'false',
      mappingOk: result.ok ? 'true' : 'false',
      mappingFileIssueCount: String(result.fileIssues.length),
      mappingRowCount: String(result.rows.length),
      mappingRowIssueCount: String(rowIssueCount),
    },
  });

  return result;
}
