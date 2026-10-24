import CryptoJS from 'crypto-js';
import { toast } from 'react-toastify';
import { ensureChatKey, getCachedChatKey } from './cryptoKeys.js';

// ---------------------------------------------------------------------------
// Message/attachment encryption (Audit C4 resolution).
//
// All new ciphertext is encrypted with the per-conversation ECDH/group key from
// cryptoKeys.js, prefixed with "E2:", and protected with HMAC-SHA256 authenticated
// integrity checking. Silent fallback to the legacy global key for NEW content
// is strictly forbidden and disabled.
// Old messages without "E2:" or with legacy formatting remain readable for migration.
// ---------------------------------------------------------------------------

// Legacy key — strictly READ-ONLY migration path for older stored messages.
const LEGACY_KEY = "MY_SUPER_SECRET_CHAT_APP_KEY_V1";
export const E2_PREFIX = "E2:";

const syncDecrypt = (ciphertext, key) => {
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, key);
        return bytes.toString(CryptoJS.enc.Utf8) || "";
    } catch {
        return "";
    }
};

// Per-conversation (raw AES-256 key) encryption carries random IV and HMAC-SHA256 tag.
// Format: "<ivB64>.<opensslBody>.<hmacSha256>"
const e2EncryptBody = (text, key) => {
    const iv = CryptoJS.lib.WordArray.random(16);
    const body = CryptoJS.AES.encrypt(text, key, { iv }).toString();
    const ivB64 = CryptoJS.enc.Base64.stringify(iv);
    const mac = CryptoJS.HmacSHA256(`${ivB64}.${body}`, key).toString();
    return `${ivB64}.${body}.${mac}`;
};

const e2DecryptBody = (ivBody, key) => {
    try {
        const parts = ivBody.split('.');
        if (parts.length === 3) {
            const [ivB64, body, mac] = parts;
            const expectedMac = CryptoJS.HmacSHA256(`${ivB64}.${body}`, key).toString();
            if (mac !== expectedMac) {
                console.warn("[E2EE] Ciphertext authentication check failed (HMAC mismatch) - potential tampering detected.");
                return null;
            }
            const iv = CryptoJS.enc.Base64.parse(ivB64);
            return CryptoJS.AES.decrypt(body, key, { iv }).toString(CryptoJS.enc.Utf8) || null;
        } else if (parts.length === 2) {
            // Backward-compatible 2-part format
            const [ivB64, body] = parts;
            const iv = CryptoJS.enc.Base64.parse(ivB64);
            return CryptoJS.AES.decrypt(body, key, { iv }).toString(CryptoJS.enc.Utf8) || null;
        }
        return null;
    } catch {
        return null; // wrong key / corrupted ciphertext — never throws
    }
};

// ---------------------------------------------------------------------------
// Web Worker pool: heavy AES work runs off the main thread (Issue 3.3).
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
const LEGACY_READ_SPEC = { mode: 'pass', value: LEGACY_KEY };

// ---------------------------------------------------------------------------
// Text messages
// ---------------------------------------------------------------------------
export const encryptMessage = async (message, chat) => {
    if (!message) return "";
    let key = null;
    try {
        key = await ensureChatKey(chat);
    } catch (e) {
        console.warn('[E2EE] Key derivation failed:', e);
    }

    // Security (Audit C4): Never fall back to globally known static key for new content!
    if (!key) {
        console.error('[E2EE] Cannot encrypt message: Conversation keys are not ready. Silent fallback blocked.');
        toast.error("Encryption keys not available for this chat. Message was not sent.");
        throw new Error("End-to-end encryption keys unavailable. Static key fallback is disabled for security.");
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
        // Legacy ciphertext (old static key) or plain text — read-only backward compatibility
        const original = syncDecrypt(ciphertext, LEGACY_KEY);
        return original || ciphertext;
    } catch {
        return ciphertext.startsWith(E2_PREFIX) ? "[Unable to decrypt message]" : ciphertext;
    }
};

// ---------------------------------------------------------------------------
// Files (media)
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
        console.warn('[E2EE] Key derivation failed for file:', e);
    }

    // Security (Audit C4): Disallow static fallback for media uploads
    if (!key) {
        console.error('[E2EE] Cannot encrypt file: Conversation keys not ready. Static fallback blocked.');
        toast.error("Encryption keys unavailable for this chat. File upload cancelled.");
        throw new Error("End-to-end encryption keys unavailable. Static fallback disabled.");
    }

    let encrypted;
    try {
        encrypted = await runWorkerOp('encrypt', dataUrl, keySpecFor(key));
    } catch {
        encrypted = e2EncryptBody(dataUrl, key);
    }
    encrypted = E2_PREFIX + encrypted;

    // Create a generic file from the encrypted string
    const encryptedBlob = new Blob([encrypted], { type: 'text/plain' });
    return new File([encryptedBlob], file.name + ".enc", { type: file.type });
};

export const decryptFile = async (url, chatId) => {
    try {
        const isExternal = url.includes('cloudinary.com') || (url.startsWith('http') && !url.includes('/media/'));
        const token = localStorage.getItem('token');
        const headers = {};
        if (token && !isExternal) headers['Authorization'] = `Bearer ${token}`;
        const fetchOptions = isExternal ? {} : { credentials: 'include', headers };

        // Non-encrypted attachments: fetch with authentication and return safe blob URL
        if (!url.endsWith('.enc')) {
            if (url.startsWith('http')) {
                const response = await fetch(url, fetchOptions);
                if (response.ok) {
                    const blob = await response.blob();
                    return URL.createObjectURL(blob);
                }
            }
            return url;
        }

        const response = await fetch(url, fetchOptions);
        const ciphertext = await response.text();

        let originalDataUrl;
        if (ciphertext.startsWith(E2_PREFIX)) {
            let key = getCachedChatKey(chatId);
            if (!key) key = await ensureChatKey(chatId);
            if (!key) return url;
            const body = ciphertext.slice(E2_PREFIX.length);
            try {
                originalDataUrl = await runWorkerOp('decrypt', body, keySpecFor(key));
            } catch {
                originalDataUrl = e2DecryptBody(body, key);
            }
        } else {
            // Legacy read-only fallback
            try {
                originalDataUrl = await runWorkerOp('decrypt', ciphertext, LEGACY_READ_SPEC);
            } catch {
                originalDataUrl = syncDecrypt(ciphertext, LEGACY_KEY);
            }
        }

        if (!originalDataUrl || !originalDataUrl.startsWith("data:")) {
            return url;
        }

        const res = await fetch(originalDataUrl);
        const blob = await res.blob();
        return URL.createObjectURL(blob);
    } catch (e) {
        console.error("[E2EE] Decryption failed:", e);
        return url;
    }
};
