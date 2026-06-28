"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle, FileText, HelpCircle, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/store/provider";
import { formatDate } from "@/lib/utils/date";

export default function CohortModuleView() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const router = useRouter();
  const { currentUser, modules, users, lectures, assignments, submissions, quizzes, quizSubmissions, announcements } = useStore();
  const m = modules.find((x) => x.id === moduleId);
  if (!m) return <div className="p-8">Module not found.</div>;

  const lecturer = users.find((u) => u.id === m.primaryLecturerId)?.name ?? "—";
  const moduleLectures = lectures.filter((l) => l.moduleId === m.id && l.status === "published").sort((a, b) => a.order - b.order);
  const moduleAssignments = assignments.filter((a) => a.moduleId === m.id && a.status === "published");
  const moduleQuizzes = quizzes.filter((q) => q.moduleId === m.id && (q.status === "active" || q.status === "closed"));
  const moduleAnnouncements = announcements.filter((a) => a.moduleId === m.id);
  const completed = currentUser?.completedLectureIds ?? [];

  const subStatus = (aid: string) => submissions.find((s) => s.assignmentId === aid && s.studentId === currentUser?.id);
  const quizStatus = (qid: string) => quizSubmissions.find((s) => s.quizId === qid && s.studentId === currentUser?.id);

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-2" onClick={() => router.push("/cohort-student/modules")}><ArrowLeft className="size-4" /> Back to modules</Button>
      <PageHeader title={`${m.code} — ${m.name}`} description={`${lecturer} · ${m.creditValue} credits · Assignments ${m.assessmentBreakdown.assignments}% | Quizzes ${m.assessmentBreakdown.quizzes}% | Exam ${m.assessmentBreakdown.finalExam}%`} />

      <Tabs defaultValue="lectures">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="lectures">Lectures</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="discussion">Discussion</TabsTrigger>
        </TabsList>

        <TabsContent value="lectures">
          <div className="space-y-2">
            {moduleLectures.map((l) => {
              const done = completed.includes(l.id);
              return (
                <Card key={l.id} className="cursor-pointer hover:bg-muted/30" onClick={() => router.push(`/cohort-student/modules/${m.id}/lectures/${l.id}`)}>
                  <CardContent className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {done ? <CheckCircle2 className="size-5 text-emerald-500" /> : <Circle className="size-5 text-muted-foreground" />}
                      <div><p className="font-medium text-sm">{l.order}. {l.title}</p><p className="text-xs text-muted-foreground">{formatDate(l.lectureDate)} · {l.resources.length} resources</p></div>
                    </div>
                    <Button size="sm" variant="outline">Open</Button>
                  </CardContent>
                </Card>
              );
            })}
            {moduleLectures.length === 0 && <EmptyState title="No published lectures yet" />}
          </div>
        </TabsContent>

        <TabsContent value="assignments">
          <div className="space-y-2">
            {moduleAssignments.map((a) => {
              const sub = subStatus(a.id);
              const status = sub?.gradingStatus === "graded" ? "graded" : sub ? "submitted" : "not-submitted";
              return (
                <Card key={a.id} className="cursor-pointer hover:bg-muted/30" onClick={() => router.push(`/cohort-student/modules/${m.id}/assignments/${a.id}`)}>
                  <CardContent className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3"><FileText className="size-5 text-muted-foreground" /><div><p className="font-medium text-sm">{a.title}</p><p className="text-xs text-muted-foreground">Due {formatDate(a.dueDate)}</p></div></div>
                    <div className="flex items-center gap-2">{sub?.gradingStatus === "graded" && <Badge variant="secondary">{sub.marks}/{a.maxMarks}</Badge>}<StatusBadge status={status} /></div>
                  </CardContent>
                </Card>
              );
            })}
            {moduleAssignments.length === 0 && <EmptyState title="No assignments" />}
          </div>
        </TabsContent>

        <TabsContent value="quizzes">
          <div className="space-y-2">
            {moduleQuizzes.map((q) => {
              const sub = quizStatus(q.id);
              return (
                <Card key={q.id} className="cursor-pointer hover:bg-muted/30" onClick={() => router.push(`/cohort-student/modules/${m.id}/quizzes/${q.id}`)}>
                  <CardContent className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3"><HelpCircle className="size-5 text-muted-foreground" /><div><p className="font-medium text-sm">{q.title}</p><p className="text-xs text-muted-foreground">{q.questions.length} questions · {q.timeLimitMinutes} min</p></div></div>
                    <div className="flex items-center gap-2">{sub && <Badge variant="secondary">{sub.finalScore}/{q.totalMarks}</Badge>}<StatusBadge status={q.status === "active" ? "active" : "closed"} /></div>
                  </CardContent>
                </Card>
              );
            })}
            {moduleQuizzes.length === 0 && <EmptyState title="No quizzes available" />}
          </div>
        </TabsContent>

        <TabsContent value="announcements">
          <div className="space-y-2">
            {moduleAnnouncements.map((a) => (
              <Card key={a.id}><CardContent className="py-3"><p className="font-medium text-sm">{a.title}</p><p className="text-xs text-muted-foreground">{a.authorName} · {formatDate(a.createdAt)}</p><p className="text-sm text-muted-foreground mt-1">{a.body}</p></CardContent></Card>
            ))}
            {moduleAnnouncements.length === 0 && <EmptyState title="No announcements" />}
          </div>
        </TabsContent>

        <TabsContent value="discussion">
          <Card><CardContent className="pt-6"><EmptyState icon={MessageSquare} title="Module Discussion Board" description="Ask questions and reply to classmates and your lecturer.">
            <Button asChild variant="outline"><Link href="#">Post a Question</Link></Button>
          </EmptyState></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
