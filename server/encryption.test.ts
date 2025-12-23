import { describe, it, expect, beforeAll, vi } from "vitest";
import {
  encryptCredentials,
  decryptCredentials,
  encryptWordPressCredentials,
  decryptWordPressCredentials,
  maskCredential,
  sanitizeErrorMessage,
} from "./encryption";

// Mock JWT_SECRET for tests
beforeAll(() => {
  process.env.JWT_SECRET = "test-secret-key-for-encryption-testing-32chars!";
});

describe("Credential Encryption", () => {
  describe("Basic Encryption/Decryption", () => {
    it("should encrypt and decrypt a simple string", () => {
      const plaintext = "my-secret-password";
      const encrypted = encryptCredentials(plaintext);
      const decrypted = decryptCredentials(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });

    it("should produce different ciphertext for same plaintext (random IV)", () => {
      const plaintext = "my-secret-password";
      const encrypted1 = encryptCredentials(plaintext);
      const encrypted2 = encryptCredentials(plaintext);
      
      expect(encrypted1).not.toBe(encrypted2);
    });

    it("should handle special characters", () => {
      const plaintext = "p@$$w0rd!#$%^&*()_+-=[]{}|;':\",./<>?";
      const encrypted = encryptCredentials(plaintext);
      const decrypted = decryptCredentials(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });

    it("should handle unicode characters", () => {
      const plaintext = "密码🔐パスワード";
      const encrypted = encryptCredentials(plaintext);
      const decrypted = decryptCredentials(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });

    it("should handle long strings", () => {
      const plaintext = "a".repeat(10000);
      const encrypted = encryptCredentials(plaintext);
      const decrypted = decryptCredentials(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });
  });

  describe("WordPress Credential Encryption", () => {
    it("should encrypt and decrypt WordPress credentials object", () => {
      const credentials = {
        username: "admin",
        applicationPassword: "xxxx-xxxx-xxxx-xxxx-xxxx-xxxx",
      };
      
      const encrypted = encryptWordPressCredentials(credentials);
      const decrypted = decryptWordPressCredentials(encrypted);
      
      expect(decrypted).toEqual(credentials);
    });

    it("encrypted credentials should not contain plaintext", () => {
      const credentials = {
        username: "admin",
        applicationPassword: "xxxx-xxxx-xxxx-xxxx-xxxx-xxxx",
      };
      
      const encrypted = encryptWordPressCredentials(credentials);
      
      expect(encrypted).not.toContain("admin");
      expect(encrypted).not.toContain("xxxx");
      expect(encrypted).not.toContain("applicationPassword");
    });
  });

  describe("Credential Masking", () => {
    it("should mask long credentials", () => {
      const credential = "abcdefghijklmnop";
      const masked = maskCredential(credential);
      
      expect(masked).toBe("abcd****mnop");
    });

    it("should fully mask short credentials", () => {
      const credential = "short";
      const masked = maskCredential(credential);
      
      expect(masked).toBe("****");
    });

    it("should handle exactly 8 character credentials", () => {
      const credential = "12345678";
      const masked = maskCredential(credential);
      
      expect(masked).toBe("****");
    });
  });

  describe("Error Message Sanitization", () => {
    it("should sanitize password in error messages", () => {
      const error = new Error("Connection failed: password=mysecretpass123");
      const sanitized = sanitizeErrorMessage(error);
      
      expect(sanitized).not.toContain("mysecretpass123");
      expect(sanitized).toContain("password=****");
    });

    it("should sanitize Basic auth headers", () => {
      const error = new Error("Auth failed: Basic YWRtaW46cGFzc3dvcmQ=");
      const sanitized = sanitizeErrorMessage(error);
      
      expect(sanitized).not.toContain("YWRtaW46cGFzc3dvcmQ=");
      expect(sanitized).toContain("Basic ****");
    });

    it("should sanitize Bearer tokens", () => {
      const error = new Error("Token invalid: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
      const sanitized = sanitizeErrorMessage(error);
      
      expect(sanitized).not.toContain("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
      expect(sanitized).toContain("Bearer ****");
    });

    it("should sanitize WordPress app password format", () => {
      const error = new Error("WP auth failed with: abcd 1234 efgh 5678");
      const sanitized = sanitizeErrorMessage(error);
      
      expect(sanitized).not.toContain("abcd 1234 efgh 5678");
      expect(sanitized).toContain("****-****-****-****");
    });

    it("should handle non-Error objects", () => {
      const sanitized = sanitizeErrorMessage("password=secret123");
      
      expect(sanitized).not.toContain("secret123");
      expect(sanitized).toContain("password=****");
    });
  });
});

describe("Security Properties", () => {
  it("encrypted output should be base64 encoded", () => {
    const plaintext = "test";
    const encrypted = encryptCredentials(plaintext);
    
    // Base64 regex pattern
    expect(encrypted).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });

  it("encrypted output should be longer than plaintext (includes IV and auth tag)", () => {
    const plaintext = "short";
    const encrypted = encryptCredentials(plaintext);
    
    // Encrypted should include: 16 byte IV + ciphertext + 16 byte auth tag
    // Minimum: 16 (IV) + 1 (ciphertext) + 16 (auth tag) = 33 bytes
    expect(Buffer.from(encrypted, "base64").length).toBeGreaterThanOrEqual(33);
  });

  it("should fail to decrypt with tampered ciphertext", () => {
    const plaintext = "my-secret";
    const encrypted = encryptCredentials(plaintext);
    
    // Tamper with the ciphertext
    const buffer = Buffer.from(encrypted, "base64");
    buffer[20] = buffer[20] ^ 0xff; // Flip bits in ciphertext area
    const tampered = buffer.toString("base64");
    
    expect(() => decryptCredentials(tampered)).toThrow();
  });
});
