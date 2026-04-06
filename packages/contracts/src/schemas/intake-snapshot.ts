import { z } from 'zod';

export const CreateIntakeSnapshotRequestSchema = z.object({
  methodologyVersion: z.string().min(1).max(64),
  rulePackVersion: z.string().min(1).max(64),
});
