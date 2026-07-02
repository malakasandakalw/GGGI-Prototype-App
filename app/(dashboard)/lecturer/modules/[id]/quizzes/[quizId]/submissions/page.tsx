"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, XCircle, Users, Target, Percent } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { useStore } from "@/lib/store/provider";
import { formatDateTime } from "@/lib/utils/date";
import type { QuizSubmission } from "@/lib/types";

export default function QuizSubmissions() {
  const { id, quizId } = useParams<{ id: string; quizId: string }>();
  const router = useRouter();
  const { quizzes, quizSubmissions, users, updateQuizSubmission } = useStore();
  const quiz = quizzes.find((q) => q.id === quizId);
  const subs = quizSubmissions.filter((s) => s.quizId === quizId);
  const [view, setView] = useState<QuizSubmission | null>(null);
  const [manual, setManual] = useState<Record<string, number>>({});
  const [savedInfo, setSavedInfo] = useState(false);

  if (!quiz) return <div className="p-8">Quiz not found.</div>;
  const studentName = (sid: string) => users.find((u) => u.id === sid)?.name ?? sid;
  const avg = subs.length ? Math.round(subs.reduce((a, s) => a + s.finalScore, 0) / subs.length) : 0;

  function saveManual() {
    if (!view) return;
    const added = Object.values(manual).reduce((a, b) => a + b, 0);
    updateQuizSubmission(view.id, { manualMarks: manual, finalScore: view.autoScore + added, manualReviewPending: false });
    toast.success("Manual marks saved");
    setView(null); setManual({});
    setSavedInfo(true);
  }

  const isCorrect = (qid: string, ans: string | string[], correct: string | string[]) =>
    Array.isArray(correct) ? JSON.stringify([...(ans as string[] ?? [])].sort()) === JSON.stringify([...correct].sort()) : ans === correct;

  // H — per-question analytics: % of students correct per question (identifies weak topics).
  const questionStats = quiz.questions.map((q, i) => {
    let correct = 0;
    for (const s of subs) {
      if (q.type === "short-answer") {
        if ((s.manualMarks?.[q.id] ?? 0) >= q.marks) correct++;
      } else {
        const ans = s.answers[q.id];
        if (ans !== undefined && isCorrect(q.id, ans, q.correctAnswer)) correct++;
      }
    }
    const pct = subs.length ? Math.round((correct / subs.length) * 100) : 0;
    return { id: q.id, label: `Q${i + 1}`, text: q.text, correct, pct };
  });

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-2" onClick={() => router.push(`/lecturer/modules/${id}`)}><ArrowLeft className="size-4" /> Back to module</Button>
      <PageHeader title={`Submissions: ${quiz.title}`} description={`${quiz.questions.length} questions · ${quiz.totalMarks} marks`} />

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard title="Total Attempts" value={subs.length} icon={Users} />
        <StatCard title="Average Score" value={`${avg}/${quiz.totalMarks}`} icon={Target} />
        <StatCard title="Completion Rate" value={`${subs.length ? 100 : 0}%`} icon={Percent} />
      </div>

      <Card className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Attempted</TableHead><TableHead>Auto Score</TableHead><TableHead>Review</TableHead><TableHead>Final</TableHead></TableRow></TableHeader>
          <TableBody>
            {subs.map((s) => (
              <TableRow key={s.id} className="cursor-pointer" onClick={() => { setView(s); setManual(s.manualMarks); }}>
                <TableCell className="font-medium">{studentName(s.studentId)}</TableCell>
                <TableCell>{formatDateTime(s.attemptedAt)}</TableCell>
                <TableCell>{s.autoScore}</TableCell>
                <TableCell>{s.manualReviewPending ? <Badge variant="secondary">Pending</Badge> : <Badge className="bg-emerald-100 text-emerald-800" variant="ghost">Done</Badge>}</TableCell>
                <TableCell className="font-semibold">{s.finalScore}/{quiz.totalMarks}</TableCell>
              </TableRow>
            ))}
            {subs.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No submissions yet</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Question Analysis</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {subs.length === 0 && <p className="text-sm text-muted-foreground">No submissions yet — analytics appear once students attempt this quiz.</p>}
          {subs.length > 0 && questionStats.map((qs) => (
            <div key={qs.id}>
              <div className="flex justify-between text-sm mb-1">
                <span className="truncate pr-2"><span className="font-medium">{qs.label}.</span> {qs.text}</span>
                <span className={`font-medium shrink-0 ${qs.pct < 50 ? "text-red-600" : qs.pct < 75 ? "text-amber-600" : "text-emerald-700"}`}>{qs.pct}%</span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div className={`h-full ${qs.pct < 50 ? "bg-red-500" : qs.pct < 75 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${qs.pct}%` }} />
              </div>
            </div>
          ))}
          {subs.length > 0 && <p className="text-xs text-muted-foreground pt-1">Low percentages flag poorly understood topics worth revisiting in class.</p>}
        </CardContent>
      </Card>

      <Sheet open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {view && (
            <>
              <SheetHeader><SheetTitle>{studentName(view.studentId)}</SheetTitle><SheetDescription>Full submission</SheetDescription></SheetHeader>
              <div className="px-4 pb-6 space-y-3">
                {quiz.questions.map((q, i) => {
                  const ans = view.answers[q.id];
                  const auto = q.type !== "short-answer";
                  const ok = auto && isCorrect(q.id, ans, q.correctAnswer);
                  return (
                    <Card key={q.id} className="p-3">
                      <p className="text-sm font-medium">{i + 1}. {q.text}</p>
                      <p className="text-sm mt-1">Answer: <span className="font-medium">{Array.isArray(ans) ? ans.join(", ") : ans ?? "—"}</span></p>
                      {auto ? (
                        <p className={`text-xs mt-1 flex items-center gap-1 ${ok ? "text-emerald-700" : "text-red-700"}`}>
                          {ok ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
                          {ok ? "Correct" : `Incorrect (correct: ${Array.isArray(q.correctAnswer) ? q.correctAnswer.join(", ") : q.correctAnswer})`}
                        </p>
                      ) : (
                        <div className="mt-2 space-y-2">
                          <div className="space-y-1"><Label className="text-xs">Manual Marks (max {q.marks})</Label>
                            <Input type="number" max={q.marks} value={manual[q.id] ?? ""} onChange={(e) => setManual((p) => ({ ...p, [q.id]: Number(e.target.value) }))} />
                          </div>
                          <Textarea placeholder="Comment (optional)" rows={2} />
                        </div>
                      )}
                    </Card>
                  );
                })}
                <Button className="w-full" onClick={saveManual}>Save Manual Marks</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <InfoDialog
        open={savedInfo}
        onOpenChange={setSavedInfo}
        title="Manual marks saved"
        description={<>Manual marks saved. The <strong>student&apos;s</strong> final quiz score is now complete and recorded to the gradebook.</>}
      />
    </div>
  );
}
