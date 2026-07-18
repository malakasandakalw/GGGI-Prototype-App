"use client";

import { CalendarDays } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store/provider";

// Prominent on-page academic-year filter. Bound to the SAME global active year as the
// header switcher (single source of truth), so changing it here updates the whole app.
// Use on year-scoped pages where the year control must be obvious (results, gradebook,
// modules, reports, students, etc.).
export function AcademicYearSelect({ className }: { className?: string }) {
  const { academicYears, activeAcademicYearId, setActiveAcademicYear } = useStore();
  return (
    <Select value={activeAcademicYearId} onValueChange={setActiveAcademicYear}>
      <SelectTrigger className={className ?? "w-[190px]"}>
        <CalendarDays className="size-4 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {academicYears.map((y) => (
          <SelectItem key={y.id} value={y.id}>
            {y.label}{y.isCurrent ? " (Current)" : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
