import { describe, it, expect } from "vitest";

/**
 * Integration tests for challenge API.
 *
 * Requires: dev server running (`npm run dev`)
 * Run with: npm run test:integration
 */
const BASE_URL = process.env.TEST_BASE_URL ?? "http://localhost:3000";

describe("POST /api/challenges", () => {
  it("rejects when no crewId", async () => {
    const res = await fetch(`${BASE_URL}/api/challenges`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "IRON_KING", title: "Test" }),
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/crewId|required/i);
  });

  it("rejects when no type", async () => {
    const res = await fetch(`${BASE_URL}/api/challenges`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ crewId: "fake-id", title: "Test" }),
    });
    expect(res.status).toBe(400);
  });

  it("rejects when no title", async () => {
    const res = await fetch(`${BASE_URL}/api/challenges`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ crewId: "fake-id", type: "IRON_KING" }),
    });
    expect(res.status).toBe(400);
  });

  it("rejects unauthenticated requests", async () => {
    // This should fail with 401 since there's no session
    const res = await fetch(`${BASE_URL}/api/challenges`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        crewId: "fake",
        type: "IRON_KING",
        title: "Test",
      }),
    });
    expect(res.status).toBe(401);
  });
});
