// ---------------------------------------------------------------------------
// Access Reason Capture Model
// Records why a principal accessed a protected resource or PII field.
// Required for audit traceability of all access to sensitive data.
// ---------------------------------------------------------------------------

import { randomUUID } from 'crypto';

export enum AccessReason {
  COMPLIANCE_REVIEW = 'COMPLIANCE_REVIEW',
  REGULATORY_REQUEST = 'REGULATORY_REQUEST',
  AUDIT = 'AUDIT',
  CASEWORK_HANDLING = 'CASEWORK_HANDLING',
  ADMINISTRATION = 'ADMINISTRATION',
  TECHNICAL_SUPPORT = 'TECHNICAL_SUPPORT',
  DATA_QUALITY_REVIEW = 'DATA_QUALITY_REVIEW',
}

export interface AccessReasonRecord {
  readonly reasonId: string;
  readonly actorId: string;
  readonly targetEntityType: string;
  readonly targetEntityId: string;
  readonly reason: AccessReason;
  readonly justification: string;
  readonly recordedAt: string;
  readonly expiresAt?: string;
  readonly correlationId?: string;
}

export type AccessReasonInput = Omit<AccessReasonRecord, 'reasonId' | 'recordedAt'>;

export function buildAccessReasonRecord(input: AccessReasonInput): AccessReasonRecord {
  return {
    ...input,
    reasonId: randomUUID(),
    recordedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export function isValidAccessReason(value: unknown): value is AccessReason {
  return (
    typeof value === 'string' && Object.values(AccessReason).includes(value as AccessReason)
  );
}

export function isValidAccessReasonRecord(value: unknown): value is AccessReasonRecord {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v['reasonId'] === 'string' &&
    v['reasonId'].length > 0 &&
    typeof v['actorId'] === 'string' &&
    v['actorId'].length > 0 &&
    typeof v['targetEntityType'] === 'string' &&
    v['targetEntityType'].length > 0 &&
    typeof v['targetEntityId'] === 'string' &&
    v['targetEntityId'].length > 0 &&
    isValidAccessReason(v['reason']) &&
    typeof v['justification'] === 'string' &&
    v['justification'].length > 0 &&
    typeof v['recordedAt'] === 'string' &&
    v['recordedAt'].length > 0
  );
}

export const ALL_ACCESS_REASONS: ReadonlyArray<AccessReason> = Object.values(AccessReason);
