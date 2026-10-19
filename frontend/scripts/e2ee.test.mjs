// E2EE key-exchange test (Issue 3.2) — run with:  node scripts/e2ee.test.mjs
//
// Proves the core security properties:
//   * both sides of a 1:1 chat independently derive the SAME AES key
//   * every group member unwraps the same group key from their own wrap
//   * adding a member shares the EXISTING group key (no re-key for others)
//   * removing a member rotates the key and locks the removed member out
//   * legacy chats (no keys yet) report "no key" so callers fall back safely
import assert from 'node:assert';
import CryptoJS from 'crypto-js';
import {
  setCurrentUser, ensureIdentityKey, getPublicKey,
  registerChat, ensureChatKey, clearChatKey, setCachedChatKey,
  createGroupKeyWraps, rekeyGroupKeyFor,
} from '../src/utils/cryptoKeys.js';
import { encryptMessage, decryptMessage, E2_PREFIX } from '../src/utils/EncryptionUtils.js';

const keyB64 = (wa) => (wa ? CryptoJS.enc.Base64.stringify(wa) : null);

// The message-key cache is keyed by chat only (a tab has a single logged-in
// user; logout clears it via clearRuntimeKeys). Tests switch identities in one
// process, so invalidate the cache between identity switches to force a real
// re-derivation instead of hitting the previous user's cache entry.
const fresh = (chat, userId) => {
  clearChatKey(chat._id);
  return ensureChatKey(chat, userId);
};

let passed = 0;
const ok = (name) => { passed++; console.log(`  OK  ${name}`); };

