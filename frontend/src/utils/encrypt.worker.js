// Web Worker: runs AES encryption/decryption off the main thread so large
// media files (8–20 MB videos/images) no longer freeze the browser UI. (Issue 3.3)
//
// Message shape: { id, op: 'encrypt'|'decrypt', payload, key }
//   key = { mode: 'raw',  value: <base64 AES-256 key> }   per-conversation key
//       | { mode: 'pass', value: <passphrase> }            legacy static key (read-only)
//
// Formats:
//   raw  encrypt → "<ivB64>.<opensslBody>.<hmacSha256>" (Authenticated Encryption:
//        tamper-proof AEAD design with SHA256 MAC over IV and ciphertext)
//   pass → classic OpenSSL passphrase format ("Salted__..."), unchanged for
//        legacy ciphertext read-only compatibility.
import CryptoJS from 'crypto-js';

const resolveKey = (key) => {
    if (!key) return '';
    if (typeof key === 'string') return key; // legacy call shape
    return key.mode === 'raw' ? CryptoJS.enc.Base64.parse(key.value) : key.value;
};

const rawEncrypt = (payload, secret) => {
    const iv = CryptoJS.lib.WordArray.random(16);
    const body = CryptoJS.AES.encrypt(payload, secret, { iv }).toString();
    const ivB64 = CryptoJS.enc.Base64.stringify(iv);
    const mac = CryptoJS.HmacSHA256(`${ivB64}.${body}`, secret).toString();
    return `${ivB64}.${body}.${mac}`;
};

const rawDecrypt = (payload, secret) => {
    const parts = payload.split('.');
    if (parts.length === 3) {
        const [ivB64, body, mac] = parts;
        const expectedMac = CryptoJS.HmacSHA256(`${ivB64}.${body}`, secret).toString();
        if (mac !== expectedMac) {
            return null; // Tamper detected
        }
        const iv = CryptoJS.enc.Base64.parse(ivB64);
        return CryptoJS.AES.decrypt(body, secret, { iv }).toString(CryptoJS.enc.Utf8) || null;
    } else if (parts.length === 2) {
        // Backward-compatible unauthenticated 2-part format
        const [ivB64, body] = parts;
        const iv = CryptoJS.enc.Base64.parse(ivB64);
        return CryptoJS.AES.decrypt(body, secret, { iv }).toString(CryptoJS.enc.Utf8) || null;
    }
    return null;
};

self.onmessage = (e) => {
    const { id, op, payload, key } = e.data || {};
    try {
        const secret = resolveKey(key);
        const isRaw = key && typeof key === 'object' && key.mode === 'raw';
        let result;
        if (op === 'encrypt') {
            if (!isRaw) {
                throw new Error('Encryption with legacy key is disabled for security');
            }
            result = rawEncrypt(payload, secret);
        } else if (op === 'decrypt') {
            result = isRaw ? rawDecrypt(payload, secret) : CryptoJS.AES.decrypt(payload, secret).toString(CryptoJS.enc.Utf8);
        } else {
            throw new Error(`Unknown operation: ${op}`);
        }
        if (result === null || result === undefined) {
            throw new Error('Decryption produced no output or authentication check failed');
        }
        self.postMessage({ id, ok: true, result });
    } catch (err) {
        self.postMessage({ id, ok: false, error: String(err?.message || err) });
    }
};
