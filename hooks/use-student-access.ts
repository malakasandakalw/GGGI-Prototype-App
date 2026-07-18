"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store/provider";
import type { Module, OLEnrollment } from "@/lib/types";

// Unified student access model — Phase 1 foundation (no visible change yet).
//
// A student is ONE identity; what they can see/do is derived from their *enrollments*,
// not a fixed role label:
//   - Cohort modules = the modules of their programme's semesters  ∪  crossEnrolledModuleIds.
//   - Open Learning  = their OL enrollments (+ open catalog browsing).
// `hasCohortAccess` is true the moment they have ≥1 cohort module (own programme or
// cross-enrolled), so a pure OL student stays OL-only until they join a module.
export interface StudentAccess {
  /** Module ids the student can access as a cohort student (programme ∪ cross-enrolled). */
  cohortModuleIds: string[];
  /** Resolved module objects for `cohortModuleIds`. */
  cohortModules: Module[];
  /** True when the student has at least one cohort module. */
  hasCohortAccess: boolean;
  /** The student's OL enrollments. */
  olEnrollments: OLEnrollment[];
  /** True when the student has at least one OL enrollment. */
  hasOLAccess: boolean;
  /** True when the student belongs to a full degree programme (has a `programId`). */
  hasProgram: boolean;
}

export function useStudentAccess(): StudentAccess {
  const { currentUser, programs, modules, olEnrollments } = useStore();

  return useMemo(() => {
    const program = programs.find((p) => p.id === currentUser?.programId);
    // Programme modules come from the programme's semesters.
    const programModuleIds = new Set<string>();
    program?.semesters.forEach((s) => s.moduleIds.forEach((id) => programModuleIds.add(id)));
    // Cross-enrolled modules add cohort access even without a `programId`.
    (currentUser?.crossEnrolledModuleIds ?? []).forEach((id) => programModuleIds.add(id));

    const cohortModuleIds = [...programModuleIds];
    const cohortModules = modules.filter((m) => programModuleIds.has(m.id));
    const mine = olEnrollments.filter((e) => e.studentId === currentUser?.id);

    return {
      cohortModuleIds,
      cohortModules,
      hasCohortAccess: cohortModuleIds.length > 0,
      olEnrollments: mine,
      hasOLAccess: mine.length > 0,
      hasProgram: !!currentUser?.programId,
    };
  }, [currentUser, programs, modules, olEnrollments]);
}
