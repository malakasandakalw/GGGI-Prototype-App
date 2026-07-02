"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Globe, Plus, FileQuestion, ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { useStore } from "@/lib/store/provider";
import type { OLCourse } from "@/lib/types";

export default function LecturerOpenLearning() {
  const { currentUser, olCourses, olEnrollments, quizzes } = useStore();
  const myCourses = olCourses.filter((c) => c.lecturerId === currentUser?.id);
  const [manage, setManage] = useState<OLCourse | null>(null);
  const [submitted, setSubmitted] = useState<string | null>(null);

  const enrollCount = (id: string) => olEnrollments.filter((e) => e.courseId === id).length;
  const lessonCount = (c: OLCourse) => c.sections.reduce((s, sec) => s + sec.lessons.length, 0);

  return (
    <div>
      <PageHeader title="Open Learning" description="Manage content for the OL courses assigned to you." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {myCourses.map((c) => (
          <Card key={c.id} className="overflow-hidden p-0">
            <div className="h-20 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center"><Globe className="size-7 text-white/80" /></div>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="secondary" className="text-[10px]">{c.category}</Badge>
                <StatusBadge status={c.status} />
              </div>
              <p className="font-semibold leading-tight">{c.title}</p>
              <p className="text-xs text-muted-foreground capitalize">{c.difficulty} · {lessonCount(c)} lessons · {enrollCount(c.id)} enrolled</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <Button size="sm" variant="outline" onClick={() => setManage(c)}>Manage Content</Button>
                {c.status === "draft" && <Button size="sm" onClick={() => { setSubmitted(c.title); }}>Submit for Verification</Button>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {myCourses.length === 0 && <Card><CardContent><EmptyState icon={Globe} title="No OL courses assigned" description="Your HOD assigns you to Open Learning courses to manage." /></CardContent></Card>}

      <Sheet open={!!manage} onOpenChange={(o) => !o && setManage(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {manage && (
            <>
              <SheetHeader>
                <SheetTitle>{manage.title}</SheetTitle>
                <SheetDescription>{lessonCount(manage)} lessons · {enrollCount(manage.id)} enrolled · <StatusBadge status={manage.status} /></SheetDescription>
              </SheetHeader>
              <div className="px-4 pb-6 space-y-4">
                {manage.sections.length === 0 && <p className="text-sm text-muted-foreground">No sections yet. Add your first section below.</p>}
                {manage.sections.map((s) => (
                  <div key={s.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{s.title}</p>
                      <Button size="sm" variant="ghost" onClick={() => toast.info("Lesson editor — simulated")}><Plus className="size-4" /> Lesson</Button>
                    </div>
                    <ul className="mt-2 space-y-2 text-sm">
                      {s.lessons.map((l) => {
                        const quiz = l.quizId ? quizzes.find((q) => q.id === l.quizId) : null;
                        return (
                          <li key={l.id} className="rounded-md border p-2">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-2">{l.title}{l.isSequential && <Badge variant="outline" className="text-[10px]">Sequential</Badge>}</span>
                              <Button size="sm" variant="ghost" onClick={() => toast.info("Resource editor — simulated")}><Plus className="size-4" /> Resource</Button>
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground flex flex-wrap gap-2">
                              <span>{l.resources.length} resource(s)</span>
                              {quiz && <span className="flex items-center gap-1"><FileQuestion className="size-3" /> {quiz.title}</span>}
                              {l.assignmentId && <span className="flex items-center gap-1"><ClipboardList className="size-3" /> Assignment</span>}
                            </div>
                          </li>
                        );
                      })}
                      {s.lessons.length === 0 && <li className="text-xs text-muted-foreground">No lessons in this section.</li>}
                    </ul>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={() => toast.info("Section editor — simulated")}><Plus className="size-4" /> Add Section</Button>
                {manage.status === "draft" && (
                  <Button className="w-full" onClick={() => { setSubmitted(manage.title); setManage(null); }}>Submit for HOD Verification</Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <InfoDialog
        open={!!submitted}
        onOpenChange={(o) => !o && setSubmitted(null)}
        title="Submitted for verification"
        description={<><strong>{submitted}</strong> was submitted to the <strong>HOD</strong> for verification. Once the HOD verifies and publishes it, the course appears in the Open Learning catalog for students to enrol.</>}
      />
    </div>
  );
}
