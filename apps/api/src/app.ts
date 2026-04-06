import { ActorType, type ActorIdentity, type AuditWriter } from '@enx/audit';
import { CreateIntakeSnapshotRequestSchema } from '@enx/contracts';
import type { IntakeFileStore, SealedIntakeSnapshotStore } from '@enx/intake-engine';
import {
  InMemorySealedIntakeSnapshotStore,
  IntakeFileNotFoundError,
  registerIntakeFile,
  runStoredIntakeMapping,
  runStoredIntakeSnapshotCreation,
} from '@enx/intake-engine';
import express from 'express';
import multer from 'multer';

export interface CreateApiAppOptions {
  readonly auditWriter: AuditWriter;
  readonly intakeStore: IntakeFileStore;
  readonly sealedSnapshotStore?: SealedIntakeSnapshotStore;
  readonly defaultActor?: ActorIdentity;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export function createApiApp(options: CreateApiAppOptions): express.Express {
  const app = express();
  app.use(express.json({ limit: '32kb' }));
  const sealedSnapshotStore = options.sealedSnapshotStore ?? new InMemorySealedIntakeSnapshotStore();
  const defaultActor: ActorIdentity = options.defaultActor ?? {
    actorId: 'system-intake',
    actorType: ActorType.SYSTEM,
    displayName: 'Intake API',
  };

  app.post('/v1/intake/files', upload.single('file'), async (req, res) => {
    const file = req.file;
    if (!file?.buffer) {
      res.status(400).json({ error: 'file_required', message: 'Multipart field "file" is required' });
      return;
    }

    const originalFilename = file.originalname || 'upload.bin';
    const contentType = file.mimetype || 'application/octet-stream';

    try {
      const record = await registerIntakeFile({
        bytes: file.buffer,
        originalFilename,
        contentType,
        actor: defaultActor,
        auditWriter: options.auditWriter,
        store: options.intakeStore,
        correlationId: typeof req.headers['x-correlation-id'] === 'string' ? req.headers['x-correlation-id'] : undefined,
      });

      res.status(201).json({
        intakeFileId: record.intakeFileId,
        status: record.status,
        validation: record.validation,
        createdAt: record.createdAt,
        contentSha256: record.contentSha256,
      });
    } catch {
      res.status(500).json({ error: 'intake_failed', message: 'Intake processing failed' });
    }
  });

  app.post('/v1/intake/files/:intakeFileId/map', async (req, res) => {
    const intakeFileId = req.params['intakeFileId'];
    if (typeof intakeFileId !== 'string' || intakeFileId.length === 0) {
      res.status(400).json({ error: 'invalid_intake_file_id', message: 'intakeFileId is required' });
      return;
    }

    try {
      const result = await runStoredIntakeMapping({
        intakeFileId,
        store: options.intakeStore,
        auditWriter: options.auditWriter,
        actor: defaultActor,
        correlationId: typeof req.headers['x-correlation-id'] === 'string' ? req.headers['x-correlation-id'] : undefined,
      });
      res.status(200).json(result);
    } catch (err) {
      if (err instanceof IntakeFileNotFoundError) {
        res.status(404).json({ error: err.code, message: err.message });
        return;
      }
      res.status(500).json({ error: 'mapping_failed', message: 'Mapping and normalization failed' });
    }
  });

  app.post('/v1/intake/files/:intakeFileId/snapshots', async (req, res) => {
    const intakeFileId = req.params['intakeFileId'];
    if (typeof intakeFileId !== 'string' || intakeFileId.length === 0) {
      res.status(400).json({ error: 'invalid_intake_file_id', message: 'intakeFileId is required' });
      return;
    }

    const parsed = CreateIntakeSnapshotRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'invalid_snapshot_request',
        message: 'methodologyVersion and rulePackVersion are required non-empty strings',
      });
      return;
    }

    const { methodologyVersion, rulePackVersion } = parsed.data;

    try {
      const result = await runStoredIntakeSnapshotCreation({
        intakeFileId,
        store: options.intakeStore,
        sealedSnapshotStore,
        auditWriter: options.auditWriter,
        actor: defaultActor,
        methodologyVersion,
        rulePackVersion,
        correlationId: typeof req.headers['x-correlation-id'] === 'string' ? req.headers['x-correlation-id'] : undefined,
      });

      if (result.ok === false) {
        res.status(422).json({
          error: 'snapshot_blocked',
          blockedReasons: result.error.blockedReasons,
        });
        return;
      }

      res.status(201).json(result.value);
    } catch (err) {
      if (err instanceof IntakeFileNotFoundError) {
        res.status(404).json({ error: err.code, message: err.message });
        return;
      }
      res.status(500).json({ error: 'snapshot_failed', message: 'Snapshot creation failed' });
    }
  });

  return app;
}
