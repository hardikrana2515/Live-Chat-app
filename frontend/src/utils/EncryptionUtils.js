import CryptoJS from 'crypto-js';
import { toast } from 'react-toastify';
import { ensureChatKey, getCachedChatKey } from './cryptoKeys.js';

// ---------------------------------------------------------------------------
// Message/attachment encryption (Issue 3.2).
//
// New ciphertext is encrypted with the per-conversation ECDH/group key from
// cryptoKeys.js and prefixed with "E2:". Content without the prefix was
// encrypted with the old bundled static key (legacy) and still decrypts so
// existing history keeps working.
// ---------------------------------------------------------------------------

// Legacy shared key — read-only migration path for old messages.
const LEGACY_KEY = "MY_SUPER_SECRET_CHAT_APP_KEY_V1";
export const E2_PREFIX = "E2:";

let warnedLegacy = false;
const warnLegacyOnce = (reason) => {
    if (warnedLegacy) return;
    warnedLegacy = true;
    console.warn(`[E2EE] Falling back to legacy encryption: ${reason}`);
    toast.info("End-to-end keys aren't available for this chat yet — using legacy encryption");
};

const syncEncrypt = (text, key) => CryptoJS.AES.encrypt(text, key).toString();
const syncDecrypt = (ciphertext, key) => {
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, key);
        return bytes.toString(CryptoJS.enc.Utf8) || "";
    } catch {
        return "";
    }
};

// Per-conversation (raw AES-256 key) encryption carries its own random IV:
// crypto-js only auto-derives an IV on the passphrase path, so raw keys must
// pass one explicitly and transmit it. Format: "<ivB64>.<opensslBody>".
const e2EncryptBody = (text, key) => {
    const iv = CryptoJS.lib.WordArray.random(16);
    const body = CryptoJS.AES.encrypt(text, key, { iv }).toString();
    return `${CryptoJS.enc.Base64.stringify(iv)}.${body}`;
};

const e2DecryptBody = (ivBody, key) => {
    try {
        const dot = ivBody.indexOf('.');
        if (dot < 1) return null;
        const iv = CryptoJS.enc.Base64.parse(ivBody.slice(0, dot));
        const body = ivBody.slice(dot + 1);
        return CryptoJS.AES.decrypt(body, key, { iv }).toString(CryptoJS.enc.Utf8) || null;
    } catch {
        return null; // wrong key / corrupted ciphertext — never throws
    }
};

// ---------------------------------------------------------------------------
// Web Worker pool: heavy AES work runs off the main thread (Issue 3.3).
// The worker receives the key as { mode: 'raw' | 'pass', value } — 'raw'
// carries a base64 AES-256 key (per-conversation), 'pass' a passphrase
// (legacy fallback). A synchronous fallback keeps everything working if
// Workers are unavailable.
// ---------------------------------------------------------------------------
let cryptoWorker = null;
let workerSeq = 0;
const workerPending = new Map();

const getCryptoWorker = () => {
    if (cryptoWorker) return cryptoWorker;
    try {
        cryptoWorker = new Worker(new URL('./encrypt.worker.js', import.meta.url), { type: 'module' });
        cryptoWorker.onmessage = (e) => {
            const { id, ok, result, error } = e.data || {};
            const pending = workerPending.get(id);
            if (!pending) return;
            workerPending.delete(id);
            if (ok) pending.resolve(result);
            else pending.reject(new Error(error || 'Worker crypto failed'));
        };
        cryptoWorker.onerror = () => {
            // Worker failed to build/run — reject everything in flight and
            // disable it so future calls use the sync fallback.
            workerPending.forEach(({ reject }) => reject(new Error('Worker unavailable')));
            workerPending.clear();
            try { cryptoWorker.terminate(); } catch { /* ignore */ }
            cryptoWorker = null;
        };
        return cryptoWorker;
    } catch {
        return null;
    }
};

const runWorkerOp = (op, payload, key) => new Promise((resolve, reject) => {
    const worker = getCryptoWorker();
    if (!worker) return reject(new Error('Worker unavailable'));
    const id = ++workerSeq;
    workerPending.set(id, { resolve, reject });
    worker.postMessage({ id, op, payload, key });
});

const keySpecFor = (keyWA) => ({ mode: 'raw', value: CryptoJS.enc.Base64.stringify(keyWA) });
const LEGACY_SPEC = { mode: 'pass', value: LEGACY_KEY };

