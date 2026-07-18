import type { CalendarEvent } from "@/lib/types";

// All seeded events fall in the 2026/2027 academic year.
const rawCalendarEvents: CalendarEvent[] = [
  { id: "ev-1", type: "semester", title: "Semester 2 Begins", date: "2026-02-01", programId: "p-cs", notes: "Year 1 Semester 2 commences." },
  { id: "ev-2", type: "deadline", title: "SQL Query Workshop Due", date: "2026-03-05", moduleId: "m-cs201" },
  { id: "ev-3", type: "deadline", title: "ER Diagram Design Due", date: "2026-06-29", moduleId: "m-cs201" },
  { id: "ev-4", type: "exam", title: "DBMS Final Examination", date: "2026-07-10", moduleId: "m-cs201", startTime: "09:00", endTime: "12:00", venue: "Hall A", durationHours: 3, notes: "Closed book." },
  { id: "ev-5", type: "exam", title: "Web Development Final Exam", date: "2026-07-12", moduleId: "m-cs202", startTime: "09:00", endTime: "11:00", venue: "Hall B", durationHours: 2 },
  { id: "ev-6", type: "quiz", title: "Quiz 1 Window — Relational Model", date: "2026-02-12", moduleId: "m-cs201" },
  { id: "ev-7", type: "holiday", title: "Poson Poya Holiday", date: "2026-06-30" },
  { id: "ev-8", type: "semester", title: "Semester 2 Ends", date: "2026-06-30", programId: "p-cs" },
  { id: "ev-9", type: "application", title: "2026 Intake Applications Close", date: "2026-08-31", programId: "p-cs" },
  { id: "ev-10", type: "exam", title: "Data Structures Final Exam", date: "2026-07-14", moduleId: "m-cs203", startTime: "13:00", endTime: "16:00", venue: "Hall A", durationHours: 3 },
];

export const calendarEvents: CalendarEvent[] = rawCalendarEvents.map((e) => ({
  academicYearId: "ay-2026",
  ...e,
}));
