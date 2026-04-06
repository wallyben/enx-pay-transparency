import {
  encrypt,
  decrypt,
  encryptRoundTrip,
  EncryptionAlgorithm,
} from '../encryption';
import type { EncryptedValue } from '../encryption';

describe('encrypt', () => {
  it('returns an EncryptedValue with a non-empty ciphertext', () => {
    const result = encrypt('hello world');
    expect(result.ciphertext).toBeTruthy();
    expect(result.ciphertext.length).toBeGreaterThan(0);
  });

  it('returns the STUB algorithm', () => {
    const result = encrypt('test');
    expect(result.algorithm).toBe(EncryptionAlgorithm.STUB);
  });

  it('returns a non-empty keyId', () => {
    const result = encrypt('test');
    expect(result.keyId).toBeTruthy();
  });

  it('produces a different ciphertext from the plaintext', () => {
    const plaintext = 'sensitive-data';
    const result = encrypt(plaintext);
    expect(result.ciphertext).not.toBe(plaintext);
  });
});

describe('decrypt', () => {
  it('recovers the original plaintext', () => {
    const plaintext = 'pay transparency is required';
    const encrypted = encrypt(plaintext);
    expect(decrypt(encrypted)).toBe(plaintext);
  });

  it('throws for unsupported algorithm', () => {
    const bad: EncryptedValue = {
      ciphertext: 'anything',
      keyId: 'key-1',
      algorithm: 'AES_256_GCM' as EncryptionAlgorithm,
    };
    expect(() => decrypt(bad)).toThrow();
  });
});

describe('encryptRoundTrip', () => {
  it('returns true for any plaintext', () => {
    expect(encryptRoundTrip('hello')).toBe(true);
    expect(encryptRoundTrip('')).toBe(true);
    expect(encryptRoundTrip('unicode: 日本語')).toBe(true);
  });
});

describe('EncryptionAlgorithm enum', () => {
  it('exports STUB', () => {
    expect(EncryptionAlgorithm.STUB).toBe('STUB');
  });
});
