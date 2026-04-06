import { randomUUID } from 'crypto';

// ---------------------------------------------------------------------------
// Actor Identity
// ---------------------------------------------------------------------------

export enum ActorType {
  USER = 'USER',
  SYSTEM = 'SYSTEM',
  SERVICE = 'SERVICE',
}

export interface ActorIdentity {
  actorId: string;
  actorType: ActorType;
  displayName: string;
  sessionId?: string;
}

// ---------------------------------------------------------------------------
// Audit Event Categories and Actions
// ---------------------------------------------------------------------------

export enum AuditEventCategory {
  DATA = 'DATA',
  ACCESS = 'ACCESS',
  GOVERNANCE = 'GOVERNANCE',
  CASEWORK = 'CASEWORK',
  SYSTEM = 'SYSTEM',
}

export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  SUBMIT = 'SUBMIT',
  EXPORT = 'EXPORT',
  UPLOAD = 'UPLOAD',
  SEAL = 'SEAL',
  ATTEST = 'ATTEST',
}

export enum AuditOutcome {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  PARTIAL = 'PARTIAL',
}

// ---------------------------------------------------------------------------
// Audit Event
// ---------------------------------------------------------------------------

export interface AuditEventMetadata {
  readonly [key: string]: string;
}

export interface AuditEvent {
  readonly eventId: string;
  readonly correlationId?: string;
  readonly category: AuditEventCategory;
  readonly action: AuditAction;
  readonly actor: ActorIdentity;
  readonly targetEntityType: string;
  readonly targetEntityId: string;
  readonly timestamp: string;
  readonly outcome: AuditOutcome;
  readonly metadata: AuditEventMetadata;
  readonly snapshotId?: string;
  readonly methodologyVersion?: string;
}

export type AuditEventInput = Omit<AuditEvent, 'eventId' | 'timestamp'>;

export function buildAuditEvent(input: AuditEventInput): AuditEvent {
  return {
    ...input,
    eventId: randomUUID(),
    timestamp: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Audit Query
// ---------------------------------------------------------------------------

export interface AuditQuery {
  actorId?: string;
  targetEntityType?: string;
  targetEntityId?: string;
  category?: AuditEventCategory;
  action?: AuditAction;
  outcome?: AuditOutcome;
  fromTimestamp?: string;
  toTimestamp?: string;
  snapshotId?: string;
}

// ---------------------------------------------------------------------------
// Evidence Manifest
// ---------------------------------------------------------------------------

export enum EvidenceItemType {
  SNAPSHOT_DATA = 'SNAPSHOT_DATA',
  METRIC_OUTPUT = 'METRIC_OUTPUT',
  CATEGORY_ASSIGNMENT = 'CATEGORY_ASSIGNMENT',
  METHODOLOGY_DOCUMENT = 'METHODOLOGY_DOCUMENT',
  ATTESTATION = 'ATTESTATION',
  CORRESPONDENCE = 'CORRESPONDENCE',
  AUDIT_LOG_EXTRACT = 'AUDIT_LOG_EXTRACT',
}

export interface EvidenceItem {
  readonly itemId: string;
  readonly itemType: EvidenceItemType;
  readonly label: string;
  readonly contentHash: string;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly linkedEntityType?: string;
  readonly linkedEntityId?: string;
}

export interface EvidenceManifest {
  readonly manifestId: string;
  readonly snapshotId: string;
  readonly methodologyVersion: string;
  readonly rulePackVersion: string;
  readonly items: ReadonlyArray<EvidenceItem>;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly sealedAt?: string;
  readonly sealedBy?: string;
  readonly provenance: string;
}

export type EvidenceManifestInput = Omit<EvidenceManifest, 'manifestId' | 'createdAt'>;

export function buildEvidenceManifest(input: EvidenceManifestInput): EvidenceManifest {
  return {
    ...input,
    manifestId: randomUUID(),
    createdAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

export function isValidIso8601(value: string): boolean {
  return !isNaN(Date.parse(value));
}

export function isValidActorIdentity(actor: unknown): actor is ActorIdentity {
  if (typeof actor !== 'object' || actor === null) return false;
  const a = actor as Record<string, unknown>;
  return (
    typeof a['actorId'] === 'string' &&
    a['actorId'].length > 0 &&
    Object.values(ActorType).includes(a['actorType'] as ActorType) &&
    typeof a['displayName'] === 'string' &&
    a['displayName'].length > 0
  );
}

export function isValidAuditEvent(event: unknown): event is AuditEvent {
  if (typeof event !== 'object' || event === null) return false;
  const e = event as Record<string, unknown>;
  return (
    typeof e['eventId'] === 'string' &&
    e['eventId'].length > 0 &&
    Object.values(AuditEventCategory).includes(e['category'] as AuditEventCategory) &&
    Object.values(AuditAction).includes(e['action'] as AuditAction) &&
    Object.values(AuditOutcome).includes(e['outcome'] as AuditOutcome) &&
    isValidActorIdentity(e['actor']) &&
    typeof e['targetEntityType'] === 'string' &&
    e['targetEntityType'].length > 0 &&
    typeof e['targetEntityId'] === 'string' &&
    e['targetEntityId'].length > 0 &&
    typeof e['timestamp'] === 'string' &&
    isValidIso8601(e['timestamp'])
  );
}
