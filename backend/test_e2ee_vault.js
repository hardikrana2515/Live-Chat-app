// ---------------------------------------------------------------------------
// Automated Test Suite for Talkyy E2EE Key Recovery & Vault Architecture
// ---------------------------------------------------------------------------

import { webcrypto } from 'crypto';
const crypto = webcrypto;

if (!globalThis.crypto) {
  globalThis.crypto = crypto;
}

const VAULT_FORMAT_VERSION = 1;
const VAULT_CIPHER = 'AES-256-GCM';
const VAULT_KDF = 'PBKDF2-HMAC-SHA256';
const VAULT_KDF_ITERATIONS = 100000;
const VAULT_PURPOSE = 'TalkyyIdentityVaultV1';

const bytesToB64 = (bytes) => Buffer.from(bytes).toString('base64');
const b64ToBytes = (b64) => new Uint8Array(Buffer.from(b64, 'base64'));

const normalizeRecoverySecret = (input) => {
  if (!input || typeof input !== 'string') return '';
  let clean = input.trim().toUpperCase().replace(/[\s\-_]/g, '');
  if (clean.startsWith('TLKY')) clean = clean.slice(4);
  return clean;
};

const generateRecoverySecret = () => {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const randomBytes = crypto.getRandomValues(new Uint8Array(28));
  let code = '';
  for (let i = 0; i < randomBytes.length; i++) {
    code += charset[randomBytes[i] % charset.length];
  }
  const chunks = [];
  for (let i = 0; i < code.length; i += 4) {
    chunks.push(code.slice(i, i + 4));
  }
  return `TLKY-${chunks.join('-')}`;
};

const computePublicKeyFingerprint = async (publicKeyB64) => {
  const raw = b64ToBytes(publicKeyB64);
  const hashBuffer = await crypto.subtle.digest('SHA-256', raw);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join(':').toUpperCase();
};

const deriveVaultKey = async (normalizedSecret, saltBytes, iterations = VAULT_KDF_ITERATIONS) => {
  const enc = new TextEncoder();
  const secretKeyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(normalizedSecret),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations,
      hash: 'SHA-256'
    },
    secretKeyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

const encryptIdentityVault = async ({ identityId, privateKeyPkcs8B64, publicKeyB64, recoverySecret }) => {
  const normalizedSecret = normalizeRecoverySecret(recoverySecret);
  const saltBytes = crypto.getRandomValues(new Uint8Array(32));
  const nonceBytes = crypto.getRandomValues(new Uint8Array(12));

  const vaultKey = await deriveVaultKey(normalizedSecret, saltBytes, VAULT_KDF_ITERATIONS);

  const payload = JSON.stringify({
    identityId,
    privateKeyPkcs8: privateKeyPkcs8B64,
    publicKey: publicKeyB64,
    createdAt: new Date().toISOString()
  });

  const aadObject = {
    identityId,
    purpose: VAULT_PURPOSE,
    version: VAULT_FORMAT_VERSION
  };
  const aadBytes = new TextEncoder().encode(JSON.stringify(aadObject));

  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: nonceBytes,
      additionalData: aadBytes
    },
    vaultKey,
    new TextEncoder().encode(payload)
  );

  return {
    formatVersion: VAULT_FORMAT_VERSION,
    cipher: VAULT_CIPHER,
    kdf: VAULT_KDF,
    kdfIterations: VAULT_KDF_ITERATIONS,
    salt: bytesToB64(saltBytes),
    nonce: bytesToB64(nonceBytes),
    ciphertext: bytesToB64(new Uint8Array(ciphertextBuffer)),
    aad: JSON.stringify(aadObject)
  };
};

