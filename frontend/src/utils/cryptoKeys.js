import CryptoJS from 'crypto-js';

const PURPOSE = 'TalkyyChatKeyV2';

// --- storage (falls back to memory in non-browser runtimes/tests) ----------
const memoryStore = new Map();
const storage = (typeof localStorage !== 'undefined')
  ? localStorage
  : {
    getItem: (k) => (memoryStore.has(k) ? memoryStore.get(k) : null),
    setItem: (k, v) => memoryStore.set(k, String(v)),
    removeItem: (k) => memoryStore.delete(k),
  };

// --- module state -----------------------------------------------------------
let currentUser = null;           // current user id (set by UserState on render)
const identityCache = new Map();  // userId -> Promise<{privateKey, publicKeyB64} | null>
const chatRegistry = new Map();   // chatId -> chat doc (members + groupKeys)
const keyCache = new Map();       // chatId -> CryptoJS WordArray message key

/** Set the active user. Called during UserState render so key derivation
 *  works before any effects run. */
export const setCurrentUser = (userId) => {
  currentUser = userId ? String(userId) : null;
};

// --- base64 helpers ---------------------------------------------------------
const bytesToB64 = (bytes) => {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
};

const b64ToBytes = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

// --- chat registry ----------------------------------------------------------
/** Remember a chat document so its keys can be resolved later by id. */
export const registerChat = (chat) => {
  if (chat && chat._id) {
    const id = String(chat._id);
    const existing = chatRegistry.get(id);
    if (!existing) {
      chatRegistry.set(id, chat);
    } else {
      const existingMembers = normalizeMembers(existing.members);
      const incomingMembers = normalizeMembers(chat.members);
      const mergedMembers = incomingMembers.length
        ? incomingMembers.map(inc => {
            const prev = existingMembers.find(p => p._id === inc._id);
            return {
              ...inc,
              publicKey: inc.publicKey || prev?.publicKey || null,
            };
          })
        : existing.members;

      chatRegistry.set(id, {
        ...existing,
        ...chat,
        members: mergedMembers || chat.members,
      });
    }
  }
  return chat;
};

export const registerChats = (chats) => {
  (Array.isArray(chats) ? chats : []).forEach(registerChat);
};

export const getRegisteredChat = (chatId) => chatRegistry.get(String(chatId));

/** Update a member's public key across all registered chats and drop invalidated message keys */
export const updatePeerPublicKey = (userId, newPublicKey) => {
  if (!userId) return;
  const targetUid = String(userId);
  chatRegistry.forEach((chat, cid) => {
    let touched = false;
    if (chat && Array.isArray(chat.members)) {
      chat.members.forEach((m) => {
        const mid = String(m?._id ?? m?.id ?? m ?? '');
        if (mid === targetUid) {
          if (typeof m === 'object' && m !== null) {
            m.publicKey = newPublicKey;
            if (m.identity) m.identity.publicKey = newPublicKey;
          }
          touched = true;
        }
      });
    }
    if (touched) {
      keyCache.delete(cid);
      notifyKeyReady(cid);
    }
  });
};

/** Forget a chat entirely (deleted group, leaving, logout). */
export const dropChat = (chatId) => {
  const id = String(chatId);
  chatRegistry.delete(id);
  keyCache.delete(id);
};

/** Clear all conversation state (called on logout / account switch). */
export const clearRuntimeKeys = () => {
  chatRegistry.clear();
  keyCache.clear();
};

// --- message key cache ------------------------------------------------------
export const getCachedChatKey = (chatId) => {
  if (!chatId) return null;
  const entry = keyCache.get(String(chatId));
  if (!entry) return null;
  return entry.key || entry;
};

const notifyKeyReady = (chatId) => {
  if (typeof window !== 'undefined' && chatId) {
    window.dispatchEvent(new CustomEvent('talkyy:key-ready', { detail: { chatId: String(chatId) } }));
  }
};

export const setCachedChatKey = (chatId, key, peerPub = null) => {
  if (chatId && key) {
    keyCache.set(String(chatId), { key, peerPub });
    notifyKeyReady(chatId);
  }
};

/** Invalidate the cached message key (key rotation after remove/leave). */
export const clearChatKey = (chatId) => {
  if (chatId) keyCache.delete(String(chatId));
};

