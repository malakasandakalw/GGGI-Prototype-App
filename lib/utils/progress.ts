import type { Assignment, Lecture, Quiz, QuizSubmission, Submission } from "@/lib/types";

export interface ModuleProgress {
  percent: number;
  lectures: { done: number; total: number };
  assignments: { done: number; total: number };
  quizzes: { done: number; total: number };
}

/**
 * Computes a student's real completion for a module from lectures accessed,
 * assignments submitted, and quizzes attempted (SRS §5.11.2). Only published /
 * available items count toward the total.
 */
export function moduleProgress(
  moduleId: string,
  studentId: string,
  data: {
    lectures: Lecture[];
    assignments: Assignment[];
    quizzes: Quiz[];
    completedLectureIds: string[];
    submissions: Submission[];
    quizSubmissions: QuizSubmission[];
  },
): ModuleProgress {
  const lectures = data.lectures.filter((l) => l.moduleId === moduleId && l.status === "published");
  const assignments = data.assignments.filter((a) => a.moduleId === moduleId && a.status === "published");
  const quizzes = data.quizzes.filter((q) => q.moduleId === moduleId && (q.status === "active" || q.status === "closed"));

  const lecturesDone = lectures.filter((l) => data.completedLectureIds.includes(l.id)).length;
  const assignmentsDone = assignments.filter((a) =>
    data.submissions.some((s) => s.assignmentId === a.id && s.studentId === studentId),
  ).length;
  const quizzesDone = quizzes.filter((q) =>
    data.quizSubmissions.some((s) => s.quizId === q.id && s.studentId === studentId),
  ).length;

  const total = lectures.length + assignments.length + quizzes.length;
  const done = lecturesDone + assignmentsDone + quizzesDone;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return {
    percent,
    lectures: { done: lecturesDone, total: lectures.length },
    assignments: { done: assignmentsDone, total: assignments.length },
    quizzes: { done: quizzesDone, total: quizzes.length },
  };
}
