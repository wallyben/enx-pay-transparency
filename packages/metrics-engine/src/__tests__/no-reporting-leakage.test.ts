import * as fs from 'fs';
import * as path from 'path';

describe('metrics-engine scope guard', () => {
  it('does not reference reporting-pack or country-pack concepts in production sources', () => {
    const srcRoot = path.join(__dirname, '..');
    const walk = (dir: string): string[] => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const out: string[] = [];
      for (const ent of entries) {
        if (ent.name === '__tests__') continue;
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) {
          out.push(...walk(full));
        } else if (ent.isFile() && ent.name.endsWith('.ts')) {
          out.push(full);
        }
      }
      return out;
    };

    const forbidden = [
      'reporting-engine',
      'evidence pack',
      'evidencePack',
      'country-pack',
      'CountryPack',
      'PDF',
      'dashboard',
    ];

    for (const file of walk(srcRoot)) {
      const text = fs.readFileSync(file, 'utf8');
      for (const phrase of forbidden) {
        expect(text.toLowerCase().includes(phrase.toLowerCase())).toBe(false);
      }
    }
  });
});
