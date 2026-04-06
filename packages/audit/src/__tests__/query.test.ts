import { InMemoryAuditWriter } from '../writer';
import { InMemoryAuditQueryEngine } from '../query';
import {
  ActorType,
  AuditAction,
  AuditEventCategory,
  AuditOutcome,
} from '../types';
import type { AuditEventInput } from '../types';

function makeInput(overrides: Partial<AuditEventInput> = {}): AuditEventInput {
  return {
    category: AuditEventCategory.DATA,
    action: AuditAction.CREATE,
    actor: {
      actorId: 'user-001',
      actorType: ActorType.USER,
      displayName: 'Test User',
    },
    targetEntityType: 'Snapshot',
    targetEntityId: 'snap-001',
    outcome: AuditOutcome.SUCCESS,
    metadata: {},
    ...overrides,
  };
}

async function seedWriter(...inputs: AuditEventInput[]) {
  const writer = new InMemoryAuditWriter();
  for (const input of inputs) {
    await writer.write(input);
  }
  return writer;
}

describe('InMemoryAuditQueryEngine', () => {
  it('findByActor returns only events for the given actor', async () => {
    const writer = await seedWriter(
      makeInput({ actor: { actorId: 'user-001', actorType: ActorType.USER, displayName: 'Alice' } }),
      makeInput({ actor: { actorId: 'user-002', actorType: ActorType.USER, displayName: 'Bob' } }),
    );
    const engine = new InMemoryAuditQueryEngine(() => writer.snapshot());
    const results = await engine.findByActor('user-001');
    expect(results).toHaveLength(1);
    expect(results[0]?.actor.actorId).toBe('user-001');
  });

  it('findByEntity returns only events for the given entity', async () => {
    const writer = await seedWriter(
      makeInput({ targetEntityType: 'Snapshot', targetEntityId: 'snap-001' }),
      makeInput({ targetEntityType: 'Snapshot', targetEntityId: 'snap-002' }),
      makeInput({ targetEntityType: 'IntakeBatch', targetEntityId: 'snap-001' }),
    );
    const engine = new InMemoryAuditQueryEngine(() => writer.snapshot());
    const results = await engine.findByEntity('Snapshot', 'snap-001');
    expect(results).toHaveLength(1);
    expect(results[0]?.targetEntityId).toBe('snap-001');
    expect(results[0]?.targetEntityType).toBe('Snapshot');
  });

  it('findByTimeRange returns only events within the range', async () => {
    const now = Date.now();
    const writer = new InMemoryAuditWriter();

    const early = await writer.write(makeInput());
    // Force a timestamp in the past to simulate time range
    const earlyWithTs = { ...early, timestamp: new Date(now - 10_000).toISOString() };

    const writer2 = new InMemoryAuditWriter();
    // Write two events we control
    await writer2.write(makeInput());
    await writer2.write(makeInput());

    const engine = new InMemoryAuditQueryEngine(() => [
      earlyWithTs,
      { ...earlyWithTs, eventId: 'late', timestamp: new Date(now + 10_000).toISOString() },
    ]);

    const from = new Date(now - 5_000).toISOString();
    const to = new Date(now + 5_000).toISOString();

    const results = await engine.findByTimeRange(from, to);
    expect(results).toHaveLength(0);

    const results2 = await engine.findByTimeRange(
      new Date(now - 20_000).toISOString(),
      new Date(now - 1_000).toISOString(),
    );
    expect(results2).toHaveLength(1);
    expect(results2[0]?.eventId).toBe(earlyWithTs.eventId);
  });

  describe('query', () => {
    it('filters by category', async () => {
      const writer = await seedWriter(
        makeInput({ category: AuditEventCategory.DATA }),
        makeInput({ category: AuditEventCategory.ACCESS }),
      );
      const engine = new InMemoryAuditQueryEngine(() => writer.snapshot());
      const results = await engine.query({ category: AuditEventCategory.ACCESS });
      expect(results).toHaveLength(1);
      expect(results[0]?.category).toBe(AuditEventCategory.ACCESS);
    });

    it('filters by action', async () => {
      const writer = await seedWriter(
        makeInput({ action: AuditAction.CREATE }),
        makeInput({ action: AuditAction.DELETE }),
      );
      const engine = new InMemoryAuditQueryEngine(() => writer.snapshot());
      const results = await engine.query({ action: AuditAction.DELETE });
      expect(results).toHaveLength(1);
      expect(results[0]?.action).toBe(AuditAction.DELETE);
    });

    it('filters by outcome', async () => {
      const writer = await seedWriter(
        makeInput({ outcome: AuditOutcome.SUCCESS }),
        makeInput({ outcome: AuditOutcome.FAILURE }),
      );
      const engine = new InMemoryAuditQueryEngine(() => writer.snapshot());
      const results = await engine.query({ outcome: AuditOutcome.FAILURE });
      expect(results).toHaveLength(1);
    });

    it('filters by snapshotId', async () => {
      const writer = await seedWriter(
        makeInput({ snapshotId: 'snap-A' }),
        makeInput({ snapshotId: 'snap-B' }),
        makeInput({}),
      );
      const engine = new InMemoryAuditQueryEngine(() => writer.snapshot());
      const results = await engine.query({ snapshotId: 'snap-A' });
      expect(results).toHaveLength(1);
    });

    it('returns all events when query is empty', async () => {
      const writer = await seedWriter(makeInput(), makeInput(), makeInput());
      const engine = new InMemoryAuditQueryEngine(() => writer.snapshot());
      const results = await engine.query({});
      expect(results).toHaveLength(3);
    });

    it('combines multiple filter criteria', async () => {
      const writer = await seedWriter(
        makeInput({ category: AuditEventCategory.DATA, action: AuditAction.CREATE }),
        makeInput({ category: AuditEventCategory.DATA, action: AuditAction.DELETE }),
        makeInput({ category: AuditEventCategory.ACCESS, action: AuditAction.CREATE }),
      );
      const engine = new InMemoryAuditQueryEngine(() => writer.snapshot());
      const results = await engine.query({
        category: AuditEventCategory.DATA,
        action: AuditAction.CREATE,
      });
      expect(results).toHaveLength(1);
    });
  });
});
