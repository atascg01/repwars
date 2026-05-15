/**
 * Streak metrics for lifters — weekly-based, not daily.
 * Rest days are expected (3-4 days/week is normal).
 *
 * Pure functions — no DB dependencies, fully testable.
 *
 * @param trainingDays - Set of date strings in YYYY-MM-DD format
 * @param today - Today's date string (injectable for testing)
 */

/** Get Monday 00:00 of the week containing the given date */
function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Count how many training days fall within a given Mon-Sun week */
function countDaysInWeek(
  trainingDays: Set<string>,
  monday: Date,
): number {
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 7);
  let count = 0;
  for (const dayStr of trainingDays) {
    const d = new Date(dayStr + "T12:00:00");
    if (d >= monday && d < sunday) count++;
  }
  return count;
}

/**
 * Current weekly streak: consecutive weeks (Mon-Sun) with ≥ minDays trained.
 * minDays defaults to 3 (a normal lifting schedule).
 */
export function calcWeeklyStreak(
  trainingDays: Set<string>,
  minDays = 3,
  today?: string,
): number {
  const now = today ? new Date(today + "T12:00:00") : new Date();
  let monday = getMonday(now);
  let streak = 0;

  // Check current week first
  const thisWeekDays = countDaysInWeek(trainingDays, monday);

  // If current week is incomplete (not enough days yet), start counting from last week
  if (thisWeekDays < minDays) {
    // Check if the current week can still hit the target
    const daysLeft = 7 - now.getDay(); // days remaining including today
    const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
    const daysSoFar = dayOfWeek; // Mon=1, Sun=7
    // If we're early in the week and could still hit target, don't count this week against us
    if (daysLeft >= minDays - thisWeekDays) {
      // Week is still in progress — skip to last week
      monday.setDate(monday.getDate() - 7);
    } else {
      // Week is almost over and target not met → streak resets
      return 0;
    }
  }

  // Count backwards through completed weeks
  while (true) {
    const days = countDaysInWeek(trainingDays, monday);
    if (days >= minDays) {
      streak++;
      monday.setDate(monday.getDate() - 7);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Longest weekly streak ever: max consecutive weeks with ≥ minDays trained.
 */
export function calcLongestWeeklyStreak(
  trainingDays: Set<string>,
  minDays = 3,
): number {
  if (trainingDays.size === 0) return 0;

  // Find the date range
  const sorted = [...trainingDays].sort();
  const firstDate = new Date(sorted[0] + "T12:00:00");
  const lastDate = new Date(sorted[sorted.length - 1] + "T12:00:00");

  // Iterate all Mondays in the range
  let monday = getMonday(firstDate);
  const finalMonday = getMonday(lastDate);

  let longest = 0;
  let current = 0;

  while (monday <= finalMonday) {
    const days = countDaysInWeek(trainingDays, monday);
    if (days >= minDays) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
    monday.setDate(monday.getDate() + 7);
  }

  return longest;
}

/** Count workouts in the current week (Mon-Sun) */
export function calcWeeklyWorkouts(
  trainingDays: Set<string>,
  today?: string,
): number {
  const now = today ? new Date(today + "T12:00:00") : new Date();
  const monday = getMonday(now);
  return countDaysInWeek(trainingDays, monday);
}
