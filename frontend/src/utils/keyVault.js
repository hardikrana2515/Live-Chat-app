const VAULT_FORMAT_VERSION = 1;
const VAULT_CIPHER = 'AES-256-GCM';
const VAULT_KDF = 'PBKDF2-HMAC-SHA256';
const VAULT_KDF_ITERATIONS = 100000;
const VAULT_PURPOSE = 'TalkyyIdentityVaultV1';

// Base64 helpers
export const bytesToB64 = (bytes) => {
  let bin = '';
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin);
};

export const b64ToBytes = (b64) => {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
};

// Canonical Public Key SHA-256 Fingerprint
export const computePublicKeyFingerprint = async (publicKeyB64) => {
  if (!publicKeyB64) return '';
  try {
    const raw = b64ToBytes(publicKeyB64);
    const hashBuffer = await crypto.subtle.digest('SHA-256', raw);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // Format into 8 colon-separated hex pairs (e.g. "a1b2:c3d4:...")
    return hashArray
      .slice(0, 16)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(':')
      .toUpperCase();
  } catch (e) {
    console.warn('[KeyVault] Fingerprint derivation failed:', e);
    return '';
  }
};

/**
 * Generate a high-entropy, human-friendly recovery secret.
 * 16 random bytes (128 bits entropy) formatted into clean alphanumeric chunks:
 * "TLKY-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX"
 */
export const generateRecoverySecret = () => {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Crockford-style (no 0/O, 1/I confusion)
  const randomBytes = crypto.getRandomValues(new Uint8Array(28));
  let code = '';
  for (let i = 0; i < randomBytes.length; i++) {
    code += charset[randomBytes[i] % charset.length];
  }

  // Format into 7 chunks of 4 characters with "TLKY-" prefix
  const chunks = [];
  for (let i = 0; i < code.length; i += 4) {
    chunks.push(code.slice(i, i + 4));
  }
  return `TLKY-${chunks.join('-')}`;
};

/**
 * Normalize user-entered recovery key:
 * Trims whitespace, removes hyphens/prefix, uppercases.
 */
export const normalizeRecoverySecret = (input) => {
  if (!input || typeof input !== 'string') return '';
  let clean = input.trim().toUpperCase().replace(/[\s\-_]/g, '');
  if (clean.startsWith('TLKY')) {
    clean = clean.slice(4);
  }
  return clean;
};

/**
 * Derive a 256-bit AES-GCM Key Encryption Key (KEK) using PBKDF2-HMAC-SHA256
 */
export const deriveVaultKey = async (normalizedSecret, saltBytes, iterations = VAULT_KDF_ITERATIONS) => {
  if (!normalizedSecret || normalizedSecret.length < 16) {
    throw new Error('Recovery key is too short or invalid.');
  }

  const enc = new TextEncoder();
  const secretKeyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(normalizedSecret),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const kek = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations,
      hash: 'SHA-256',
    },
    secretKeyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  return kek;
};

/**
 * Encrypt a user's ECDH Private Key into a versioned, authenticated Vault Envelope.
 * 
 * @param {CryptoKey} privateKey - The ECDH P-256 private key
 * @param {string} publicKeyB64 - The matching base64 public key
 * @param {string} identityId - Stable identity identifier
 * @param {string} recoverySecret - Raw generated recovery secret
 * @returns {Promise<{ vault: object, publicKeyFingerprint: string }>}
 */
