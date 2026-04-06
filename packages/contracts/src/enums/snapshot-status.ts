export enum SnapshotStatus {
  /** Snapshot is being assembled; data may still change. */
  DRAFT = 'DRAFT',
  /** Snapshot is locked; no further modifications permitted. */
  SEALED = 'SEALED',
  /** Snapshot has been archived; retained for audit purposes only. */
  ARCHIVED = 'ARCHIVED',
}
