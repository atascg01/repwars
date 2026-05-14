/**
 * Simple AES-GCM encryption for Hevy API keys using Web Crypto.
 * Derives key material from ENCRYPTION_KEY env var (or a dev fallback).
 */

function getKeySecret(): string {
  return process.env.ENCRYPTION_KEY ?? "hevy-social-mvp-default-key-min-32-ch!!";
}

async function importKey(): Promise<CryptoKey> {
  const secret = getKeySecret();
  const encoder = new TextEncoder();
  const keyBytes = encoder.encode(secret).slice(0, 32);
  return crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encrypt(text: string): Promise<string> {
  const key = await importKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(text)
  );

  const ivHex = Array.from(iv)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const ctHex = Array.from(new Uint8Array(encrypted))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${ivHex}:${ctHex}`;
}

export async function decrypt(hex: string): Promise<string> {
  const key = await importKey();
  const [ivHex, ctHex] = hex.split(":");
  if (!ivHex || !ctHex) {
    throw new Error("Invalid encrypted format");
  }

  const iv = new Uint8Array(
    ivHex.match(/.{2}/g)!.map((b) => parseInt(b, 16))
  );
  const ct = new Uint8Array(
    ctHex.match(/.{2}/g)!.map((b) => parseInt(b, 16))
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ct
  );

  return new TextDecoder().decode(decrypted);
}
