import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "@/lib/crypto";

describe("encrypt / decrypt", () => {
  it("round-trips a simple string", async () => {
    const original = "test-api-key-12345";
    const encrypted = await encrypt(original);
    const decrypted = await decrypt(encrypted);
    expect(decrypted).toBe(original);
  });

  it("round-trips a long API key", async () => {
    const original = "hv_" + "a".repeat(40);
    const encrypted = await encrypt(original);
    const decrypted = await decrypt(encrypted);
    expect(decrypted).toBe(original);
  });

  it("round-trips special characters", async () => {
    const original = "key-with-dashes_and_underscores.more!chars@2024";
    const encrypted = await encrypt(original);
    const decrypted = await decrypt(encrypted);
    expect(decrypted).toBe(original);
  });

  it("produces different ciphertexts for same plaintext", async () => {
    const original = "same-string";
    const e1 = await encrypt(original);
    const e2 = await encrypt(original);
    // Different IV → different ciphertext
    expect(e1).not.toBe(e2);
    // Both decrypt to original
    expect(await decrypt(e1)).toBe(original);
    expect(await decrypt(e2)).toBe(original);
  });

  it("encrypted format is ivHex:ctHex", async () => {
    const encrypted = await encrypt("test");
    expect(encrypted).toMatch(/^[0-9a-f]+:[0-9a-f]+$/);
    const [iv, ct] = encrypted.split(":");
    expect(iv).toHaveLength(24); // 12 bytes = 24 hex chars
    expect(ct.length).toBeGreaterThan(0);
  });

  it("throws on invalid format", async () => {
    await expect(decrypt("not-valid")).rejects.toThrow("Invalid encrypted format");
  });

  it("throws on empty string", async () => {
    await expect(decrypt("")).rejects.toThrow("Invalid encrypted format");
  });

  it("round-trips empty string", async () => {
    const encrypted = await encrypt("");
    const decrypted = await decrypt(encrypted);
    expect(decrypted).toBe("");
  });
});
