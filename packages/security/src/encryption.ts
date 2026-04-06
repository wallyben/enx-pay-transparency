// ---------------------------------------------------------------------------
// Field-Level Encryption — Baseline Stubs
// Key management is deferred to S34 (security_hardening_and_role_matrix).
// This module provides the shape and round-trip contract only.
// ---------------------------------------------------------------------------

export enum EncryptionAlgorithm {
  STUB = 'STUB',
}

export interface EncryptionKey {
  readonly keyId: string;
  readonly algorithm: EncryptionAlgorithm;
  readonly createdAt: string;
}

export interface EncryptedValue {
  readonly ciphertext: string;
  readonly keyId: string;
  readonly algorithm: EncryptionAlgorithm;
}

// ---------------------------------------------------------------------------
// Key Resolver interface
// Implementations will be provided by the infrastructure layer in a later slice.
// ---------------------------------------------------------------------------

export interface KeyResolver {
  resolve(keyId: string): Promise<Buffer>;
}

// ---------------------------------------------------------------------------
// Stub encrypt / decrypt
// Uses base64 encoding as a placeholder so the round-trip contract holds.
// Real AES-256-GCM or equivalent will be wired in S34.
// ---------------------------------------------------------------------------

const STUB_KEY_ID = 'stub-key-baseline';

export function encrypt(plaintext: string): EncryptedValue {
  const ciphertext = Buffer.from(plaintext, 'utf-8').toString('base64');
  return {
    ciphertext,
    keyId: STUB_KEY_ID,
    algorithm: EncryptionAlgorithm.STUB,
  };
}

export function decrypt(encrypted: EncryptedValue): string {
  if (encrypted.algorithm !== EncryptionAlgorithm.STUB) {
    throw new Error(
      `Unsupported algorithm in stub decryptor: ${encrypted.algorithm}. Real decryption is wired in S34.`,
    );
  }
  return Buffer.from(encrypted.ciphertext, 'base64').toString('utf-8');
}

export function encryptRoundTrip(plaintext: string): boolean {
  return decrypt(encrypt(plaintext)) === plaintext;
}
