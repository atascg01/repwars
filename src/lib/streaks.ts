/**
 * Calculate streak-related metrics from a set of training day strings.
 * Pure function — no DB dependencies, fully testable.
 *
 * @param trainingDays - Set of date strings in YYYY-MM-DD format
 * @param today - Today's date string (injectable for testing)
 */

export function calcCurrentStreak(
  trainingDays: Set<string>,
  today?: string,
): number {
  const dayStr = today ?? new Date().toISOString().slice(0, 10);
  const todayMs = new Date(dayStr + "T12:00:00").getTime();
  const yesterdayMs = todayMs - 86400000;
  const yesterday = new Date(yesterdayMs).toISOString().slice(0, 10);

  let check = new Date(dayStr + "T12:00:00");
  let streak = 0;

  // If no workout today AND no workout yesterday, find the most recent day
  if (!trainingDays.has(dayStr) && !trainingDays.has(yesterday)) {
    const sorted = [...trainingDays].sort().reverse();
    if (sorted.length === 0) return 0;
    const mostRecent = new Date(sorted[0] + "T12:00:00");
    const diffDays = Math.floor(
      (todayMs - mostRecent.getTime()) / 86400000,
    );
    // Gap more than 1 day OR most recent day is in the future → streak broken
    if (diffDays > 1 || diffDays < 0) return 0;
    check = mostRecent;
  }

  while (true) {
    const checkStr = check.toISOString().slice(0, 10);
    if (trainingDays.has(checkStr)) {
      streak++;
      check.setDate(check.getDate() - 1);
    } else if (streak === 0) {
      check.setDate(check.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function calcLongestStreak(trainingDays: Set<string>): number {
  const sorted = [...trainingDays].sort();
  if (sorted.length === 0) return 0;

  let longest = 0;
  let current = 1;
  let prev = new Date(sorted[0] + "T12:00:00");

  for (let i = 1; i < sorted.length; i++) {
    const curr = new Date(sorted[i] + "T12:00:00");
    const diffDays = (curr.getTime() - prev.getTime()) / 86400000;
    if (diffDays === 1) {
      current++;
    } else {
      longest = Math.max(longest, current);
      current = 1;
    }
    prev = curr;
  }

  return Math.max(longest, current);
}

/** Calculate workout stats for the current week (Mon-Sun) */
export function calcWeeklyWorkouts(
  trainingDays: Set<string>,
  today?: string,
): number {
  const now = today ? new Date(today + "T12:00:00") : new Date();
  const day = now.getDay();
  const mondayDiff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayDiff);
  monday.setHours(0, 0, 0, 0);

  let count = 0;
  for (const dayStr of trainingDays) {
    const d = new Date(dayStr + "T12:00:00");
    if (d >= monday) count++;
  }
  return count;
}
