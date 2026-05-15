import { describe, it, expect, beforeAll, afterAll } from "vitest";

/**
 * Integration test for signup API.
 *
 * These tests hit the REAL API + database. They require the dev server:
 *   npm run dev
 * Then run with:
 *   npm run test:integration
 */

const BASE_URL = process.env.TEST_BASE_URL ?? "http://localhost:3000";

describe("POST /api/auth/signup", () => {
  const testEmail = `test-${Date.now()}@repwars.test`;

  afterAll(async () => {
    // Clean up would require a delete endpoint — for now, test users remain
  });

  it("rejects missing email", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "12345678" }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("rejects missing password", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@test.com" }),
    });
    expect(res.status).toBe(400);
  });

  it("rejects short password", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: "123" }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/contraseña|caracteres|password|characters/i);
  });

  it("creates a new user successfully", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "test12345678",
        displayName: "Test User",
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBeDefined();
    expect(body.email).toBe(testEmail.toLowerCase());
    expect(body.displayName).toBe("Test User");
  });

  it("rejects duplicate email", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "test12345678",
      }),
    });
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toMatch(/existe|cuenta|email|already exists|account/i);
  });
});
