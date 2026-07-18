"use client";

import Link from "next/link";
import { Layers, CheckSquare, AlertTriangle, BookOpen, Users, ClipboardList, BookMarked } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { AcademicYearChip } from "@/components/shared/AcademicYearChip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store/provider";
import { useYearScope } from "@/hooks/use-year-scope";
import { gpa } from "@/lib/utils/gpa";

export default function HODDashboard() {
  const { currentUser, modules, lectures, quizzes, users, submissions, moduleGrades, programs } = useStore();
  const { isModuleInYear } = useYearScope();
  const dept = currentUser?.department;
  const deptModules = modules.filter((m) => isModuleInYear(m.id) && programs.find((p) => p.id === m.programId)?.department === dept);
  const lecturesPublished = lectures.filter((l) => l.status === "published" && isModuleInYear(l.moduleId)).length;
  const quizzesActive = quizzes.filter((q) => q.status === "active" && isModuleInYear(q.moduleId)).length;
  const students = users.filter((u) => u.role === "cohort-student");
  const atRisk = students.filter((s) => {
    const g = moduleGrades.filter((x) => x.studentId === s.id && x.published);
    return g.length > 0 && gpa(g, modules) < 2.0;
  }).length;
  const ungraded = submissions.filter((s) => s.gradingStatus === "submitted").length;

  return (
    <div>
      <PageHeader title={`${dept} Department`} description="Your academic control centre.">
        <AcademicYearChip />
      </PageHeader>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Modules in Department" value={deptModules.length} icon={Layers} />
        <StatCard title="Lectures Published" value={lecturesPublished} icon={BookOpen} variant="success" />
        <StatCard title="Quizzes Active" value={quizzesActive} icon={CheckSquare} variant="success" />
        <StatCard title="Students at Risk" value={atRisk} icon={AlertTriangle} variant="danger" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
        <StatCard title="Active Students" value={students.filter((s) => s.status === "active").length} icon={Users} />
        <StatCard title="Assignments to Grade" value={ungraded} icon={ClipboardList} variant="warning" />
        <StatCard title="Programs Managed" value={currentUser?.programIds?.length ?? 0} icon={BookMarked} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3 mt-6">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">To-Do</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <TodoItem text={`${ungraded} assignments awaiting grading`} href="/hod/gradebook" />
            <TodoItem text="Results ready to publish for CS201" href="/hod/results" />
            <TodoItem text="BSc CS submitted to Program Admin" href="/hod/programs" muted />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Department Overview</CardTitle></CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-3">
            {deptModules.filter((m) => m.status === "active").map((m) => {
              const ls = lectures.filter((l) => l.moduleId === m.id);
              const pub = ls.filter((l) => l.status === "published").length;
              const lecturer = users.find((u) => u.id === m.primaryLecturerId)?.name ?? "Unassigned";
              return (
                <div key={m.id} className="rounded-lg border p-3">
                  <p className="font-medium text-sm">{m.code} — {m.name}</p>
                  <p className="text-xs text-muted-foreground">{lecturer}</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1"><span>{pub}/{ls.length || 0} published</span></div>
                    <Progress value={ls.length ? (pub / ls.length) * 100 : 0} />
                  </div>
                  <Button asChild size="sm" variant="outline" className="mt-2 w-full"><Link href="/hod/modules">Manage</Link></Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TodoItem({ text, href, muted }: { text: string; href: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b last:border-0 pb-2">
      <span className={muted ? "text-muted-foreground" : ""}>{text}</span>
      {!muted && <Link href={href} className="text-primary text-xs hover:underline">Review Now</Link>}
    </div>
  );
}
