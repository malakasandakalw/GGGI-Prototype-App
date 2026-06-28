"use client";

import Link from "next/link";
import { BookOpen, ClipboardList, HelpCircle, Award, Bell } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store/provider";
import { gpa } from "@/lib/utils/gpa";
import { formatDate, daysUntil } from "@/lib/utils/date";

export default function CohortDashboard() {
  const { currentUser, programs, modules, lectures, assignments, submissions, quizzes, moduleGrades, calendarEvents, notifications } = useStore();
  const program = programs.find((p) => p.id === currentUser?.programId);
  const sem = program?.semesters.find((s) => s.id === currentUser?.currentSemesterId);
  const myModules = modules.filter((m) => sem?.moduleIds.includes(m.id) || currentUser?.crossEnrolledModuleIds?.includes(m.id));
  const intakeLabel = "2024 Intake";

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

  return (
    <div>
      <Card className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
        <CardContent className="py-6">
          <h2 className="text-xl font-bold">Welcome back, {currentUser?.name}</h2>
          <p className="text-sm text-blue-100 mt-1">{program?.name} · {intakeLabel} · {sem?.name}</p>
        </CardContent>
      </Card>

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
              const ls = lectures.filter((l) => l.moduleId === m.id && l.status === "published");
              const nextDl = deadlines.find((d) => d.moduleId === m.id);
              return (
                <Card key={m.id}><CardContent className="pt-6 space-y-2">
                  <div className="flex items-start justify-between">
                    <div><p className="font-medium">{m.name}</p><p className="text-xs text-muted-foreground">{m.code}</p></div>
                    {currentUser?.crossEnrolledModuleIds?.includes(m.id) && <Badge variant="secondary" className="text-[10px]">Cross-Program</Badge>}
                  </div>
                  <Progress value={ls.length ? 40 : 0} />
                  {nextDl && <p className="text-xs text-amber-600">Due in {daysUntil(nextDl.date)} days: {nextDl.title}</p>}
                  <Button asChild size="sm" className="w-full"><Link href={`/cohort-student/modules/${m.id}`}>Continue</Link></Button>
                </CardContent></Card>
              );
            })}
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
    </div>
  );
}
