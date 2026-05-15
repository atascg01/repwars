import { describe, it, expect } from "vitest";
import {
  cn,
  formatVolume,
  formatDate,
  generateInviteCode,
  getInitials,
  getRelativeTime,
  calculateStreak,
} from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
    expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("resolves tailwind conflicts", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });
});

describe("formatVolume", () => {
  it("formats kg by default", () => {
    expect(formatVolume(100)).toBe("100 kg");
    expect(formatVolume(1234.5)).toBe("1,235 kg");
    expect(formatVolume(0)).toBe("0 kg");
  });

  it("converts to lbs", () => {
    const result = formatVolume(100, "lbs");
    expect(result).toMatch(/^220 lbs$/);
  });

  it("handles zero with lbs", () => {
    expect(formatVolume(0, "lbs")).toBe("0 lbs");
  });
});

describe("formatDate", () => {
  it("formats a date string", () => {
    const result = formatDate("2026-05-15");
    expect(result).toMatch(/May 15, 2026/);
  });

  it("formats a Date object", () => {
    const result = formatDate(new Date("2026-01-01"));
    expect(result).toMatch(/Jan 1, 2026/);
  });
});

describe("generateInviteCode", () => {
  it("generates an 8-character uppercase alphanumeric code", () => {
    const code = generateInviteCode();
    expect(code).toHaveLength(8);
    expect(code).toMatch(/^[A-Z0-9]{8}$/);
  });

  it("generates unique codes (high probability)", () => {
    const codes = new Set(Array.from({ length: 100 }, () => generateInviteCode()));
    expect(codes.size).toBeGreaterThan(90); // allow some collisions
  });
});

describe("getInitials", () => {
  it("returns ?? for null/undefined/empty", () => {
    expect(getInitials(null)).toBe("??");
    expect(getInitials(undefined)).toBe("??");
    expect(getInitials("")).toBe("??");
    expect(getInitials("   ")).toBe("??");
  });

  it("returns first two letters for single name", () => {
    expect(getInitials("John")).toBe("JO");
    expect(getInitials("Alice")).toBe("AL");
    expect(getInitials("A")).toBe("A");
  });

  it("returns first+last initials for multi-word names", () => {
    expect(getInitials("John Doe")).toBe("JD");
    expect(getInitials("Jean Claude Van Damme")).toBe("JD");
    expect(getInitials("Mary Jane Watson")).toBe("MW");
  });

  it("handles extra whitespace", () => {
    expect(getInitials("  John   Doe  ")).toBe("JD");
  });
});

describe("getRelativeTime", () => {
  it('returns "just now" for current time', () => {
    expect(getRelativeTime(new Date())).toBe("just now");
  });

  it("returns minutes ago", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60000);
    expect(getRelativeTime(fiveMinAgo)).toBe("5m ago");
  });

  it("returns hours ago", () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3600000);
    expect(getRelativeTime(threeHoursAgo)).toBe("3h ago");
  });

  it("returns days ago", () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000);
    expect(getRelativeTime(twoDaysAgo)).toBe("2d ago");
  });

  it("returns formatted date for older dates", () => {
    const oldDate = new Date("2026-01-15");
    const result = getRelativeTime(oldDate);
    expect(result).toMatch(/Jan 15/);
  });

  it("accepts string dates", () => {
    expect(getRelativeTime("2026-01-15")).toMatch(/Jan 15/);
  });
});

describe("calculateStreak", () => {
  it("returns 0 for empty dates", () => {
    expect(calculateStreak([])).toBe(0);
  });

  it("counts consecutive days from today", () => {
    const today = new Date();
    const yesterday = new Date(Date.now() - 86400000);
    expect(calculateStreak([today, yesterday])).toBe(2);
  });

  it("returns 0 if streak doesn't include today or yesterday", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000);
    const fourDaysAgo = new Date(Date.now() - 4 * 86400000);
    expect(calculateStreak([threeDaysAgo, fourDaysAgo])).toBe(0);
  });

  it("stops at gaps", () => {
    const today = new Date();
    const yesterday = new Date(Date.now() - 86400000);
    const fourDaysAgo = new Date(Date.now() - 4 * 86400000);
    expect(calculateStreak([today, yesterday, fourDaysAgo])).toBe(2);
  });
});
