import {
  AuditAction,
  AuditEvent,
  AuditEventCategory,
  AuditOutcome,
  AuditQuery,
} from './types';

// ---------------------------------------------------------------------------
// AuditQueryEngine interface
// ---------------------------------------------------------------------------

export interface AuditQueryEngine {
  query(q: AuditQuery): Promise<ReadonlyArray<AuditEvent>>;
  findByActor(actorId: string): Promise<ReadonlyArray<AuditEvent>>;
  findByEntity(entityType: string, entityId: string): Promise<ReadonlyArray<AuditEvent>>;
  findByTimeRange(fromTimestamp: string, toTimestamp: string): Promise<ReadonlyArray<AuditEvent>>;
}

// ---------------------------------------------------------------------------
// InMemoryAuditQueryEngine
// Operates over a shared event store supplied at construction time.
// ---------------------------------------------------------------------------

export class InMemoryAuditQueryEngine implements AuditQueryEngine {
  constructor(private readonly events: () => ReadonlyArray<AuditEvent>) {}

  async query(q: AuditQuery): Promise<ReadonlyArray<AuditEvent>> {
    return this.events().filter((e) => matchesQuery(e, q));
  }

  async findByActor(actorId: string): Promise<ReadonlyArray<AuditEvent>> {
    return this.events().filter((e) => e.actor.actorId === actorId);
  }

  async findByEntity(
    entityType: string,
    entityId: string,
  ): Promise<ReadonlyArray<AuditEvent>> {
    return this.events().filter(
      (e) => e.targetEntityType === entityType && e.targetEntityId === entityId,
    );
  }

  async findByTimeRange(
    fromTimestamp: string,
    toTimestamp: string,
  ): Promise<ReadonlyArray<AuditEvent>> {
    const from = Date.parse(fromTimestamp);
    const to = Date.parse(toTimestamp);
    return this.events().filter((e) => {
      const t = Date.parse(e.timestamp);
      return t >= from && t <= to;
    });
  }
}

// ---------------------------------------------------------------------------
// Internal filter helper
// ---------------------------------------------------------------------------

function matchesQuery(event: AuditEvent, q: AuditQuery): boolean {
  if (q.actorId !== undefined && event.actor.actorId !== q.actorId) return false;
  if (
    q.targetEntityType !== undefined &&
    event.targetEntityType !== q.targetEntityType
  )
    return false;
  if (
    q.targetEntityId !== undefined &&
    event.targetEntityId !== q.targetEntityId
  )
    return false;
  if (q.category !== undefined && event.category !== q.category) return false;
  if (q.action !== undefined && event.action !== q.action) return false;
  if (q.outcome !== undefined && event.outcome !== q.outcome) return false;
  if (q.snapshotId !== undefined && event.snapshotId !== q.snapshotId) return false;
  if (q.fromTimestamp !== undefined) {
    if (Date.parse(event.timestamp) < Date.parse(q.fromTimestamp)) return false;
  }
  if (q.toTimestamp !== undefined) {
    if (Date.parse(event.timestamp) > Date.parse(q.toTimestamp)) return false;
  }
  return true;
}

export { AuditAction, AuditEventCategory, AuditOutcome };