// --- identity keys ----------------------------------------------------------
/**
 * Load this user's ECDH identity keypair from storage.
 * If not present locally, returns null (does NOT silently generate a replacement!).
 */
export const ensureIdentityKey = (userId = currentUser) => {
  if (!userId) return Promise.resolve(null);
  const uid = String(userId);
  if (!identityCache.has(uid)) {
    identityCache.set(uid, (async () => {
      const privStore = `talkyy_identity_priv_${uid}`;
      const pubStore = `talkyy_identity_pub_${uid}`;
      try {
        const privJwk = storage.getItem(privStore);
        const pubB64 = storage.getItem(pubStore);
        if (privJwk && pubB64) {
          const privateKey = await crypto.subtle.importKey(
            'jwk', JSON.parse(privJwk),
            { name: 'ECDH', namedCurve: 'P-256' },
            true, ['deriveBits']
          );
          return { privateKey, publicKeyB64: pubB64 };
        }
        // Local key absent. Do not silently generate a replacement key!
        return null;
      } catch (e) {
        console.warn('[E2EE] Identity key import failed:', e);
        identityCache.delete(uid); // allow retry on next call
        return null;
      }
    })());
  }
  return identityCache.get(uid);
};

/** Check if user has an identity key stored locally */
export const hasLocalIdentityKey = (userId = currentUser) => {
  if (!userId) return false;
  return Boolean(storage.getItem(`talkyy_identity_priv_${userId}`));
};

/** Generate a brand-new identity keypair (explicit initial setup only) */
export const generateNewIdentityKey = async (userId = currentUser) => {
  if (!userId) throw new Error('User ID required');
  const uid = String(userId);
  const privStore = `talkyy_identity_priv_${uid}`;
  const pubStore = `talkyy_identity_pub_${uid}`;

  const kp = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  );
  const jwk = await crypto.subtle.exportKey('jwk', kp.privateKey);
  const raw = new Uint8Array(await crypto.subtle.exportKey('raw', kp.publicKey));
  const pubB64 = bytesToB64(raw);

  storage.setItem(privStore, JSON.stringify(jwk));
  storage.setItem(pubStore, pubB64);

  const identity = { privateKey: kp.privateKey, publicKeyB64: pubB64, jwk };
  identityCache.set(uid, Promise.resolve(identity));
  return identity;
};

/** Save an authenticated recovered identity key to storage and memory cache */
export const saveRecoveredIdentityKey = async (userId, privateKey, publicKeyB64, jwk) => {
  const uid = String(userId);
  const privStore = `talkyy_identity_priv_${uid}`;
  const pubStore = `talkyy_identity_pub_${uid}`;

  const jwkToSave = jwk || (await crypto.subtle.exportKey('jwk', privateKey));
  storage.setItem(privStore, JSON.stringify(jwkToSave));
  storage.setItem(pubStore, publicKeyB64);

  const identity = { privateKey, publicKeyB64 };
  identityCache.set(uid, Promise.resolve(identity));

  // Clear cached conversation keys so they immediately re-derive with the restored identity
  keyCache.clear();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('talkyy:key-ready', { detail: { restored: true } }));
  }

  return identity;
};

/** Clear identity key from local storage (used on reset) */
export const clearLocalIdentityKey = (userId = currentUser) => {
  if (!userId) return;
  const uid = String(userId);
  storage.removeItem(`talkyy_identity_priv_${uid}`);
  storage.removeItem(`talkyy_identity_pub_${uid}`);
  identityCache.delete(uid);
  keyCache.clear();
};

/** My published public key (base64), or null. */
export const getPublicKey = (userId = currentUser) =>
  (userId ? storage.getItem(`talkyy_identity_pub_${userId}`) : null);

// --- key derivation ---------------------------------------------------------
/**
 * ECDH + SHA-256 KDF (HKDF-lite): both sides run the identical derivation so
 * they converge on the same AES-256 key. Uses only universally supported
 * WebCrypto primitives (no HKDF importKey, for maximum browser compatibility).
 */
