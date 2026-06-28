// ============================================================================
// LMS Prototype — Core Types
// ============================================================================

export type Role =
  | "super-admin"
  | "program-admin"
  | "registrar"
  | "hod"
  | "lecturer"
  | "cohort-student"
  | "ol-student";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  department?: string;
  specialisation?: string;
  programIds?: string[];
  assignedModuleIds?: string[];
  // student-specific
  studentId?: string;
  programId?: string;
  intakeId?: string;
  currentSemesterId?: string;
  lastLogin?: string;
  crossEnrolledModuleIds?: string[];
  completedLectureIds?: string[];
  tempPassword?: string;
}

// Programs & Academic Structure
export type ProgramStatus = "draft" | "submitted" | "approved" | "active" | "archived";
export type ProgramLevel = "certificate" | "diploma" | "hnd" | "degree" | "postgraduate";

export interface Program {
  id: string;
  name: string;
  code: string;
  description: string;
  level: ProgramLevel;
  durationYears: number;
  totalCredits: number;
  department: string;
  hodId: string;
  status: ProgramStatus;
  semesters: Semester[];
  entryRequirements: string;
  hodComments?: string;
}

export interface Semester {
  id: string;
  programId: string;
  name: string;
  year: number;
  semesterNumber: number;
  startDate: string;
  endDate: string;
  status: "upcoming" | "active" | "completed";
  moduleIds: string[];
}

export interface Intake {
  id: string;
  programId: string;
  label: string;
  applicationOpenDate: string;
  applicationCloseDate: string;
  maxCapacity?: number;
  academicStartDate: string;
  status: "draft" | "open" | "closed" | "completed";
  enrolledStudentIds: string[];
}

// Modules
export type ModuleStatus = "draft" | "active" | "archived";

export interface Module {
  id: string;
  code: string;
  name: string;
  programId: string;
  semesterId: string;
  creditValue: number;
  learningOutcomes: string;
  prerequisiteModuleIds: string[];
  assessmentBreakdown: {
    assignments: number;
    quizzes: number;
    finalExam: number;
  };
  primaryLecturerId: string;
  lecturerIds: string[];
  status: ModuleStatus;
  isShared: boolean;
  isCrossStreamEnabled: boolean;
}

// Lectures
export type LectureStatus = "draft" | "submitted" | "verified" | "published" | "archived";

export interface Resource {
  id: string;
  lectureId: string;
  title: string;
  type: "video" | "slides" | "notes" | "reading" | "file";
  url: string;
  isDownloadable: boolean;
  format: string;
}

export interface Lecture {
  id: string;
  moduleId: string;
  title: string;
  order: number;
  lectureDate: string;
  description: string;
  status: LectureStatus;
  hodFeedback?: string;
  scheduledPublishDate?: string;
  resources: Resource[];
  createdByLecturerId: string;
}

// Applications
export type ApplicationStatus =
  | "submitted"
  | "under-review"
  | "payment-pending"
  | "payment-confirmed"
  | "enrolled"
  | "rejected"
  | "waitlisted";

export interface ApplicationStatusEvent {
  status: ApplicationStatus;
  date: string;
  note?: string;
}

export interface Application {
  id: string;
  referenceNumber: string;
  applicantName: string;
  email: string;
  phone: string;
  nic: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  programId: string;
  qualifications: string;
  documents: string[];
  status: ApplicationStatus;
  submittedAt: string;
  registrarNotes: string;
  paymentReference?: string;
  paymentConfirmedAt?: string;
  history: ApplicationStatusEvent[];
}

// Quizzes
export type QuestionType =
  | "mcq-single"
  | "mcq-multi"
  | "true-false"
  | "short-answer"
  | "fill-blank";
export type QuizStatus = "draft" | "submitted" | "verified" | "active" | "closed";

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  imageUrl?: string;
  options?: string[];
  correctAnswer: string | string[];
  marks: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  moduleId: string;
  lectureId?: string;
  title: string;
  instructions: string;
  questions: Question[];
  totalMarks: number;
  timeLimitMinutes?: number;
  availableFrom: string;
  availableTo: string;
  allowedAttempts: number;
  randomiseOrder: boolean;
  showAnswersAfter: boolean;
  status: QuizStatus;
  hodFeedback?: string;
  createdByLecturerId: string;
  submittedAt?: string;
  verifiedAt?: string;
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  studentId: string;
  attemptedAt: string;
  answers: Record<string, string | string[]>;
  autoScore: number;
  manualMarks: Record<string, number>;
  finalScore: number;
  manualReviewPending: boolean;
}

