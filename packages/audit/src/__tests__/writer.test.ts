import { InMemoryAuditWriter } from '../writer';
import {
  ActorType,
  AuditAction,
  AuditEventCategory,
  AuditOutcome,
  isValidAuditEvent,
} from '../types';
import type { AuditEventInput } from '../types';

function makeInput(overrides: Partial<AuditEventInput> = {}): AuditEventInput {
  return {
    category: AuditEventCategory.DATA,
    action: AuditAction.UPLOAD,
    actor: {
      actorId: 'user-001',
      actorType: ActorType.USER,
      displayName: 'Compliance Officer',
    },
    targetEntityType: 'IntakeBatch',
    targetEntityId: 'batch-001',
    outcome: AuditOutcome.SUCCESS,
    metadata: {},
    ...overrides,
  };
}

describe('InMemoryAuditWriter', () => {
  it('writes an event and returns a valid AuditEvent', async () => {
    const writer = new InMemoryAuditWriter();
    const event = await writer.write(makeInput());
    expect(isValidAuditEvent(event)).toBe(true);
  });

  it('assigns a non-empty eventId to each written event', async () => {
    const writer = new InMemoryAuditWriter();
    const e = await writer.write(makeInput());
    expect(e.eventId.length).toBeGreaterThan(0);
  });

  it('assigns unique eventIds to successive writes', async () => {
    const writer = new InMemoryAuditWriter();
    const e1 = await writer.write(makeInput());
    const e2 = await writer.write(makeInput());
    expect(e1.eventId).not.toBe(e2.eventId);
  });

  it('persists events so snapshot() reflects all writes', async () => {
    const writer = new InMemoryAuditWriter();
    await writer.write(makeInput());
    await writer.write(makeInput({ action: AuditAction.READ }));
    const events = writer.snapshot();
    expect(events).toHaveLength(2);
  });

  it('preserves actor, category, action, outcome from input', async () => {
    const writer = new InMemoryAuditWriter();
    const event = await writer.write(
      makeInput({ category: AuditEventCategory.GOVERNANCE, action: AuditAction.APPROVE }),
    );
    expect(event.category).toBe(AuditEventCategory.GOVERNANCE);
    expect(event.action).toBe(AuditAction.APPROVE);
    expect(event.actor.actorId).toBe('user-001');
    expect(event.outcome).toBe(AuditOutcome.SUCCESS);
  });

  it('clear() empties the event store', async () => {
    const writer = new InMemoryAuditWriter();
    await writer.write(makeInput());
    writer.clear();
    expect(writer.snapshot()).toHaveLength(0);
  });

  it('snapshot() returns a copy — mutating it does not affect the store', async () => {
    const writer = new InMemoryAuditWriter();
    await writer.write(makeInput());
    const snap = writer.snapshot() as unknown as AuditEventInput[];
    snap.length = 0;
    expect(writer.snapshot()).toHaveLength(1);
  });
});
