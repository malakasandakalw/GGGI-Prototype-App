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
];
