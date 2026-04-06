import * as fs from 'fs';
import * as path from 'path';

const FORBIDDEN = [/comparable\s*category/i, /equal[\s_-]*value/i, /pay\s*gap/i, /category\s*engine/i];

describe('job-architecture scope guard', () => {
  it('does not reference comparable categories, equal value, pay gap, or category engine in library sources', () => {
    const srcRoot = path.join(__dirname, '..');
    const entries = fs.readdirSync(srcRoot, { withFileTypes: true });
    const files: string[] = [];
    for (const e of entries) {
      if (!e.isFile() || !e.name.endsWith('.ts') || e.name.endsWith('.test.ts')) continue;
      files.push(path.join(srcRoot, e.name));
    }
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const text = fs.readFileSync(file, 'utf8');
      for (const re of FORBIDDEN) {
        expect(text).not.toMatch(re);
      }
    }
  });
});
