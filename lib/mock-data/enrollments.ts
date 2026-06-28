import type { CrossEnrollmentRequest } from "@/lib/types";

export const crossEnrollmentRequests: CrossEnrollmentRequest[] = [
  {
    id: "ce-1",
    studentId: "u-ol2",
    studentName: "Roshan Perera",
    type: "ol-to-cohort",
    targetModuleId: "m-cs201",
    reason: "I work as a junior developer and want formal database credit from the CS programme.",
    status: "pending",
    requestedAt: "2026-06-25T10:00:00Z",
    paymentStatus: "pending",
  },
  {
    id: "ce-2",
    studentId: "u-st3",
    studentName: "Dinuka Bandara",
    type: "cohort-to-cohort",
    targetModuleId: "m-cs202",
    reason: "I want to take Web Development as an elective alongside my core modules.",
    status: "pending",
    requestedAt: "2026-06-24T15:30:00Z",
    paymentStatus: "pending",
  },
  {
    id: "ce-3",
    studentId: "u-st1",
    studentName: "Kasun Rajapaksa",
    type: "cohort-to-ol",
    targetCourseId: "ol-1",
    reason: "Interested in the UX design short course.",
    status: "approved",
    requestedAt: "2026-05-10T09:00:00Z",
    registrarNotes: "Free course — auto approved.",
    paymentStatus: "confirmed",
  },
];
