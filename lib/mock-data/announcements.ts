import type { Announcement, DiscussionThread } from "@/lib/types";

export const announcements: Announcement[] = [
  {
    id: "ann-1",
    title: "Welcome to Semester 2!",
    body: "Welcome back everyone. Please review the updated module handbooks available in each module page. Office hours resume next week.",
    authorId: "u-pa",
    authorName: "Nimal Fernando",
    authorRole: "program-admin",
    target: "p-cs",
    createdAt: "2026-02-01T08:00:00Z",
  },
  {
    id: "ann-2",
    title: "DBMS — Lab session rescheduled",
    body: "This week's lab has been moved to Friday 2pm in Lab 4. Bring your laptops with PostgreSQL installed.",
    authorId: "u-lec1",
    authorName: "Dr. Priyanka Silva",
    authorRole: "lecturer",
    target: "m-cs201",
    moduleId: "m-cs201",
    createdAt: "2026-06-20T09:00:00Z",
  },
  {
    id: "ann-3",
    title: "Final Examination Timetable Released",
    body: "The semester 2 final examination timetable is now published in the Exam Calendar. Please check your venues carefully.",
    authorId: "u-hod",
    authorName: "Dr. Ravindra Mendis",
    authorRole: "hod",
    target: "p-cs",
    createdAt: "2026-06-15T10:00:00Z",
  },
];

export const discussionThreads: DiscussionThread[] = [
  {
    id: "dt-1",
    moduleId: "m-cs201",
    title: "Confused about the difference between LEFT and RIGHT JOIN",
    authorId: "u-st3",
    authorName: "Dinuka Bandara",
    authorRole: "cohort-student",
    body: "Can someone explain when I'd actually use a RIGHT JOIN instead of just swapping the tables in a LEFT JOIN?",
    createdAt: "2026-06-22T14:00:00Z",
    resolved: false,
    replies: [
      {
        id: "dr-1",
        authorId: "u-st2",
        authorName: "Tharushi Wijesinghe",
        authorRole: "cohort-student",
        body: "They're logically equivalent if you swap the order — most people just use LEFT JOIN for readability.",
        createdAt: "2026-06-22T15:00:00Z",
      },
    ],
  },
  {
    id: "dt-2",
    moduleId: "m-cs201",
    title: "Is normalisation in the final exam?",
    authorId: "u-st1",
    authorName: "Kasun Rajapaksa",
    authorRole: "cohort-student",
    body: "Will BCNF be tested in the final?",
    createdAt: "2026-06-25T10:00:00Z",
    resolved: true,
    replies: [
      {
        id: "dr-2",
        authorId: "u-lec1",
        authorName: "Dr. Priyanka Silva",
        authorRole: "lecturer",
        body: "Yes, up to and including BCNF. A worked example will be covered once the normalisation lecture is published.",
        createdAt: "2026-06-25T11:00:00Z",
      },
    ],
  },
];
