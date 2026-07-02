"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Play, Video, FileText, Presentation, BookOpen, File, CheckCircle2, Lock } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store/provider";
import { formatDate } from "@/lib/utils/date";
import type { Resource } from "@/lib/types";

const resIcon: Record<Resource["type"], typeof Video> = { video: Video, slides: Presentation, notes: FileText, reading: BookOpen, file: File };

export default function CohortLectureView() {
  const { moduleId, lectureId } = useParams<{ moduleId: string; lectureId: string }>();
  const router = useRouter();
  const { currentUser, modules, lectures, markLectureComplete } = useStore();
  const moduleLectures = lectures.filter((l) => l.moduleId === moduleId && l.status === "published").sort((a, b) => a.order - b.order);
  const lecture = lectures.find((l) => l.id === lectureId);
  const mod = modules.find((m) => m.id === moduleId);
  const [video, setVideo] = useState(false);

  if (!lecture) return <div className="p-8">Lecture not found.</div>;
  const idx = moduleLectures.findIndex((l) => l.id === lecture.id);
  const prev = moduleLectures[idx - 1];
  const next = moduleLectures[idx + 1];
  const done = currentUser?.completedLectureIds?.includes(lecture.id);
  // Sequential access: block this lecture until the previous one is complete (SRS §4.6).
  const locked = !!mod?.sequentialLectures && idx > 0 && !currentUser?.completedLectureIds?.includes(prev?.id ?? "");
  const nextLocked = !!mod?.sequentialLectures && !done;

  if (locked) {
    return (
      <div>
        <Button variant="ghost" size="sm" className="mb-2" onClick={() => router.push(`/cohort-student/modules/${moduleId}`)}><ArrowLeft className="size-4" /> Back to module</Button>
        <PageHeader title={lecture.title} description={`Lecture ${idx + 1} of ${moduleLectures.length}`} />
        <Card className="max-w-lg"><CardContent className="pt-6 flex flex-col items-center text-center gap-2 py-10">
          <Lock className="size-8 text-muted-foreground" />
          <p className="font-medium">This lecture is locked</p>
          <p className="text-sm text-muted-foreground">Complete the previous lecture first — this module uses sequential access.</p>
          {prev && <Button variant="outline" onClick={() => router.push(`/cohort-student/modules/${moduleId}/lectures/${prev.id}`)}>Go to previous lecture</Button>}
        </CardContent></Card>
      </div>
    );
  }

  function access(r: Resource) {
    if (currentUser) markLectureComplete(currentUser.id, lecture!.id);
    if (r.type === "video") setVideo(true);
    else if (r.isDownloadable) toast.success("Download simulated");
    else if (r.url !== "#") toast.success("External link opened (simulated)");
    else toast.info("Opened (view only)");
  }

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-2" onClick={() => router.push(`/cohort-student/modules/${moduleId}`)}><ArrowLeft className="size-4" /> Back to module</Button>
      <PageHeader title={lecture.title} description={`Lecture ${idx + 1} of ${moduleLectures.length} · ${formatDate(lecture.lectureDate)}`}>
        {done && <Badge className="bg-emerald-100 text-emerald-800" variant="ghost"><CheckCircle2 className="size-3.5" /> Complete</Badge>}
      </PageHeader>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card><CardHeader><CardTitle className="text-base">Learning Objectives</CardTitle></CardHeader><CardContent><p className="text-sm">{lecture.description}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Resources</CardTitle></CardHeader><CardContent className="space-y-2">
            {lecture.resources.map((r) => {
              const Icon = resIcon[r.type];
              return (
                <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2 text-sm"><Icon className="size-4 text-muted-foreground" /> {r.title} <Badge variant="secondary" className="text-[10px]">{r.format}</Badge></div>
                  {r.type === "video" ? <Button size="sm" onClick={() => access(r)}><Play className="size-4" /> Watch</Button>
                    : r.isDownloadable ? <Button size="sm" variant="outline" onClick={() => access(r)}>Download</Button>
                    : r.url !== "#" ? <Button size="sm" variant="outline" onClick={() => access(r)}>Open</Button>
                    : <Button size="sm" variant="ghost" onClick={() => access(r)}><Lock className="size-3.5" /> View (No download)</Button>}
                </div>
              );
            })}
            {lecture.resources.length === 0 && <p className="text-sm text-muted-foreground">No resources.</p>}
          </CardContent></Card>
        </div>

        <div className="space-y-4">
          <Card><CardContent className="pt-6 space-y-2">
            <p className="text-sm font-medium">Navigation</p>
            <Button variant="outline" className="w-full" disabled={!prev} onClick={() => prev && router.push(`/cohort-student/modules/${moduleId}/lectures/${prev.id}`)}>← Previous Lecture</Button>
            <Button variant="outline" className="w-full" disabled={!next || nextLocked} onClick={() => next && router.push(`/cohort-student/modules/${moduleId}/lectures/${next.id}`)}>{nextLocked && next ? "Next locked — complete this lecture" : "Next Lecture →"}</Button>
          </CardContent></Card>
          <Card><CardContent className="pt-6 text-sm"><p className="text-muted-foreground">Status</p><p className="font-medium mt-1">{done ? "Completed" : "Not yet completed — open a resource to mark complete."}</p></CardContent></Card>
        </div>
      </div>

      <Dialog open={video} onOpenChange={setVideo}>
        <DialogContent>
          <DialogHeader><DialogTitle>{lecture.title}</DialogTitle></DialogHeader>
          <div className="aspect-video bg-slate-900 rounded-lg flex flex-col items-center justify-center text-white/70">
            <Play className="size-12 mb-2" />
            <p className="text-sm">Video streaming to be integrated</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
