import Papa from "papaparse";

// Hevy CSV columns we care about
interface HevyCsvRow {
  workout_title: string;
  start_time: string;
  end_time: string;
  exercise_title: string;
  set_type: string;
  weight_kg: string;
  reps: string;
  duration_seconds: string;
  distance_meters: string;
  notes: string;
}

interface ParsedWorkout {
  title: string;
  startTime: Date;
  endTime: Date;
  exercises: {
    title: string;
    setType: string;
    weightKg: number | null;
    reps: number | null;
    durationSeconds: number | null;
    distanceMeters: number | null;
  }[];
}

/**
 * Parse a Hevy CSV file and group rows into workouts with exercises.
 */
export function parseHevyCsv(csvText: string): ParsedWorkout[] {
  const { data } = Papa.parse<HevyCsvRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
  });

  // Group rows by workout (adjacent rows with same workout_title + start_time)
  const workouts: ParsedWorkout[] = [];
  let current: ParsedWorkout | null = null;

  for (const row of data) {
    const title = row.workout_title?.trim();
    if (!title) continue;

    const startTime = new Date(row.start_time);
    const endTime = new Date(row.end_time);

    if (
      !current ||
      current.title !== title ||
      current.startTime.getTime() !== startTime.getTime()
    ) {
      current = { title, startTime, endTime, exercises: [] };
      workouts.push(current);
    }

    current.exercises.push({
      title: row.exercise_title?.trim() || "Unknown",
      setType: row.set_type?.trim() || "normal",
      weightKg: parseNumeric(row.weight_kg),
      reps: parseNumericInt(row.reps),
      durationSeconds: parseNumericInt(row.duration_seconds),
      distanceMeters: parseNumericInt(row.distance_meters),
    });
  }

  return workouts;
}

function parseNumeric(val: string | undefined): number | null {
  if (!val || val.trim() === "") return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

function parseNumericInt(val: string | undefined): number | null {
  const n = parseNumeric(val);
  return n !== null ? Math.round(n) : null;
}
