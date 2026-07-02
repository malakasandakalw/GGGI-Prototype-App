"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Circle, FileText, HelpCircle, Lock, Mail, MessageSquare, Plus, Send } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store/provider";
import { formatDate } from "@/lib/utils/date";
import { moduleProgress } from "@/lib/utils/progress";

export default function CohortModuleView() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const router = useRouter();
  const store = useStore();
  const { currentUser, modules, users, lectures, assignments, submissions, quizzes, quizSubmissions, announcements, discussions } = store;
  const m = modules.find((x) => x.id === moduleId);

  const [newOpen, setNewOpen] = useState(false);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [postedInfo, setPostedInfo] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [msgText, setMsgText] = useState("");
  const [messages, setMessages] = useState<{ from: "student" | "lecturer"; body: string }[]>([]);

  if (!m) return <div className="p-8">Module not found.</div>;

  const lecturer = users.find((u) => u.id === m.primaryLecturerId)?.name ?? "—";
  const moduleLectures = lectures.filter((l) => l.moduleId === m.id && l.status === "published").sort((a, b) => a.order - b.order);
  const moduleAssignments = assignments.filter((a) => a.moduleId === m.id && a.status === "published");
  const moduleQuizzes = quizzes.filter((q) => q.moduleId === m.id && (q.status === "active" || q.status === "closed"));
  const moduleAnnouncements = announcements.filter((a) => a.moduleId === m.id);
  const moduleThreads = discussions.filter((d) => d.moduleId === m.id);
  const completed = currentUser?.completedLectureIds ?? [];

  const progress = moduleProgress(m.id, currentUser?.id ?? "", {
    lectures, assignments, quizzes, completedLectureIds: completed, submissions, quizSubmissions,
  });

  const subStatus = (aid: string) => submissions.find((s) => s.assignmentId === aid && s.studentId === currentUser?.id);
  const quizStatus = (qid: string) => quizSubmissions.find((s) => s.quizId === qid && s.studentId === currentUser?.id);
  // Sequential access: a lecture is locked until the previous published lecture is complete (SRS §4.6).
  const lectureLocked = (order: number) =>
    !!m.sequentialLectures && order > 1 && !completed.includes(moduleLectures[order - 2]?.id ?? "");

  function sendMessage() {
    if (!msgText.trim()) return;
    setMessages((prev) => [...prev, { from: "student", body: msgText }]);
    setMsgText("");
    toast.success(`Message sent to ${lecturer} (simulated).`);
  }

  function createThread(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    store.addThread({ moduleId: m!.id, title: String(fd.get("title")), body: String(fd.get("body")) });
    setNewOpen(false);
    toast.success("Question posted");
    setPostedInfo(true);
  }

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-2" onClick={() => router.push("/cohort-student/modules")}><ArrowLeft className="size-4" /> Back to modules</Button>
      <PageHeader title={`${m.code} — ${m.name}`} description={`${lecturer} · ${m.creditValue} credits · Assignments ${m.assessmentBreakdown.assignments}% | Quizzes ${m.assessmentBreakdown.quizzes}% | Exam ${m.assessmentBreakdown.finalExam}%`}>
        <Button variant="outline" size="sm" onClick={() => setMsgOpen(true)}><Mail className="size-4" /> Message Lecturer</Button>
      </PageHeader>

      <Card className="mb-4"><CardContent className="pt-6 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Module Progress</p>
          <span className="text-sm font-semibold">{progress.percent}%</span>
        </div>
        <Progress value={progress.percent} />
        <p className="text-xs text-muted-foreground">
          Lectures {progress.lectures.done}/{progress.lectures.total} · Assignments {progress.assignments.done}/{progress.assignments.total} · Quizzes {progress.quizzes.done}/{progress.quizzes.total}
        </p>
      </CardContent></Card>

      <Tabs defaultValue="lectures">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="lectures">Lectures</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="discussion">Discussion</TabsTrigger>
        </TabsList>

        <TabsContent value="lectures">
          {m.sequentialLectures && <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Lock className="size-3" /> Sequential access is on — complete each lecture to unlock the next.</p>}
          <div className="space-y-2">
            {moduleLectures.map((l) => {
              const done = completed.includes(l.id);
              const locked = lectureLocked(l.order);
              return (
                <Card key={l.id} className={locked ? "opacity-60" : "cursor-pointer hover:bg-muted/30"} onClick={() => !locked && router.push(`/cohort-student/modules/${m.id}/lectures/${l.id}`)}>
                  <CardContent className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {locked ? <Lock className="size-5 text-muted-foreground" /> : done ? <CheckCircle2 className="size-5 text-emerald-500" /> : <Circle className="size-5 text-muted-foreground" />}
                      <div><p className="font-medium text-sm">{l.order}. {l.title}</p><p className="text-xs text-muted-foreground">{locked ? "Locked — finish the previous lecture" : `${formatDate(l.lectureDate)} · ${l.resources.length} resources`}</p></div>
                    </div>
                    <Button size="sm" variant="outline" disabled={locked}>{locked ? "Locked" : "Open"}</Button>
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
          <div className="flex justify-end mb-3"><Button size="sm" onClick={() => setNewOpen(true)}><Plus className="size-4" /> New Question</Button></div>
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              {moduleThreads.map((t) => (
                <button key={t.id} onClick={() => setActiveThread(t.id)} className={`w-full text-left rounded-lg border p-3 hover:bg-muted ${activeThread === t.id ? "border-primary bg-primary/5" : ""}`}>
                  <div className="flex items-center justify-between"><p className="font-medium text-sm">{t.title}</p>{t.resolved && <Badge variant="secondary" className="text-[10px]">Resolved</Badge>}</div>
                  <p className="text-xs text-muted-foreground">{t.authorName} · {t.replies.length} replies</p>
                </button>
              ))}
              {moduleThreads.length === 0 && <EmptyState icon={MessageSquare} title="No questions yet" description="Be the first to ask." />}
            </div>
            <Card className="lg:col-span-2"><CardContent className="pt-6">
              {(() => {
                const t = moduleThreads.find((x) => x.id === activeThread);
                if (!t) return <EmptyState title="Select a question" description="Choose a thread to read replies, or post a new question." />;
                return (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2"><p className="font-semibold">{t.title}</p>{t.resolved && <Badge variant="secondary" className="text-[10px]">Resolved</Badge>}</div>
                      <p className="text-sm mt-1">{t.body}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t.authorName} · {formatDate(t.createdAt)}</p>
                    </div>
                    <div className="space-y-2 border-t pt-3">
                      {t.replies.map((r) => (
                        <div key={r.id} className="text-sm bg-muted rounded p-2"><p className="font-medium text-xs">{r.authorName} <span className="text-muted-foreground font-normal">· {r.authorRole === "lecturer" ? "Lecturer" : "Student"}</span></p><p>{r.body}</p></div>
                      ))}
                      {t.replies.length === 0 && <p className="text-sm text-muted-foreground">No replies yet.</p>}
                    </div>
                    <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply..." rows={2} />
                    <Button size="sm" disabled={!reply.trim()} onClick={() => { store.addReply(t.id, reply); setReply(""); toast.success("Reply posted"); }}>Post Reply</Button>
                  </div>
                );
              })()}
            </CardContent></Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ask a Question</DialogTitle></DialogHeader>
          <form onSubmit={createThread} className="space-y-3">
            <div className="space-y-1.5"><Label className="text-xs">Title</Label><Input name="title" required placeholder="Summarise your question" /></div>
            <div className="space-y-1.5"><Label className="text-xs">Details</Label><Textarea name="body" required rows={4} placeholder="Explain what you need help with..." /></div>
            <DialogFooter><Button type="submit">Post Question</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={msgOpen} onOpenChange={setMsgOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Message {lecturer}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2 max-h-64 overflow-y-auto rounded-lg border p-3 bg-muted/30">
              {messages.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No messages yet. Start a private conversation with your module lecturer.</p>}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "student" ? "justify-end" : "justify-start"}`}>
                  <div className={`text-sm rounded-lg px-3 py-1.5 max-w-[80%] ${msg.from === "student" ? "bg-primary text-primary-foreground" : "bg-background border"}`}>{msg.body}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={msgText} onChange={(e) => setMsgText(e.target.value)} placeholder="Type a message..." onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }} />
              <Button size="icon" onClick={sendMessage} disabled={!msgText.trim()}><Send className="size-4" /></Button>
            </div>
            <p className="text-[11px] text-muted-foreground">Direct messages are private between you and your module lecturer (simulated).</p>
          </div>
        </DialogContent>
      </Dialog>

      <InfoDialog
        open={postedInfo}
        onOpenChange={setPostedInfo}
        title="Question posted"
        description={<>Your question is now on the module discussion board. Your <strong>Lecturer and classmates</strong> can reply, and you&apos;ll see their responses here.</>}
      />
    </div>
  );
}
