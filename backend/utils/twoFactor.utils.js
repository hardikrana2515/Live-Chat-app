import crypto from "crypto";
import { generateSecret, generateURI, verifySync } from "otplib";
import QRCode from "qrcode";

/**
 * Derives a consistent 32-byte key for AES-256-GCM from environment variables.
 */
function getEncryptionKey() {
  const secretKey = process.env.TWO_FACTOR_ENCRYPTION_KEY || process.env.JWT_SECRET || "default_talkyy_2fa_master_key_fallback";
  return crypto.scryptSync(secretKey, "salt_talkyy_2fa_vault", 32);
}

/**
 * Encrypts a TOTP secret using AES-256-GCM before saving to the database.
 * @param {string} text - Plaintext TOTP secret
 * @returns {string} iv:authTag:ciphertext (hex encoded)
 */
export function encryptSecret(text) {
  if (!text) return "";
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypts an AES-256-GCM encrypted TOTP secret.
 * @param {string} cipherText - iv:authTag:ciphertext (hex encoded)
 * @returns {string} Plaintext TOTP secret
 */
export function decryptSecret(cipherText) {
  if (!cipherText || !cipherText.includes(":")) return "";
  try {
    const [ivHex, tagHex, encryptedHex] = cipherText.split(":");
    if (!ivHex || !tagHex || !encryptedHex) return "";
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  } catch (err) {
    console.error("[2FA] Failed to decrypt TOTP secret:", err);
    return "";
  }
}

/**
 * Generates a base32 TOTP secret.
 */
export function generateTwoFactorSecret() {
  return generateSecret();
}

/**
 * Generates an otpauth:// URI for authenticator apps.
 */
export function generateTwoFactorURI(email, secret) {
  return generateURI({
    secret,
    issuer: "Talkyy",
    label: email,
  });
}

/**
 * Generates a Data URL QR Code image from an otpauth URI.
 */
export async function generateQRCodeDataUrl(otpAuthUrl) {
  return QRCode.toDataURL(otpAuthUrl, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 256,
    color: {
      dark: "#0F172A",
      light: "#FFFFFF",
    },
  });
}

/**
 * Generates 8 one-time emergency backup codes.
 * Returns raw codes (for user to write down) and hashed codes (to store in DB).
 */
export function generateBackupCodes(count = 8) {
  const rawCodes = [];
  const hashedCodes = [];

  for (let i = 0; i < count; i++) {
    // Generate 8-character code formatted as XXXX-XXXX
    const part1 = crypto.randomBytes(2).toString("hex").toUpperCase();
    const part2 = crypto.randomBytes(2).toString("hex").toUpperCase();
    const code = `${part1}-${part2}`;
    
    // Hash normalized code (without hyphen) with SHA-256
    const normalized = code.replace(/[^A-Z0-9]/gi, "").toUpperCase();
    const codeHash = crypto.createHash("sha256").update(normalized).digest("hex");

    rawCodes.push(code);
    hashedCodes.push({
      codeHash,
      used: false,
      usedAt: null,
    });
  }

  return { rawCodes, hashedCodes };
}

/**
 * Verifies a 6-digit TOTP token against a decrypted secret.
 * Tolerance: 30 seconds clock drift.
 */
export function verifyTwoFactorToken(token, secret) {
  if (!token || !secret) return { valid: false };
  const cleanToken = token.toString().trim();
  
  try {
    const result = verifySync({
      secret,
      token: cleanToken,
      epochTolerance: 30, // Allows +/- 1 step of clock drift (30 seconds)
    });
    return result || { valid: false };
  } catch (err) {
    console.error("[2FA] Token verification error:", err);
    return { valid: false };
  }
}

/**
 * Verifies and consumes a backup code against user's stored backupCodes.
 */
export function verifyBackupCode(inputCode, backupCodes = []) {
  if (!inputCode || !Array.isArray(backupCodes)) return { matched: false, index: -1 };
  
  const normalized = inputCode.toString().replace(/[^A-Z0-9]/gi, "").toUpperCase();
  const inputHash = crypto.createHash("sha256").update(normalized).digest("hex");

  const index = backupCodes.findIndex((b) => !b.used && b.codeHash === inputHash);
  if (index !== -1) {
    return { matched: true, index };
  }
  return { matched: false, index: -1 };
}
