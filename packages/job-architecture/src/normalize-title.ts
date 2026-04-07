/**
 * Deterministic title normalization: NFC, trim, collapse whitespace, uppercase for stable keys.
 */
export function normalizeJobTitle(raw: string): string | null {
  const nfc = raw.normalize('NFC').trim();
  if (nfc.length === 0) return null;
  const collapsed = nfc.replace(/\s+/g, ' ');
  return collapsed.toUpperCase();
}