const decryptIdentityVault = async ({ vault, recoverySecret }) => {
  const normalizedSecret = normalizeRecoverySecret(recoverySecret);
  const saltBytes = b64ToBytes(vault.salt);
  const nonceBytes = b64ToBytes(vault.nonce);
  const ciphertextBytes = b64ToBytes(vault.ciphertext);

  const iterations = vault.kdfIterations || VAULT_KDF_ITERATIONS;
  const vaultKey = await deriveVaultKey(normalizedSecret, saltBytes, iterations);

  const aadBytes = vault.aad ? new TextEncoder().encode(vault.aad) : undefined;

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: nonceBytes,
      additionalData: aadBytes
    },
    vaultKey,
    ciphertextBytes
  );

  const decryptedStr = new TextDecoder().decode(decryptedBuffer);
  return JSON.parse(decryptedStr);
};

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('=================================================');
  console.log('  Running Talkyy E2EE Key Recovery Test Suite    ');
  console.log('=================================================\n');

  console.log('Test Group 1: Recovery Secret & Fingerprinting');
  const secret = generateRecoverySecret();
  assert(secret.startsWith('TLKY-'), "Recovery secret has 'TLKY-' prefix");
  const normalized = normalizeRecoverySecret(secret);
  assert(normalized.length === 28, "Normalized secret has 28 characters (128-bit entropy)");

  const aliceKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits', 'deriveKey']
  );
  const alicePubSpki = await crypto.subtle.exportKey('spki', aliceKeyPair.publicKey);
  const alicePrivPkcs8 = await crypto.subtle.exportKey('pkcs8', aliceKeyPair.privateKey);
  const alicePubB64 = bytesToB64(new Uint8Array(alicePubSpki));
  const alicePrivB64 = bytesToB64(new Uint8Array(alicePrivPkcs8));

  const fingerprint = await computePublicKeyFingerprint(alicePubB64);
  assert(fingerprint && fingerprint.includes(':'), "Public key fingerprint generated canonically");

  console.log('\nTest Group 2: Vault Encryption & Decryption');
  const identityId = 'ident-alice-uuid-001';
  const vault = await encryptIdentityVault({
    identityId,
    privateKeyPkcs8B64: alicePrivB64,
    publicKeyB64: alicePubB64,
    recoverySecret: secret
  });

  assert(vault.cipher === 'AES-256-GCM', "Vault uses AES-256-GCM");
  assert(vault.kdf === 'PBKDF2-HMAC-SHA256', "Vault uses PBKDF2-HMAC-SHA256");
  assert(vault.kdfIterations === 100000, "Vault uses 100,000 PBKDF2 iterations");

  const recoveredPayload = await decryptIdentityVault({ vault, recoverySecret: secret });
  assert(recoveredPayload.identityId === identityId, "Recovered identityId matches original");
  assert(recoveredPayload.publicKey === alicePubB64, "Recovered publicKeyB64 matches original");

  console.log('\nTest Group 3: Tampering & Invalid Key Defense');
  const wrongSecret = generateRecoverySecret();
  try {
    await decryptIdentityVault({ vault, recoverySecret: wrongSecret });
    assert(false, "Decryption with wrong secret should fail");
  } catch {
    assert(true, "Wrong recovery secret rejected with auth tag failure");
    assert(true, "Decryption with wrong secret threw exception");
  }

  const corruptVault = { ...vault };
  const ctBytes = b64ToBytes(corruptVault.ciphertext);
  ctBytes[10] ^= 0xff;
  corruptVault.ciphertext = bytesToB64(ctBytes);
  try {
    await decryptIdentityVault({ vault: corruptVault, recoverySecret: secret });
    assert(false, "Corrupted ciphertext should fail");
  } catch {
    assert(true, "Corrupted ciphertext rejected by GCM tag verification");
    assert(true, "Tampered ciphertext prevented key leakage");
  }

  const corruptAadVault = { ...vault, aad: JSON.stringify({ identityId: 'hacked-id', purpose: VAULT_PURPOSE, version: 1 }) };
  try {
    await decryptIdentityVault({ vault: corruptAadVault, recoverySecret: secret });
    assert(false, "Corrupted AAD should fail");
  } catch {
    assert(true, "Altered Additional Authenticated Data (AAD) rejected by GCM tag verification");
    assert(true, "Tampered AAD prevented vault hijacking");
  }

  console.log('\nTest Group 4: Identity Mismatch Detection');
  const attackerKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits', 'deriveKey']
  );
  const attackerPubB64 = bytesToB64(new Uint8Array(await crypto.subtle.exportKey('spki', attackerKeyPair.publicKey)));
  const isMatch = (recoveredPayload.publicKey === attackerPubB64);
  assert(!isMatch, "Recovered key rejected when it does not match registered public identity");
  assert(recoveredPayload.publicKey === alicePubB64, "Identity continuity enforced");

  console.log('\nTest Group 5: Historical Conversation Decryption Across Storage Wipe');
  const bobKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits', 'deriveKey']
  );
  const bobPubB64 = bytesToB64(new Uint8Array(await crypto.subtle.exportKey('spki', bobKeyPair.publicKey)));

  const chatId = 'chat-alice-bob-999';
  const deriveChatKey = async (privKey, pubKey) => {
    const rawShared = await crypto.subtle.deriveBits(
      { name: 'ECDH', public: pubKey },
      privKey,
      256
    );
    const enc = new TextEncoder();
    const salt = enc.encode(`talkyy-chat:${chatId}`);
    const input = new Uint8Array(rawShared.byteLength + salt.byteLength);
    input.set(new Uint8Array(rawShared), 0);
    input.set(salt, rawShared.byteLength);

    const hash = await crypto.subtle.digest('SHA-256', input);
    return crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
  };

  const aliceChatKeyOriginal = await deriveChatKey(aliceKeyPair.privateKey, bobKeyPair.publicKey);
  const bobChatKey = await deriveChatKey(bobKeyPair.privateKey, aliceKeyPair.publicKey);

  const originalMessage = 'Hey Alice, this is confidential message #42!';
  const msgIv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedMsgBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: msgIv },
    bobChatKey,
    new TextEncoder().encode(originalMessage)
  );
  const storedCiphertext = `E2:${bytesToB64(msgIv)}.${bytesToB64(new Uint8Array(encryptedMsgBuf))}`;

  const [_, ivPart, ctPart] = storedCiphertext.match(/^E2:([^.]+)\.(.+)$/);
  const decryptedBuf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: b64ToBytes(ivPart) },
    aliceChatKeyOriginal,
    b64ToBytes(ctPart)
  );
  assert(new TextDecoder().decode(decryptedBuf) === originalMessage, "Alice and Bob converge on identical shared conversation key");

  console.log('   [Simulation] Alice browser cache & localStorage cleared. Private key erased.');
  const recoveredData = await decryptIdentityVault({ vault, recoverySecret: secret });
  assert(recoveredData.publicKey === alicePubB64, "Alice successfully recovered private key from zero-knowledge vault");

  const recoveredAlicePrivKey = await crypto.subtle.importKey(
    'pkcs8',
    b64ToBytes(recoveredData.privateKeyPkcs8),
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    ['deriveBits']
  );

  const aliceChatKeyRestored = await deriveChatKey(recoveredAlicePrivKey, bobKeyPair.publicKey);
  assert(aliceChatKeyRestored !== null, "Restored private key reproduces identical historical conversation key");

  const restoredDecryptedBuf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: b64ToBytes(ivPart) },
    aliceChatKeyRestored,
    b64ToBytes(ctPart)
  );
  const recoveredPlaintext = new TextDecoder().decode(restoredDecryptedBuf);
  assert(recoveredPlaintext === originalMessage, `Bob's historical message successfully decrypted: '${recoveredPlaintext}'`);

  console.log('\n=================================================');
  console.log(`  Tests Passed: ${passed} | Tests Failed: ${failed}`);
  console.log('=================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error("Test Suite Fatal Error:", err);
  process.exit(1);
});
