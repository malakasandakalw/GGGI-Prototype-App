import type { Lecture } from "@/lib/types";

export const lectures: Lecture[] = [
  // CS201 Database Management Systems (main demo module) — 12 planned
  {
    id: "lec-201-1",
    moduleId: "m-cs201",
    title: "Introduction to Databases & DBMS",
    order: 1,
    lectureDate: "2026-02-03",
    description: "What is a database, DBMS architecture, data models and the relational model.",
    status: "published",
    createdByLecturerId: "u-lec1",
    resources: [
      { id: "r-1", lectureId: "lec-201-1", title: "Lecture 1 Slides", type: "slides", url: "#", isDownloadable: true, format: "PPTX" },
      { id: "r-2", lectureId: "lec-201-1", title: "Recording — Intro to DBMS", type: "video", url: "#", isDownloadable: false, format: "MP4" },
      { id: "r-3", lectureId: "lec-201-1", title: "Chapter 1 Reading", type: "reading", url: "#", isDownloadable: true, format: "PDF" },
    ],
  },
  {
    id: "lec-201-2",
    moduleId: "m-cs201",
    title: "The Relational Model & Keys",
    order: 2,
    lectureDate: "2026-02-10",
    description: "Relations, tuples, primary/foreign keys, integrity constraints.",
    status: "published",
    createdByLecturerId: "u-lec1",
    resources: [
      { id: "r-4", lectureId: "lec-201-2", title: "Lecture 2 Slides", type: "slides", url: "#", isDownloadable: true, format: "PPTX" },
      { id: "r-5", lectureId: "lec-201-2", title: "Recording", type: "video", url: "#", isDownloadable: false, format: "MP4" },
    ],
  },
  {
    id: "lec-201-3",
    moduleId: "m-cs201",
    title: "SQL Fundamentals — SELECT",
    order: 3,
    lectureDate: "2026-02-17",
    description: "SELECT, WHERE, ORDER BY, aggregate functions and GROUP BY.",
    status: "published",
    createdByLecturerId: "u-lec1",
    resources: [
      { id: "r-6", lectureId: "lec-201-3", title: "SQL Cheatsheet", type: "notes", url: "#", isDownloadable: true, format: "PDF" },
      { id: "r-7", lectureId: "lec-201-3", title: "Recording", type: "video", url: "#", isDownloadable: false, format: "MP4" },
    ],
  },
  {
    id: "lec-201-4",
    moduleId: "m-cs201",
    title: "Joins & Subqueries",
    order: 4,
    lectureDate: "2026-02-24",
    description: "INNER, LEFT, RIGHT joins and correlated subqueries.",
    status: "submitted",
    createdByLecturerId: "u-lec1",
    resources: [
      { id: "r-8", lectureId: "lec-201-4", title: "Lecture 4 Slides", type: "slides", url: "#", isDownloadable: true, format: "PPTX" },
      { id: "r-9", lectureId: "lec-201-4", title: "Joins worked examples", type: "notes", url: "#", isDownloadable: true, format: "PDF" },
    ],
  },
  {
    id: "lec-201-5",
    moduleId: "m-cs201",
    title: "Normalisation (1NF–3NF)",
    order: 5,
    lectureDate: "2026-03-03",
    description: "Functional dependencies and the normal forms.",
    status: "draft",
    hodFeedback:
      "Please add a worked example for BCNF and include the practice exercise sheet before resubmitting.",
    createdByLecturerId: "u-lec1",
    resources: [
      { id: "r-10", lectureId: "lec-201-5", title: "Normalisation Slides (draft)", type: "slides", url: "#", isDownloadable: true, format: "PPTX" },
    ],
  },
  // CS202 Web Dev
  {
    id: "lec-202-1",
    moduleId: "m-cs202",
    title: "HTML, CSS & the Box Model",
    order: 1,
    lectureDate: "2026-02-04",
    description: "Semantic HTML and responsive CSS fundamentals.",
    status: "published",
    createdByLecturerId: "u-lec2",
    resources: [
      { id: "r-11", lectureId: "lec-202-1", title: "Slides", type: "slides", url: "#", isDownloadable: true, format: "PPTX" },
    ],
  },
  {
    id: "lec-202-2",
    moduleId: "m-cs202",
    title: "JavaScript Essentials",
    order: 2,
    lectureDate: "2026-02-11",
    description: "Variables, functions, DOM manipulation and events.",
    status: "submitted",
    createdByLecturerId: "u-lec2",
    resources: [
      { id: "r-12", lectureId: "lec-202-2", title: "Slides", type: "slides", url: "#", isDownloadable: true, format: "PPTX" },
      { id: "r-13", lectureId: "lec-202-2", title: "Code samples", type: "file", url: "#", isDownloadable: true, format: "ZIP" },
    ],
  },
  // CS203
  {
    id: "lec-203-1",
    moduleId: "m-cs203",
    title: "Complexity Analysis & Big-O",
    order: 1,
    lectureDate: "2026-02-05",
    description: "Asymptotic notation and complexity classes.",
    status: "published",
    createdByLecturerId: "u-lec1",
    resources: [
      { id: "r-14", lectureId: "lec-203-1", title: "Slides", type: "slides", url: "#", isDownloadable: true, format: "PPTX" },
    ],
  },
];
