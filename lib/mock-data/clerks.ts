import type { Clerk } from "@/lib/types";

// Program clerks — application-management accounts created & managed by the Registrar.
export const clerks: Clerk[] = [
  { id: "clk-cs", name: "Dilani Gunawardena", email: "clerk.cs@lms.ac.lk", programId: "p-cs", status: "active", createdAt: "2026-02-05T08:00:00Z" },
  { id: "clk-it", name: "Tharindu Bandara", email: "clerk.it@lms.ac.lk", programId: "p-it", status: "active", createdAt: "2026-02-06T08:00:00Z" },
];
