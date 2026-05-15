import { describe, it, expect } from "vitest";
import { calcCurrentStreak, calcLongestStreak, calcWeeklyWorkouts } from "@/lib/streaks";

function days(...dates: string[]): Set<string> {
  return new Set(dates);
}

describe("calcCurrentStreak", () => {
  it("returns 0 when no training days exist", () => {
    expect(calcCurrentStreak(days(), "2026-05-15")).toBe(0);
  });

  it("counts consecutive days backward from today", () => {
    const training = days(
      "2026-05-15", // today
      "2026-05-14", // yesterday
      "2026-05-13",
      "2026-05-12",
    );
    expect(calcCurrentStreak(training, "2026-05-15")).toBe(4);
  });

  it("stops at the first gap", () => {
    const training = days(
      "2026-05-15",
      "2026-05-14",
      // gap: no May 13
      "2026-05-12",
      "2026-05-11",
    );
    expect(calcCurrentStreak(training, "2026-05-15")).toBe(2);
  });

  it("starts from yesterday if no workout today", () => {
    const training = days(
      "2026-05-14", // yesterday
      "2026-05-13",
    );
    expect(calcCurrentStreak(training, "2026-05-15")).toBe(2);
  });

  it("looks for most recent day if gap is exactly 1 from yesterday", () => {
    // User trained on 14th and 13th, but not on 15th (today)
    // and has a gap to earlier. Streak from 14th backward: 14, 13 = 2
    const training = days(
      "2026-05-14",
      "2026-05-13",
      "2026-05-11", // gap here
      "2026-05-10",
    );
    expect(calcCurrentStreak(training, "2026-05-15")).toBe(2);
  });

  it("returns 0 if last workout was more than 1 day ago", () => {
    const training = days(
      "2026-05-12", // 3 days ago
      "2026-05-11",
    );
    expect(calcCurrentStreak(training, "2026-05-15")).toBe(0);
  });

  it("handles single workout today", () => {
    expect(calcCurrentStreak(days("2026-05-15"), "2026-05-15")).toBe(1);
  });

  it("handles streak across month boundary", () => {
    const training = days(
      "2026-05-01",
      "2026-04-30",
      "2026-04-29",
    );
    expect(calcCurrentStreak(training, "2026-05-01")).toBe(3);
  });

  it("handles streak across year boundary", () => {
    const training = days(
      "2026-01-02",
      "2026-01-01",
      "2025-12-31",
      "2025-12-30",
    );
    expect(calcCurrentStreak(training, "2026-01-02")).toBe(4);
  });

  it("avoids infinite loop when trainingDays has future dates only", () => {
    // Should not loop forever — returns 0 because today is not in set
    const training = days("2026-06-01");
    expect(calcCurrentStreak(training, "2026-05-15")).toBe(0);
  });
});

describe("calcLongestStreak", () => {
  it("returns 0 for empty set", () => {
    expect(calcLongestStreak(days())).toBe(0);
  });

  it("returns 1 for single day", () => {
    expect(calcLongestStreak(days("2026-05-15"))).toBe(1);
  });

  it("finds longest consecutive run", () => {
    const training = days(
      "2026-05-15",
      "2026-05-14",
      "2026-05-13",
      // gap
      "2026-05-10",
      "2026-05-09",
      "2026-05-08",
      "2026-05-07",
    );
    expect(calcLongestStreak(training)).toBe(4); // the 4-day run
  });

  it("handles multiple runs", () => {
    const training = days(
      "2026-05-15",
      "2026-05-14",
      // gap
      "2026-05-10",
      "2026-05-09",
      // gap
      "2026-05-01",
    );
    expect(calcLongestStreak(training)).toBe(2);
  });

  it("handles all consecutive days", () => {
    const training = days(
      "2026-05-05",
      "2026-05-04",
      "2026-05-03",
      "2026-05-02",
      "2026-05-01",
    );
    expect(calcLongestStreak(training)).toBe(5);
  });
});

describe("calcWeeklyWorkouts", () => {
  it("counts workouts in the current Mon-Sun week", () => {
    // May 15, 2026 is a Friday
    // Mon May 11 - Sun May 17
    const training = days(
      "2026-05-15", // Fri
      "2026-05-14", // Thu
      "2026-05-13", // Wed
      "2026-05-12", // Tue
      "2026-05-11", // Mon
      "2026-05-10", // Sun (previous week)
    );
    expect(calcWeeklyWorkouts(training, "2026-05-15")).toBe(5);
  });

  it("handles Sunday correctly", () => {
    // May 17, 2026 is a Sunday
    // Mon May 11 - Sun May 17
    const training = days(
      "2026-05-17", // Sun (this week)
      "2026-05-11", // Mon (this week)
      "2026-05-10", // Sun (last week)
    );
    expect(calcWeeklyWorkouts(training, "2026-05-17")).toBe(2);
  });

  it("handles Monday correctly", () => {
    // May 18, 2026 is a Monday
    const training = days(
      "2026-05-18", // Mon (this week)
      "2026-05-17", // Sun (last week)
    );
    expect(calcWeeklyWorkouts(training, "2026-05-18")).toBe(1);
  });

  it("returns 0 for empty set", () => {
    expect(calcWeeklyWorkouts(days(), "2026-05-15")).toBe(0);
  });
});
