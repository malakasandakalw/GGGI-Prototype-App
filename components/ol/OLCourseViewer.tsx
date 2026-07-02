"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft, CheckCircle2, Circle, Lock, Play, Video, FileText, Presentation,
  BookOpen, File, Download, Eye, ClipboardCheck, PencilLine, MessageSquare, Send,
  Award, HelpCircle,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { OLQuizDialog } from "@/components/ol/OLQuizDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store/provider";
import { cn, uid } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils/date";
import type { OLLesson, Resource } from "@/lib/types";

const resIcon: Record<Resource["type"], typeof Video> = { video: Video, slides: Presentation, notes: FileText, reading: BookOpen, file: File };

type LocalMessage = { id: string; from: "student" | "instructor"; body: string; at: string };

/**
 * Shared Open Learning course player. Reused by both the OL student route and
 * the Cohort student "explore" route so enrolled OL courses are consumable from
 * either stream (SRS §7.2). `backHref` / `backLabel` point back to the caller's
 * course list.
 */
export function OLCourseViewer({
  courseId,
  backHref,
  backLabel = "Back to my courses",
}: {
  courseId: string;
  backHref: string;
  backLabel?: string;
}) {
  const router = useRouter();
  const {
    currentUser, olCourses, olEnrollments, users, quizzes, assignments, submissions,
    discussions, completeOLLesson, upsertSubmission, addThread, addReply, resolveThread,
  } = useStore();
  const course = olCourses.find((c) => c.id === courseId);
  const enrollment = olEnrollments.find((e) => e.studentId === currentUser?.id && e.courseId === courseId);
  const allLessons = course?.sections.flatMap((s) => s.lessons) ?? [];
  const [activeId, setActiveId] = useState(allLessons[0]?.id ?? "");
  const [video, setVideo] = useState(false);
  const [viewRes, setViewRes] = useState<Resource | null>(null);

  // Item G — quiz + assignment
  const [quizOpen, setQuizOpen] = useState(false);
  const [asgOpen, setAsgOpen] = useState(false);
  const [asgText, setAsgText] = useState("");
  const [asgFile, setAsgFile] = useState("");

  // Item M — message instructor
  const [msgOpen, setMsgOpen] = useState(false);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [draft, setDraft] = useState("");

  // Item L — discussion
  const [askOpen, setAskOpen] = useState(false);
  const [qTitle, setQTitle] = useState("");
  const [qBody, setQBody] = useState("");
  const [replyOf, setReplyOf] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");

  // Explainers
  const [postedInfo, setPostedInfo] = useState(false);
  const [completeInfo, setCompleteInfo] = useState(false);

  if (!course) return <div className="p-8">Course not found.</div>;
  if (!enrollment) return <div className="p-8">You are not enrolled in this course.</div>;

  const completed = enrollment.completedLessonIds;
  const active = allLessons.find((l) => l.id === activeId);
  const instructor = users.find((u) => u.id === course.lecturerId);
  const threads = discussions.filter((t) => t.moduleId === courseId);
  const isComplete = enrollment.completionPercentage >= 100;

  const activeQuiz = active?.quizId ? quizzes.find((q) => q.id === active.quizId) : undefined;
  const activeAsg = active?.assignmentId ? assignments.find((a) => a.id === active.assignmentId) : undefined;
  const mySubmission = activeAsg ? submissions.find((s) => s.assignmentId === activeAsg.id && s.studentId === currentUser?.id) : undefined;

  function isLocked(lesson: OLLesson, sectionLessons: OLLesson[]) {
    if (!lesson.isSequential) return false;
    const idx = sectionLessons.findIndex((l) => l.id === lesson.id);
    if (idx <= 0) return false;
    return !completed.includes(sectionLessons[idx - 1].id);
  }

  function markComplete() {
    if (!active) return;
    const wasLast = completed.length + 1 >= allLessons.length;
    completeOLLesson(currentUser!.id, course!.id, active.id);
    toast.success("Lesson marked complete");
    if (wasLast) setCompleteInfo(true);
  }

  function submitAssignment() {
    if (!activeAsg) return;
    upsertSubmission({
      assignmentId: activeAsg.id,
      studentId: currentUser!.id,
      textContent: asgText || undefined,
      fileName: asgFile || undefined,
      fileUrl: asgFile ? "#" : undefined,
      submittedAt: new Date().toISOString(),
      gradingStatus: "submitted",
    });
    toast.success("Assignment submitted");
    setAsgOpen(false); setAsgText(""); setAsgFile("");
  }

  function sendMessage() {
    if (!draft.trim()) return;
    const mine: LocalMessage = { id: uid("m"), from: "student", body: draft.trim(), at: new Date().toISOString() };
    setMessages((p) => [...p, mine]);
    setDraft("");
    // Simulate instructor auto-reply
    setTimeout(() => {
      setMessages((p) => [...p, { id: uid("m"), from: "instructor", body: "Thanks for your message — I'll get back to you within one working day. (Simulated reply)", at: new Date().toISOString() }]);
    }, 700);
  }

  function postQuestion() {
    addThread({ moduleId: courseId, title: qTitle, body: qBody });
    setAskOpen(false); setQTitle(""); setQBody("");
    setPostedInfo(true);
  }

  function sendReply(threadId: string) {
    if (!replyBody.trim()) return;
    addReply(threadId, replyBody.trim());
    setReplyBody(""); setReplyOf(null);
    toast.success("Reply posted");
  }

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-2" onClick={() => router.push(backHref)}><ArrowLeft className="size-4" /> {backLabel}</Button>
      <div className="flex items-start justify-between gap-4">
        <PageHeader title={course.title} description={`${enrollment.completionPercentage}% complete${isComplete ? " · Course complete 🎉" : ""}`} />
        <Button variant="outline" size="sm" onClick={() => setMsgOpen(true)}><MessageSquare className="size-4" /> Message Instructor</Button>
      </div>

      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="discussion">Discussion {threads.length > 0 && <Badge variant="secondary" className="ml-1">{threads.length}</Badge>}</TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="h-fit"><CardContent className="pt-6 space-y-3">
              <Progress value={enrollment.completionPercentage} />
              {course.sections.map((s) => (
                <Collapsible key={s.id} defaultOpen>
                  <CollapsibleTrigger className="font-medium text-sm w-full text-left py-1">{s.title}</CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 pl-1">
                    {s.lessons.map((l) => {
                      const done = completed.includes(l.id);
                      const locked = isLocked(l, s.lessons);
                      return (
                        <button key={l.id} disabled={locked} onClick={() => setActiveId(l.id)}
                          className={cn("flex items-center gap-2 w-full text-left text-sm rounded px-2 py-1.5 disabled:opacity-50", activeId === l.id ? "bg-primary/10 text-primary" : "hover:bg-muted")}>
                          {locked ? <Lock className="size-3.5" /> : done ? <CheckCircle2 className="size-3.5 text-emerald-500" /> : <Circle className="size-3.5 text-muted-foreground" />}
                          <span className="flex-1">{l.title}</span>
                          {l.quizId && <HelpCircle className="size-3.5 text-muted-foreground" />}
                          {l.assignmentId && <PencilLine className="size-3.5 text-muted-foreground" />}
                        </button>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </CardContent></Card>

            <Card className="lg:col-span-2"><CardHeader><CardTitle className="text-base">{active?.title ?? "Select a lesson"}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {active ? (
                  <>
                    <div className="space-y-2">
                      {active.resources.map((r) => {
                        const Icon = resIcon[r.type];
                        return (
                          <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
                            <span className="flex items-center gap-2 text-sm">
                              <Icon className="size-4 text-muted-foreground" /> {r.title}
                              <Badge variant="secondary" className="text-[10px]">{r.format}</Badge>
                              {!r.isDownloadable && r.type !== "video" && <Badge variant="outline" className="text-[10px]">View only</Badge>}
                            </span>
                            {r.type === "video" ? (
                              <Button size="sm" onClick={() => setVideo(true)}><Play className="size-4" /> Watch</Button>
                            ) : r.isDownloadable ? (
                              <Button size="sm" variant="outline" onClick={() => toast.success("Download simulated")}><Download className="size-4" /> Download</Button>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => setViewRes(r)}><Eye className="size-4" /> View</Button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {(activeQuiz || activeAsg) && (
                      <div className="space-y-2">
                        {activeQuiz && (
                          <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-3">
                            <span className="flex items-center gap-2 text-sm"><HelpCircle className="size-4 text-primary" /> {activeQuiz.title} <Badge variant="secondary" className="text-[10px]">{activeQuiz.totalMarks} marks</Badge></span>
                            <Button size="sm" onClick={() => setQuizOpen(true)}><ClipboardCheck className="size-4" /> Attempt Quiz</Button>
                          </div>
                        )}
                        {activeAsg && (
                          <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-3">
                            <span className="flex items-center gap-2 text-sm"><PencilLine className="size-4 text-primary" /> {activeAsg.title}
                              {mySubmission && <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">{mySubmission.gradingStatus === "graded" ? `Graded ${mySubmission.marks}/${activeAsg.maxMarks}` : "Submitted"}</Badge>}
                            </span>
                            <Button size="sm" variant={mySubmission ? "outline" : "default"} onClick={() => setAsgOpen(true)}>{mySubmission ? "Resubmit" : "Submit"}</Button>
                          </div>
                        )}
                      </div>
                    )}

                    <Button onClick={markComplete} disabled={completed.includes(active.id)}>
                      {completed.includes(active.id) ? "Completed" : "Mark as Complete"}
                    </Button>
                  </>
                ) : <p className="text-sm text-muted-foreground">No lesson selected.</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="discussion">
          <Card><CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Ask questions and discuss this course with peers and your instructor.</p>
              <Button size="sm" onClick={() => setAskOpen(true)}><MessageSquare className="size-4" /> Ask a Question</Button>
            </div>
            {threads.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">No questions yet — be the first to ask.</p>}
            {threads.map((t) => (
              <div key={t.id} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm">{t.title} {t.resolved && <Badge className="bg-emerald-100 text-emerald-800 ml-1">Resolved</Badge>}</p>
                    <p className="text-xs text-muted-foreground">{t.authorName} · {formatDateTime(t.createdAt)}</p>
                  </div>
                  {t.authorId === currentUser?.id && <Button variant="ghost" size="sm" onClick={() => resolveThread(t.id)}>{t.resolved ? "Reopen" : "Mark Resolved"}</Button>}
                </div>
                <p className="text-sm">{t.body}</p>
                {t.replies.length > 0 && (
                  <div className="space-y-2 border-l-2 pl-3 ml-1">
                    {t.replies.map((r) => (
                      <div key={r.id} className="text-sm">
                        <p className="text-xs text-muted-foreground">{r.authorName} · {formatDateTime(r.createdAt)}</p>
                        <p>{r.body}</p>
                      </div>
                    ))}
                  </div>
                )}
                {replyOf === t.id ? (
                  <div className="flex gap-2">
                    <Input value={replyBody} onChange={(e) => setReplyBody(e.target.value)} placeholder="Write a reply..." />
                    <Button size="sm" onClick={() => sendReply(t.id)}><Send className="size-4" /></Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => { setReplyOf(t.id); setReplyBody(""); }}>Reply</Button>
                )}
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* Video */}
      <Dialog open={video} onOpenChange={setVideo}>
        <DialogContent>
          <DialogHeader><DialogTitle>{active?.title}</DialogTitle></DialogHeader>
          <div className="aspect-video bg-slate-900 rounded-lg flex flex-col items-center justify-center text-white/70"><Play className="size-12 mb-2" /><p className="text-sm">Video streaming to be integrated</p></div>
        </DialogContent>
      </Dialog>

      {/* View-only resource (F) */}
      <Dialog open={!!viewRes} onOpenChange={(o) => !o && setViewRes(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{viewRes?.title}</DialogTitle></DialogHeader>
          <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center text-muted-foreground">
            <FileText className="size-12 mb-2" />
            <p className="text-sm">In-browser preview ({viewRes?.format})</p>
            <p className="text-xs mt-1">This resource is view-only — downloading is disabled by the instructor.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quiz (G) */}
      {activeQuiz && <OLQuizDialog quiz={activeQuiz} open={quizOpen} onOpenChange={setQuizOpen} />}

      {/* Assignment submit (G) */}
      <Dialog open={asgOpen} onOpenChange={setAsgOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{activeAsg?.title}</DialogTitle></DialogHeader>
          {activeAsg && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{activeAsg.description}</p>
              <p className="text-xs text-muted-foreground">Due {formatDateTime(activeAsg.dueDate)} · Max {activeAsg.maxMarks} marks{activeAsg.allowedFileTypes ? ` · ${activeAsg.allowedFileTypes.join(", ")}` : ""}</p>
              {(activeAsg.submissionType === "text" || activeAsg.submissionType === "both") && (
                <div className="space-y-1.5"><Label className="text-xs">Your answer</Label><Textarea value={asgText} onChange={(e) => setAsgText(e.target.value)} rows={4} /></div>
              )}
              {(activeAsg.submissionType === "file" || activeAsg.submissionType === "both") && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Upload file</Label>
                  <Input type="file" onChange={(e) => setAsgFile(e.target.files?.[0]?.name ?? "")} />
                  {asgFile && <p className="text-xs text-muted-foreground">Selected: {asgFile}</p>}
                </div>
              )}
            </div>
          )}
          <DialogFooter><Button variant="ghost" onClick={() => setAsgOpen(false)}>Cancel</Button><Button onClick={submitAssignment}>Submit</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message instructor (M) */}
      <Dialog open={msgOpen} onOpenChange={setMsgOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Message {instructor?.name ?? "Instructor"}</DialogTitle></DialogHeader>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {messages.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Start a conversation with your instructor.</p>}
            {messages.map((m) => (
              <div key={m.id} className={cn("max-w-[80%] rounded-lg px-3 py-2 text-sm", m.from === "student" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted")}>
                {m.body}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message..." onKeyDown={(e) => e.key === "Enter" && sendMessage()} />
            <Button size="sm" onClick={sendMessage}><Send className="size-4" /></Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ask a question (L) */}
      <Dialog open={askOpen} onOpenChange={setAskOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ask a Question</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label className="text-xs">Title</Label><Input value={qTitle} onChange={(e) => setQTitle(e.target.value)} placeholder="Summarise your question" /></div>
            <div className="space-y-1.5"><Label className="text-xs">Details</Label><Textarea value={qBody} onChange={(e) => setQBody(e.target.value)} rows={4} /></div>
          </div>
          <DialogFooter><Button variant="ghost" onClick={() => setAskOpen(false)}>Cancel</Button><Button disabled={!qTitle.trim()} onClick={postQuestion}>Post Question</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Explainers */}
      <InfoDialog
        open={postedInfo}
        onOpenChange={setPostedInfo}
        title="Question posted"
        description={<>Your question is now visible on the <strong>course discussion board</strong>. Peers and the course <strong>instructor</strong> can reply, and you can mark the thread <strong>resolved</strong> once answered. Instructors are notified of new questions.</>}
      />
      <InfoDialog
        open={completeInfo}
        onOpenChange={setCompleteInfo}
        title="Course complete 🎉"
        description={<>You&apos;ve finished every lesson in <strong>{course.title}</strong>. Once your quizzes meet the minimum pass score, a <strong>certificate of completion</strong> is issued with a unique ID and verification URL — find it under <strong>Certificates</strong>.</>}
        actionLabel="View Certificates"
      />
    </div>
  );
}
