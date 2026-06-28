"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store/provider";

export default function QuizDetail() {
  const { id, quizId } = useParams<{ id: string; quizId: string }>();
  const router = useRouter();
  const { quizzes } = useStore();
  const quiz = quizzes.find((q) => q.id === quizId);
  if (!quiz) return <div className="p-8">Quiz not found.</div>;

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-2" onClick={() => router.push(`/lecturer/modules/${id}`)}><ArrowLeft className="size-4" /> Back to module</Button>
      <PageHeader title={quiz.title} description={`${quiz.questions.length} questions · ${quiz.totalMarks} marks · ${quiz.timeLimitMinutes ?? "no"} min limit`}>
        <StatusBadge status={quiz.status} />
        <Button asChild><Link href={`/lecturer/modules/${id}/quizzes/${quiz.id}/submissions`}>View Submissions</Link></Button>
      </PageHeader>
      <p className="text-sm text-muted-foreground mb-4">{quiz.instructions}</p>
      <div className="space-y-3">
        {quiz.questions.map((q, i) => (
          <Card key={q.id}><CardContent className="pt-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium">{i + 1}. {q.text}</p>
              <div className="flex items-center gap-2 shrink-0"><Badge variant="secondary" className="text-[10px] capitalize">{q.type.replace("-", " ")}</Badge><span className="text-xs text-muted-foreground">{q.marks}m</span></div>
            </div>
            {q.options && <ul className="mt-2 text-sm space-y-0.5">{q.options.map((o) => <li key={o} className={Array.isArray(q.correctAnswer) ? (q.correctAnswer.includes(o) ? "text-emerald-700" : "") : (q.correctAnswer === o ? "text-emerald-700" : "")}>• {o}</li>)}</ul>}
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}
