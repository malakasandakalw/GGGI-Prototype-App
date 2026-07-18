import type { AcademicYear } from "@/lib/types";

// Real-world academic years (Sri Lankan "YYYY/YYYY" convention). The current year is the
// one the app opens in by default. Existing programmes/semesters/intakes are backfilled
// to these ids so historical mock data lands in the correct year.
export const academicYears: AcademicYear[] = [
  { id: "ay-2024", label: "2024/2025", startDate: "2024-02-01", endDate: "2025-01-31", status: "archived", isCurrent: false },
  { id: "ay-2025", label: "2025/2026", startDate: "2025-02-01", endDate: "2026-01-31", status: "archived", isCurrent: false },
  { id: "ay-2026", label: "2026/2027", startDate: "2026-02-01", endDate: "2027-01-31", status: "active", isCurrent: true },
];

export const currentAcademicYearId = "ay-2026";
