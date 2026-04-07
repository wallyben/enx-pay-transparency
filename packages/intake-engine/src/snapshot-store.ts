import type { IntakeSealedSnapshot } from '@enx/canonical-model';

export interface SealedIntakeSnapshotStore {
  put(snapshot: IntakeSealedSnapshot): Promise<void>;
  get(snapshotId: string): Promise<IntakeSealedSnapshot | undefined>;
}

export class InMemorySealedIntakeSnapshotStore implements SealedIntakeSnapshotStore {
  private readonly byId = new Map<string, IntakeSealedSnapshot>();

  async put(snapshot: IntakeSealedSnapshot): Promise<void> {
    this.byId.set(snapshot.snapshotId, snapshot);
  }

  async get(snapshotId: string): Promise<IntakeSealedSnapshot | undefined> {
    return this.byId.get(snapshotId);
  }
}
