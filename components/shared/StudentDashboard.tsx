"use client";

import Link from "next/link";
import {
  BookOpen, ClipboardList, HelpCircle, Award, Bell, CheckCircle, TrendingUp,
  Globe, CalendarClock, PencilLine,
} from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store/provider";
import { useStudentAccess } from "@/hooks/use-student-access";
import { gpa } from "@/lib/utils/gpa";
import { moduleProgress } from "@/lib/utils/progress";
import { formatDate, daysUntil } from "@/lib/utils/date";

// Unified student dashboard (Phase 2). One component for BOTH student roles:
// a Cohort section shows when the student has cohort access (own programme or a
// cross-enrolled module); an Open Learning section shows their OL journey.
export function StudentDashboard() {
  const {
    currentUser, programs, modules, lectures, assignments, submissions, quizzes,
    quizSubmissions, moduleGrades, calendarEvents, notifications, olCourses, olEnrollments, users,
  } = useStore();
  const { hasCohortAccess, hasProgram } = useStudentAccess();

  // ---- Cohort side ----
  const program = programs.find((p) => p.id === currentUser?.programId);
  const sem = program?.semesters.find((s) => s.id === currentUser?.currentSemesterId);
  const myModules = modules.filter((m) => sem?.moduleIds.includes(m.id) || currentUser?.crossEnrolledModuleIds?.includes(m.id));
  const myGrades = moduleGrades.filter((g) => g.studentId === currentUser?.id && g.published);
  const cgpa = gpa(myGrades, modules);
  const semLectures = lectures.filter((l) => myModules.some((m) => m.id === l.moduleId) && l.status === "published");
  const semAssignments = assignments.filter((a) => myModules.some((m) => m.id === a.moduleId));
  const mySubs = submissions.filter((s) => s.studentId === currentUser?.id);
  const semQuizzes = quizzes.filter((q) => myModules.some((m) => m.id === q.moduleId) && q.status === "active");
  const deadlines = [...calendarEvents]
    .filter((e) => (e.type === "deadline" || e.type === "exam" || e.type === "quiz") && e.date >= "2026-06-28")
    .sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  const recentNotifs = notifications.filter((n) => n.recipientId === currentUser?.id).slice(0, 3);

  // ---- Open Learning side ----
  const mine = olEnrollments.filter((e) => e.studentId === currentUser?.id);
  const inProgress = mine.filter((e) => e.completionPercentage < 100);
  const completed = mine.filter((e) => e.completionPercentage >= 100);
  const certs = mine.filter((e) => e.certificateIssued).length;
  const lessonsCompleted = mine.reduce((sum, e) => sum + e.completedLessonIds.length, 0);
  const eligible = mine.filter((e) => e.completionPercentage >= 100 && !e.certificateIssued);
  const lecturerName = (id: string) => users.find((u) => u.id === id)?.name ?? "—";
  const recommendations = olCourses.filter((c) => c.status === "published" && !mine.some((e) => e.courseId === c.id)).slice(0, 3);

  const subtitle = hasProgram
    ? [program?.name, sem?.name].filter(Boolean).join(" · ")
    : "Open Learning" + (hasCohortAccess ? " · cross-enrolled student" : "");

  return (
    <div>
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="py-6">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight">Welcome back, {currentUser?.name}</h2>
            {currentUser?.role === "ol-student" && hasCohortAccess && (
              <Badge variant="secondary" className="gap-1"><Globe className="size-3" /> Open Learning + Module Access</Badge>
            )}
          </div>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </CardContent>
      </Card>

      {/* ---------------- Cohort section ---------------- */}
      {hasCohortAccess && (
        <section className="mb-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Lectures Available" value={semLectures.length} icon={BookOpen} />
            <StatCard title="Assignments" value={`${mySubs.length}/${semAssignments.length}`} icon={ClipboardList} />
            <StatCard title="Active Quizzes" value={semQuizzes.length} icon={HelpCircle} />
            <StatCard title="Current CGPA" value={cgpa.toFixed(2)} icon={Award} variant="success" />
          </div>

          <div className="grid gap-4 lg:grid-cols-3 mt-6">
            <div className="lg:col-span-2">
              <h3 className="font-semibold mb-3">Active Modules</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {myModules.map((m) => {
                  const nextDl = deadlines.find((d) => d.moduleId === m.id);
                  const prog = moduleProgress(m.id, currentUser?.id ?? "", {
                    lectures, assignments, quizzes, completedLectureIds: currentUser?.completedLectureIds ?? [], submissions, quizSubmissions,
                  });
                  return (
                    <Card key={m.id}><CardContent className="pt-6 space-y-2">
                      <div className="flex items-start justify-between">
                        <div><p className="font-medium">{m.name}</p><p className="text-xs text-muted-foreground">{m.code}</p></div>
                        {currentUser?.crossEnrolledModuleIds?.includes(m.id) && <Badge variant="secondary" className="text-[10px]">Cross-Program</Badge>}
                      </div>
                      <Progress value={prog.percent} />
                      <p className="text-xs text-muted-foreground">{prog.percent}% complete</p>
                      {nextDl && <p className="text-xs text-amber-600">Due in {daysUntil(nextDl.date)} days: {nextDl.title}</p>}
                      <Button asChild size="sm" className="w-full"><Link href={`/cohort-student/modules/${m.id}`}>Continue</Link></Button>
                    </CardContent></Card>
                  );
                })}
                {myModules.length === 0 && <p className="text-sm text-muted-foreground">No active modules.</p>}
              </div>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Upcoming Deadlines</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {deadlines.map((d) => (
                    <div key={d.id} className="text-sm border-b last:border-0 pb-2">
                      <p className="font-medium">{d.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(d.date)} · <span className="capitalize">{d.type}</span></p>
                    </div>
                  ))}
                  {deadlines.length === 0 && <p className="text-sm text-muted-foreground">Nothing upcoming.</p>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Bell className="size-4" /> Recent</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {recentNotifs.map((n) => <div key={n.id} className="text-sm border-b last:border-0 pb-2"><p className="font-medium">{n.title}</p><p className="text-xs text-muted-foreground line-clamp-1">{n.body}</p></div>)}
                  <Link href="/notifications" className="text-primary text-xs hover:underline">View all</Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* ---------------- Open Learning section ---------------- */}
      <section>
        <h3 className="font-semibold mb-3 flex items-center gap-2"><Globe className="size-4" /> Open Learning</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Courses Enrolled" value={mine.length} icon={BookOpen} />
          <StatCard title="Completed" value={completed.length} icon={CheckCircle} variant="success" />
          <StatCard title="Certificates" value={certs} icon={Award} variant="success" />
          <StatCard title="Lessons Completed" value={lessonsCompleted} icon={TrendingUp} />
        </div>

        {eligible.length > 0 && (
          <Card className="mt-6 border-emerald-200 bg-emerald-50">
            <CardContent className="pt-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Award className="size-6 text-emerald-600" />
                <div>
                  <p className="font-semibold text-emerald-900">You&apos;re eligible for {eligible.length} certificate{eligible.length > 1 ? "s" : ""}</p>
                  <p className="text-sm text-emerald-800">You&apos;ve completed all lessons — claim your certificate now.</p>
                </div>
              </div>
              <Button asChild size="sm"><Link href="/ol-student/certificates">Go to Certificates</Link></Button>
            </CardContent>
          </Card>
        )}

        {inProgress.length > 0 && (
          <>
            <h4 className="font-medium mt-6 mb-3 flex items-center gap-2 text-sm"><CalendarClock className="size-4" /> Continue Learning</h4>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {inProgress.map((e) => {
                const c = olCourses.find((x) => x.id === e.courseId);
                if (!c) return null;
                return (
                  <Card key={e.courseId} className="overflow-hidden p-0">
                    <div className="h-20 bg-muted border-b flex items-center justify-center text-muted-foreground text-xs font-medium">{c.category}</div>
                    <CardContent className="p-4 space-y-2">
                      <p className="font-semibold leading-tight">{c.title}</p>
                      <p className="text-xs text-muted-foreground">{lecturerName(c.lecturerId)}</p>
                      <Progress value={e.completionPercentage} />
                      <p className="text-xs text-muted-foreground">{e.completionPercentage}% complete</p>
                      <Button asChild size="sm" className="w-full"><Link href={`/ol-student/courses/${c.id}`}>Continue</Link></Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {recommendations.length > 0 && (
          <>
            <h4 className="font-medium mt-6 mb-3 text-sm">You Might Like</h4>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((c) => (
                <Card key={c.id}><CardContent className="pt-6 space-y-2">
                  <Badge variant="secondary" className="text-[10px]">{c.category}</Badge>
                  <p className="font-semibold">{c.title}</p>
                  <Button asChild size="sm" variant="outline" className="w-full"><Link href={`/ol-student/catalog/${c.id}`}>View Course</Link></Button>
                </CardContent></Card>
              ))}
            </div>
          </>
        )}

        {mine.length === 0 && (
          <p className="text-sm text-muted-foreground mt-4 flex items-center gap-2">
            <PencilLine className="size-4" /> Not enrolled in any Open Learning courses yet — browse the <Link href="/ol-student/catalog" className="text-primary hover:underline">course catalog</Link> to start.
          </p>
        )}
      </section>
    </div>
  );
}
