import type { Program, Role, User } from "@/lib/types";

// Unified student access helpers — Phase 1 foundation (no visible change yet).
// Staff answer "is this student ENROLLED in my module?" — never "is their role cohort-student?".

/** Both student entry-point roles count as students. */
export function isStudentRole(role: Role): boolean {
  return role === "cohort-student" || role === "ol-student";
}

/**
 * Every student enrolled in `moduleId`, whether via their programme's semesters or a
 * cross-enrollment — regardless of which student role they entered through. This is the
 * roster/gradebook source of truth once staff views move off the role filter.
 */
export function studentsInModule(users: User[], programs: Program[], moduleId: string): User[] {
  // Programmes whose semesters contain this module → their students are enrolled by programme.
  const programIdsWithModule = new Set(
    programs
      .filter((p) => p.semesters.some((s) => s.moduleIds.includes(moduleId)))
      .map((p) => p.id),
  );

  return users.filter((u) => {
    if (!isStudentRole(u.role)) return false;
    const byProgram = !!u.programId && programIdsWithModule.has(u.programId);
    const byCrossEnroll = !!u.crossEnrolledModuleIds?.includes(moduleId);
    return byProgram || byCrossEnroll;
  });
}
