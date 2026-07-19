"use client";

import { EscalationsPanel } from "@/components/shared/EscalationsPanel";
import { useStore } from "@/lib/store/provider";

export default function HODEscalations() {
  const { currentUser, users, programs } = useStore();
  const dept = currentUser?.department;
  const lecturers = users
    .filter((u) => u.role === "lecturer" && u.department === dept)
    .map((u) => ({ id: u.id, name: u.name }));
  const myPrograms = programs
    .filter((p) => (currentUser?.programIds ?? []).includes(p.id) || p.department === dept)
    .map((p) => ({ id: p.id, name: p.name }));

  return (
    <EscalationsPanel
      description="Raise a dispute about a lecturer to the Program Admin, and track its resolution."
      candidateLabel="Lecturer"
      candidates={lecturers}
      programs={myPrograms}
    />
  );
}
