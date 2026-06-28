import type { ModuleGrade, Module } from "@/lib/types";

export function gpa(
  grades: ModuleGrade[],
  modules: Module[],
): number {
  let totalCredits = 0;
  let totalPoints = 0;
  for (const g of grades) {
    if (g.specialCode) continue;
    const mod = modules.find((m) => m.id === g.moduleId);
    if (!mod) continue;
    totalCredits += mod.creditValue;
    totalPoints += g.gradePoint * mod.creditValue;
  }
  if (totalCredits === 0) return 0;
  return Math.round((totalPoints / totalCredits) * 100) / 100;
}

export function academicClass(cgpa: number): { label: string; tone: string } {
  if (cgpa >= 3.7) return { label: "First Class", tone: "bg-amber-100 text-amber-800" };
  if (cgpa >= 3.3) return { label: "Second Class Upper", tone: "bg-emerald-100 text-emerald-800" };
  if (cgpa >= 3.0) return { label: "Second Class Lower", tone: "bg-blue-100 text-blue-800" };
  if (cgpa >= 2.0) return { label: "Pass", tone: "bg-slate-100 text-slate-800" };
  return { label: "Below Pass", tone: "bg-red-100 text-red-800" };
}
