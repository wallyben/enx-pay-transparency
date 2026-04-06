import { ActorType, buildAuditEvent, type AuditWriter } from '@enx/audit';
import type { JobNormalizationSnapshotResult } from '@enx/contracts';
import { runCategoryAssignmentWithAudit } from '../category-assignment-service';

describe('runCategoryAssignmentWithAudit', () => {
  it('writes audit metadata and returns assignment result', async () => {
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

    const result = await runCategoryAssignmentWithAudit({
      jobNormalization,
      methodologyVersion: 'm1',
      rulePackVersion: 'r1',
      actor: { actorId: 'a1', actorType: ActorType.USER, displayName: 'Tester' },
      auditWriter,
    });

    expect(result.rows).toHaveLength(1);
    expect(written).toHaveLength(1);
    const evt = written[0] as { targetEntityType: string; metadata: Record<string, string> };
    expect(evt.targetEntityType).toBe('CATEGORY_ASSIGNMENT_RUN');
    expect(evt.metadata.assignedCount).toBe('1');
    expect(evt.metadata.reviewRequiredCount).toBe('0');
    expect(evt.metadata.unassignedCount).toBe('0');
  });
});
