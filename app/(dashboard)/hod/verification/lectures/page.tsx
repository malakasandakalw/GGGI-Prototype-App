"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Video, FileText, Presentation, BookOpen, File } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useStore } from "@/lib/store/provider";
import { formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils";
import type { Resource } from "@/lib/types";

const resIcon: Record<Resource["type"], typeof Video> = {
  video: Video, slides: Presentation, notes: FileText, reading: BookOpen, file: File,
};

export default function LectureVerification() {
  const { lectures, modules, users, assignments, quizzes, updateLecture, addNotification } = useStore();
  const queue = lectures.filter((l) => l.status === "submitted");
  const [selectedId, setSelectedId] = useState<string | null>(queue[0]?.id ?? null);
  const [feedback, setFeedback] = useState("");
  const selected = lectures.find((l) => l.id === selectedId && l.status === "submitted");

  const moduleName = (id: string) => modules.find((m) => m.id === id)?.name ?? "";
  const lecturerName = (id: string) => users.find((u) => u.id === id)?.name ?? "";

  function publish() {
    if (!selected) return;
    updateLecture(selected.id, { status: "published" });
    addNotification({ recipientId: selected.createdByLecturerId, title: "Lecture approved", body: `${selected.title} was approved and published.`, type: "lecture" });
    toast.success("Lecture published. Students notified (simulated).");
    setSelectedId(null); setFeedback("");
  }
  function returnLec() {
    if (!selected) return;
    updateLecture(selected.id, { status: "draft", hodFeedback: feedback });
    addNotification({ recipientId: selected.createdByLecturerId, title: "Lecture returned", body: `${selected.title} was returned with feedback.`, type: "lecture" });
    toast.success(`Lecture returned to ${lecturerName(selected.createdByLecturerId)}.`);
    setSelectedId(null); setFeedback("");
  }

  if (queue.length === 0) {
    return (
      <div>
        <PageHeader title="Lecture Verification" description="Review lectures submitted by lecturers." />
        <Card><CardContent><EmptyState title="No lectures pending verification" description="You're all caught up." /></CardContent></Card>
      </div>
    );
  }

  const lecAssignment = selected ? assignments.find((a) => a.lectureId === selected.id) : null;
  const lecQuiz = selected ? quizzes.find((q) => q.lectureId === selected.id) : null;

  return (
    <div>
      <PageHeader title="Lecture Verification" description={`${queue.length} lecture(s) awaiting your review.`} />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          {queue.map((l) => (
            <button
              key={l.id}
              onClick={() => { setSelectedId(l.id); setFeedback(""); }}
              className={cn("w-full text-left rounded-lg border p-3 transition-colors hover:bg-muted", selectedId === l.id && "border-primary bg-primary/5")}
            >
              <p className="font-medium text-sm">{l.title}</p>
              <p className="text-xs text-muted-foreground">{moduleName(l.moduleId)} · {lecturerName(l.createdByLecturerId)}</p>
              <p className="text-xs text-muted-foreground">{formatDate(l.lectureDate)} · {l.resources.length} resources</p>
            </button>
          ))}
        </div>

        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            {selected ? (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold">{selected.title}</h2>
                  <p className="text-sm text-muted-foreground">{moduleName(selected.moduleId)} · {formatDate(selected.lectureDate)}</p>
                  <p className="text-sm mt-2">{selected.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Resources</p>
                  <div className="space-y-2">
                    {selected.resources.map((r) => {
                      const Icon = resIcon[r.type];
                      return (
                        <div key={r.id} className="flex items-center justify-between rounded-lg border p-2.5">
                          <div className="flex items-center gap-2 text-sm"><Icon className="size-4 text-muted-foreground" /> {r.title} <span className="text-xs text-muted-foreground">({r.format})</span></div>
                          <Button size="sm" variant="ghost" onClick={() => toast.info("Preview simulated")}>Preview</Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {lecAssignment && <Alert><AlertDescription className="text-sm">Attached assignment: <b>{lecAssignment.title}</b> · Due {formatDate(lecAssignment.dueDate)} · {lecAssignment.maxMarks} marks</AlertDescription></Alert>}
                {lecQuiz && <Alert><AlertDescription className="text-sm">Attached quiz: <b>{lecQuiz.title}</b> · {lecQuiz.questions.length} questions · {lecQuiz.totalMarks} marks</AlertDescription></Alert>}
                <div className="space-y-2 pt-2 border-t">
                  <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Return with feedback (optional)..." />
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={publish}>Approve &amp; Publish</Button>
                    <Button variant="outline" className="flex-1" disabled={!feedback.trim()} onClick={returnLec}>Return to Lecturer</Button>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState title="Select a lecture to review" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
