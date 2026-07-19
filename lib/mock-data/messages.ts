import type { DirectMessage } from "@/lib/types";

// Module-scoped 1:1 threads between a lecturer and a student. Seeded so both the lecturer
// inbox and the student inbox open onto an existing conversation.
export const directMessages: DirectMessage[] = [
  {
    id: "dm-1",
    moduleId: "m-cs201",
    lecturerId: "u-lec1",
    studentId: "u-st1",
    from: "student",
    text: "Hello, I have a question about the SQL assignment — is the deadline firm?",
    at: "2026-06-30T10:12:00Z",
  },
  {
    id: "dm-2",
    moduleId: "m-cs201",
    lecturerId: "u-lec1",
    studentId: "u-st1",
    from: "lecturer",
    text: "Hi Kasun — the deadline is firm, but reach out if you hit a blocker and we'll talk.",
    at: "2026-06-30T11:40:00Z",
  },
];
