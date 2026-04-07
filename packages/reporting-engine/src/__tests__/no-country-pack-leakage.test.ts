import * as fs from 'fs';
import * as path from 'path';

describe('reporting-engine scope guard', () => {
  it('does not embed country-pack or regulator-template concepts in production sources', () => {
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
      'country-pack',
      'CountryPack',
      'countryPack',
      'regulatorTemplate',
      'RegulatorTemplate',
      'S20_country',
      'S21_country',
    ];

    for (const file of walk(srcRoot)) {
      const text = fs.readFileSync(file, 'utf8');
      const lower = text.toLowerCase();
      for (const phrase of forbidden) {
        expect(lower.includes(phrase.toLowerCase())).toBe(false);
      }
    }
  });
});