const derivePairwiseKeyB64 = async (privateKey, peerPubB64, saltStr) => {
  const peerKey = await crypto.subtle.importKey(
    'raw', b64ToBytes(peerPubB64),
    { name: 'ECDH', namedCurve: 'P-256' },
    false, []
  );
  const shared = new Uint8Array(
    await crypto.subtle.deriveBits({ name: 'ECDH', public: peerKey }, privateKey, 256)
  );

  const enc = new TextEncoder();
  const saltBytes = enc.encode(saltStr);
  const infoBytes = enc.encode(PURPOSE);
  const joined = new Uint8Array(saltBytes.length + shared.length + infoBytes.length);
  joined.set(saltBytes, 0);
  joined.set(shared, saltBytes.length);
  joined.set(infoBytes, saltBytes.length + shared.length);

  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', joined));
  return bytesToB64(digest);
};

const aesGcmEncryptB64 = async (keyB64, plainBytes) => {
  const key = await crypto.subtle.importKey('raw', b64ToBytes(keyB64), { name: 'AES-GCM' }, false, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plainBytes));
  return `${bytesToB64(iv)}.${bytesToB64(ct)}`;
};

const aesGcmDecryptB64 = async (keyB64, packed) => {
  try {
    const [ivB64, ctB64] = String(packed).split('.');
    if (!ivB64 || !ctB64) return null;
    const key = await crypto.subtle.importKey('raw', b64ToBytes(keyB64), { name: 'AES-GCM' }, false, ['decrypt']);
    const pt = new Uint8Array(await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: b64ToBytes(ivB64) }, key, b64ToBytes(ctB64)
    ));
    return bytesToB64(pt);
  } catch {
    return null;
  }
};

const normalizeMembers = (list) =>
  (Array.isArray(list) ? list : [])
    .map((m) => (typeof m === 'string' ? { _id: m } : m))
    .filter((m) => m && (m._id || m.id))
    .map((m) => ({
      _id: String(m._id ?? m.id),
      publicKey: m.publicKey || m.identity?.publicKey || null
    }));

// --- conversation key resolution --------------------------------------------
/**
 * Resolve (and cache) the AES message key for a chat.
 *   chatOrId — chat document (registers it) or chat id (registry lookup)
 * Returns a CryptoJS WordArray, or null when no key applies yet
 * (legacy chats, peer without published keys, new device, etc.).
 * Never throws.
 */
export const ensureChatKey = async (chatOrId, userId = currentUser) => {
  try {
    if (!chatOrId) return null;
    let chat;
    if (typeof chatOrId === 'object') {
      chat = registerChat(chatOrId);
    } else {
      chat = chatRegistry.get(String(chatOrId));
    }
    if (!chat || !chat._id) return null;

    const cid = String(chat._id);
    const uid = String(userId || currentUser || '');
    const peer = !chat.isGroup ? normalizeMembers(chat.members).find((m) => m._id !== uid) : null;
    const peerPub = peer?.publicKey || null;

    const cached = keyCache.get(cid);
    if (cached) {
      const cachedKey = cached.key || cached;
      const cachedPeerPub = cached.peerPub;
      // In 1:1 chats, if peer public key changed, invalidate stale cached key and re-derive
      if (!chat.isGroup && cachedPeerPub && peerPub && cachedPeerPub !== peerPub) {
        keyCache.delete(cid);
      } else {
        return cachedKey;
      }
    }
    if (!userId && !currentUser) return null;

    const identity = await ensureIdentityKey(userId || currentUser);
    if (!identity) return null;

    let keyB64 = null;

    if (chat.isGroup) {
      const wraps = chat.groupKeys || {};
      const wrap = wraps[uid] || wraps[userId];
      if (wrap && wrap.key) {
        let wrapperPub = wrap.byKey;
        if (!wrapperPub && wrap.by) {
          const wrapper = normalizeMembers(chat.members).find((m) => m._id === String(wrap.by));
          wrapperPub = wrapper?.publicKey;
        }
        if (wrapperPub) {
          const pairB64 = await derivePairwiseKeyB64(
            identity.privateKey, wrapperPub, `talkyy-wrap:${cid}:${uid}`
          );
          keyB64 = await aesGcmDecryptB64(pairB64, wrap.key);
        }
      }
    } else {
      if (peer && peer.publicKey) {
        keyB64 = await derivePairwiseKeyB64(
          identity.privateKey, peer.publicKey, `talkyy-chat:${cid}`
        );
      }
    }

    if (chat.isGroup && !keyB64 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('talkyy:request-group-key', {
        detail: { chatId: cid, userId: uid, publicKey: identity.publicKeyB64 }
      }));
    }

    if (!keyB64) return null;
    const key = CryptoJS.enc.Base64.parse(keyB64);
    keyCache.set(cid, { key, peerPub });
    notifyKeyReady(cid);
    return key;
  } catch (e) {
    console.warn('[E2EE] ensureChatKey failed:', e);
    return null;
  }
};

