"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Circle, Lock, Play, Video, FileText, Presentation, BookOpen, File } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store/provider";
import { cn } from "@/lib/utils";
import type { OLLesson, Resource } from "@/lib/types";

const resIcon: Record<Resource["type"], typeof Video> = { video: Video, slides: Presentation, notes: FileText, reading: BookOpen, file: File };

export default function OLCourseView() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const { currentUser, olCourses, olEnrollments, completeOLLesson } = useStore();
  const course = olCourses.find((c) => c.id === courseId);
  const enrollment = olEnrollments.find((e) => e.studentId === currentUser?.id && e.courseId === courseId);
  const allLessons = course?.sections.flatMap((s) => s.lessons) ?? [];
  const [activeId, setActiveId] = useState(allLessons[0]?.id ?? "");
  const [video, setVideo] = useState(false);

  if (!course) return <div className="p-8">Course not found.</div>;
  if (!enrollment) return <div className="p-8">You are not enrolled in this course.</div>;

  const completed = enrollment.completedLessonIds;
  const active = allLessons.find((l) => l.id === activeId);

  function isLocked(lesson: OLLesson, sectionLessons: OLLesson[]) {
    if (!lesson.isSequential) return false;
    const idx = sectionLessons.findIndex((l) => l.id === lesson.id);
    if (idx <= 0) return false;
    return !completed.includes(sectionLessons[idx - 1].id);
  }

  function markComplete() {
    if (!active) return;
    completeOLLesson(currentUser!.id, course!.id, active.id);
    toast.success("Lesson marked complete");
  }

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-2" onClick={() => router.push("/ol-student/courses")}><ArrowLeft className="size-4" /> Back to my courses</Button>
      <PageHeader title={course.title} description={`${enrollment.completionPercentage}% complete`} />

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="h-fit"><CardContent className="pt-6 space-y-3">
          <Progress value={enrollment.completionPercentage} />
          {course.sections.map((s) => (
            <Collapsible key={s.id} defaultOpen>
              <CollapsibleTrigger className="font-medium text-sm w-full text-left py-1">{s.title}</CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 pl-1">
                {s.lessons.map((l) => {
                  const done = completed.includes(l.id);
                  const locked = isLocked(l, s.lessons);
                  return (
                    <button key={l.id} disabled={locked} onClick={() => setActiveId(l.id)}
                      className={cn("flex items-center gap-2 w-full text-left text-sm rounded px-2 py-1.5 disabled:opacity-50", activeId === l.id ? "bg-primary/10 text-primary" : "hover:bg-muted")}>
                      {locked ? <Lock className="size-3.5" /> : done ? <CheckCircle2 className="size-3.5 text-emerald-500" /> : <Circle className="size-3.5 text-muted-foreground" />}
                      {l.title}
                    </button>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </CardContent></Card>

        <Card className="lg:col-span-2"><CardHeader><CardTitle className="text-base">{active?.title ?? "Select a lesson"}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {active ? (
              <>
                <div className="space-y-2">
                  {active.resources.map((r) => {
                    const Icon = resIcon[r.type];
                    return (
                      <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
                        <span className="flex items-center gap-2 text-sm"><Icon className="size-4 text-muted-foreground" /> {r.title} <Badge variant="secondary" className="text-[10px]">{r.format}</Badge></span>
                        {r.type === "video" ? <Button size="sm" onClick={() => setVideo(true)}><Play className="size-4" /> Watch</Button> : <Button size="sm" variant="outline" onClick={() => toast.success("Download simulated")}>Open</Button>}
                      </div>
                    );
                  })}
                </div>
                <Button onClick={markComplete} disabled={completed.includes(active.id)}>
                  {completed.includes(active.id) ? "Completed" : "Mark as Complete"}
                </Button>
              </>
            ) : <p className="text-sm text-muted-foreground">No lesson selected.</p>}
          </CardContent>
        </Card>
      </div>

      <Dialog open={video} onOpenChange={setVideo}>
        <DialogContent>
          <DialogHeader><DialogTitle>{active?.title}</DialogTitle></DialogHeader>
          <div className="aspect-video bg-slate-900 rounded-lg flex flex-col items-center justify-center text-white/70"><Play className="size-12 mb-2" /><p className="text-sm">Video streaming to be integrated</p></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
