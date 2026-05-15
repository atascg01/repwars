// Map exercise titles to muscle groups using name patterns
const MUSCLE_GROUPS: Record<string, string[]> = {
  quadriceps: [
    "sentadilla", "squat", "prensa", "leg press", "lung", "zancada",
    "extensión de pierna", "leg extension", "hack squat", "sissy",
    "bulgarian split", "goblet squat",
  ],
  hamstrings: [
    "peso muerto rumano", "rdl", "romanian deadlift", "curl de pierna",
    "leg curl", "hiperextensión", "hyperextension", "nórdico", "nordic",
    "buenos días", "good morning",
  ],
  glutes: [
    "hip thrust", "glute", "glúteo", "patada", "kickback", "puente",
    "abducción", "abductor", "abduction",
  ],
  chest: [
    "press banca", "bench press", "pectoral", "pecho", "chest press",
    "mariposa", "butterfly", "pec deck", "crossover", "fondos",
    "dip", "apertura", "fly", "push up", "flexión",
  ],
  back: [
    "remo", "row", "dominad", "pull up", "chin up", "jalón",
    "lat pulldown", "pulldown", "dorsal", "pullover",
  ],
  shoulders: [
    "hombro", "shoulder", "press militar", "military press", "arnold",
    "elevación lateral", "lateral raise", "vuelo", "reverse pec deck",
    "pájaro", "face pull", "upright row",
  ],
  biceps: [
    "curl", "bicep", "bíceps", "curl de bíceps", "martillo", "hammer",
    "predicador", "preacher", "concentrado", "spider curl",
  ],
  triceps: [
    "trícep", "tricep", "extensión de tríc", "fondo", "press francés",
    "skull crusher", "polea tríc", "pushdown",
  ],
  abdominals: [
    "abdominal", "crunch", "abdomen", "core", "plank", "plancha",
    "sit up", "elevación de pierna", "leg raise", "abs",
  ],
  calves: [
    "gemelo", "calf", "elevación de talones", "heel raise",
  ],
  adductors: ["aducción", "adductor", "adduction"],
};

export function guessMuscleGroup(title: string): string | null {
  const lower = title.toLowerCase().trim();

  // Skip warmup / stretching
  if (
    lower.includes("calentamiento") ||
    lower.includes("warmup") ||
    lower.includes("dead hang") ||
    lower.includes("estiramiento") ||
    lower.includes("stretch")
  ) {
    return null;
  }

  for (const [group, patterns] of Object.entries(MUSCLE_GROUPS)) {
    for (const pattern of patterns) {
      if (lower.includes(pattern)) {
        // Remove trailing 's' for display
        return group.replace(/s$/, "");
      }
    }
  }

  return "other";
}

// Color palette for muscle groups (consistent across charts)
export const MUSCLE_COLORS: Record<string, string> = {
  quadricep: "#f59e0b",
  hamstring: "#d97706",
  glute: "#ea580c",
  chest: "#ef4444",
  back: "#3b82f6",
  shoulder: "#8b5cf6",
  bicep: "#22c55e",
  tricep: "#ec4899",
  abdominal: "#06b6d4",
  calf: "#84cc16",
  adductor: "#f97316",
  other: "#71717a",
};

export const MUSCLE_LABELS: Record<string, string> = {
  quadricep: "Cuádriceps",
  hamstring: "Femoral",
  glute: "Glúteo",
  chest: "Pecho",
  back: "Espalda",
  shoulder: "Hombro",
  bicep: "Bíceps",
  tricep: "Tríceps",
  abdominal: "Abdominal",
  calf: "Gemelo",
  adductor: "Aductor",
  other: "Otros",
};