async function main() {
  // --- identities -----------------------------------------------------------
  setCurrentUser('userA');
  const idA = await ensureIdentityKey('userA');
  const idB = await ensureIdentityKey('userB');
  const idC = await ensureIdentityKey('userC');
  assert(idA && idB && idC, 'identities created');
  assert.notStrictEqual(getPublicKey('userA'), getPublicKey('userB'), 'distinct public keys');
  ok('identity keypairs generated per user (private keys stay local)');

  // reusing the same identity must be deterministic
  const idA2 = await ensureIdentityKey('userA');
  assert.strictEqual(getPublicKey('userA'), idA2.publicKeyB64, 'cached identity stable');
  ok('identity keypair reused on subsequent calls');

  const pubA = getPublicKey('userA');
  const pubB = getPublicKey('userB');
  const pubC = getPublicKey('userC');

  // --- 1:1 agreement --------------------------------------------------------
  const dm = {
    _id: 'chat1', isGroup: false,
    members: [
      { _id: 'userA', publicKey: pubA },
      { _id: 'userB', publicKey: pubB },
    ],
  };
  const kA = await fresh(dm, 'userA');
  const kB = await fresh(dm, 'userB');
  assert(kA && kB, 'both sides derive a key');
  assert.strictEqual(keyB64(kA), keyB64(kB), 'ECDH keys must agree');
  ok('1:1 chat: both sides independently derive the same key');

  // message roundtrip through the REAL helpers (cache warm for chat1)
  await fresh(dm, 'userA');
  const encHello = await encryptMessage('hello there', dm);
  assert(encHello.startsWith(E2_PREFIX), 'new ciphertext carries the E2 prefix');
  assert.strictEqual(decryptMessage(encHello, 'chat1'), 'hello there');
  ok('1:1 chat: encrypt/decrypt roundtrip via EncryptionUtils (E2 + IV format)');

  // deterministic re-derivation after cache invalidation
  assert.strictEqual(keyB64(await fresh(dm, 'userA')), keyB64(kA), 're-derived key stable');
  ok('1:1 chat: key survives cache invalidation');

  // peer without published keys → callers fall back to legacy
  const dmNoPub = {
    _id: 'chat2', isGroup: false,
    members: [{ _id: 'userA', publicKey: pubA }, { _id: 'userB' }],
  };
  assert.strictEqual(await fresh(dmNoPub, 'userA'), null);
  ok('1:1 chat: peer without public key → null (legacy fallback)');

  // --- group creation -------------------------------------------------------
  const group = {
    _id: 'group1', isGroup: true,
    members: [
      { _id: 'userA', publicKey: pubA },
      { _id: 'userB', publicKey: pubB },
      { _id: 'userC', publicKey: pubC },
    ],
    creator: 'userA', admins: ['userA'],
  };
  const { groupKeys: gk1, chatKey: creatorKey } = await createGroupKeyWraps(
    group, group.members, 'userA'
  );
  assert.deepStrictEqual(Object.keys(gk1).sort(), ['userA', 'userB', 'userC'], 'wrap for every member');
  assert(gk1.userA.byKey && gk1.userA.key, 'wrap embeds wrapper public key + ciphertext');
  ok('group creation: wrapped group key distributed to all members');

  const g1 = { ...group, groupKeys: gk1 };
  const gkA = await fresh(g1, 'userA');
  const gkB = await fresh(g1, 'userB');
  const gkC = await fresh(g1, 'userC');
  assert(gkA && gkB && gkC, 'every member unwraps');
  assert.strictEqual(keyB64(gkA), keyB64(gkB), 'A and B agree');
  assert.strictEqual(keyB64(gkA), keyB64(gkC), 'A and C agree');
  assert.strictEqual(keyB64(gkA), keyB64(creatorKey), 'matches the generated key');
  ok('group: all members unwrap the SAME group key');

  // group message roundtrip: sender C → receiver A via the real helpers
  await fresh(g1, 'userC'); // warm cache with C's unwrap (same key)
  const groupMsg = await encryptMessage('hello group', g1);
  assert(groupMsg.startsWith(E2_PREFIX), 'group messages are E2-prefixed');
  clearChatKey('group1');
  await fresh(g1, 'userA'); // receiver derives their own copy
  assert.strictEqual(decryptMessage(groupMsg, 'group1'), 'hello group');
  ok('group: cross-member encrypt/decrypt via EncryptionUtils');

  // server-side view: only ciphertext — never the group key itself
  const serverView = JSON.stringify(gk1);
  assert(!serverView.includes(keyB64(creatorKey)), 'raw group key must never appear in wraps');
  ok('group: server only ever stores wrapped ciphertext');

  // --- add member: reuse the SAME group key (merge semantics) ---------------
  const idD = await ensureIdentityKey('userD');
  assert(idD, 'identity for D');
  const pubD = getPublicKey('userD');
  const { groupKeys: addWraps, chatKey: sameKey } = await rekeyGroupKeyFor(
    g1, [{ _id: 'userD', publicKey: pubD }], 'userA'
  );
  assert.deepStrictEqual(Object.keys(addWraps), ['userD'], 'only the newcomer is wrapped');
  assert.strictEqual(keyB64(sameKey), keyB64(creatorKey), 'group key unchanged on add');
  const g2 = { ...g1, groupKeys: { ...gk1, ...addWraps } }; // server merge
  const gkD = await fresh(g2, 'userD');
  assert(gkD && keyB64(gkD) === keyB64(creatorKey), 'new member unwraps the existing key');
  assert.strictEqual(keyB64(await fresh(g2, 'userB')), keyB64(creatorKey), 'existing member unaffected');
  ok('add member: existing group key handed to newcomer; others unaffected');

  // --- remove member: rotate + lock out -------------------------------------
  const remaining = group.members.filter((m) => m._id !== 'userA');
  const { groupKeys: gk2, chatKey: newKey } = await createGroupKeyWraps(g2, remaining, 'userB');
  assert(!gk2.userA, "removed member's wrap dropped");
  assert.notStrictEqual(keyB64(newKey), keyB64(creatorKey), 'rotation produces a fresh key');
  const g3 = { ...g2, groupKeys: gk2 };
  const newB = await fresh(g3, 'userB');
  const newC = await fresh(g3, 'userC');
  assert.strictEqual(keyB64(newB), keyB64(newKey), 'remaining member gets rotated key');
  assert.strictEqual(keyB64(newC), keyB64(newKey), 'all remaining members converge');
  assert.strictEqual(await fresh(g3, 'userA'), null, 'removed member cannot derive the new key');
  ok('remove member: key rotated, removed member locked out');

  // removed member also cannot decrypt anything under the NEW key
  await fresh(g3, 'userB'); // cache holds the rotated key
  const newCt = await encryptMessage('secret', g3);
  assert(newCt.startsWith(E2_PREFIX), 'post-rotation message encrypted');
  clearChatKey('group1');
  setCachedChatKey('group1', creatorKey); // what a stale/removed client would still hold
  assert.strictEqual(
    decryptMessage(newCt, 'group1'), '[Unable to decrypt message]',
    'old key must not read new ciphertext'
  );
  ok('rotation: old key cannot read ciphertext sent after rotation');

  // --- legacy fallbacks -----------------------------------------------------
  const legacyGroup = {
    _id: 'glegacy', isGroup: true,
    members: [{ _id: 'userA', publicKey: pubA }, { _id: 'userB', publicKey: pubB }],
  };
  assert.strictEqual(await fresh(legacyGroup, 'userA'), null);
  ok('legacy group without groupKeys → null (legacy fallback)');

  // existing history was encrypted with the old static key — it must keep working
  const legacyCt = CryptoJS.AES.encrypt('legacy message', 'MY_SUPER_SECRET_CHAT_APP_KEY_V1').toString();
  assert.strictEqual(decryptMessage(legacyCt, 'chat1'), 'legacy message');
  ok('legacy static-key ciphertext still decrypts (history migration)');

  // unencrypted content (e.g. polls created before poll encryption) passes through
  assert.strictEqual(decryptMessage('Lunch at 12?', 'chat1'), 'Lunch at 12?');
  ok('plaintext content passes through unchanged');

  // E2 ciphertext with no cached key must never surface raw plaintext
  clearChatKey('chat1');
  assert.strictEqual(decryptMessage(encHello, 'chat1'), '[Unable to decrypt message]');
  ok('E2 ciphertext without a key → cannot-decrypt marker');

  console.log(`\nAll ${passed} E2EE checks passed.`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error('\nTEST FAILED:', e); process.exit(1); });
