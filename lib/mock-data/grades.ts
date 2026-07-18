import type { ModuleGrade } from "@/lib/types";

// Semester 1 (completed, published) + Semester 2 (in progress, CA entered, final exam pending)
export const moduleGrades: ModuleGrade[] = [
  // --- m-cs101 (published) ---
  { studentId: "u-st1", moduleId: "m-cs101", assignmentMarks: 78, quizMarks: 80, finalExamMark: 72, weightedTotal: 75, grade: "A", gradePoint: 4.0, published: true },
  { studentId: "u-st2", moduleId: "m-cs101", assignmentMarks: 88, quizMarks: 90, finalExamMark: 86, weightedTotal: 87, grade: "A+", gradePoint: 4.0, published: true },
  { studentId: "u-st3", moduleId: "m-cs101", assignmentMarks: 55, quizMarks: 60, finalExamMark: 48, weightedTotal: 52, grade: "C+", gradePoint: 2.3, published: true },
  { studentId: "u-st4", moduleId: "m-cs101", assignmentMarks: 65, quizMarks: 70, finalExamMark: 62, weightedTotal: 64, grade: "B", gradePoint: 3.0, published: true },
  { studentId: "u-st5", moduleId: "m-cs101", assignmentMarks: 40, quizMarks: 35, finalExamMark: 30, weightedTotal: 35, grade: "D", gradePoint: 1.0, published: true },
  // --- m-cs102 (published) ---
  { studentId: "u-st1", moduleId: "m-cs102", assignmentMarks: 70, quizMarks: 75, finalExamMark: 68, weightedTotal: 70, grade: "A-", gradePoint: 3.7, published: true },
  { studentId: "u-st2", moduleId: "m-cs102", assignmentMarks: 82, quizMarks: 85, finalExamMark: 80, weightedTotal: 81, grade: "A", gradePoint: 4.0, published: true },
  { studentId: "u-st3", moduleId: "m-cs102", assignmentMarks: 50, quizMarks: 55, finalExamMark: 45, weightedTotal: 49, grade: "C", gradePoint: 2.0, published: true },
  { studentId: "u-st4", moduleId: "m-cs102", assignmentMarks: 60, quizMarks: 62, finalExamMark: 58, weightedTotal: 59, grade: "B-", gradePoint: 2.7, published: true },
  { studentId: "u-st5", moduleId: "m-cs102", assignmentMarks: 38, quizMarks: 30, finalExamMark: 25, weightedTotal: 30, grade: "F", gradePoint: 0.0, published: true },
  // --- m-cs201 (in progress, CA entered, final exam not yet) ---
  { studentId: "u-st1", moduleId: "m-cs201", assignmentMarks: 82, quizMarks: 70, finalExamMark: 0, weightedTotal: 0, grade: "—", gradePoint: 0, published: false },
  { studentId: "u-st2", moduleId: "m-cs201", assignmentMarks: 91, quizMarks: 88, finalExamMark: 0, weightedTotal: 0, grade: "—", gradePoint: 0, published: false },
  { studentId: "u-st3", moduleId: "m-cs201", assignmentMarks: 60, quizMarks: 50, finalExamMark: 0, weightedTotal: 0, grade: "—", gradePoint: 0, published: false },
  { studentId: "u-st4", moduleId: "m-cs201", assignmentMarks: 68, quizMarks: 40, finalExamMark: 0, weightedTotal: 0, grade: "—", gradePoint: 0, published: false },
  { studentId: "u-st5", moduleId: "m-cs201", assignmentMarks: 35, quizMarks: 30, finalExamMark: 0, weightedTotal: 0, grade: "—", gradePoint: 0, published: false },
  // --- m-cs202 (Web Application Development — published, 2026 semester) ---
  { studentId: "u-st1", moduleId: "m-cs202", assignmentMarks: 80, quizMarks: 78, finalExamMark: 74, weightedTotal: 76, grade: "A", gradePoint: 4.0, published: true },
  { studentId: "u-st2", moduleId: "m-cs202", assignmentMarks: 92, quizMarks: 88, finalExamMark: 89, weightedTotal: 90, grade: "A+", gradePoint: 4.0, published: true },
  { studentId: "u-st3", moduleId: "m-cs202", assignmentMarks: 54, quizMarks: 58, finalExamMark: 49, weightedTotal: 52, grade: "C", gradePoint: 2.0, published: true },
  { studentId: "u-st4", moduleId: "m-cs202", assignmentMarks: 66, quizMarks: 70, finalExamMark: 62, weightedTotal: 65, grade: "B", gradePoint: 3.0, published: true },
  { studentId: "u-st5", moduleId: "m-cs202", assignmentMarks: 34, quizMarks: 30, finalExamMark: 28, weightedTotal: 32, grade: "F", gradePoint: 0.0, published: true },
  // --- m-cs203 (Data Structures & Algorithms — published, 2026 semester) ---
  { studentId: "u-st1", moduleId: "m-cs203", assignmentMarks: 74, quizMarks: 76, finalExamMark: 70, weightedTotal: 72, grade: "A-", gradePoint: 3.7, published: true },
  { studentId: "u-st2", moduleId: "m-cs203", assignmentMarks: 86, quizMarks: 84, finalExamMark: 83, weightedTotal: 84, grade: "A", gradePoint: 4.0, published: true },
  { studentId: "u-st3", moduleId: "m-cs203", assignmentMarks: 57, quizMarks: 60, finalExamMark: 53, weightedTotal: 55, grade: "C+", gradePoint: 2.3, published: true },
  { studentId: "u-st4", moduleId: "m-cs203", assignmentMarks: 61, quizMarks: 58, finalExamMark: 60, weightedTotal: 60, grade: "B-", gradePoint: 2.7, published: true },
  { studentId: "u-st5", moduleId: "m-cs203", assignmentMarks: 40, quizMarks: 36, finalExamMark: 37, weightedTotal: 38, grade: "D", gradePoint: 1.0, published: true },
  // --- m-it101 (Networking Fundamentals — published, 2026 semester, HND IT) ---
  { studentId: "u-st6", moduleId: "m-it101", assignmentMarks: 70, quizMarks: 66, finalExamMark: 67, weightedTotal: 68, grade: "B+", gradePoint: 3.3, published: true },
  { studentId: "u-st7", moduleId: "m-it101", assignmentMarks: 52, quizMarks: 50, finalExamMark: 51, weightedTotal: 51, grade: "C", gradePoint: 2.0, published: true },
  { studentId: "u-st8", moduleId: "m-it101", assignmentMarks: 76, quizMarks: 72, finalExamMark: 73, weightedTotal: 74, grade: "A-", gradePoint: 3.7, published: true },
];
