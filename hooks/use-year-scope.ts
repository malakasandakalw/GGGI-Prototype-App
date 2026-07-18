"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store/provider";

// Shared helper for scoping page data to the globally-active academic year.
// - Modules/lectures/quizzes/assignments/grades derive their year via module → semester.
// - Intakes / calendar events / applications carry `academicYearId` directly (use `inYear`).
export function useYearScope() {
  const { activeAcademicYearId, activeAcademicYear, academicYears, programs, modules } = useStore();

  const { semesterIdsInYear, moduleIdsInYear } = useMemo(() => {
    const sems = new Set<string>();
    const mods = new Set<string>();
    programs.forEach((p) =>
      p.semesters.forEach((s) => {
        if (s.academicYearId === activeAcademicYearId) {
          sems.add(s.id);
          s.moduleIds.forEach((m) => mods.add(m));
        }
      }),
    );
    modules.forEach((m) => {
      if (sems.has(m.semesterId)) mods.add(m.id);
    });
    return { semesterIdsInYear: sems, moduleIdsInYear: mods };
  }, [programs, modules, activeAcademicYearId]);

  return {
    activeAcademicYearId,
    activeAcademicYear,
    academicYears,
    semesterIdsInYear,
    moduleIdsInYear,
    /** True if a module is offered in the active academic year. */
    isModuleInYear: (moduleId: string) => moduleIdsInYear.has(moduleId),
    /** True if a semester belongs to the active academic year. */
    isSemesterInYear: (semesterId: string) => semesterIdsInYear.has(semesterId),
    /** True if an entity's own academicYearId matches the active year. */
    inYear: (academicYearId?: string) => academicYearId === activeAcademicYearId,
    /** False when the active year is archived/planning — records can't be created into a closed year. */
    activeYearEditable: (activeAcademicYear?.status ?? "active") === "active",
  };
}
