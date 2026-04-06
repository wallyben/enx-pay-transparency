import { ActorType, type ActorIdentity, type AuditWriter } from '@enx/audit';
import type { IntakeFileStore } from '@enx/intake-engine';
import { registerIntakeFile } from '@enx/intake-engine';
import express from 'express';
import multer from 'multer';

export interface CreateApiAppOptions {
  readonly auditWriter: AuditWriter;
  readonly intakeStore: IntakeFileStore;
  readonly defaultActor?: ActorIdentity;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export function createApiApp(options: CreateApiAppOptions): express.Express {
  const app = express();
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

  return app;
}
