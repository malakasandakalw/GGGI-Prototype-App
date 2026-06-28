import type { NotificationTemplate } from "@/lib/types";

export const notificationTemplates: NotificationTemplate[] = [
  { id: "nt-1", event: "Application Received", body: "Dear {name}, we have received your application ({ref}). Our team will review it shortly." },
  { id: "nt-2", event: "Account Created", body: "Dear {name}, your account has been created. Your temporary password is {password}." },
  { id: "nt-3", event: "Lecture Published", body: "A new lecture '{title}' is now available in {module}." },
  { id: "nt-4", event: "Assignment Graded", body: "Your submission for '{assignment}' has been graded: {marks}/{max}." },
  { id: "nt-5", event: "Results Published", body: "Results for {module} have been published. Log in to view your grade." },
];

export const systemSettings = {
  maxFileSizeMb: 25,
  allowedFileTypes: [".pdf", ".docx", ".pptx", ".zip", ".png", ".jpg", ".sql"],
  sessionTimeoutMinutes: 60,
  requireReauthForAdmin: true,
  maintenanceMode: false,
  academicYear: "2026",
  semestersPerYear: 2,
  semesterDurationWeeks: 18,
};
