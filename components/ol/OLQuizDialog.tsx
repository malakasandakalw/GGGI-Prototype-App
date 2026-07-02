"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store/provider";
import { uid } from "@/lib/utils";
import type { Question, Quiz } from "@/lib/types";

function fillBlankOk(correct: string | string[], answer: string | string[] | undefined) {
  const accepted = (Array.isArray(correct) ? correct : String(correct).split(",")).map((s) => s.trim().toLowerCase());
  return accepted.includes(String(answer ?? "").trim().toLowerCase());
}

/** Compact, self-contained OL lesson-quiz attempt used inside the course viewer. */
export function OLQuizDialog({ quiz, open, onOpenChange }: { quiz: Quiz; open: boolean; onOpenChange: (o: boolean) => void }) {
  const { currentUser, quizSubmissions, addQuizSubmission } = useStore();
  const myAttempts = quizSubmissions.filter((s) => s.quizId === quiz.id && s.studentId === currentUser?.id);
  const [phase, setPhase] = useState<"attempt" | "result">(myAttempts.length > 0 ? "result" : "attempt");
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [score, setScore] = useState(myAttempts[myAttempts.length - 1]?.finalScore ?? 0);

  const attemptsRemaining = Math.max(0, quiz.allowedAttempts - myAttempts.length);
  const allAnswered = quiz.questions.every((qq) => answers[qq.id] !== undefined && answers[qq.id] !== "");

  function grade() {
    let s = 0;
    for (const qq of quiz.questions) {
      if (qq.type === "short-answer") continue;
      const a = answers[qq.id];
      let ok = false;
      if (qq.type === "fill-blank") ok = fillBlankOk(qq.correctAnswer, a);
      else if (Array.isArray(qq.correctAnswer)) ok = JSON.stringify([...((a as string[]) ?? [])].sort()) === JSON.stringify([...qq.correctAnswer].sort());
      else ok = a === qq.correctAnswer;
      if (ok) s += qq.marks;
    }
    return s;
  }

  function submit() {
    const auto = grade();
    const hasShort = quiz.questions.some((qq) => qq.type === "short-answer");
    addQuizSubmission({ id: uid("qs"), quizId: quiz.id, studentId: currentUser!.id, attemptedAt: new Date().toISOString(), answers, autoScore: auto, manualMarks: {}, finalScore: auto, manualReviewPending: hasShort });
    setScore(auto);
    setPhase("result");
    toast.success("Quiz submitted");
  }

  function retake() { setAnswers({}); setPhase("attempt"); }

  const setAns = (qid: string, v: string | string[]) => setAnswers((p) => ({ ...p, [qid]: v }));
  const toggleMulti = (qid: string, opt: string) => setAnswers((p) => {
    const cur = (p[qid] as string[]) ?? [];
    return { ...p, [qid]: cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt] };
  });

  const answered = quiz.questions.filter((qq) => answers[qq.id] !== undefined && answers[qq.id] !== "").length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{quiz.title}</DialogTitle></DialogHeader>
        {phase === "attempt" ? (
          <div className="space-y-4">
            <Progress value={(answered / quiz.questions.length) * 100} />
            {quiz.questions.map((q, i) => (
              <div key={q.id} className="rounded-lg border p-3 space-y-2">
                <p className="text-sm font-medium">{i + 1}. {q.text}</p>
                <QuestionInput q={q} value={answers[q.id]} onChange={(v) => setAns(q.id, v)} onToggle={(o) => toggleMulti(q.id, o)} />
              </div>
            ))}
            <Button className="w-full" disabled={!allAnswered} onClick={submit}>Submit Quiz</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-4xl font-bold">{score}<span className="text-xl text-muted-foreground">/{quiz.totalMarks}</span></p>
              <p className="text-sm text-muted-foreground mt-1">Auto-graded score · attempt {myAttempts.length} of {quiz.allowedAttempts}</p>
            </div>
            {quiz.showAnswersAfter && (myAttempts[myAttempts.length - 1] ?? { answers }) && (
              <div className="space-y-2 border-t pt-3">
                {quiz.questions.map((qq, i) => {
                  const a = (myAttempts[myAttempts.length - 1]?.answers ?? answers)[qq.id];
                  const auto = qq.type !== "short-answer";
                  const ok = auto && (qq.type === "fill-blank" ? fillBlankOk(qq.correctAnswer, a) : Array.isArray(qq.correctAnswer) ? JSON.stringify([...((a as string[]) ?? [])].sort()) === JSON.stringify([...qq.correctAnswer].sort()) : a === qq.correctAnswer);
                  return (
                    <div key={qq.id} className="text-sm rounded border p-2">
                      <p className="font-medium">{i + 1}. {qq.text}</p>
                      <p className="mt-1 text-muted-foreground">Your answer: {Array.isArray(a) ? a.join(", ") : a ?? "—"}</p>
                      {auto && <p className={`text-xs flex items-center gap-1 mt-1 ${ok ? "text-emerald-700" : "text-red-700"}`}>{ok ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}{ok ? "Correct" : `Correct: ${Array.isArray(qq.correctAnswer) ? qq.correctAnswer.join(", ") : qq.correctAnswer}`}</p>}
                    </div>
                  );
                })}
              </div>
            )}
            {attemptsRemaining > 0
              ? <Button variant="outline" className="w-full" onClick={retake}>Retake Quiz ({attemptsRemaining} left)</Button>
              : <p className="text-sm text-muted-foreground text-center">No attempts remaining.</p>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function QuestionInput({ q, value, onChange, onToggle }: { q: Question; value: string | string[] | undefined; onChange: (v: string) => void; onToggle: (o: string) => void }) {
  if (q.type === "mcq-single") {
    return <RadioGroup value={(value as string) ?? ""} onValueChange={onChange} className="space-y-1.5">
      {q.options?.map((o) => <label key={o} className="flex items-center gap-2 text-sm rounded border p-2 cursor-pointer hover:bg-muted"><RadioGroupItem value={o} /> {o}</label>)}
    </RadioGroup>;
  }
  if (q.type === "mcq-multi") {
    const arr = (value as string[]) ?? [];
    return <div className="space-y-1.5">{q.options?.map((o) => <label key={o} className="flex items-center gap-2 text-sm rounded border p-2 cursor-pointer hover:bg-muted"><Checkbox checked={arr.includes(o)} onCheckedChange={() => onToggle(o)} /> {o}</label>)}</div>;
  }
  if (q.type === "true-false") {
    return <div className="flex gap-3">{["True", "False"].map((o) => <Button key={o} type="button" variant={value === o ? "default" : "outline"} className="flex-1" onClick={() => onChange(o)}>{o}</Button>)}</div>;
  }
  if (q.type === "short-answer") return <Textarea value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="Your answer..." />;
  return <Input value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="Fill in the blank" />;
}
