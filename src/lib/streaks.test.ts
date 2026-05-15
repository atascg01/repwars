import { describe, it, expect } from "vitest";
import {
  calcWeeklyStreak,
  calcLongestWeeklyStreak,
  calcWeeklyWorkouts,
} from "@/lib/streaks";

function days(...dates: string[]): Set<string> {
  return new Set(dates);
}

describe("calcWeeklyStreak", () => {
  it("returns 0 when no training days exist", () => {
    expect(calcWeeklyStreak(days())).toBe(0);
  });

  it("counts weeks with ≥3 training days (default minDays=3)", () => {
    // Week 1 (current): Mon=18, Wed=20, Fri=22 → 3 days ✓
    // Week 2: Mon=11, Wed=13, Fri=15 → 3 days ✓
    // Week 3: Mon=4, Wed=6 → 2 days ✗
    const training = days(
      "2026-05-22", "2026-05-20", "2026-05-18", // Week 1: Mon/Wed/Fri
      "2026-05-15", "2026-05-13", "2026-05-11", // Week 2: Mon/Wed/Fri
      "2026-05-06", "2026-05-04", // Week 3: Mon/Wed only → 2 days
    );
    // Today = May 24 (Sunday, end of week 1)
    expect(calcWeeklyStreak(training, 3, "2026-05-24")).toBe(2);
  });

  it("counts from last completed week if current week is in progress", () => {
    // It's Tuesday May 19. User trained Mon 18 and Tue 19.
    // 2 days so far, can still hit 3 → current week is in progress, skip it
    // Last week: Mon 11, Wed 13, Fri 15 → 3 ✓
    // Week before: Mon 4, Wed 6 → 2 ✗
    const training = days(
      "2026-05-19", "2026-05-18", // This week (in progress, 2 days)
      "2026-05-15", "2026-05-13", "2026-05-11", // Last week (3 days)
      "2026-05-06", "2026-05-04", // 2 weeks ago (2 days)
    );
    expect(calcWeeklyStreak(training, 3, "2026-05-19")).toBe(1);
  });

  it("counts current week if target already met", () => {
    // It's Wednesday May 20. Already trained Mon/Tue/Wed → 3 ✓
    const training = days(
      "2026-05-20", "2026-05-19", "2026-05-18", // This week
      "2026-05-15", "2026-05-13", "2026-05-11", // Last week (Mon/Wed/Fri = 3)
    );
    expect(calcWeeklyStreak(training, 3, "2026-05-20")).toBe(2);
  });

  it("returns 0 when current week is ending and target not met", () => {
    // It's Saturday May 23. Only 1 day trained. 1 day left can't hit 3.
    const training = days(
      "2026-05-20", // Wed only — 1 day, Saturday with only Sunday left = can't hit 3
    );
    expect(calcWeeklyStreak(training, 3, "2026-05-23")).toBe(0);
  });

  it("respects custom minDays threshold", () => {
    // 2 days/week threshold
    const training = days(
      "2026-05-20", "2026-05-18", // This week: 2 ✓
      "2026-05-13", "2026-05-11", // Last week: 2 ✓
    );
    expect(calcWeeklyStreak(training, 2, "2026-05-22")).toBe(2);
    expect(calcWeeklyStreak(training, 3, "2026-05-22")).toBe(0);
  });

  it("handles single week of data", () => {
    const training = days("2026-05-20", "2026-05-19", "2026-05-18");
    expect(calcWeeklyStreak(training, 3, "2026-05-20")).toBe(1);
  });

  it("doesn't count weeks beyond first gap", () => {
    const training = days(
      "2026-05-22", "2026-05-20", "2026-05-18", // Week 1: 3 ✓
      // Week 2 gap (0 days)
      "2026-05-08", "2026-05-06", "2026-05-04", // Week 3: 3 (but gap breaks it)
    );
    expect(calcWeeklyStreak(training, 3, "2026-05-24")).toBe(1);
  });
});

describe("calcLongestWeeklyStreak", () => {
  it("returns 0 for empty set", () => {
    expect(calcLongestWeeklyStreak(days())).toBe(0);
  });

  it("finds longest weekly run", () => {
    const training = days(
      // 3 weeks of 3 days each
      "2026-05-22", "2026-05-20", "2026-05-18",
      "2026-05-15", "2026-05-13", "2026-05-11",
      "2026-05-08", "2026-05-06", "2026-05-04",
      // gap
      // 1 week of 3 days
      "2026-04-24", "2026-04-22", "2026-04-20",
    );
    expect(calcLongestWeeklyStreak(training, 3)).toBe(3);
  });

  it("handles multiple runs", () => {
    const training = days(
      // 2 weeks
      "2026-05-22", "2026-05-20", "2026-05-18",
      "2026-05-15", "2026-05-13", "2026-05-11",
      // gap (1 week off)
      // 3 weeks
      "2026-04-24", "2026-04-22", "2026-04-20",
      "2026-04-17", "2026-04-15", "2026-04-13",
      "2026-04-10", "2026-04-08", "2026-04-06",
    );
    expect(calcLongestWeeklyStreak(training, 3)).toBe(3);
  });
});

describe("calcWeeklyWorkouts", () => {
  it("counts workouts in the current Mon-Sun week", () => {
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
    const training = days(
      "2026-05-17", // Sun (this week)
      "2026-05-11", // Mon (this week)
      "2026-05-10", // Sun (last week)
    );
    expect(calcWeeklyWorkouts(training, "2026-05-17")).toBe(2);
  });

  it("returns 0 for empty set", () => {
    expect(calcWeeklyWorkouts(days(), "2026-05-15")).toBe(0);
  });
});
