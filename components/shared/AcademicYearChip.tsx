"use client";

import { CalendarDays } from "lucide-react";
import { useStore } from "@/lib/store/provider";

// Small read-only chip showing the active academic year. Drop into page headers on
// year-scoped pages so the user always knows which year the data belongs to.
export function AcademicYearChip() {
  const { activeAcademicYear } = useStore();
  if (!activeAcademicYear) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
      <CalendarDays className="size-3.5" />
      {activeAcademicYear.label}
    </span>
  );
}
