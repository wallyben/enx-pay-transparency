/**
 * migration-sanity.test.ts
 *
 * Verifies that the SQL migration file exists and defines all expected tables.
 * This does not run against a live database — it checks the DDL source file itself.
 */
import * as fs from 'fs';
import * as path from 'path';

const MIGRATION_PATH = path.resolve(
  __dirname,
  '../../../../infra/migrations/0001_canonical_model.sql',
);

const EXPECTED_TABLES = [
  'legal_entities',
  'jobs',
  'workers',
  'pay_snapshots',
  'pay_components',
  'snapshot_manifests',
  'source_lineage_refs',
];

const EXPECTED_ENUM_TYPES = [
  'employment_type',
  'contract_type',
  'gender',
  'worker_status',
  'snapshot_status',
  'pay_component_type',
  'pay_period_code',
];

const COUNTRY_NAMES = [
  'ireland', 'france', 'germany', 'belgium', 'netherlands',
  'norway', 'sweden', 'denmark', 'portugal', 'spain', 'italy',
];

describe('SQL migration 0001_canonical_model', () => {
  let sql: string;

  beforeAll(() => {
    sql = fs.readFileSync(MIGRATION_PATH, 'utf-8').toLowerCase();
  });

  it('migration file exists', () => {
    expect(fs.existsSync(MIGRATION_PATH)).toBe(true);
  });

  for (const table of EXPECTED_TABLES) {
    it(`defines table ${table}`, () => {
      expect(sql).toContain(`create table ${table}`);
    });
  }

  for (const enumType of EXPECTED_ENUM_TYPES) {
    it(`defines enum type ${enumType}`, () => {
      expect(sql).toContain(`create type ${enumType}`);
    });
  }

  it('does not reference country names in table or column definitions', () => {
    const createTableBlocks = sql
      .split(/create table/)
      .slice(1)
      .join('create table ');

    const leaked = COUNTRY_NAMES.filter((c) => createTableBlocks.includes(c));
    expect(leaked).toHaveLength(0);
  });

  it('defines a primary key for every table', () => {
    for (const table of EXPECTED_TABLES) {
      const tableBlock = sql.slice(sql.indexOf(`create table ${table}`));
      const nextTable = tableBlock.indexOf('create table', 1);
      const block = nextTable > 0 ? tableBlock.slice(0, nextTable) : tableBlock;
      expect(block).toContain('primary key');
    }
  });

  it('pay_components does not have sub-period effective date columns', () => {
    const tableStart = sql.indexOf('create table pay_components');
    const tableEnd = sql.indexOf('create table', tableStart + 1);
    const block = sql.slice(tableStart, tableEnd > 0 ? tableEnd : undefined);
    expect(block).not.toContain('effective_from');
    expect(block).not.toContain('effective_to');
  });

  it('workers does not have a seniority_level_code column', () => {
    const tableStart = sql.indexOf('create table workers');
    const tableEnd = sql.indexOf('create table', tableStart + 1);
    const block = sql.slice(tableStart, tableEnd > 0 ? tableEnd : undefined);
    expect(block).not.toContain('seniority_level_code');
  });

  it('snapshot_manifests does not have a source_ref column', () => {
    const tableStart = sql.indexOf('create table snapshot_manifests');
    const tableEnd = sql.indexOf('create table', tableStart + 1);
    const block = sql.slice(tableStart, tableEnd > 0 ? tableEnd : undefined);
    expect(block).not.toContain('source_ref');
  });

  it('ck_snapshot_sealed_at constraint uses DRAFT discriminant (not SEALED)', () => {
    // Verifies the constraint correctly allows ARCHIVED snapshots to retain sealed_at.
    // Wrong form: status != 'SEALED' AND sealed_at IS NULL (blocks archiving)
    // Correct form: status = 'DRAFT' AND sealed_at IS NULL
    const snapshotStart = sql.indexOf('create table pay_snapshots');
    const snapshotEnd = sql.indexOf('create table', snapshotStart + 1);
    const block = sql.slice(snapshotStart, snapshotEnd > 0 ? snapshotEnd : undefined);
    expect(block).toContain("status = 'draft' and sealed_at is null");
    expect(block).not.toContain("status != 'sealed' and sealed_at is null");
  });

  it('pay_components has a composite index on (snapshot_id, component_type)', () => {
    expect(sql).toContain('idx_pay_components_snapshot_type');
    expect(sql).toContain('snapshot_id, component_type');
  });
});