// Assignments
export type AssignmentStatus = "draft" | "published" | "closed";

export interface Assignment {
  id: string;
  moduleId: string;
  lectureId?: string;
  title: string;
  description: string;
  maxMarks: number;
  submissionType: "file" | "text" | "both";
  allowedFileTypes: string[];
  openDate: string;
  dueDate: string;
  status: AssignmentStatus;
  createdByLecturerId: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  submittedAt: string;
  fileUrl?: string;
  fileName?: string;
  textContent?: string;
  marks?: number;
  feedback?: string;
  gradingStatus: "not-submitted" | "submitted" | "graded";
}

// Grades
export interface ModuleGrade {
  studentId: string;
  moduleId: string;
  assignmentMarks: number;
  quizMarks: number;
  finalExamMark: number;
  weightedTotal: number;
  grade: string;
  gradePoint: number;
  specialCode?: "I" | "N" | "W" | "AB";
  published: boolean;
}

// Cross-Enrollment
export type CrossEnrollmentType = "cohort-to-cohort" | "ol-to-cohort" | "cohort-to-ol";
export type CrossEnrollmentStatus = "pending" | "payment-pending" | "approved" | "rejected";

export interface CrossEnrollmentRequest {
  id: string;
  studentId: string;
  studentName: string;
  type: CrossEnrollmentType;
  targetModuleId?: string;
  targetCourseId?: string;
  reason: string;
  status: CrossEnrollmentStatus;
  requestedAt: string;
  registrarNotes?: string;
  paymentStatus?: "pending" | "confirmed";
}

// Open Learning
export interface OLCourse {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedHours: number;
  pricing: "free" | "paid";
  price?: number;
  prerequisitesText: string;
  lecturerId: string;
  hodId: string;
  status: "draft" | "published" | "archived";
  sections: OLSection[];
  minimumPassScore: number;
  whatYouLearn: string[];
  rating: number;
}

export interface OLSection {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessons: OLLesson[];
}

export interface OLLesson {
  id: string;
  sectionId: string;
  title: string;
  order: number;
  resources: Resource[];
  quizId?: string;
  assignmentId?: string;
  isSequential: boolean;
}

export interface OLEnrollment {
  studentId: string;
  courseId: string;
  enrolledAt: string;
  completedLessonIds: string[];
  completionPercentage: number;
  certificateIssued: boolean;
  certificateId?: string;
}

// Notifications
export type NotificationType =
  | "application"
  | "lecture"
  | "quiz"
  | "assignment"
  | "grade"
  | "enrollment"
  | "announcement"
  | "system";

export interface Notification {
  id: string;
  recipientId: string;
  title: string;
  body: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  linkTo?: string;
}

// Audit
export interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: Role;
  action: string;
  details: string;
  ipAddress: string;
}

// Calendar
export type CalendarEventType =
  | "semester"
  | "exam"
  | "deadline"
  | "holiday"
  | "application"
  | "quiz";

export interface CalendarEvent {
  id: string;
  type: CalendarEventType;
  title: string;
  date: string;
  programId?: string;
  moduleId?: string;
  startTime?: string;
  endTime?: string;
  venue?: string;
  durationHours?: number;
  notes?: string;
}

// Announcements
export interface Announcement {
  id: string;
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  target: string; // program id, module id, or "all"
  moduleId?: string;
  createdAt: string;
}

// Discussion
export interface DiscussionReply {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  body: string;
  createdAt: string;
}

export interface DiscussionThread {
  id: string;
  moduleId: string;
  title: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  body: string;
  createdAt: string;
  replies: DiscussionReply[];
  resolved: boolean;
}

// Grading scheme
export interface GradeBand {
  grade: string;
  minMark: number;
  gradePoint: number;
}

// Notification template
export interface NotificationTemplate {
  id: string;
  event: string;
  body: string;
}

// Nav
import type { LucideIcon } from "lucide-react";
export interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: "pending-lectures" | "pending-quizzes";
}
