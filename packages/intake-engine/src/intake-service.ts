import type { AuditWriter } from '@enx/audit';
import {
  AuditAction,
  AuditEventCategory,
  AuditOutcome,
  type ActorIdentity,
} from '@enx/audit';
import {
  IntakeFileRecord,
  IntakeFileStatus,
  IntakeLayoutSpec,
  StructuralValidationResult,
} from '@enx/contracts';
import { createHash, randomUUID } from 'crypto';
import { DEFAULT_INTAKE_LAYOUT } from './default-layout';
import type { IntakeFileStore, IntakeStoreEntry } from './memory-store';
import { runStructuralValidation } from './csv-structural';

function sha256Hex(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

function buildMetadataStrings(validation: StructuralValidationResult): Record<string, string> {
  const codes = validation.issues.map((i) => i.code).join('|');
  return {
    structuralOk: validation.ok ? 'true' : 'false',
    structuralIssueCount: String(validation.issues.length),
    structuralIssueCodes: codes.length > 0 ? codes : 'none',
  };
}

export interface RegisterIntakeInput {
  readonly bytes: Buffer;
  readonly originalFilename: string;
  readonly contentType: string;
  readonly actor: ActorIdentity;
  readonly auditWriter: AuditWriter;
  readonly store: IntakeFileStore;
  readonly layout?: IntakeLayoutSpec;
  readonly correlationId?: string;
}

export async function registerIntakeFile(input: RegisterIntakeInput): Promise<IntakeFileRecord> {
  const layout = input.layout ?? DEFAULT_INTAKE_LAYOUT;
  const intakeFileId = randomUUID();
  const createdAt = new Date().toISOString();
  const contentSha256 = sha256Hex(input.bytes);

  await input.auditWriter.write({
    correlationId: input.correlationId,
    category: AuditEventCategory.DATA,
    action: AuditAction.UPLOAD,
    actor: input.actor,
    targetEntityType: 'INTAKE_FILE',
    targetEntityId: intakeFileId,
    outcome: AuditOutcome.SUCCESS,
    metadata: {
      originalFilename: input.originalFilename,
      contentType: input.contentType,
      byteLength: String(input.bytes.length),
      contentSha256,
    },
  });

  const validation = runStructuralValidation(input.bytes, layout);
  const status = validation.ok ? IntakeFileStatus.STRUCTURALLY_VALID : IntakeFileStatus.QUARANTINED;

  const record: IntakeFileRecord = {
    intakeFileId,
    originalFilename: input.originalFilename,
    contentType: input.contentType,
    byteLength: input.bytes.length,
    status,
    validation,
    createdAt,
    contentSha256,
  };

  const entry: IntakeStoreEntry = { record, bytes: input.bytes };
  await input.store.put(entry);

  await input.auditWriter.write({
    correlationId: input.correlationId,
    category: AuditEventCategory.DATA,
    action: AuditAction.SUBMIT,
    actor: input.actor,
    targetEntityType: 'INTAKE_FILE',
    targetEntityId: intakeFileId,
    outcome: validation.ok ? AuditOutcome.SUCCESS : AuditOutcome.FAILURE,
    metadata: {
      intakeStatus: status,
      ...buildMetadataStrings(validation),
    },
  });

  return record;
}
