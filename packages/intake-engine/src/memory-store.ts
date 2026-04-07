import type { IntakeFileRecord } from '@enx/contracts';

export interface IntakeStoreEntry {
  readonly record: IntakeFileRecord;
  readonly bytes: Buffer;
}

export interface IntakeFileStore {
  put(entry: IntakeStoreEntry): Promise<void>;
  get(intakeFileId: string): Promise<IntakeStoreEntry | undefined>;
}

export class InMemoryIntakeFileStore implements IntakeFileStore {
  private readonly byId = new Map<string, IntakeStoreEntry>();

  async put(entry: IntakeStoreEntry): Promise<void> {
    this.byId.set(entry.record.intakeFileId, entry);
  }

  async get(intakeFileId: string): Promise<IntakeStoreEntry | undefined> {
    return this.byId.get(intakeFileId);
  }
}
