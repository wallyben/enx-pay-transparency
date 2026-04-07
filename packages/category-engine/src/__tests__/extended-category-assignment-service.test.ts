import { ActorType, buildAuditEvent, type AuditWriter } from '@enx/audit';
import type { JobNormalizationSnapshotResult } from '@enx/contracts';
import { CategoryOverrideStatus } from '@enx/contracts';
import { runExtendedCategoryAssignmentWithAudit } from '../extended-category-assignment-service';

describe('runExtendedCategoryAssignmentWithAudit', () => {
  it('records metricsCalculationBlockedCount in audit metadata', async () => {
    const written: unknown[] = [];
    const auditWriter: AuditWriter = {
      write: async (event) => {
        written.push(event);
        return buildAuditEvent(event);
      },
    };

    const jobNormalization: JobNormalizationSnapshotResult = {
      snapshotId: 'snp_x',
      jobNormalizationRulesVersion: 'jn.v1',
      rowIssueCount: 0,
      ok: true,
      rows: [
        {
          rowIndex: 0,
          workerExternalId: 'w1',
          issues: [],
          descriptor: {
            jobNormalizationRulesVersion: 'jn.v1',
            raw: {},
            normalized: {
              titleNormalized: 't',
              familyCodeNormalized: 'f',
              subfamilyCodeNormalized: 's',
              gradeOrLevelNormalized: 'g',
            },
          },
        },
      ],
    };

    await runExtendedCategoryAssignmentWithAudit({
      jobNormalization,
      methodologyVersion: 'm1',
      rulePackVersion: 'r1',
      actor: { actorId: 'a1', actorType: ActorType.USER, displayName: 'Runner' },
      auditWriter,
      governedOverrides: [
        {
          overrideId: 'ovr_p',
          rowIndex: 0,
          proposedCategoryId: 'cat_x',
          status: CategoryOverrideStatus.PENDING,
          proposedAtIso: '2026-04-07T10:00:00.000Z',
        },
      ],
    });

    const evt = written[0] as { metadata: Record<string, string> };
    expect(evt.metadata.metricsCalculationBlockedCount).toBe('1');
    expect(evt.metadata.extendedPipeline).toBe('S10');
  });
});
