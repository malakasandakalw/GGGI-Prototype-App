"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Plus, MessageSquare, Lock } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { QuizBuilder } from "@/components/lecturer/QuizBuilder";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useStore } from "@/lib/store/provider";
import { formatDate } from "@/lib/utils/date";
import { studentsInModule } from "@/lib/utils/student-access";

export default function ModuleHub() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const store = useStore();
  const { modules, programs, lectures, assignments, submissions, quizzes, users, moduleGrades, discussions } = store;
  const m = modules.find((x) => x.id === id);
  const [lecOpen, setLecOpen] = useState(false);
  const [asgOpen, setAsgOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [asgLevel, setAsgLevel] = useState("module");
  const [asgSubType, setAsgSubType] = useState<"file" | "text" | "both">("file");
  const [asgFileTypes, setAsgFileTypes] = useState<string[]>([".pdf", ".docx"]);
  const [asgVisible, setAsgVisible] = useState(true);
  const [reply, setReply] = useState("");
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");
  const [createdAsg, setCreatedAsg] = useState(false);
  const [caInfo, setCaInfo] = useState(false);
  const [annInfo, setAnnInfo] = useState(false);
  const FILE_TYPES = [".pdf", ".docx", ".pptx", ".zip", ".jpg", ".png"];

  if (!m) return <div className="p-8">Module not found.</div>;

  const moduleLectures = lectures.filter((l) => l.moduleId === m.id).sort((a, b) => a.order - b.order);
  const moduleAssignments = assignments.filter((a) => a.moduleId === m.id);
  const moduleQuizzes = quizzes.filter((q) => q.moduleId === m.id);
  const prog = programs.find((p) => p.id === m.programId);
  // Roster by enrollment — includes cross-enrolled Open Learning students, not just cohort-role.
  const enrolled = studentsInModule(users, programs, m.id);
  const moduleThreads = discussions.filter((d) => d.moduleId === m.id);
  const moduleAnnouncements = store.announcements.filter((a) => a.moduleId === m.id);

  function createLecture(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    store.addLecture({ moduleId: m!.id, title: String(fd.get("title")), order: Number(fd.get("order")), lectureDate: String(fd.get("date")), description: String(fd.get("desc")) });
    setLecOpen(false);
    toast.success("Lecture saved as draft");
  }
  function createAssignment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    store.addAssignment({
      moduleId: m!.id,
      title: String(fd.get("title")),
      description: String(fd.get("desc")),
      maxMarks: Number(fd.get("marks")),
      submissionType: asgSubType,
      allowedFileTypes: asgSubType === "text" ? [] : asgFileTypes,
      maxFileSizeMb: Number(fd.get("maxsize")) || undefined,
      openDate: String(fd.get("open")),
      dueDate: String(fd.get("due")),
      latePolicy: String(fd.get("late")) || undefined,
      status: asgVisible ? "published" : "draft",
      lectureId: asgLevel === "lecture" ? String(fd.get("lecture")) : undefined,
    });
    setAsgOpen(false);
    toast.success("Assignment created");
    if (asgVisible) setCreatedAsg(true);
  }
  function submitCA() {
    store.submitModuleCA(m!.id);
    toast.success("CA marks submitted to HOD for review.");
    setCaInfo(true);
  }
  function postAnnouncement() {
    store.addAnnouncement({ title: annTitle, body: annBody, target: m!.id, moduleId: m!.id });
    toast.success("Announcement posted. All enrolled students notified (simulated).");
    setAnnTitle(""); setAnnBody(""); setAnnInfo(true);
  }
  const caSubmitted = store.caSubmittedModuleIds.includes(m.id);

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-2" onClick={() => router.push("/lecturer/modules")}><ArrowLeft className="size-4" /> Back</Button>
      <PageHeader title={`${m.code} — ${m.name}`} description={`${prog?.name} · ${m.creditValue} credits · ${enrolled.length} students · CA ${m.assessmentBreakdown.assignments + m.assessmentBreakdown.quizzes}% / Exam ${m.assessmentBreakdown.finalExam}%`} />

      <Tabs defaultValue="lectures">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="lectures">Lectures</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <TabsTrigger value="gradebook">Gradebook</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="discussion">Discussion</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>

        {/* LECTURES */}
        <TabsContent value="lectures">
          <div className="flex justify-end mb-3"><Button size="sm" onClick={() => setLecOpen(true)}><Plus className="size-4" /> Create Lecture</Button></div>
          <div className="space-y-2">
            {moduleLectures.map((l) => (
              <Card key={l.id}><CardContent className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{l.order}. {l.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(l.lectureDate)} · {l.resources.length} resources</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={l.status} />
                  <Button asChild size="sm" variant="outline"><Link href={`/lecturer/modules/${m.id}/lectures/${l.id}`}>Open</Link></Button>
                </div>
              </CardContent></Card>
            ))}
            {moduleLectures.length === 0 && <EmptyState title="No lectures yet" />}
          </div>
        </TabsContent>

        {/* ASSIGNMENTS */}
        <TabsContent value="assignments">
          <div className="flex justify-end mb-3"><Button size="sm" onClick={() => setAsgOpen(true)}><Plus className="size-4" /> Create Assignment</Button></div>
          <div className="grid sm:grid-cols-2 gap-3">
            {moduleAssignments.map((a) => {
              const subs = submissions.filter((s) => s.assignmentId === a.id);
              return (
                <Card key={a.id}><CardContent className="pt-6 space-y-2">
                  <div className="flex items-start justify-between">
                    <div><p className="font-medium">{a.title}</p><p className="text-xs text-muted-foreground">{a.lectureId ? "Lecture-level" : "Module-level"} · Due {formatDate(a.dueDate)}</p></div>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">{subs.length}/{enrolled.length} submitted</p>
                  <Button asChild size="sm" variant="outline" className="w-full"><Link href={`/lecturer/modules/${m.id}/assignments/${a.id}/grade`}>Grade</Link></Button>
                </CardContent></Card>
              );
            })}
            {moduleAssignments.length === 0 && <EmptyState title="No assignments yet" />}
          </div>
        </TabsContent>

        {/* QUIZZES */}
        <TabsContent value="quizzes">
          <div className="flex justify-end mb-3"><Button size="sm" onClick={() => setQuizOpen(true)}><Plus className="size-4" /> Create Quiz</Button></div>
          <div className="grid sm:grid-cols-2 gap-3">
            {moduleQuizzes.map((q) => (
              <Card key={q.id}><CardContent className="pt-6 space-y-2">
                <div className="flex items-start justify-between"><div><p className="font-medium">{q.title}</p><p className="text-xs text-muted-foreground">{q.questions.length} questions · {q.totalMarks} marks</p></div><StatusBadge status={q.status} /></div>
                <Button asChild size="sm" variant="outline" className="w-full"><Link href={`/lecturer/modules/${m.id}/quizzes/${q.id}/submissions`}>View Submissions</Link></Button>
              </CardContent></Card>
            ))}
            {moduleQuizzes.length === 0 && <EmptyState title="No quizzes yet" />}
          </div>
        </TabsContent>

        {/* GRADEBOOK */}
        <TabsContent value="gradebook">
          <Card className="p-0">
            <div className="flex items-center justify-between p-4 border-b">
              <p className="text-sm text-muted-foreground">CA is auto-aggregated from graded assignments &amp; quizzes. Final Exam is entered by the HOD.</p>
              {caSubmitted
                ? <Badge className="bg-emerald-100 text-emerald-800">Submitted to HOD</Badge>
                : <Button size="sm" onClick={submitCA}>Submit to HOD</Button>}
            </div>
            <Table>
              <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Assign</TableHead><TableHead>Quiz</TableHead><TableHead>Total CA</TableHead><TableHead>Final Exam</TableHead><TableHead>Grade</TableHead></TableRow></TableHeader>
              <TableBody>
                {enrolled.map((s) => {
                  const g = moduleGrades.find((x) => x.studentId === s.id && x.moduleId === m.id);
                  const ca = g ? Math.round((g.assignmentMarks + g.quizMarks) / 2) : 0;
                  return <TableRow key={s.id}>
                    <TableCell>{s.name}</TableCell><TableCell>{g?.assignmentMarks ?? "—"}</TableCell><TableCell>{g?.quizMarks ?? "—"}</TableCell>
                    <TableCell>{ca}</TableCell>
                    <TableCell className="text-muted-foreground"><span className="inline-flex items-center gap-1.5"><Lock className="size-3.5" /> Awaiting HOD</span></TableCell>
                    <TableCell className="font-semibold">{g?.grade ?? "—"}</TableCell>
                  </TableRow>;
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* STUDENTS */}
        <TabsContent value="students">
          <Card className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Student ID</TableHead><TableHead>Name</TableHead><TableHead>Type</TableHead></TableRow></TableHeader>
              <TableBody>
                {enrolled.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.studentId ?? "—"}</TableCell>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.crossEnrolledModuleIds?.includes(m.id) ? <Badge variant="secondary">Cross-Enrolled</Badge> : s.programId === m.programId ? "Cohort" : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* DISCUSSION */}
        <TabsContent value="discussion">
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              {moduleThreads.map((t) => (
                <button key={t.id} onClick={() => setActiveThread(t.id)} className={`w-full text-left rounded-lg border p-3 hover:bg-muted ${activeThread === t.id ? "border-primary bg-primary/5" : ""}`}>
                  <div className="flex items-center justify-between"><p className="font-medium text-sm">{t.title}</p>{t.resolved && <Badge variant="secondary" className="text-[10px]">Resolved</Badge>}</div>
                  <p className="text-xs text-muted-foreground">{t.authorName} · {t.replies.length} replies</p>
                </button>
              ))}
              {moduleThreads.length === 0 && <EmptyState icon={MessageSquare} title="No threads" />}
            </div>
            <Card className="lg:col-span-2"><CardContent className="pt-6">
              {(() => {
                const t = moduleThreads.find((x) => x.id === activeThread);
                if (!t) return <EmptyState title="Select a thread" />;
                return (
                  <div className="space-y-4">
                    <div><p className="font-semibold">{t.title}</p><p className="text-sm mt-1">{t.body}</p><p className="text-xs text-muted-foreground mt-1">{t.authorName}</p></div>
                    <div className="space-y-2 border-t pt-3">
                      {t.replies.map((r) => (
                        <div key={r.id} className="text-sm bg-muted rounded p-2"><p className="font-medium text-xs">{r.authorName}</p><p>{r.body}</p></div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply..." rows={2} />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" disabled={!reply.trim()} onClick={() => { store.addReply(t.id, reply); setReply(""); toast.success("Reply posted"); }}>Post Reply</Button>
                      <Button size="sm" variant="outline" onClick={() => { store.resolveThread(t.id); toast.success(t.resolved ? "Reopened" : "Marked resolved"); }}>{t.resolved ? "Reopen" : "Mark Resolved"}</Button>
                      <Button size="sm" variant="ghost" onClick={() => { store.deleteThread(t.id); setActiveThread(null); toast.success("Thread deleted"); }}>Delete</Button>
                    </div>
                  </div>
                );
              })()}
            </CardContent></Card>
          </div>
        </TabsContent>

        {/* ANNOUNCEMENTS */}
        <TabsContent value="announcements">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card><CardContent className="pt-6 space-y-3 max-h-[420px] overflow-y-auto">
              {moduleAnnouncements.map((a) => (
                <div key={a.id} className="border-b last:border-0 pb-2"><p className="font-medium text-sm">{a.title}</p><p className="text-xs text-muted-foreground">{a.authorName} · {formatDate(a.createdAt)}</p><p className="text-sm text-muted-foreground mt-1">{a.body}</p></div>
              ))}
              {moduleAnnouncements.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No announcements yet.</p>}
            </CardContent></Card>
            <Card><CardContent className="pt-6 space-y-3">
              <div className="space-y-1.5"><Label className="text-xs">Title</Label><Input value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Message</Label><Textarea value={annBody} onChange={(e) => setAnnBody(e.target.value)} rows={5} /></div>
              <Button disabled={!annTitle || !annBody} onClick={postAnnouncement}>Post Announcement</Button>
            </CardContent></Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Lecture Dialog */}
      <Dialog open={lecOpen} onOpenChange={setLecOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Lecture</DialogTitle></DialogHeader>
          <form onSubmit={createLecture} className="space-y-3">
            <div className="space-y-1.5"><Label className="text-xs">Lecture Title</Label><Input name="title" required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Order</Label><Input name="order" type="number" defaultValue={moduleLectures.length + 1} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Lecture Date</Label><Input name="date" type="date" /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Description / Objectives</Label><Textarea name="desc" /></div>
            <DialogFooter><Button type="submit">Save as Draft</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Assignment Dialog */}
      <Dialog open={asgOpen} onOpenChange={setAsgOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create Assignment</DialogTitle></DialogHeader>
          <form onSubmit={createAssignment} className="space-y-3">
            <div className="space-y-1.5"><Label className="text-xs">Title</Label><Input name="title" required /></div>
            <div className="space-y-1.5"><Label className="text-xs">Level</Label>
              <RadioGroup value={asgLevel} onValueChange={setAsgLevel} className="flex gap-4">
                <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="module" /> Module-level</label>
                <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="lecture" /> Lecture-level</label>
              </RadioGroup>
            </div>
            {asgLevel === "lecture" && (
              <div className="space-y-1.5"><Label className="text-xs">Attach to Lecture</Label>
                <Select name="lecture"><SelectTrigger><SelectValue placeholder="Select lecture" /></SelectTrigger><SelectContent>{moduleLectures.map((l) => <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>)}</SelectContent></Select>
              </div>
            )}
            <div className="space-y-1.5"><Label className="text-xs">Instructions</Label><Textarea name="desc" /></div>
            <div className="space-y-1.5"><Label className="text-xs">Submission Type</Label>
              <Select value={asgSubType} onValueChange={(v) => setAsgSubType(v as "file" | "text" | "both")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="file">File upload</SelectItem>
                  <SelectItem value="text">Text entry</SelectItem>
                  <SelectItem value="both">File + Text</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {asgSubType !== "text" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs">Allowed File Types</Label>
                  <div className="flex flex-wrap gap-3 rounded-md border p-2">
                    {FILE_TYPES.map((ft) => (
                      <label key={ft} className="flex items-center gap-1.5 text-sm">
                        <Checkbox checked={asgFileTypes.includes(ft)} onCheckedChange={() => setAsgFileTypes((p) => p.includes(ft) ? p.filter((x) => x !== ft) : [...p, ft])} />
                        {ft}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5"><Label className="text-xs">Max File Size (MB)</Label><Input name="maxsize" type="number" defaultValue={10} /></div>
              </>
            )}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Max Marks</Label><Input name="marks" type="number" defaultValue={100} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Open Date</Label><Input name="open" type="datetime-local" /></div>
              <div className="space-y-1.5"><Label className="text-xs">Due Date</Label><Input name="due" type="datetime-local" /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Late / Grace Policy</Label><Input name="late" placeholder="e.g. 10% penalty per day, up to 3 days" /></div>
            <div className="flex items-center justify-between rounded-md border p-2.5">
              <div><p className="text-sm">Visible to students immediately</p><p className="text-xs text-muted-foreground">Off = saved as draft</p></div>
              <Switch checked={asgVisible} onCheckedChange={setAsgVisible} />
            </div>
            <DialogFooter><Button type="submit">Create Assignment</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <InfoDialog
        open={createdAsg}
        onOpenChange={setCreatedAsg}
        title="Assignment published"
        description={<>Assignment published to <strong>students</strong> in this module. They can submit until the due date, after which the submission window <strong>closes automatically</strong>. You&apos;ll grade submissions from the Assignments tab.</>}
      />
      <InfoDialog
        open={caInfo}
        onOpenChange={setCaInfo}
        title="CA marks submitted"
        description={<>Continuous Assessment marks submitted to the <strong>HOD</strong>. The HOD will enter the final examination mark, then review and <strong>publish</strong> the results to students.</>}
      />
      <InfoDialog
        open={annInfo}
        onOpenChange={setAnnInfo}
        title="Announcement posted"
        description={<>Announcement posted. All <strong>students</strong> enrolled in this module have been notified (simulated).</>}
      />

      <QuizBuilder open={quizOpen} onOpenChange={setQuizOpen} moduleId={m.id} />
    </div>
  );
}
