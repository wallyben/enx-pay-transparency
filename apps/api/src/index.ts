import { createApiApp } from './app';
import { InMemoryAuditWriter } from '@enx/audit';
import { InMemoryIntakeFileStore } from '@enx/intake-engine';

export { createApiApp } from './app';

const port = Number(process.env['PORT'] ?? '3000');

if (require.main === module) {
  const auditWriter = new InMemoryAuditWriter();
  const intakeStore = new InMemoryIntakeFileStore();
  const app = createApiApp({ auditWriter, intakeStore });
  app.listen(port, () => {
    process.stdout.write(`api listening on ${port}\n`);
  });
}
