import type { GradeBand } from "@/lib/types";

export const DEFAULT_GRADE_BANDS: GradeBand[] = [
  { grade: "A+", minMark: 85, gradePoint: 4.0 },
  { grade: "A", minMark: 75, gradePoint: 4.0 },
  { grade: "A-", minMark: 70, gradePoint: 3.7 },
  { grade: "B+", minMark: 65, gradePoint: 3.3 },
  { grade: "B", minMark: 60, gradePoint: 3.0 },
  { grade: "B-", minMark: 55, gradePoint: 2.7 },
  { grade: "C+", minMark: 50, gradePoint: 2.3 },
  { grade: "C", minMark: 45, gradePoint: 2.0 },
  { grade: "C-", minMark: 40, gradePoint: 1.7 },
  { grade: "D", minMark: 35, gradePoint: 1.0 },
  { grade: "F", minMark: 0, gradePoint: 0.0 },
];

export function markToGrade(mark: number, bands: GradeBand[] = DEFAULT_GRADE_BANDS) {
  const band = bands.find((b) => mark >= b.minMark) ?? bands[bands.length - 1];
  return band;
}

export function weightedTotal(
  caAvg: number,
  finalExam: number,
  caWeight: number,
): number {
  const finalWeight = 100 - caWeight;
  return Math.round((caAvg * (caWeight / 100) + finalExam * (finalWeight / 100)) * 10) / 10;
}
