import { z } from 'zod';

export const PaginationQuerySchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1).max(200),
});
