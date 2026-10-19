// Web Worker: runs AES encryption/decryption off the main thread so large
// media files (8–20 MB videos/images) no longer freeze the browser UI. (Issue 3.3)
//
// Message shape: { id, op: 'encrypt'|'decrypt', payload, key }
//   key = { mode: 'raw',  value: <base64 AES-256 key> }   per-conversation key
//       | { mode: 'pass', value: <passphrase> }            legacy static key
//
// Formats:
//   raw  encrypt → "<ivB64>.<opensslBody>" (crypto-js does not generate an IV
//        for raw keys, so we prepend a fresh random one); raw decrypt expects
//        that same shape.
//   pass → classic OpenSSL passphrase format ("Salted__..."), unchanged for
//        legacy ciphertext compatibility.
import CryptoJS from 'crypto-js';

const resolveKey = (key) => {
    if (!key) return '';
    if (typeof key === 'string') return key; // legacy call shape
    return key.mode === 'raw' ? CryptoJS.enc.Base64.parse(key.value) : key.value;
};

const rawEncrypt = (payload, secret) => {
    const iv = CryptoJS.lib.WordArray.random(16);
    const body = CryptoJS.AES.encrypt(payload, secret, { iv }).toString();
    return `${CryptoJS.enc.Base64.stringify(iv)}.${body}`;
};

const rawDecrypt = (payload, secret) => {
    const dot = payload.indexOf('.');
    if (dot < 1) return null;
    const iv = CryptoJS.enc.Base64.parse(payload.slice(0, dot));
    const body = payload.slice(dot + 1);
    return CryptoJS.AES.decrypt(body, secret, { iv }).toString(CryptoJS.enc.Utf8) || null;
};

self.onmessage = (e) => {
    const { id, op, payload, key } = e.data || {};
    try {
        const secret = resolveKey(key);
        const isRaw = key && typeof key === 'object' && key.mode === 'raw';
        let result;
        if (op === 'encrypt') {
            result = isRaw ? rawEncrypt(payload, secret) : CryptoJS.AES.encrypt(payload, secret).toString();
        } else if (op === 'decrypt') {
            result = isRaw ? rawDecrypt(payload, secret) : CryptoJS.AES.decrypt(payload, secret).toString(CryptoJS.enc.Utf8);
        } else {
            throw new Error(`Unknown operation: ${op}`);
        }
        if (result === null || result === undefined) {
            throw new Error('Decryption produced no output');
        }
        self.postMessage({ id, ok: true, result });
    } catch (err) {
        self.postMessage({ id, ok: false, error: String(err?.message || err) });
    }
};