// ---------------------------------------------------------------------------
// Text messages (sync decrypt — render paths call this during paint;
// encrypt is async because it may need to derive the chat key first)
// ---------------------------------------------------------------------------
export const encryptMessage = async (message, chat) => {
    if (!message) return "";
    let key = null;
    try {
        key = await ensureChatKey(chat);
    } catch (e) {
        console.warn('[E2EE] key derivation failed', e);
    }
    if (!key) {
        warnLegacyOnce('no conversation key');
        return syncEncrypt(message, LEGACY_KEY);
    }
    return E2_PREFIX + e2EncryptBody(message, key);
};

export const decryptMessage = (ciphertext, chatId) => {
    if (!ciphertext) return "";
    try {
        if (ciphertext.startsWith(E2_PREFIX)) {
            const key = getCachedChatKey(chatId);
            if (!key) {
                if (chatId) {
                    ensureChatKey(chatId).catch(() => {});
                }
                return "[Unable to decrypt message]";
            }
            const original = e2DecryptBody(ciphertext.slice(E2_PREFIX.length), key);
            if (original) return original;
            
            // If decrypting with cached key failed, request background re-derivation
            if (chatId) {
                ensureChatKey(chatId).catch(() => {});
            }
            return "[Unable to decrypt message]";
        }
        // Legacy ciphertext (old static key) or plain text (e.g. old polls)
        const original = syncDecrypt(ciphertext, LEGACY_KEY);
        return original || ciphertext;
    } catch {
        return ciphertext.startsWith(E2_PREFIX) ? "[Unable to decrypt message]" : ciphertext;
    }
};

// ---------------------------------------------------------------------------
// Files (media) — same per-chat keys; AES runs in the Web Worker so large
// videos don't freeze the UI (Issue 3.3)
// ---------------------------------------------------------------------------
export const encryptFile = async (file, chat) => {
    // Read as DataURL (Base64) then encrypt
    const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
    });

    let key = null;
    try {
        key = await ensureChatKey(chat);
    } catch (e) {
        console.warn('[E2EE] key derivation failed', e);
    }

    let encrypted;
    if (key) {
        try {
            encrypted = await runWorkerOp('encrypt', dataUrl, keySpecFor(key));
        } catch {
            encrypted = e2EncryptBody(dataUrl, key); // same iv.body format as the worker
        }
        encrypted = E2_PREFIX + encrypted;
    } else {
        warnLegacyOnce('no conversation key for attachment');
        try {
            encrypted = await runWorkerOp('encrypt', dataUrl, LEGACY_SPEC);
        } catch {
            encrypted = syncEncrypt(dataUrl, LEGACY_KEY);
        }
    }

    // Create a generic file from the encrypted string
    const encryptedBlob = new Blob([encrypted], { type: 'text/plain' });
    return new File([encryptedBlob], file.name + ".enc", { type: file.type });
};

export const decryptFile = async (url, chatId) => {
    // Check if it looks like an encrypted file
    if (!url.endsWith('.enc')) {
        return url;
    }

    try {
        const response = await fetch(url);
        const ciphertext = await response.text();

        let originalDataUrl;
        if (ciphertext.startsWith(E2_PREFIX)) {
            let key = getCachedChatKey(chatId);
            if (!key) key = await ensureChatKey(chatId); // async-safe: files decrypt outside render
            if (!key) return url; // e.g. signed in on a new device — key is gone
            const body = ciphertext.slice(E2_PREFIX.length);
            try {
                originalDataUrl = await runWorkerOp('decrypt', body, keySpecFor(key));
            } catch {
                originalDataUrl = e2DecryptBody(body, key);
            }
        } else {
            try {
                originalDataUrl = await runWorkerOp('decrypt', ciphertext, LEGACY_SPEC);
            } catch {
                originalDataUrl = syncDecrypt(ciphertext, LEGACY_KEY);
            }
        }

        if (!originalDataUrl || !originalDataUrl.startsWith("data:")) {
            return url; // Not our encrypted package (or decryption artifact)
        }

        const res = await fetch(originalDataUrl);
        const blob = await res.blob();
        return URL.createObjectURL(blob);
    } catch (e) {
        console.error("Decryption failed", e);
        return url; // Return original URL if failure
    }
};
