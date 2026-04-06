import * as fs from 'fs';
import * as path from 'path';

describe('S09 scope guard — no equal-value / metrics leakage in category-engine sources', () => {
  const srcDir = path.join(__dirname, '..');
  const forbidden = [/equal\s*value/i, /pay\s*gap/i, /metrics-engine/i, /banding/i];

  function walk(dir: string): string[] {
    const out: string[] = [];
    for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, name.name);
      if (name.isDirectory()) {
        if (name.name === '__tests__') continue;
        out.push(...walk(full));
      } else if (name.isFile() && name.name.endsWith('.ts')) {
        out.push(full);
      }
    }
    return out;
  }

  it('source files do not reference forbidden domains', () => {
    for (const file of walk(srcDir)) {
      const text = fs.readFileSync(file, 'utf8');
      for (const pattern of forbidden) {
        expect(pattern.test(text)).toBe(false);
      }
    }
  });
});