// --- group key build/rotate -------------------------------------------------
const makeWrap = async (identity, targetPubB64, cid, targetId, gkB64) => {
  const pairB64 = await derivePairwiseKeyB64(
    identity.privateKey, targetPubB64, `talkyy-wrap:${cid}:${targetId}`
  );
  const wrapped = await aesGcmEncryptB64(pairB64, b64ToBytes(gkB64));
  return { by: String(identity.userId ?? ''), byKey: identity.publicKeyB64, targetKey: targetPubB64, key: wrapped };
};

/**
 * Generate a NEW group key and wrap it for `targets` (+ always for myself).
 * Used when creating a group and when rotating keys after remove/leave.
 * Returns { groupKeys, chatKey }.
 */
export const createGroupKeyWraps = async (chatOrId, targets, userId = currentUser) => {
  const identity = await ensureIdentityKey(userId);
  if (!identity) throw new Error('No encryption identity available');
  const chat = typeof chatOrId === 'object' ? registerChat(chatOrId) : getRegisteredChat(chatOrId);
  if (!chat || !chat._id) throw new Error('Chat not registered for key creation');
  const cid = String(chat._id);
  const uid = String(userId);
  identity.userId = uid;

  const gkBytes = crypto.getRandomValues(new Uint8Array(32));
  const gkB64 = bytesToB64(gkBytes);

  const groupKeys = {};
  for (const t of normalizeMembers(targets)) {
    if (t._id === uid) continue; // self wrapped below (needs no lookup)
    if (!t.publicKey) continue;  // member without published keys: skipped (legacy fallback)
    groupKeys[t._id] = await makeWrap(identity, t.publicKey, cid, t._id, gkB64);
  }
  // Always keep a copy for myself so I can re-open the chat (and so a failed
  // "leave" after rotation doesn't lock me out of my own group).
  groupKeys[uid] = await makeWrap(identity, identity.publicKeyB64, cid, uid, gkB64);

  const chatKey = CryptoJS.enc.Base64.parse(gkB64);
  return { groupKeys, chatKey };
};

/**
 * Re-wrap the CURRENT group key for `targets` only (used when adding members:
 * existing members' wraps must stay untouched because they reference the same
 * group key). Throws when this chat has no group key yet.
 * Returns { groupKeys, chatKey }.
 */
export const rekeyGroupKeyFor = async (chatOrId, targets, userId = currentUser) => {
  const identity = await ensureIdentityKey(userId);
  if (!identity) throw new Error('No encryption identity available');
  const chat = typeof chatOrId === 'object' ? registerChat(chatOrId) : getRegisteredChat(chatOrId);
  if (!chat || !chat._id) throw new Error('Chat not registered');
  const cid = String(chat._id);
  const uid = String(userId);
  identity.userId = uid;

  const cached = keyCache.get(cid);
  let gkB64 = null;
  if (cached) {
    gkB64 = CryptoJS.enc.Base64.stringify(cached);
  } else {
    const wrap = (chat.groupKeys || {})[uid];
    if (wrap && wrap.key) {
      let wrapperPub = wrap.byKey || identity.publicKeyB64;
      const pairB64 = await derivePairwiseKeyB64(identity.privateKey, wrapperPub, `talkyy-wrap:${cid}:${uid}`);
      gkB64 = await aesGcmDecryptB64(pairB64, wrap.key);
    }
  }
  if (!gkB64) throw new Error('Cannot unwrap group key');

  const groupKeys = {};
  for (const t of normalizeMembers(targets)) {
    if (!t.publicKey) continue;
    groupKeys[t._id] = await makeWrap(identity, t.publicKey, cid, t._id, gkB64);
  }
  if (!Object.keys(groupKeys).length) throw new Error('No wrap targets with published keys');

  return { groupKeys, chatKey: CryptoJS.enc.Base64.parse(gkB64) };
};
