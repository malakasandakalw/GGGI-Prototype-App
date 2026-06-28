"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useStore } from "@/lib/store/provider";
import { formatDateTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils";

export default function QuizVerification() {
  const { quizzes, modules, users, updateQuiz, addNotification } = useStore();
  const queue = quizzes.filter((q) => q.status === "submitted");
  const [selectedId, setSelectedId] = useState<string | null>(queue[0]?.id ?? null);
  const [feedback, setFeedback] = useState("");
  const selected = quizzes.find((q) => q.id === selectedId && q.status === "submitted");

  const moduleName = (id: string) => modules.find((m) => m.id === id)?.name ?? "";
  const lecturerName = (id: string) => users.find((u) => u.id === id)?.name ?? "";

  function approve() {
    if (!selected) return;
    updateQuiz(selected.id, { status: "active", verifiedAt: new Date().toISOString() });
    addNotification({ recipientId: selected.createdByLecturerId, title: "Quiz approved", body: `${selected.title} was approved.`, type: "quiz" });
    toast.success("Quiz approved and made available to students.");
    setSelectedId(null); setFeedback("");
  }
  function returnQz() {
    if (!selected) return;
    updateQuiz(selected.id, { status: "draft", hodFeedback: feedback });
    addNotification({ recipientId: selected.createdByLecturerId, title: "Quiz returned", body: `${selected.title} was returned with feedback.`, type: "quiz" });
    toast.success(`Quiz returned to ${lecturerName(selected.createdByLecturerId)}.`);
    setSelectedId(null); setFeedback("");
  }

  if (queue.length === 0) {
    return (
      <div>
        <PageHeader title="Quiz Verification" description="Review quizzes before they go live." />
        <Card><CardContent><EmptyState title="No quizzes pending verification" description="You're all caught up." /></CardContent></Card>
      </div>
    );
  }

  const isCorrect = (opt: string, correct: string | string[]) => Array.isArray(correct) ? correct.includes(opt) : correct === opt;

  return (
    <div>
      <PageHeader title="Quiz Verification" description={`${queue.length} quiz(zes) awaiting your review.`} />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          {queue.map((q) => (
            <button key={q.id} onClick={() => { setSelectedId(q.id); setFeedback(""); }}
              className={cn("w-full text-left rounded-lg border p-3 transition-colors hover:bg-muted", selectedId === q.id && "border-primary bg-primary/5")}>
              <p className="font-medium text-sm">{q.title}</p>
              <p className="text-xs text-muted-foreground">{moduleName(q.moduleId)} · {lecturerName(q.createdByLecturerId)}</p>
              <p className="text-xs text-muted-foreground">{q.questions.length} questions · {q.totalMarks} marks</p>
            </button>
          ))}
        </div>

        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            {selected ? (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold">{selected.title}</h2>
                  <p className="text-sm text-muted-foreground">{selected.instructions}</p>
                  <p className="text-xs text-muted-foreground mt-1">Time limit: {selected.timeLimitMinutes ?? "—"} min · Attempts: {selected.allowedAttempts} · Submitted {formatDateTime(selected.submittedAt ?? "")}</p>
                </div>
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertDescription className="text-sm">Ensure all questions are unambiguous, answers are correct, and marks are fairly distributed.</AlertDescription>
                </Alert>
                <div className="space-y-3">
                  {selected.questions.map((q, i) => (
                    <Card key={q.id} className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{i + 1}. {q.text}</p>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="secondary" className="text-[10px] capitalize">{q.type.replace("-", " ")}</Badge>
                          <span className="text-xs text-muted-foreground">{q.marks} marks</span>
                        </div>
                      </div>
                      {q.options && (
                        <ul className="mt-2 space-y-1">
                          {q.options.map((o) => (
                            <li key={o} className={cn("text-sm flex items-center gap-2", isCorrect(o, q.correctAnswer) && "text-emerald-700 font-medium")}>
                              {isCorrect(o, q.correctAnswer) && <CheckCircle2 className="size-3.5" />} {o}
                            </li>
                          ))}
                        </ul>
                      )}
                      {!q.options && <p className="text-sm mt-2 text-emerald-700">Answer: {String(q.correctAnswer)}</p>}
                      {q.explanation && <p className="text-xs text-muted-foreground mt-2 italic">{q.explanation}</p>}
                    </Card>
                  ))}
                </div>
                <div className="space-y-2 pt-2 border-t">
                  <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Return with feedback (optional)..." />
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={approve}>Approve Quiz</Button>
                    <Button variant="outline" className="flex-1" disabled={!feedback.trim()} onClick={returnQz}>Return to Lecturer</Button>
                  </div>
                </div>
              </div>
            ) : <EmptyState title="Select a quiz to review" />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
