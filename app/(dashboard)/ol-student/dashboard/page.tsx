"use client";

import Link from "next/link";
import { BookOpen, CheckCircle, Award, TrendingUp, Globe, CalendarClock, PencilLine, HelpCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store/provider";
import { formatDate } from "@/lib/utils/date";

export default function OLDashboard() {
  const { currentUser, olCourses, olEnrollments, users, assignments, quizzes, submissions } = useStore();
  const mine = olEnrollments.filter((e) => e.studentId === currentUser?.id);
  const inProgress = mine.filter((e) => e.completionPercentage < 100);
  const completed = mine.filter((e) => e.completionPercentage >= 100);
  const certs = mine.filter((e) => e.certificateIssued).length;
  const lessonsCompleted = mine.reduce((sum, e) => sum + e.completedLessonIds.length, 0);
  const lecturerName = (id: string) => users.find((u) => u.id === id)?.name ?? "—";
  const recommendations = olCourses.filter((c) => c.status === "published" && !mine.some((e) => e.courseId === c.id)).slice(0, 3);

  // Item I — courses eligible for a certificate (100% but not yet issued)
  const eligible = mine.filter((e) => e.completionPercentage >= 100 && !e.certificateIssued);

  // Item I — upcoming assignment/quiz deadlines across enrolled courses
  const now = new Date();
  const myCourseIds = mine.map((e) => e.courseId);
  const asgDeadlines = assignments
    .filter((a) => myCourseIds.includes(a.moduleId) && new Date(a.dueDate) >= now && !submissions.some((s) => s.assignmentId === a.id && s.studentId === currentUser?.id))
    .map((a) => ({ id: a.id, kind: "assignment" as const, title: a.title, course: olCourses.find((c) => c.id === a.moduleId)?.title ?? "", date: a.dueDate }));
  const quizDeadlines = quizzes
    .filter((q) => myCourseIds.includes(q.moduleId) && q.status === "active" && new Date(q.availableTo) >= now)
    .map((q) => ({ id: q.id, kind: "quiz" as const, title: q.title, course: olCourses.find((c) => c.id === q.moduleId)?.title ?? "", date: q.availableTo }));
  const deadlines = [...asgDeadlines, ...quizDeadlines].sort((a, b) => +new Date(a.date) - +new Date(b.date));

  return (
    <div>
      <PageHeader title={`Welcome back, ${currentUser?.name}`} description="Continue your learning journey." />
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

      {deadlines.length > 0 && (
        <>
          <h3 className="font-semibold mt-6 mb-3 flex items-center gap-2"><CalendarClock className="size-4" /> Upcoming Deadlines</h3>
          <Card><CardContent className="pt-6 space-y-2">
            {deadlines.slice(0, 5).map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-lg border p-3">
                <span className="flex items-center gap-2 text-sm">
                  {d.kind === "assignment" ? <PencilLine className="size-4 text-muted-foreground" /> : <HelpCircle className="size-4 text-muted-foreground" />}
                  <span><span className="font-medium">{d.title}</span> <span className="text-muted-foreground">· {d.course}</span></span>
                </span>
                <Badge variant="secondary">{d.kind === "assignment" ? "Due" : "Closes"} {formatDate(d.date)}</Badge>
              </div>
            ))}
          </CardContent></Card>
        </>
      )}

      <h3 className="font-semibold mt-6 mb-3">Continue Learning</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {inProgress.map((e) => {
          const c = olCourses.find((x) => x.id === e.courseId);
          if (!c) return null;
          return (
            <Card key={e.courseId} className="overflow-hidden p-0">
              <div className="h-20 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white/80 text-xs font-medium">{c.category}</div>
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
        {inProgress.length === 0 && <p className="text-sm text-muted-foreground">No courses in progress. Browse the catalog to start.</p>}
      </div>

      {completed.length > 0 && (
        <>
          <h3 className="font-semibold mt-6 mb-3">Completed Courses</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {completed.map((e) => {
              const c = olCourses.find((x) => x.id === e.courseId);
              if (!c) return null;
              return (
                <Card key={e.courseId}><CardContent className="pt-6 space-y-2">
                  <div className="flex items-center justify-between"><p className="font-semibold">{c.title}</p><Badge className="bg-emerald-100 text-emerald-800" variant="ghost">Completed</Badge></div>
                  <Button asChild size="sm" variant="outline" className="w-full"><Link href="/ol-student/certificates">View Certificate</Link></Button>
                </CardContent></Card>
              );
            })}
          </div>
        </>
      )}

      <h3 className="font-semibold mt-6 mb-3 flex items-center gap-2"><Globe className="size-4" /> You Might Like</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((c) => (
          <Card key={c.id}><CardContent className="pt-6 space-y-2">
            <Badge variant="secondary" className="text-[10px]">{c.category}</Badge>
            <p className="font-semibold">{c.title}</p>
            <Button asChild size="sm" variant="outline" className="w-full"><Link href={`/ol-student/catalog/${c.id}`}>View Course</Link></Button>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}
