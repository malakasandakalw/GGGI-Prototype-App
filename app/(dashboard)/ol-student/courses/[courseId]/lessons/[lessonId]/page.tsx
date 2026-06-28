"use client";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Video, FileText, Presentation, BookOpen, File } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store/provider";
import type { Resource } from "@/lib/types";

const resIcon: Record<Resource["type"], typeof Video> = { video: Video, slides: Presentation, notes: FileText, reading: BookOpen, file: File };

export default function OLLessonView() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const router = useRouter();
  const { currentUser, olCourses, olEnrollments, completeOLLesson } = useStore();
  const course = olCourses.find((c) => c.id === courseId);
  const lesson = course?.sections.flatMap((s) => s.lessons).find((l) => l.id === lessonId);
  const enrollment = olEnrollments.find((e) => e.studentId === currentUser?.id && e.courseId === courseId);

  if (!course || !lesson) return <div className="p-8">Lesson not found.</div>;
  const done = enrollment?.completedLessonIds.includes(lesson.id);

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-2" onClick={() => router.push(`/ol-student/courses/${courseId}`)}><ArrowLeft className="size-4" /> Back to course</Button>
      <PageHeader title={lesson.title} description={course.title} />
      <Card className="max-w-2xl"><CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          {lesson.resources.map((r) => {
            const Icon = resIcon[r.type];
            return (
              <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
                <span className="flex items-center gap-2 text-sm"><Icon className="size-4 text-muted-foreground" /> {r.title} <Badge variant="secondary" className="text-[10px]">{r.format}</Badge></span>
                <Button size="sm" variant="outline" onClick={() => toast.success("Opened (simulated)")}>Open</Button>
              </div>
            );
          })}
        </div>
        <Button disabled={done} onClick={() => { completeOLLesson(currentUser!.id, course.id, lesson.id); toast.success("Lesson marked complete"); }}>
          {done ? "Completed" : "Mark as Complete"}
        </Button>
      </CardContent></Card>
    </div>
  );
}
