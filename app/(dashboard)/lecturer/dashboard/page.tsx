"use client";

import Link from "next/link";
import { Layers, FileClock, ClipboardList, CheckSquare } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store/provider";

export default function LecturerDashboard() {
  const { currentUser, modules, lectures, assignments, submissions, quizzes } = useStore();
  const myModules = modules.filter((m) => m.lecturerIds.includes(currentUser?.id ?? ""));
  const myLectures = lectures.filter((l) => l.createdByLecturerId === currentUser?.id);
  const drafts = myLectures.filter((l) => l.status === "draft");
  const myAssignments = assignments.filter((a) => myModules.some((m) => m.id === a.moduleId));
  const ungraded = submissions.filter((s) => s.gradingStatus === "submitted" && myAssignments.some((a) => a.id === s.assignmentId)).length;
  const manualReview = quizzes.filter((q) => myModules.some((m) => m.id === q.moduleId)).length;

  return (
    <div>
      <PageHeader title={`Welcome, ${currentUser?.name}`} description="Your modules and outstanding tasks." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="My Active Modules" value={myModules.length} icon={Layers} />
        <StatCard title="Lectures in Draft" value={drafts.length} icon={FileClock} variant="warning" />
        <StatCard title="Assignments to Grade" value={ungraded} icon={ClipboardList} variant={ungraded > 0 ? "warning" : "default"} />
        <StatCard title="Quizzes Needing Review" value={manualReview} icon={CheckSquare} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3 mt-6">
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          {myModules.map((m) => {
            const ls = lectures.filter((l) => l.moduleId === m.id);
            const pub = ls.filter((l) => l.status === "published").length;
            return (
              <Card key={m.id}>
                <CardContent className="pt-6 space-y-3">
                  <div><p className="font-semibold">{m.code} — {m.name}</p><p className="text-xs text-muted-foreground">{m.creditValue} credits</p></div>
                  <div><div className="flex justify-between text-xs mb-1"><span>{pub} of {ls.length} lectures published</span></div><Progress value={ls.length ? (pub / ls.length) * 100 : 0} /></div>
                  <Button asChild size="sm" className="w-full"><Link href={`/lecturer/modules/${m.id}`}>Manage Module</Link></Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">To-Do</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {drafts.filter((l) => l.hodFeedback).map((l) => (
              <div key={l.id} className="border-b pb-2">
                <p className="font-medium">Returned: {l.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{l.hodFeedback}</p>
                <Link href={`/lecturer/modules/${l.moduleId}/lectures/${l.id}`} className="text-primary text-xs hover:underline">Revise →</Link>
              </div>
            ))}
            <div className="border-b pb-2"><p className="font-medium">{ungraded} ungraded submission(s)</p><p className="text-xs text-muted-foreground">Across your assignments</p></div>
            <div><p className="font-medium">Quiz short-answers awaiting marking</p></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
