import crypto from "crypto";

/**
 * Credential Encryption Utilities
 * 
 * Uses AES-256-GCM for encrypting sensitive credentials at rest.
 * The encryption key is derived from JWT_SECRET using PBKDF2.
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT = "leadengine-credential-salt"; // Static salt for key derivation

/**
 * Derive encryption key from JWT_SECRET
 */
function deriveKey(): Buffer {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is required for credential encryption");
  }
  
  return crypto.pbkdf2Sync(secret, SALT, 100000, 32, "sha256");
}

/**
 * Encrypt sensitive data (e.g., WordPress credentials)
 * Returns base64-encoded string containing IV + ciphertext + auth tag
 */
export function encryptCredentials(plaintext: string): string {
  const key = deriveKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");
  
  const authTag = cipher.getAuthTag();
  
  // Combine IV + ciphertext + auth tag
  const combined = Buffer.concat([
    iv,
    Buffer.from(encrypted, "base64"),
    authTag,
  ]);
  
  return combined.toString("base64");
}

/**
 * Decrypt sensitive data
 * Expects base64-encoded string containing IV + ciphertext + auth tag
 */
export function decryptCredentials(encryptedData: string): string {
  const key = deriveKey();
  const combined = Buffer.from(encryptedData, "base64");
  
  // Extract IV, ciphertext, and auth tag
  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(combined.length - AUTH_TAG_LENGTH);
  const ciphertext = combined.subarray(IV_LENGTH, combined.length - AUTH_TAG_LENGTH);
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(ciphertext);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted.toString("utf8");
}

/**
 * Encrypt WordPress credentials object
 */
export function encryptWordPressCredentials(credentials: {
  username: string;
  applicationPassword: string;
}): string {
  return encryptCredentials(JSON.stringify(credentials));
}

/**
 * Decrypt WordPress credentials object
 */
export function decryptWordPressCredentials(encryptedData: string): {
  username: string;
  applicationPassword: string;
} {
  const decrypted = decryptCredentials(encryptedData);
  return JSON.parse(decrypted);
}

/**
 * Mask credential for safe logging/display
 * Shows only first 4 and last 4 characters
 */
export function maskCredential(credential: string): string {
  if (credential.length <= 8) {
    return "****";
  }
  return `${credential.slice(0, 4)}****${credential.slice(-4)}`;
}

/**
 * Sanitize error message to remove any credential leaks
 */
export function sanitizeErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  
  // Remove common credential patterns
  return message
    .replace(/password[=:]\s*[^\s,}]+/gi, "password=****")
    .replace(/token[=:]\s*[^\s,}]+/gi, "token=****")
    .replace(/key[=:]\s*[^\s,}]+/gi, "key=****")
    .replace(/secret[=:]\s*[^\s,}]+/gi, "secret=****")
    .replace(/Basic\s+[A-Za-z0-9+/=]+/gi, "Basic ****")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer ****")
    .replace(/[a-zA-Z0-9]{4}\s+[a-zA-Z0-9]{4}\s+[a-zA-Z0-9]{4}\s+[a-zA-Z0-9]{4}/g, "****-****-****-****");
}
