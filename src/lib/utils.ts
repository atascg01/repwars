import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatVolume(kg: number, unit: "kg" | "lbs" = "kg"): string {
  const value = unit === "lbs" ? kg * 2.20462 : kg;
  return `${Math.round(value).toLocaleString()} ${unit}`;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function calculateStreak(workoutDates: Date[]): number {
  if (!workoutDates.length) return 0;
  const unique = [
    ...new Set(workoutDates.map((d) => new Date(d).toISOString().split("T")[0])),
  ]
    .sort()
    .reverse();

  let streak = 0;
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000)
    .toISOString()
    .split("T")[0];

  if (unique[0] !== today && unique[0] !== yesterday) return 0;

  let checkDate = new Date(unique[0]);
  for (const dateStr of unique) {
    const date = new Date(dateStr);
    if (date.getTime() === checkDate.getTime()) {
      streak++;
      checkDate = new Date(checkDate.getTime() - 86400000);
    } else if (date.getTime() < checkDate.getTime()) {
      break;
    }
  }
  return streak;
}

export function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
