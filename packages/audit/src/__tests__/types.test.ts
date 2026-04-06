import {
  ActorType,
  AuditAction,
  AuditEventCategory,
  AuditOutcome,
  EvidenceItemType,
  buildAuditEvent,
  buildEvidenceManifest,
  isValidActorIdentity,
  isValidAuditEvent,
  isValidIso8601,
} from '../types';
import type { ActorIdentity, AuditEventInput, EvidenceManifestInput } from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeActor(overrides: Partial<ActorIdentity> = {}): ActorIdentity {
  return {
    actorId: 'user-001',
    actorType: ActorType.USER,
    displayName: 'Test User',
    ...overrides,
  };
}

function makeEventInput(overrides: Partial<AuditEventInput> = {}): AuditEventInput {
  return {
    category: AuditEventCategory.DATA,
    action: AuditAction.CREATE,
    actor: makeActor(),
    targetEntityType: 'Snapshot',
    targetEntityId: 'snap-001',
    outcome: AuditOutcome.SUCCESS,
    metadata: {},
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Enum completeness
// ---------------------------------------------------------------------------

describe('ActorType enum', () => {
  it('exports USER, SYSTEM, SERVICE', () => {
    expect(Object.values(ActorType)).toEqual(
      expect.arrayContaining(['USER', 'SYSTEM', 'SERVICE']),
    );
  });
});

describe('AuditEventCategory enum', () => {
  it('exports DATA, ACCESS, GOVERNANCE, CASEWORK, SYSTEM', () => {
    const categories = Object.values(AuditEventCategory);
    expect(categories).toContain('DATA');
    expect(categories).toContain('ACCESS');
    expect(categories).toContain('GOVERNANCE');
    expect(categories).toContain('CASEWORK');
    expect(categories).toContain('SYSTEM');
  });

  it('contains no country-specific category', () => {
    const categories = Object.values(AuditEventCategory).join(' ').toLowerCase();
    const countryNames = [
      'ireland', 'uk', 'france', 'germany', 'belgium',
      'netherlands', 'norway', 'sweden', 'denmark', 'portugal', 'spain', 'italy',
    ];
    for (const country of countryNames) {
      expect(categories).not.toContain(country);
    }
  });
});

describe('AuditAction enum', () => {
  it('exports at least CREATE, READ, UPDATE, DELETE, APPROVE, REJECT, EXPORT, UPLOAD, SEAL', () => {
    const actions = Object.values(AuditAction);
    const required = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'EXPORT', 'UPLOAD', 'SEAL'];
    for (const a of required) {
      expect(actions).toContain(a);
    }
  });
});

describe('AuditOutcome enum', () => {
  it('exports SUCCESS, FAILURE, PARTIAL', () => {
    expect(Object.values(AuditOutcome)).toEqual(
      expect.arrayContaining(['SUCCESS', 'FAILURE', 'PARTIAL']),
    );
  });
});

describe('EvidenceItemType enum', () => {
  it('exports expected item types', () => {
    const types = Object.values(EvidenceItemType);
    expect(types).toContain('SNAPSHOT_DATA');
    expect(types).toContain('METRIC_OUTPUT');
    expect(types).toContain('ATTESTATION');
    expect(types).toContain('AUDIT_LOG_EXTRACT');
  });
});

// ---------------------------------------------------------------------------
// isValidIso8601
// ---------------------------------------------------------------------------

describe('isValidIso8601', () => {
  it('accepts a valid ISO timestamp', () => {
    expect(isValidIso8601('2026-04-06T10:00:00.000Z')).toBe(true);
  });

  it('rejects a non-date string', () => {
    expect(isValidIso8601('not-a-date')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isValidActorIdentity
// ---------------------------------------------------------------------------

describe('isValidActorIdentity', () => {
  it('accepts a valid actor', () => {
    expect(isValidActorIdentity(makeActor())).toBe(true);
  });

  it('rejects null', () => {
    expect(isValidActorIdentity(null)).toBe(false);
  });

  it('rejects missing actorId', () => {
    const actor = makeActor();
    const rest = { actorType: actor.actorType, displayName: actor.displayName };
    expect(isValidActorIdentity(rest)).toBe(false);
  });

  it('rejects invalid actorType', () => {
    expect(isValidActorIdentity({ ...makeActor(), actorType: 'ROBOT' })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// buildAuditEvent
// ---------------------------------------------------------------------------

describe('buildAuditEvent', () => {
  it('assigns a unique eventId and timestamp', () => {
    const e1 = buildAuditEvent(makeEventInput());
    const e2 = buildAuditEvent(makeEventInput());
    expect(e1.eventId).toBeTruthy();
    expect(e2.eventId).toBeTruthy();
    expect(e1.eventId).not.toBe(e2.eventId);
  });

  it('produces a valid ISO timestamp', () => {
    const event = buildAuditEvent(makeEventInput());
    expect(isValidIso8601(event.timestamp)).toBe(true);
  });

  it('passes through all input fields', () => {
    const input = makeEventInput({
      category: AuditEventCategory.GOVERNANCE,
      action: AuditAction.APPROVE,
      outcome: AuditOutcome.SUCCESS,
      snapshotId: 'snap-xyz',
      metadata: { reason: 'batch-run' },
    });
    const event = buildAuditEvent(input);
    expect(event.category).toBe(AuditEventCategory.GOVERNANCE);
    expect(event.action).toBe(AuditAction.APPROVE);
    expect(event.snapshotId).toBe('snap-xyz');
    expect(event.metadata['reason']).toBe('batch-run');
  });
});

// ---------------------------------------------------------------------------
// isValidAuditEvent
// ---------------------------------------------------------------------------

describe('isValidAuditEvent', () => {
  it('accepts a fully built event', () => {
    const event = buildAuditEvent(makeEventInput());
    expect(isValidAuditEvent(event)).toBe(true);
  });

  it('rejects an event with a missing eventId', () => {
    const event = buildAuditEvent(makeEventInput());
    const rest = { ...event, eventId: '' };
    expect(isValidAuditEvent(rest)).toBe(false);
  });

  it('rejects an event with an invalid category', () => {
    const event = { ...buildAuditEvent(makeEventInput()), category: 'INVALID' };
    expect(isValidAuditEvent(event)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// buildEvidenceManifest
// ---------------------------------------------------------------------------

describe('buildEvidenceManifest', () => {
  const manifestInput: EvidenceManifestInput = {
    snapshotId: 'snap-001',
    methodologyVersion: '1.0.0',
    rulePackVersion: '1.0.0',
    items: [],
    createdBy: 'system',
    provenance: 'S04 test',
  };

  it('assigns a unique manifestId and createdAt', () => {
    const m1 = buildEvidenceManifest(manifestInput);
    const m2 = buildEvidenceManifest(manifestInput);
    expect(m1.manifestId).toBeTruthy();
    expect(m2.manifestId).toBeTruthy();
    expect(m1.manifestId).not.toBe(m2.manifestId);
  });

  it('produces a valid ISO createdAt timestamp', () => {
    const m = buildEvidenceManifest(manifestInput);
    expect(isValidIso8601(m.createdAt)).toBe(true);
  });

  it('carries snapshotId, methodologyVersion, rulePackVersion, and provenance', () => {
    const m = buildEvidenceManifest(manifestInput);
    expect(m.snapshotId).toBe('snap-001');
    expect(m.methodologyVersion).toBe('1.0.0');
    expect(m.rulePackVersion).toBe('1.0.0');
    expect(m.provenance).toBe('S04 test');
  });
});
