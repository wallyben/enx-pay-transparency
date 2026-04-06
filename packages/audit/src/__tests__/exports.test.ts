import * as AuditPackage from '../index';

describe('audit package exports', () => {
  it('exports ActorType enum', () => {
    expect(AuditPackage.ActorType).toBeDefined();
    expect(AuditPackage.ActorType.USER).toBe('USER');
  });

  it('exports AuditEventCategory enum', () => {
    expect(AuditPackage.AuditEventCategory).toBeDefined();
    expect(AuditPackage.AuditEventCategory.DATA).toBe('DATA');
  });

  it('exports AuditAction enum', () => {
    expect(AuditPackage.AuditAction).toBeDefined();
    expect(AuditPackage.AuditAction.CREATE).toBe('CREATE');
  });

  it('exports AuditOutcome enum', () => {
    expect(AuditPackage.AuditOutcome).toBeDefined();
    expect(AuditPackage.AuditOutcome.SUCCESS).toBe('SUCCESS');
  });

  it('exports EvidenceItemType enum', () => {
    expect(AuditPackage.EvidenceItemType).toBeDefined();
    expect(AuditPackage.EvidenceItemType.SNAPSHOT_DATA).toBe('SNAPSHOT_DATA');
  });

  it('exports buildAuditEvent function', () => {
    expect(typeof AuditPackage.buildAuditEvent).toBe('function');
  });

  it('exports buildEvidenceManifest function', () => {
    expect(typeof AuditPackage.buildEvidenceManifest).toBe('function');
  });

  it('exports InMemoryAuditWriter class', () => {
    expect(AuditPackage.InMemoryAuditWriter).toBeDefined();
    const w = new AuditPackage.InMemoryAuditWriter();
    expect(typeof w.write).toBe('function');
  });

  it('exports InMemoryAuditQueryEngine class', () => {
    expect(AuditPackage.InMemoryAuditQueryEngine).toBeDefined();
    const e = new AuditPackage.InMemoryAuditQueryEngine(() => []);
    expect(typeof e.query).toBe('function');
    expect(typeof e.findByActor).toBe('function');
    expect(typeof e.findByEntity).toBe('function');
    expect(typeof e.findByTimeRange).toBe('function');
  });

  it('exports validation helpers', () => {
    expect(typeof AuditPackage.isValidIso8601).toBe('function');
    expect(typeof AuditPackage.isValidActorIdentity).toBe('function');
    expect(typeof AuditPackage.isValidAuditEvent).toBe('function');
  });
});
