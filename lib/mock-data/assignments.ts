import type { Assignment, Submission } from "@/lib/types";

export const assignments: Assignment[] = [
  {
    id: "as-201-1",
    moduleId: "m-cs201",
    lectureId: "lec-201-3",
    title: "SQL Query Workshop",
    description:
      "Write SQL queries answering 10 business questions against the supplied sample schema. Submit a single .sql file.",
    maxMarks: 100,
    submissionType: "file",
    allowedFileTypes: [".sql", ".txt"],
    openDate: "2026-02-18T09:00",
    dueDate: "2026-03-05T23:59",
    status: "published",
    createdByLecturerId: "u-lec1",
  },
  {
    id: "as-201-2",
    moduleId: "m-cs201",
    title: "ER Diagram Design",
    description:
      "Design an entity-relationship diagram for the case study and provide the relational mapping.",
    maxMarks: 100,
    submissionType: "both",
    allowedFileTypes: [".pdf", ".png"],
    openDate: "2026-03-10T09:00",
    dueDate: "2026-06-29T23:59",
    status: "published",
    createdByLecturerId: "u-lec1",
  },
  {
    id: "as-202-1",
    moduleId: "m-cs202",
    title: "Personal Portfolio Site",
    description: "Build a responsive portfolio website and submit the source as a zip.",
    maxMarks: 100,
    submissionType: "file",
    allowedFileTypes: [".zip"],
    openDate: "2026-02-12T09:00",
    dueDate: "2026-03-15T23:59",
    status: "published",
    createdByLecturerId: "u-lec2",
  },
  {
    id: "ol-as-1",
    moduleId: "ol-1",
    title: "Low-Fidelity Wireframe Exercise",
    description: "Sketch a low-fidelity wireframe for a simple mobile app screen and upload it as a PDF or image.",
    maxMarks: 50,
    submissionType: "both",
    allowedFileTypes: [".pdf", ".png", ".jpg"],
    maxFileSizeMb: 10,
    openDate: "2026-06-01T09:00",
    dueDate: "2026-12-20T23:59",
    status: "published",
    createdByLecturerId: "u-lec2",
  },
];

export const submissions: Submission[] = [
  // as-201-1: graded + submitted mix across students
  { id: "sub-1", assignmentId: "as-201-1", studentId: "u-st1", submittedAt: "2026-03-04T20:00:00Z", fileName: "kasun_queries.sql", fileUrl: "#", marks: 82, feedback: "Strong joins, watch your GROUP BY aliases.", gradingStatus: "graded" },
  { id: "sub-2", assignmentId: "as-201-1", studentId: "u-st2", submittedAt: "2026-03-05T18:30:00Z", fileName: "tharushi_queries.sql", fileUrl: "#", marks: 91, feedback: "Excellent work.", gradingStatus: "graded" },
  { id: "sub-3", assignmentId: "as-201-1", studentId: "u-st3", submittedAt: "2026-03-05T22:10:00Z", fileName: "dinuka_queries.sql", fileUrl: "#", gradingStatus: "submitted" },
  { id: "sub-4", assignmentId: "as-201-1", studentId: "u-st4", submittedAt: "2026-03-03T11:00:00Z", fileName: "hashini_queries.sql", fileUrl: "#", gradingStatus: "submitted" },
  // u-st5 did not submit (handled at runtime as not-submitted)
];
