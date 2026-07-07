"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Clock, CheckCircle2, XCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store/provider";
import { uid } from "@/lib/utils";
import type { Question } from "@/lib/types";

type Phase = "intro" | "attempt" | "result";

// Fill-blank answers accept a comma-separated list of acceptable strings.
function fillBlankOk(correct: string | string[], answer: string | string[] | undefined) {
  const accepted = (Array.isArray(correct) ? correct : String(correct).split(","))
    .map((s) => s.trim().toLowerCase());
  return accepted.includes(String(answer ?? "").trim().toLowerCase());
}

export default function QuizAttempt() {
  const { moduleId, quizId } = useParams<{ moduleId: string; quizId: string }>();
  const router = useRouter();
  const { currentUser, quizzes, quizSubmissions, addQuizSubmission } = useStore();
  const quiz = quizzes.find((q) => q.id === quizId);
  const myAttempts = quizSubmissions.filter((s) => s.quizId === quizId && s.studentId === currentUser?.id);
  const attemptsUsed = myAttempts.length;
  const latest = myAttempts[myAttempts.length - 1];

  const [phase, setPhase] = useState<Phase>(attemptsUsed > 0 ? "result" : "intro");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [seconds, setSeconds] = useState((quiz?.timeLimitMinutes ?? 20) * 60);
  const [score, setScore] = useState(0);
  const [submittedInfo, setSubmittedInfo] = useState(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (phase !== "attempt") return;
    const t = setInterval(() => setSeconds((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(t);
  }, [phase]);

  // Auto-submit when the timer runs out.
  useEffect(() => {
    if (phase === "attempt" && seconds === 0 && !submittedRef.current) {
      toast.info("Time's up — submitting your quiz.");
      submit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, phase]);

  if (!quiz) return <div className="p-8">Quiz not found.</div>;
  const attemptsRemaining = Math.max(0, quiz.allowedAttempts - attemptsUsed);

  const q = quiz.questions[idx];
  const allAnswered = quiz.questions.every((qq) => answers[qq.id] !== undefined && answers[qq.id] !== "");
  const mm = Math.floor(seconds / 60), ss = seconds % 60;

  function setAns(qid: string, v: string | string[]) { setAnswers((p) => ({ ...p, [qid]: v })); }
  function toggleMulti(qid: string, opt: string) {
    setAnswers((p) => {
      const cur = (p[qid] as string[]) ?? [];
      return { ...p, [qid]: cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt] };
    });
  }

  function grade(): number {
    let s = 0;
    for (const qq of quiz!.questions) {
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
    if (submittedRef.current) return;
    submittedRef.current = true;
    const auto = grade();
    const hasShort = quiz!.questions.some((qq) => qq.type === "short-answer");
    addQuizSubmission({
      id: uid("qs"), quizId: quiz!.id, studentId: currentUser!.id,
      attemptedAt: new Date().toISOString(), answers, autoScore: auto, manualMarks: {},
      finalScore: auto, manualReviewPending: hasShort,
    });
    setScore(auto);
    setPhase("result");
    toast.success("Quiz submitted");
    setSubmittedInfo(true);
  }

  function startAttempt() {
    submittedRef.current = false;
    setAnswers({});
    setIdx(0);
    setSeconds((quiz!.timeLimitMinutes ?? 20) * 60);
    setPhase("attempt");
  }

  if (phase === "intro") {
    return (
      <div>
        <Button variant="ghost" size="sm" className="mb-2" onClick={() => router.push(`/cohort-student/modules/${moduleId}`)}><ArrowLeft className="size-4" /> Back</Button>
        <PageHeader title={quiz.title} description={quiz.instructions} />
        <Card className="max-w-lg"><CardContent className="pt-6 space-y-3">
          <Row label="Questions" value={`${quiz.questions.length}`} />
          <Row label="Total Marks" value={`${quiz.totalMarks}`} />
          <Row label="Time Limit" value={quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} min` : "None"} />
          <Row label="Attempts Allowed" value={`${quiz.allowedAttempts}`} />
          <Row label="Attempts Remaining" value={`${attemptsRemaining}`} />
          <Button className="w-full mt-2" disabled={attemptsRemaining === 0} onClick={startAttempt}>Start Quiz</Button>
        </CardContent></Card>
      </div>
    );
  }

  if (phase === "result") {
    const sub = latest;
    const finalScore = sub?.finalScore ?? score;
    const pending = sub?.manualReviewPending;
    return (
      <div>
        <Button variant="ghost" size="sm" className="mb-2" onClick={() => router.push(`/cohort-student/modules/${moduleId}`)}><ArrowLeft className="size-4" /> Back to module</Button>
        <PageHeader title="Quiz Submitted" description={quiz.title} />
        <Card className="max-w-2xl"><CardContent className="pt-6 space-y-4">
          <div className="text-center">
            <p className="font-heading text-3xl font-bold tabular-nums">{finalScore}<span className="text-lg font-normal text-muted-foreground">/{quiz.totalMarks}</span></p>
            <p className="text-sm text-muted-foreground mt-1">Auto-graded score</p>
            <p className="text-xs text-muted-foreground mt-1">Attempt {attemptsUsed} of {quiz.allowedAttempts}</p>
          </div>
          {pending && <p className="text-sm text-amber-600 text-center">Some questions are pending manual review by your lecturer.</p>}
          {attemptsRemaining > 0
            ? <div className="text-center"><Button variant="outline" onClick={startAttempt}>Retake Quiz ({attemptsRemaining} left)</Button></div>
            : <p className="text-sm text-muted-foreground text-center">No attempts remaining.</p>}
          {quiz.showAnswersAfter && sub && (
            <div className="space-y-2 border-t pt-4">
              {quiz.questions.map((qq, i) => {
                const a = sub.answers[qq.id];
                const auto = qq.type !== "short-answer";
                const ok = auto && (qq.type === "fill-blank"
                  ? fillBlankOk(qq.correctAnswer, a)
                  : Array.isArray(qq.correctAnswer)
                    ? JSON.stringify([...((a as string[]) ?? [])].sort()) === JSON.stringify([...qq.correctAnswer].sort())
                    : a === qq.correctAnswer);
                return (
                  <div key={qq.id} className="text-sm rounded border p-3">
                    <p className="font-medium">{i + 1}. {qq.text}</p>
                    <p className="mt-1">Your answer: {Array.isArray(a) ? a.join(", ") : a ?? "—"}</p>
                    {auto && <p className={`text-xs flex items-center gap-1 mt-1 ${ok ? "text-emerald-700" : "text-red-700"}`}>{ok ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}{ok ? "Correct" : `Correct: ${Array.isArray(qq.correctAnswer) ? qq.correctAnswer.join(", ") : qq.correctAnswer}`}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent></Card>

        <InfoDialog
          open={submittedInfo}
          onOpenChange={setSubmittedInfo}
          title="Quiz submitted"
          description={<>Your quiz was auto-graded instantly. Any <strong>short-answer</strong> questions are sent to your <strong>Lecturer</strong> for manual marking — your final score updates once they review them.</>}
        />
      </div>
    );
  }

  // attempt phase
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium">Question {idx + 1} of {quiz.questions.length}</p>
        {quiz.timeLimitMinutes && <span className={`flex items-center gap-1 text-sm font-mono ${seconds <= 30 ? "text-red-600" : ""}`}><Clock className="size-4" /> {mm}:{String(ss).padStart(2, "0")}</span>}
      </div>
      <Progress value={((idx + 1) / quiz.questions.length) * 100} className="mb-4" />
      <Card><CardContent className="pt-6 space-y-4">
        <p className="font-medium">{q.text}</p>
        <QuestionInput q={q} value={answers[q.id]} onChange={(v) => setAns(q.id, v)} onToggle={(o) => toggleMulti(q.id, o)} />
      </CardContent></Card>
      <div className="flex justify-between mt-4">
        <Button variant="outline" disabled={idx === 0} onClick={() => setIdx((i) => i - 1)}>Previous</Button>
        {idx < quiz.questions.length - 1
          ? <Button onClick={() => setIdx((i) => i + 1)}>Next</Button>
          : <Button disabled={!allAnswered && seconds > 0} onClick={submit}>Submit Quiz</Button>}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between text-sm"><span className="text-muted-foreground">{label}</span><span className="font-medium">{value}</span></div>;
}

function QuestionInput({ q, value, onChange, onToggle }: { q: Question; value: string | string[] | undefined; onChange: (v: string) => void; onToggle: (o: string) => void }) {
  if (q.type === "mcq-single") {
    return <RadioGroup value={(value as string) ?? ""} onValueChange={onChange} className="space-y-2">
      {q.options?.map((o) => <label key={o} className="flex items-center gap-2 text-sm rounded border p-2 cursor-pointer hover:bg-muted"><RadioGroupItem value={o} /> {o}</label>)}
    </RadioGroup>;
  }
  if (q.type === "mcq-multi") {
    const arr = (value as string[]) ?? [];
    return <div className="space-y-2">{q.options?.map((o) => <label key={o} className="flex items-center gap-2 text-sm rounded border p-2 cursor-pointer hover:bg-muted"><Checkbox checked={arr.includes(o)} onCheckedChange={() => onToggle(o)} /> {o}</label>)}</div>;
  }
  if (q.type === "true-false") {
    return <div className="flex gap-3">{["True", "False"].map((o) => <Button key={o} variant={value === o ? "default" : "outline"} className="flex-1" onClick={() => onChange(o)}>{o}</Button>)}</div>;
  }
  if (q.type === "short-answer") return <Textarea value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="Your answer..." />;
  return <Input value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="Fill in the blank" />;
}
