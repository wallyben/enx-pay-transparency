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
});
