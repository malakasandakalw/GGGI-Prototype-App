import type { Escalation } from "@/lib/types";

// Disputes routed to the Program Admin. Raised by real HOD/Lecturer accounts so the
// counter-party notifications resolve to actual users.
export const escalations: Escalation[] = [
  {
    id: "esc-1",
    title: "Disagreement over lecture publishing timeline",
    raisedById: "u-hod",
    raisedByName: "Dr. Ravindra Mendis",
    raisedByRole: "hod",
    againstId: "u-lec1",
    againstName: "Dr. Priyanka Silva",
    programId: "p-cs",
    program: "BSc (Hons) Computer Science",
    detail:
      "Repeated delays in publishing lecture content are leaving students without materials on time.",
    raisedAt: "2026-06-24T09:00:00Z",
    status: "open",
  },
  {
    id: "esc-2",
    title: "Assessment weighting dispute for CS201",
    raisedById: "u-lec2",
    raisedByName: "Ms. Dilani Perera",
    raisedByRole: "lecturer",
    againstId: "u-hod",
    againstName: "Dr. Ravindra Mendis",
    programId: "p-cs",
    program: "BSc (Hons) Computer Science",
    detail:
      "Requesting review of the assignment/quiz split imposed for the module against the approved breakdown.",
    raisedAt: "2026-06-19T11:00:00Z",
    status: "open",
  },
  {
    id: "esc-3",
    title: "Shared module ownership clarification",
    raisedById: "u-hod2",
    raisedByName: "Dr. Kumari Bandara",
    raisedByRole: "hod",
    againstId: "u-lec1",
    againstName: "Dr. Priyanka Silva",
    programId: "p-bus",
    program: "Diploma in Business Management",
    detail: "Question over who is responsible for grading a cross-stream shared module.",
    raisedAt: "2026-06-10T09:00:00Z",
    status: "resolved",
    resolvedById: "u-pa",
    resolvedAt: "2026-06-12T09:00:00Z",
    resolution:
      "Confirmed the primary lecturer owns grading; secondary lecturer supports content only.",
  },
];