export const encryptIdentityVault = async (privateKey, publicKeyB64, identityId, recoverySecret) => {
  const normalized = normalizeRecoverySecret(recoverySecret);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const nonce = crypto.getRandomValues(new Uint8Array(12)); // 96-bit AES-GCM nonce

  const kek = await deriveVaultKey(normalized, salt, VAULT_KDF_ITERATIONS);

  // Export private key to JWK
  const privJwk = await crypto.subtle.exportKey('jwk', privateKey);

  const payload = JSON.stringify({
    identityId,
    privateKeyJwk: privJwk,
    publicKeyB64,
    createdAt: Date.now(),
  });

  const aadString = JSON.stringify({
    identityId,
    purpose: VAULT_PURPOSE,
    version: VAULT_FORMAT_VERSION,
  });

  const enc = new TextEncoder();
  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: nonce,
      additionalData: enc.encode(aadString),
    },
    kek,
    enc.encode(payload)
  );

  const publicKeyFingerprint = await computePublicKeyFingerprint(publicKeyB64);

  return {
    vault: {
      formatVersion: VAULT_FORMAT_VERSION,
      cipher: VAULT_CIPHER,
      kdf: VAULT_KDF,
      kdfIterations: VAULT_KDF_ITERATIONS,
      salt: bytesToB64(salt),
      nonce: bytesToB64(nonce),
      ciphertext: bytesToB64(new Uint8Array(ciphertextBuffer)),
      aad: aadString,
    },
    publicKeyFingerprint,
  };
};

/**
 * Decrypt a Vault Envelope using the recovery secret, and verify identity integrity.
 * 
 * @param {object} vault - The vault envelope from the server
 * @param {string} recoverySecret - User-entered recovery secret
 * @param {string} expectedPublicKeyB64 - The public key currently registered on the server
 * @returns {Promise<{ privateKey: CryptoKey, publicKeyB64: string, identityId: string }>}
 */
export const decryptIdentityVault = async (vault, recoverySecret, expectedPublicKeyB64) => {
  if (!vault || !vault.ciphertext || !vault.nonce || !vault.salt) {
    throw new Error('Malformed or incomplete vault envelope.');
  }

  if (vault.formatVersion > VAULT_FORMAT_VERSION) {
    throw new Error('Unsupported vault version. Please update Talkyy to restore this key.');
  }

  const normalized = normalizeRecoverySecret(recoverySecret);
  const saltBytes = b64ToBytes(vault.salt);
  const nonceBytes = b64ToBytes(vault.nonce);
  const ciphertextBytes = b64ToBytes(vault.ciphertext);
  const iterations = vault.kdfIterations || VAULT_KDF_ITERATIONS;

  let kek;
  try {
    kek = await deriveVaultKey(normalized, saltBytes, iterations);
  } catch (e) {
    throw new Error('Failed to derive vault key: ' + e.message);
  }

  const enc = new TextEncoder();
  const aadBytes = vault.aad ? enc.encode(vault.aad) : new Uint8Array(0);

  let decryptedBuffer;
  try {
    decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: nonceBytes,
        additionalData: aadBytes,
      },
      kek,
      ciphertextBytes
    );
  } catch {
    // Cryptographic failure (authentication tag mismatch)
    throw new Error('Invalid recovery key. Decryption failed.');
  }

  const dec = new TextDecoder();
  const payload = JSON.parse(dec.decode(decryptedBuffer));

  if (!payload.privateKeyJwk) {
    throw new Error('Corrupted vault payload: private key JWK missing.');
  }

  // Import recovered private key
  const privateKey = await crypto.subtle.importKey(
    'jwk',
    payload.privateKeyJwk,
    { name: 'ECDH', namedCurve: 'P-256' },
    true, // extractable for local storage backup
    ['deriveBits']
  );

  const recoveredPublicB64 = payload.publicKeyB64;

  // Identity continuity check: Verify that recovered key matches server's registered public identity
  if (expectedPublicKeyB64 && recoveredPublicB64) {
    if (recoveredPublicB64.trim() !== expectedPublicKeyB64.trim()) {
      throw new Error(
        'Identity Mismatch: The recovered private key does not correspond to the public key registered on your account.'
      );
    }
  }

  return {
    privateKey,
    publicKeyB64: recoveredPublicB64,
    identityId: payload.identityId,
  };
};

/**
 * Validate recovery secret format syntax before running heavy PBKDF2
 */
export const isValidRecoverySecretFormat = (input) => {
  const norm = normalizeRecoverySecret(input);
  return norm.length >= 24 && /^[A-Z0-9]+$/.test(norm);
};
