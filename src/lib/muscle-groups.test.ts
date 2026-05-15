import { describe, it, expect } from "vitest";
import { guessMuscleGroup, MUSCLE_LABELS } from "@/lib/muscle-groups";

describe("guessMuscleGroup", () => {
  it("detects quadriceps from Spanish names", () => {
    expect(guessMuscleGroup("Sentadilla Hack (Máquina)")).toBe("quadricep");
    expect(guessMuscleGroup("Extensión de Pierna")).toBe("quadricep");
    expect(guessMuscleGroup("Prensa (Máquina)")).toBe("quadricep");
  });

  it("detects quadriceps from English names", () => {
    expect(guessMuscleGroup("Hack Squat")).toBe("quadricep");
    expect(guessMuscleGroup("Leg Extension")).toBe("quadricep");
    expect(guessMuscleGroup("Leg Press")).toBe("quadricep");
    expect(guessMuscleGroup("Bulgarian Split Squat")).toBe("quadricep");
  });

  it("detects hamstrings", () => {
    expect(guessMuscleGroup("Peso Muerto Rumano (Barra)")).toBe("hamstring");
    expect(guessMuscleGroup("Curl de Pierna Sentado")).toBe("hamstring");
    expect(guessMuscleGroup("RDL")).toBe("hamstring");
    expect(guessMuscleGroup("Nordic Curl")).toBe("hamstring");
    expect(guessMuscleGroup("Hiperextensión")).toBe("hamstring");
  });

  it("detects glutes", () => {
    expect(guessMuscleGroup("Hip Thrust")).toBe("glute");
    expect(guessMuscleGroup("Patada de Glúteo")).toBe("glute");
    expect(guessMuscleGroup("Abducción de Caderas")).toBe("glute");
  });

  it("detects chest", () => {
    expect(guessMuscleGroup("Press Banca (Barra)")).toBe("chest");
    expect(guessMuscleGroup("Bench Press")).toBe("chest");
    expect(guessMuscleGroup("Mariposa (Pec Deck)")).toBe("chest");
    expect(guessMuscleGroup("Aperturas con Mancuerna")).toBe("chest");
    expect(guessMuscleGroup("Fondos en Paralelas")).toBe("chest");
    expect(guessMuscleGroup("Push Up")).toBe("chest");
  });

  it("detects back", () => {
    expect(guessMuscleGroup("Remo Iso-Lateral")).toBe("back");
    expect(guessMuscleGroup("Dominada (Con Peso Añadido)")).toBe("back");
    expect(guessMuscleGroup("Jalón al Pecho")).toBe("back");
    expect(guessMuscleGroup("Lat Pulldown")).toBe("back");
    expect(guessMuscleGroup("Pullover")).toBe("back");
  });

  it("detects shoulders", () => {
    expect(guessMuscleGroup("Press de Hombros (Mancuerna)")).toBe("shoulder");
    expect(guessMuscleGroup("Elevaciones Laterales")).toBe("shoulder");
    expect(guessMuscleGroup("Lateral Raise")).toBe("shoulder");
    expect(guessMuscleGroup("Face Pull")).toBe("shoulder");
    expect(guessMuscleGroup("Vuelos Posteriores")).toBe("shoulder");
  });

  it("detects biceps", () => {
    expect(guessMuscleGroup("Curl de Bíceps (Máquina)")).toBe("bicep");
    expect(guessMuscleGroup("Curl Martillo")).toBe("bicep");
    expect(guessMuscleGroup("Predicador")).toBe("bicep");
    expect(guessMuscleGroup("Hammer Curl")).toBe("bicep");
  });

  it("detects triceps", () => {
    expect(guessMuscleGroup("Extensión de tríceps por encima")).toBe("tricep");
    expect(guessMuscleGroup("Tríceps con Polea")).toBe("tricep");
    expect(guessMuscleGroup("Press Francés")).toBe("tricep");
    expect(guessMuscleGroup("Fondo Tríceps")).toBe("tricep");
  });

  it("detects abdominals", () => {
    expect(guessMuscleGroup("Abdominal Corto (Máquina)")).toBe("abdominal");
    expect(guessMuscleGroup("Crunch")).toBe("abdominal");
    expect(guessMuscleGroup("Sit Up")).toBe("abdominal");
    expect(guessMuscleGroup("Plancha")).toBe("abdominal");
  });

  it("detects calves", () => {
    expect(guessMuscleGroup("Elevación de Gemelos de Pie")).toBe("calf");
    expect(guessMuscleGroup("Calf Raise")).toBe("calf");
  });

  it("detects adductors", () => {
    expect(guessMuscleGroup("Aducción de Caderas")).toBe("adductor");
    expect(guessMuscleGroup("Adductor Machine")).toBe("adductor");
  });

  it("skips warmup and stretching", () => {
    expect(guessMuscleGroup("Calentamiento")).toBeNull();
    expect(guessMuscleGroup("Warmup")).toBeNull();
    expect(guessMuscleGroup("Dead Hang")).toBeNull();
    expect(guessMuscleGroup("Estiramiento")).toBeNull();
  });

  it("returns other for unknown exercises", () => {
    expect(guessMuscleGroup("Ejercicio Misterioso")).toBe("other");
    expect(guessMuscleGroup("xyz123")).toBe("other");
  });

  it("is case insensitive", () => {
    expect(guessMuscleGroup("SENTADILLA HACK")).toBe("quadricep");
    expect(guessMuscleGroup("curl de bíceps")).toBe("bicep");
    expect(guessMuscleGroup("BENCH PRESS")).toBe("chest");
  });
});

describe("MUSCLE_LABELS", () => {
  it("has labels for all expected keys", () => {
    const expected = [
      "quadricep",
      "hamstring",
      "glute",
      "chest",
      "back",
      "shoulder",
      "bicep",
      "tricep",
      "abdominal",
      "calf",
      "adductor",
      "other",
    ];
    for (const key of expected) {
      expect(MUSCLE_LABELS[key]).toBeTruthy();
      // Verify they're in English
      expect(MUSCLE_LABELS[key]).not.toMatch(/[áéíóúüñ]/i);
    }
  });
});
