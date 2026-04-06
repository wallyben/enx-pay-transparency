import { AuditEvent, AuditEventInput, buildAuditEvent } from './types';

// ---------------------------------------------------------------------------
// AuditWriter interface
// ---------------------------------------------------------------------------

export interface AuditWriter {
  write(event: AuditEventInput): Promise<AuditEvent>;
}

// ---------------------------------------------------------------------------
// InMemoryAuditWriter
// Baseline implementation for S04. Persistence layer is introduced in a
// later slice when the database schema is defined.
// ---------------------------------------------------------------------------

export class InMemoryAuditWriter implements AuditWriter {
  private readonly store: AuditEvent[] = [];

  async write(input: AuditEventInput): Promise<AuditEvent> {
    const event = buildAuditEvent(input);
    this.store.push(event);
    return event;
  }

  snapshot(): ReadonlyArray<AuditEvent> {
    return [...this.store];
  }

  clear(): void {
    this.store.length = 0;
  }
}
