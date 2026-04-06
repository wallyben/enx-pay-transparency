import { createHash } from 'crypto';
import { canonicalJsonStringify } from './deterministic-category-id';

export function deterministicCategoryOverrideId(input: {
  readonly snapshotId: string;
  readonly rowIndex: number;
  readonly proposedCategoryId: string;
  readonly proposedAtIso: string;
}): string {
  const envelope = {
    snapshotId: input.snapshotId,
    rowIndex: input.rowIndex,
    proposedCategoryId: input.proposedCategoryId,
    proposedAtIso: input.proposedAtIso,
  };
  const digest = createHash('sha256').update(canonicalJsonStringify(envelope), 'utf8').digest('hex');
  return `ovr_${digest}`;
}
