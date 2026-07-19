"use client";

import { EscalationsPanel } from "@/components/shared/EscalationsPanel";
import { useStore } from "@/lib/store/provider";

export default function LecturerEscalations() {
  const { currentUser, users, programs, modules } = useStore();
  const dept = currentUser?.department;
  // Escalate to the HOD(s) of the lecturer's department.
  const hods = users
    .filter((u) => u.role === "hod" && u.department === dept)
    .map((u) => ({ id: u.id, name: u.name }));
  // Programmes the lecturer actually teaches into.
  const myModuleProgramIds = new Set(
    modules.filter((m) => m.lecturerIds.includes(currentUser?.id ?? "")).map((m) => m.programId),
  );
  const myPrograms = programs
    .filter((p) => myModuleProgramIds.has(p.id) || p.department === dept)
    .map((p) => ({ id: p.id, name: p.name }));

  return (
    <EscalationsPanel
      description="Raise a dispute about your HOD to the Program Admin, and track its resolution."
      candidateLabel="Head of Department"
      candidates={hods}
      programs={myPrograms}
    />
  );
}
