"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as mock from "@/lib/mock-data";
import { DEFAULT_GRADE_BANDS, markToGrade, weightedTotal } from "@/lib/utils/grading";
import type {
  AcademicYear,
  Announcement,
  Application,
  Assignment,
  AuditEvent,
  CalendarEvent,
  Clerk,
  CrossEnrollmentRequest,
  DiscussionReply,
  DiscussionThread,
  GradeBand,
  Intake,
  Lecture,
  Module,
  ModuleGrade,
  Notification,
  NotificationTemplate,
  OLCourse,
  OLEnrollment,
  Program,
  Question,
  Quiz,
  QuizSubmission,
  Resource,
  Role,
  Submission,
  User,
} from "@/lib/types";

const uid = (p = "id") => `${p}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;

interface StoreValue {
  // auth
  currentUser: User | null;
  currentRole: Role | null;
  login: (role: Role) => void;
  logout: () => void;

  // academic year (real-world calendar scope, e.g. "2026/2027")
  academicYears: AcademicYear[];
  activeAcademicYearId: string;
  activeAcademicYear: AcademicYear | null;
  setActiveAcademicYear: (id: string) => void;
  /** Resolve the academic year a semester belongs to. */
  academicYearIdOfSemester: (semesterId: string) => string | undefined;
  /** Resolve the academic year a module is offered in (module → semester → year). */
  academicYearIdOfModule: (moduleId: string) => string | undefined;

  // collections
  users: User[];
  clerks: Clerk[];
  programs: Program[];
  intakes: Intake[];
  modules: Module[];
  lectures: Lecture[];
  assignments: Assignment[];
  submissions: Submission[];
  quizzes: Quiz[];
  quizSubmissions: QuizSubmission[];
  applications: Application[];
  crossEnrollments: CrossEnrollmentRequest[];
  moduleGrades: ModuleGrade[];
  olCourses: OLCourse[];
  olEnrollments: OLEnrollment[];
  olCategories: string[];
  notifications: Notification[];
  auditEvents: AuditEvent[];
  calendarEvents: CalendarEvent[];
  announcements: Announcement[];
  discussions: DiscussionThread[];
  gradeBands: GradeBand[];
  notificationTemplates: NotificationTemplate[];
  systemSettings: typeof mock.systemSettings;

  // users
  addUser: (u: Partial<User> & { name: string; email: string; role: Role }) => User;
  updateUser: (id: string, patch: Partial<User>) => void;
  markLectureComplete: (studentId: string, lectureId: string) => void;

  // program clerks (Registrar-managed application-management accounts)
  addClerk: (c: Partial<Clerk> & { name: string; email: string; programId: string }) => Clerk;
  updateClerk: (id: string, patch: Partial<Clerk>) => void;

  // programs
  addProgram: (p: Partial<Program> & { name: string; code: string }) => Program;
  updateProgram: (id: string, patch: Partial<Program>) => void;
  addSemesterToProgram: (programId: string, semester: Program["semesters"][number]) => void;
  addIntake: (i: Partial<Intake> & { programId: string; label: string }) => Intake;
  updateIntake: (id: string, patch: Partial<Intake>) => void;
  addModule: (m: Partial<Module> & { code: string; name: string; programId: string; semesterId: string }) => Module;
  updateModule: (id: string, patch: Partial<Module>) => void;

  // lectures
  addLecture: (l: Partial<Lecture> & { moduleId: string; title: string }) => Lecture;
  updateLecture: (id: string, patch: Partial<Lecture>) => void;
  addResource: (lectureId: string, r: Partial<Resource> & { title: string; type: Resource["type"] }) => void;

  // quizzes
  addQuiz: (q: Partial<Quiz> & { moduleId: string; title: string; questions: Question[] }) => Quiz;
  updateQuiz: (id: string, patch: Partial<Quiz>) => void;
  addQuizSubmission: (s: QuizSubmission) => void;
  updateQuizSubmission: (id: string, patch: Partial<QuizSubmission>) => void;

  // assignments
  addAssignment: (a: Partial<Assignment> & { moduleId: string; title: string }) => Assignment;
  upsertSubmission: (s: Partial<Submission> & { assignmentId: string; studentId: string }) => void;

  // applications
  addApplication: (a: Partial<Application> & { applicantName: string; programId: string }) => Application;
  updateApplication: (id: string, patch: Partial<Application>, statusNote?: string) => void;
  /** Simulate emailing a payment reminder to an applicant awaiting payment. */
  sendPaymentReminder: (applicationId: string) => void;

  // cross enrollment
  addCrossEnrollment: (r: Partial<CrossEnrollmentRequest> & { studentId: string; studentName: string; type: CrossEnrollmentRequest["type"] }) => void;
  updateCrossEnrollment: (id: string, patch: Partial<CrossEnrollmentRequest>) => void;

  // grades
  updateGrade: (studentId: string, moduleId: string, patch: Partial<ModuleGrade>) => void;
  publishResults: (moduleId: string) => void;
  caSubmittedModuleIds: string[];
  submitModuleCA: (moduleId: string) => void;

  // OL
  addOLCourse: (c: Partial<OLCourse> & { title: string }) => OLCourse;
  updateOLCourse: (id: string, patch: Partial<OLCourse>) => void;
  enrollOL: (studentId: string, courseId: string) => void;
  completeOLLesson: (studentId: string, courseId: string, lessonId: string) => void;
  addOLCategory: (c: string) => void;
  removeOLCategory: (c: string) => void;

  // notifications
  addNotification: (n: Partial<Notification> & { recipientId: string; title: string; body: string; type: Notification["type"] }) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (recipientId: string) => void;

  // audit
  addAudit: (a: Partial<AuditEvent> & { action: string; details: string }) => void;

  // calendar
  addCalendarEvent: (e: Partial<CalendarEvent> & { title: string; date: string; type: CalendarEvent["type"] }) => void;
  updateCalendarEvent: (id: string, patch: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;

  // announcements
  addAnnouncement: (a: Partial<Announcement> & { title: string; body: string }) => void;

  // discussions
  addThread: (t: Partial<DiscussionThread> & { moduleId: string; title: string; body: string }) => void;
  addReply: (threadId: string, body: string) => void;
  resolveThread: (threadId: string) => void;
  deleteThread: (threadId: string) => void;

  // settings
  setGradeBands: (b: GradeBand[]) => void;
  setNotificationTemplates: (t: NotificationTemplate[]) => void;
  setSystemSettings: (s: Partial<typeof mock.systemSettings>) => void;
}

const Ctx = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>(mock.users);
  const [clerks, setClerks] = useState<Clerk[]>(mock.clerks);
  const currentUser = users.find((u) => u.id === currentUserId) ?? null;
  const [academicYears] = useState<AcademicYear[]>(mock.academicYears);
  const [activeAcademicYearId, setActiveAcademicYearId] = useState<string>(mock.currentAcademicYearId);
  const [programs, setPrograms] = useState<Program[]>(mock.programs);
  const [intakes, setIntakes] = useState<Intake[]>(mock.intakes);
  const [modules, setModules] = useState<Module[]>(mock.modules);
  const [lectures, setLectures] = useState<Lecture[]>(mock.lectures);
  const [assignments, setAssignments] = useState<Assignment[]>(mock.assignments);
  const [submissions, setSubmissions] = useState<Submission[]>(mock.submissions);
  const [quizzes, setQuizzes] = useState<Quiz[]>(mock.quizzes);
  const [quizSubmissions, setQuizSubmissions] = useState<QuizSubmission[]>(mock.quizSubmissions);
  const [applications, setApplications] = useState<Application[]>(mock.applications);
  const [crossEnrollments, setCrossEnrollments] = useState<CrossEnrollmentRequest[]>(mock.crossEnrollmentRequests);
  const [moduleGrades, setModuleGrades] = useState<ModuleGrade[]>(mock.moduleGrades);
  const [caSubmittedModuleIds, setCaSubmittedModuleIds] = useState<string[]>([]);
  const [olCourses, setOLCourses] = useState<OLCourse[]>(mock.olCourses);
  const [olEnrollments, setOLEnrollments] = useState<OLEnrollment[]>(mock.olEnrollments);
  const [olCategories, setOLCategories] = useState<string[]>(mock.olCategories);
  const [notifications, setNotifications] = useState<Notification[]>(mock.notifications);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(mock.auditEvents);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(mock.calendarEvents);
  const [announcements, setAnnouncements] = useState<Announcement[]>(mock.announcements);
  const [discussions, setDiscussions] = useState<DiscussionThread[]>(mock.discussionThreads);
  const [gradeBands, setGradeBands] = useState<GradeBand[]>(DEFAULT_GRADE_BANDS);
  const [notificationTemplates, setNotificationTemplates] = useState<NotificationTemplate[]>(mock.notificationTemplates);
  const [systemSettings, setSystemSettingsState] = useState(mock.systemSettings);

  // restore login + active academic year from session
  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("lms-current-user") : null;
    if (saved && mock.users.some((u) => u.id === saved)) setCurrentUserId(saved);
    const savedYear = typeof window !== "undefined" ? window.localStorage.getItem("lms-academic-year") : null;
    if (savedYear && mock.academicYears.some((y) => y.id === savedYear)) setActiveAcademicYearId(savedYear);
  }, []);

  const persistUser = (id: string | null) => {
    if (typeof window === "undefined") return;
    if (id) window.localStorage.setItem("lms-current-user", id);
    else window.localStorage.removeItem("lms-current-user");
  };

  const value = useMemo<StoreValue>(() => {
    const addAudit: StoreValue["addAudit"] = (a) => {
      const ev: AuditEvent = {
        id: uid("au"),
        timestamp: new Date().toISOString(),
        userId: currentUser?.id ?? "system",
        userName: currentUser?.name ?? "System",
        role: currentUser?.role ?? "super-admin",
        ipAddress: "10.0.0." + Math.floor(Math.random() * 250),
        ...a,
      };
      setAuditEvents((prev) => [ev, ...prev]);
    };

    const addNotification: StoreValue["addNotification"] = (n) => {
      setNotifications((prev) => [
        { id: uid("n"), read: false, createdAt: new Date().toISOString(), ...n } as Notification,
        ...prev,
      ]);
    };

    return {
      currentUser,
      currentRole: currentUser?.role ?? null,
      login: (role) => {
        const id = mock.demoUserByRole[role];
        setCurrentUserId(id);
        persistUser(id);
      },
      logout: () => {
        setCurrentUserId(null);
        persistUser(null);
      },

      academicYears,
      activeAcademicYearId,
      activeAcademicYear: academicYears.find((y) => y.id === activeAcademicYearId) ?? null,
      setActiveAcademicYear: (id) => {
        setActiveAcademicYearId(id);
        if (typeof window !== "undefined") window.localStorage.setItem("lms-academic-year", id);
      },
      academicYearIdOfSemester: (semesterId) => {
        for (const p of programs) {
          const s = p.semesters.find((x) => x.id === semesterId);
          if (s) return s.academicYearId;
        }
        return undefined;
      },
      academicYearIdOfModule: (moduleId) => {
        const mod = modules.find((m) => m.id === moduleId);
        if (!mod) return undefined;
        for (const p of programs) {
          const s = p.semesters.find((x) => x.id === mod.semesterId);
          if (s) return s.academicYearId;
        }
        return undefined;
      },

      users,
      clerks,
      programs,
      intakes,
      modules,
      lectures,
      assignments,
      submissions,
      quizzes,
      quizSubmissions,
      applications,
      crossEnrollments,
      moduleGrades,
      caSubmittedModuleIds,
      olCourses,
      olEnrollments,
      olCategories,
      notifications,
      auditEvents,
      calendarEvents,
      announcements,
      discussions,
      gradeBands,
      notificationTemplates,
      systemSettings,

      addUser: (u) => {
        const newU: User = {
          id: uid("u"),
          status: "active",
          createdAt: new Date().toISOString(),
          ...u,
        } as User;
        setUsers((prev) => [...prev, newU]);
        addAudit({ action: "Account Created", details: `Created ${u.role} account for ${u.name}` });
        return newU;
      },
      updateUser: (id, patch) => setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u))),
      addClerk: (c) => {
        const newC: Clerk = {
          id: uid("clk"),
          status: "active",
          createdAt: new Date().toISOString(),
          tempPassword: "Welcome@2026",
          ...c,
        } as Clerk;
        setClerks((prev) => [...prev, newC]);
        addAudit({ action: "Clerk Account Created", details: `Created program clerk account for ${c.name}` });
        return newC;
      },
      updateClerk: (id, patch) => setClerks((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c))),
      markLectureComplete: (studentId, lectureId) =>
        setUsers((prev) =>
          prev.map((u) =>
            u.id === studentId && !u.completedLectureIds?.includes(lectureId)
              ? { ...u, completedLectureIds: [...(u.completedLectureIds ?? []), lectureId] }
              : u,
          ),
        ),

      addProgram: (p) => {
        const newP: Program = {
          id: uid("p"),
          description: "",
          level: "degree",
          durationYears: 3,
          totalCredits: 0,
          department: currentUser?.department ?? "",
          hodId: currentUser?.id ?? "",
          status: "draft",
          semesters: [],
          entryRequirements: "",
          ...p,
        } as Program;
        setPrograms((prev) => [...prev, newP]);
        return newP;
      },
      updateProgram: (id, patch) => setPrograms((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p))),
      addSemesterToProgram: (programId, semester) =>
        setPrograms((prev) =>
          prev.map((p) =>
            p.id === programId
              // Stamp the active academic year unless the caller supplied one.
              ? { ...p, semesters: [...p.semesters, { academicYearId: activeAcademicYearId, ...semester }] }
              : p,
          ),
        ),
      addIntake: (i) => {
        const newI: Intake = {
          id: uid("in"),
          academicYearId: activeAcademicYearId,
          applicationOpenDate: new Date().toISOString().slice(0, 10),
          applicationCloseDate: new Date().toISOString().slice(0, 10),
          academicStartDate: new Date().toISOString().slice(0, 10),
          status: "open",
          enrolledStudentIds: [],
          ...i,
        } as Intake;
        setIntakes((prev) => [...prev, newI]);
        return newI;
      },
      updateIntake: (id, patch) => setIntakes((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x))),

      addModule: (m) => {
        const newM: Module = {
          id: uid("m"),
          creditValue: 15,
          learningOutcomes: "",
          prerequisiteModuleIds: [],
          assessmentBreakdown: { assignments: 40, quizzes: 10, finalExam: 50 },
          primaryLecturerId: "",
          lecturerIds: [],
          status: "draft",
          isShared: false,
          isCrossStreamEnabled: false,
          ...m,
        } as Module;
        setModules((prev) => [...prev, newM]);
        setPrograms((prev) =>
          prev.map((p) =>
            p.id === m.programId
              ? {
                  ...p,
                  semesters: p.semesters.map((s) =>
                    s.id === m.semesterId ? { ...s, moduleIds: [...s.moduleIds, newM.id] } : s,
                  ),
                }
              : p,
          ),
        );
        return newM;
      },
      updateModule: (id, patch) => setModules((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m))),

      addLecture: (l) => {
        const moduleLectures = lectures.filter((x) => x.moduleId === l.moduleId);
        const newL: Lecture = {
          id: uid("lec"),
          order: l.order ?? moduleLectures.length + 1,
          lectureDate: new Date().toISOString().slice(0, 10),
          description: "",
          status: "draft",
          resources: [],
          createdByLecturerId: currentUser?.id ?? "",
          ...l,
        } as Lecture;
        setLectures((prev) => [...prev, newL]);
        return newL;
      },
      updateLecture: (id, patch) => setLectures((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l))),
      addResource: (lectureId, r) =>
        setLectures((prev) =>
          prev.map((l) =>
            l.id === lectureId
              ? {
                  ...l,
                  resources: [
                    ...l.resources,
                    { id: uid("r"), lectureId, url: "#", isDownloadable: true, format: "PDF", ...r } as Resource,
                  ],
                }
              : l,
          ),
        ),

      addQuiz: (q) => {
        const total = q.questions.reduce((s, x) => s + x.marks, 0);
        const newQ: Quiz = {
          id: uid("qz"),
          instructions: "",
          totalMarks: total,
          allowedAttempts: 1,
          availableFrom: new Date().toISOString().slice(0, 16),
          availableTo: new Date().toISOString().slice(0, 16),
          randomiseOrder: false,
          showAnswersAfter: true,
          status: "draft",
          createdByLecturerId: currentUser?.id ?? "",
          ...q,
        } as Quiz;
        setQuizzes((prev) => [...prev, newQ]);
        return newQ;
      },
      updateQuiz: (id, patch) => setQuizzes((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q))),
      addQuizSubmission: (s) => setQuizSubmissions((prev) => [...prev, s]),
      updateQuizSubmission: (id, patch) =>
        setQuizSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s))),

      addAssignment: (a) => {
        const newA: Assignment = {
          id: uid("as"),
          description: "",
          maxMarks: 100,
          submissionType: "file",
          allowedFileTypes: [".pdf"],
          openDate: new Date().toISOString().slice(0, 16),
          dueDate: new Date().toISOString().slice(0, 16),
          status: "published",
          createdByLecturerId: currentUser?.id ?? "",
          ...a,
        } as Assignment;
        setAssignments((prev) => [...prev, newA]);
        return newA;
      },
      upsertSubmission: (s) =>
        setSubmissions((prev) => {
          const existing = prev.find((x) => x.assignmentId === s.assignmentId && x.studentId === s.studentId);
          if (existing) return prev.map((x) => (x.id === existing.id ? { ...x, ...s } : x));
          return [
            ...prev,
            {
              id: uid("sub"),
              submittedAt: new Date().toISOString(),
              gradingStatus: "submitted",
              ...s,
            } as Submission,
          ];
        }),

      addApplication: (a) => {
        const ref = `APP-2026-${String(1001 + applications.length).slice(-4)}`;
        const now = new Date().toISOString();
        const newA: Application = {
          id: uid("app"),
          referenceNumber: ref,
          academicYearId: activeAcademicYearId,
          email: "",
          phone: "",
          nic: "",
          dateOfBirth: "",
          gender: "",
          address: "",
          qualifications: "",
          documents: [],
          status: "submitted",
          submittedAt: now,
          registrarNotes: "",
          history: [{ status: "submitted", date: now }],
          ...a,
        };
        setApplications((prev) => [newA, ...prev]);
        addNotification({
          recipientId: "u-reg",
          title: "New application received",
          body: `${newA.applicantName} applied (${ref}).`,
          type: "application",
          linkTo: `/registrar/applications/${newA.id}`,
        });
        return newA;
      },
      updateApplication: (id, patch, statusNote) =>
        setApplications((prev) =>
          prev.map((a) => {
            if (a.id !== id) return a;
            const history = patch.status && patch.status !== a.status
              ? [...a.history, { status: patch.status, date: new Date().toISOString(), note: statusNote }]
              : a.history;
            return { ...a, ...patch, history };
          }),
        ),
      sendPaymentReminder: (applicationId) => {
        const now = new Date().toISOString();
        setApplications((prev) =>
          prev.map((a) =>
            a.id === applicationId
              ? { ...a, paymentReminderCount: (a.paymentReminderCount ?? 0) + 1, lastPaymentReminderAt: now }
              : a,
          ),
        );
        const appn = applications.find((a) => a.id === applicationId);
        if (appn) addAudit({ action: "Payment Reminder Sent", details: `Emailed payment reminder to ${appn.applicantName} (${appn.referenceNumber})` });
      },

      addCrossEnrollment: (r) => {
        const newR: CrossEnrollmentRequest = {
          id: uid("ce"),
          reason: "",
          status: "pending",
          requestedAt: new Date().toISOString(),
          paymentStatus: "pending",
          ...r,
        } as CrossEnrollmentRequest;
        setCrossEnrollments((prev) => [newR, ...prev]);
        addNotification({
          recipientId: "u-reg",
          title: "Cross-enrollment request",
          body: `${r.studentName} submitted a cross-enrollment request.`,
          type: "enrollment",
          linkTo: "/registrar/cross-enrollment",
        });
      },
      updateCrossEnrollment: (id, patch) => {
        setCrossEnrollments((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
        if (patch.status === "approved") {
          const req = crossEnrollments.find((r) => r.id === id);
          if (req?.targetModuleId) {
            setUsers((prev) =>
              prev.map((u) =>
                u.id === req.studentId
                  ? { ...u, crossEnrolledModuleIds: [...(u.crossEnrolledModuleIds ?? []), req.targetModuleId!] }
                  : u,
              ),
            );
          }
          if (req?.targetCourseId) {
            // also create OL enrollment for cohort->ol
            setOLEnrollments((prev) =>
              prev.some((e) => e.studentId === req.studentId && e.courseId === req.targetCourseId)
                ? prev
                : [
                    ...prev,
                    {
                      studentId: req.studentId,
                      courseId: req.targetCourseId!,
                      enrolledAt: new Date().toISOString(),
                      completedLessonIds: [],
                      completionPercentage: 0,
                      certificateIssued: false,
                    },
                  ],
            );
          }
          if (req) {
            const modName = req.targetModuleId ? modules.find((m) => m.id === req.targetModuleId)?.name : undefined;
            addNotification({
              recipientId: req.studentId,
              title: "Cross-enrollment approved",
              body: req.targetModuleId
                ? `You're now enrolled in ${modName ?? "the module"}. Open it from My Modules to access its lectures, assignments and quizzes.`
                : "Your cross-enrollment request has been approved.",
              type: "enrollment",
              linkTo: req.targetModuleId ? `/cohort-student/modules/${req.targetModuleId}` : undefined,
            });
          }
        }
      },

      updateGrade: (studentId, moduleId, patch) =>
        setModuleGrades((prev) => {
          const exists = prev.some((g) => g.studentId === studentId && g.moduleId === moduleId);
          const compute = (g: ModuleGrade): ModuleGrade => {
            const mod = modules.find((m) => m.id === moduleId);
            const caWeight = mod ? mod.assessmentBreakdown.assignments + mod.assessmentBreakdown.quizzes : 40;
            const caAvg = (g.assignmentMarks + g.quizMarks) / 2;
            const wt = g.specialCode ? 0 : weightedTotal(caAvg, g.finalExamMark, caWeight);
            const band = markToGrade(wt, gradeBands);
            return {
              ...g,
              weightedTotal: g.specialCode ? 0 : wt,
              grade: g.specialCode ?? band.grade,
              gradePoint: g.specialCode ? 0 : band.gradePoint,
            };
          };
          if (exists) {
            return prev.map((g) =>
              g.studentId === studentId && g.moduleId === moduleId ? compute({ ...g, ...patch }) : g,
            );
          }
          return [
            ...prev,
            compute({
              studentId,
              moduleId,
              assignmentMarks: 0,
              quizMarks: 0,
              finalExamMark: 0,
              weightedTotal: 0,
              grade: "—",
              gradePoint: 0,
              published: false,
              ...patch,
            }),
          ];
        }),
      publishResults: (moduleId) => {
        setModuleGrades((prev) => prev.map((g) => (g.moduleId === moduleId ? { ...g, published: true } : g)));
        const enrolled = users.filter((u) => u.role === "cohort-student");
        enrolled.forEach((s) =>
          addNotification({
            recipientId: s.id,
            title: "Results published",
            body: "Results for one of your modules have been published.",
            type: "grade",
            linkTo: "/cohort-student/grades",
          }),
        );
        addAudit({ action: "Results Published", details: `Published results for module ${moduleId}` });
      },
      submitModuleCA: (moduleId) => {
        setCaSubmittedModuleIds((prev) => (prev.includes(moduleId) ? prev : [...prev, moduleId]));
        const mod = modules.find((m) => m.id === moduleId);
        addNotification({
          recipientId: "u-hod",
          title: "CA marks submitted",
          body: `Continuous Assessment marks for ${mod?.code ?? moduleId} are ready for the final exam mark.`,
          type: "grade",
          linkTo: "/hod/gradebook",
        });
        addAudit({ action: "CA Marks Submitted", details: `Submitted CA marks for ${mod?.code ?? moduleId} to HOD` });
      },

      addOLCourse: (c) => {
        const newC: OLCourse = {
          id: uid("ol"),
          description: "",
          thumbnail: "",
          category: olCategories[0],
          tags: [],
          difficulty: "beginner",
          estimatedHours: 10,
          pricing: "free",
          prerequisitesText: "",
          lecturerId: "",
          hodId: currentUser?.id ?? "",
          status: "draft",
          sections: [],
          minimumPassScore: 50,
          whatYouLearn: [],
          rating: 0,
          ...c,
        } as OLCourse;
        setOLCourses((prev) => [...prev, newC]);
        return newC;
      },
      updateOLCourse: (id, patch) => setOLCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c))),
      enrollOL: (studentId, courseId) =>
        setOLEnrollments((prev) =>
          prev.some((e) => e.studentId === studentId && e.courseId === courseId)
            ? prev
            : [
                ...prev,
                {
                  studentId,
                  courseId,
                  enrolledAt: new Date().toISOString(),
                  completedLessonIds: [],
                  completionPercentage: 0,
                  certificateIssued: false,
                },
              ],
        ),
      completeOLLesson: (studentId, courseId, lessonId) =>
        setOLEnrollments((prev) =>
          prev.map((e) => {
            if (e.studentId !== studentId || e.courseId !== courseId) return e;
            if (e.completedLessonIds.includes(lessonId)) return e;
            const course = olCourses.find((c) => c.id === courseId);
            const totalLessons = course?.sections.reduce((s, sec) => s + sec.lessons.length, 0) ?? 1;
            const completed = [...e.completedLessonIds, lessonId];
            const pct = Math.round((completed.length / totalLessons) * 100);
            const done = pct >= 100;
            return {
              ...e,
              completedLessonIds: completed,
              completionPercentage: pct,
              certificateIssued: done || e.certificateIssued,
              certificateId: done && !e.certificateId ? `CERT-2026-${uid().slice(-5)}` : e.certificateId,
            };
          }),
        ),
      addOLCategory: (c) => setOLCategories((prev) => (prev.includes(c) ? prev : [...prev, c])),
      removeOLCategory: (c) => setOLCategories((prev) => prev.filter((x) => x !== c)),

      addNotification,
      markNotificationRead: (id) =>
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))),
      markAllNotificationsRead: (recipientId) =>
        setNotifications((prev) => prev.map((n) => (n.recipientId === recipientId ? { ...n, read: true } : n))),

      addAudit,

      addCalendarEvent: (e) =>
        setCalendarEvents((prev) => [...prev, { id: uid("ev"), academicYearId: activeAcademicYearId, ...e } as CalendarEvent]),
      updateCalendarEvent: (id, patch) =>
        setCalendarEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e))),
      deleteCalendarEvent: (id) => setCalendarEvents((prev) => prev.filter((e) => e.id !== id)),

      addAnnouncement: (a) =>
        setAnnouncements((prev) => [
          {
            id: uid("ann"),
            authorId: currentUser?.id ?? "",
            authorName: currentUser?.name ?? "",
            authorRole: currentUser?.role ?? "lecturer",
            target: "all",
            createdAt: new Date().toISOString(),
            ...a,
          } as Announcement,
          ...prev,
        ]),

      addThread: (t) =>
        setDiscussions((prev) => [
          {
            id: uid("dt"),
            authorId: currentUser?.id ?? "",
            authorName: currentUser?.name ?? "",
            authorRole: currentUser?.role ?? "cohort-student",
            createdAt: new Date().toISOString(),
            replies: [],
            resolved: false,
            ...t,
          } as DiscussionThread,
          ...prev,
        ]),
      addReply: (threadId, body) =>
        setDiscussions((prev) =>
          prev.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  replies: [
                    ...t.replies,
                    {
                      id: uid("dr"),
                      authorId: currentUser?.id ?? "",
                      authorName: currentUser?.name ?? "",
                      authorRole: currentUser?.role ?? "cohort-student",
                      body,
                      createdAt: new Date().toISOString(),
                    } as DiscussionReply,
                  ],
                }
              : t,
          ),
        ),
      resolveThread: (threadId) =>
        setDiscussions((prev) => prev.map((t) => (t.id === threadId ? { ...t, resolved: !t.resolved } : t))),
      deleteThread: (threadId) => setDiscussions((prev) => prev.filter((t) => t.id !== threadId)),

      setGradeBands,
      setNotificationTemplates,
      setSystemSettings: (s) => setSystemSettingsState((prev) => ({ ...prev, ...s })),
    };
  }, [
    academicYears, activeAcademicYearId,
    currentUser, users, clerks, programs, intakes, modules, lectures, assignments, submissions, quizzes,
    quizSubmissions, applications, crossEnrollments, moduleGrades, caSubmittedModuleIds, olCourses, olEnrollments,
    olCategories, notifications, auditEvents, calendarEvents, announcements, discussions, gradeBands,
    notificationTemplates, systemSettings,
  ]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
