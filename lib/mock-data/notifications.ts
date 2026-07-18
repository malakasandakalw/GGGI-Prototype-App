import type { Notification } from "@/lib/types";

export const notifications: Notification[] = [
  { id: "n-1", recipientId: "u-reg", title: "New application received", body: "Menaka Ratnayake applied for BSc Computer Science (APP-2026-0001).", type: "application", read: false, createdAt: "2026-06-26T09:15:00Z", linkTo: "/registrar/applications/app-1" },
  { id: "n-2", recipientId: "u-reg", title: "Cross-enrollment request", body: "Roshan Perera (OL) requested access to Database Management Systems.", type: "enrollment", read: false, createdAt: "2026-06-25T10:00:00Z", linkTo: "/registrar/cross-enrollment" },
  { id: "n-6", recipientId: "u-st1", title: "New lecture published", body: "SQL Fundamentals — SELECT is now available in Database Management Systems.", type: "lecture", read: false, createdAt: "2026-02-17T09:00:00Z", linkTo: "/cohort-student/modules/m-cs201" },
  { id: "n-7", recipientId: "u-st1", title: "Assignment graded", body: "Your SQL Query Workshop submission was graded: 82/100.", type: "grade", read: true, createdAt: "2026-03-08T10:00:00Z", linkTo: "/cohort-student/grades" },
  { id: "n-8", recipientId: "u-st1", title: "Assignment due soon", body: "ER Diagram Design is due in 1 day.", type: "assignment", read: false, createdAt: "2026-06-28T08:00:00Z", linkTo: "/cohort-student/modules/m-cs201" },
  { id: "n-9", recipientId: "u-ol1", title: "Certificate issued", body: "Congratulations! You earned a certificate for Digital Marketing Essentials.", type: "grade", read: true, createdAt: "2025-10-20T10:00:00Z", linkTo: "/ol-student/certificates" },
  { id: "n-10", recipientId: "u-pa", title: "Program submitted for review", body: "Diploma in Business Management was submitted by Dr. Kumari Bandara.", type: "system", read: false, createdAt: "2026-06-22T11:00:00Z", linkTo: "/program-admin/programs" },
];
