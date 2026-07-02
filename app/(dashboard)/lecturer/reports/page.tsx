"use client";

import { toast } from "sonner";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useStore } from "@/lib/store/provider";

const BANDS = [
  { b: "A", min: 70, color: "bg-emerald-500" },
  { b: "B", min: 60, color: "bg-blue-500" },
  { b: "C", min: 50, color: "bg-amber-500" },
  { b: "D", min: 40, color: "bg-orange-500" },
  { b: "F", min: 0, color: "bg-red-500" },
];
const bandOf = (pct: number) => BANDS.find((x) => pct >= x.min)!.b;

export default function LecturerReports() {
  const { currentUser, modules, assignments, submissions, quizzes, quizSubmissions, users } = useStore();
  const myModules = modules.filter((m) => m.lecturerIds.includes(currentUser?.id ?? ""));
  const myAssignments = assignments.filter((a) => myModules.some((m) => m.id === a.moduleId));
  const myQuizzes = quizzes.filter((q) => myModules.some((m) => m.id === q.moduleId));

  const enrolledIn = (moduleId: string) => {
    const mod = myModules.find((m) => m.id === moduleId);
    return users.filter((u) => u.role === "cohort-student" && (u.programId === mod?.programId || u.crossEnrolledModuleIds?.includes(moduleId)));
  };
  const isCorrect = (ans: string | string[] | undefined, correct: string | string[]) =>
    ans === undefined ? false : Array.isArray(correct) ? JSON.stringify([...(ans as string[] ?? [])].sort()) === JSON.stringify([...correct].sort()) : ans === correct;

  const students = Array.from(new Map(myModules.flatMap((m) => enrolledIn(m.id)).map((s) => [s.id, s])).values());

  const exportBtn = <Button variant="outline" size="sm" onClick={() => toast.success("Report exported successfully")}><Download className="size-4" /> Export</Button>;

  function Bar({ value, total }: { value: number; total: number }) {
    const pct = total ? Math.round((value / total) * 100) : 0;
    return (
      <div className="flex items-center gap-2">
        <div className="h-2.5 flex-1 bg-muted rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${pct}%` }} /></div>
        <span className="text-xs text-muted-foreground w-20 text-right">{value}/{total} ({pct}%)</span>
      </div>
    );
  }

  function Distribution({ marks }: { marks: number[] }) {
    const total = marks.length || 1;
    return (
      <div className="flex h-6 rounded overflow-hidden border">
        {BANDS.map((band) => {
          const n = marks.filter((mk) => bandOf(mk) === band.b).length;
          const pct = (n / total) * 100;
          return pct > 0 ? <div key={band.b} className={`${band.color} flex items-center justify-center text-[10px] text-white`} style={{ width: `${pct}%` }}>{band.b}</div> : null;
        })}
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Reports" description="Submission rates, grade distributions, student progress and quiz analytics across your modules.">
        {exportBtn}
      </PageHeader>
      <Tabs defaultValue="submission">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="submission">Submission Rates</TabsTrigger>
          <TabsTrigger value="grades">Grade Distribution</TabsTrigger>
          <TabsTrigger value="progress">Student Progress</TabsTrigger>
          <TabsTrigger value="quiz">Quiz Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="submission">
          <Card><CardContent className="pt-6 space-y-4">
            <p className="text-sm font-medium">Assignments</p>
            {myAssignments.map((a) => {
              const total = enrolledIn(a.moduleId).length;
              const done = submissions.filter((s) => s.assignmentId === a.id).length;
              return <div key={a.id}><p className="text-sm mb-1">{a.title}</p><Bar value={done} total={total} /></div>;
            })}
            {myAssignments.length === 0 && <p className="text-sm text-muted-foreground">No assignments yet.</p>}
            <p className="text-sm font-medium pt-2">Quizzes</p>
            {myQuizzes.map((q) => {
              const total = enrolledIn(q.moduleId).length;
              const done = quizSubmissions.filter((s) => s.quizId === q.id).length;
              return <div key={q.id}><p className="text-sm mb-1">{q.title}</p><Bar value={done} total={total} /></div>;
            })}
            {myQuizzes.length === 0 && <p className="text-sm text-muted-foreground">No quizzes yet.</p>}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="grades">
          <Card><CardContent className="pt-6 space-y-5">
            {myAssignments.map((a) => {
              const marks = submissions.filter((s) => s.assignmentId === a.id && s.gradingStatus === "graded").map((s) => Math.round(((s.marks ?? 0) / a.maxMarks) * 100));
              return (
                <div key={a.id}>
                  <p className="text-sm font-medium mb-1">{a.title} <span className="text-xs text-muted-foreground">· {marks.length} graded</span></p>
                  {marks.length ? <Distribution marks={marks} /> : <p className="text-xs text-muted-foreground">No graded submissions yet.</p>}
                </div>
              );
            })}
            {myQuizzes.map((q) => {
              const marks = quizSubmissions.filter((s) => s.quizId === q.id).map((s) => Math.round((s.finalScore / q.totalMarks) * 100));
              return (
                <div key={q.id}>
                  <p className="text-sm font-medium mb-1">{q.title} <span className="text-xs text-muted-foreground">· {marks.length} attempts</span></p>
                  {marks.length ? <Distribution marks={marks} /> : <p className="text-xs text-muted-foreground">No attempts yet.</p>}
                </div>
              );
            })}
            {myAssignments.length === 0 && myQuizzes.length === 0 && <p className="text-sm text-muted-foreground">No assessments yet.</p>}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="progress">
          <Card className="p-0"><Table>
            <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Assignments Submitted</TableHead><TableHead>Quizzes Attempted</TableHead></TableRow></TableHeader>
            <TableBody>
              {students.map((st) => {
                const enrolledAsg = myAssignments.filter((a) => enrolledIn(a.moduleId).some((e) => e.id === st.id));
                const subDone = enrolledAsg.filter((a) => submissions.some((s) => s.assignmentId === a.id && s.studentId === st.id)).length;
                const enrolledQz = myQuizzes.filter((q) => enrolledIn(q.moduleId).some((e) => e.id === st.id));
                const qzDone = enrolledQz.filter((q) => quizSubmissions.some((s) => s.quizId === q.id && s.studentId === st.id)).length;
                return (
                  <TableRow key={st.id}>
                    <TableCell className="font-medium">{st.name}</TableCell>
                    <TableCell>{subDone}/{enrolledAsg.length}</TableCell>
                    <TableCell>{qzDone}/{enrolledQz.length}</TableCell>
                  </TableRow>
                );
              })}
              {students.length === 0 && <TableRow><TableCell colSpan={3} className="text-muted-foreground text-sm text-center py-6">No students enrolled.</TableCell></TableRow>}
            </TableBody>
          </Table></Card>
        </TabsContent>

        <TabsContent value="quiz">
          <div className="space-y-4">
            {myQuizzes.map((q) => {
              const qsubs = quizSubmissions.filter((s) => s.quizId === q.id);
              return (
                <Card key={q.id}>
                  <CardHeader><CardTitle className="text-base">{q.title} <span className="text-xs font-normal text-muted-foreground">· {qsubs.length} attempts</span></CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {qsubs.length === 0 && <p className="text-sm text-muted-foreground">No attempts yet.</p>}
                    {qsubs.length > 0 && q.questions.map((qq, i) => {
                      let correct = 0;
                      for (const s of qsubs) {
                        if (qq.type === "short-answer") { if ((s.manualMarks?.[qq.id] ?? 0) >= qq.marks) correct++; }
                        else if (isCorrect(s.answers[qq.id], qq.correctAnswer)) correct++;
                      }
                      const pct = Math.round((correct / qsubs.length) * 100);
                      return (
                        <div key={qq.id}>
                          <div className="flex justify-between text-sm mb-1"><span className="truncate pr-2"><span className="font-medium">Q{i + 1}.</span> {qq.text}</span><span className={`shrink-0 font-medium ${pct < 50 ? "text-red-600" : pct < 75 ? "text-amber-600" : "text-emerald-700"}`}>{pct}%</span></div>
                          <div className="h-2.5 bg-muted rounded-full overflow-hidden"><div className={`h-full ${pct < 50 ? "bg-red-500" : pct < 75 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} /></div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })}
            {myQuizzes.length === 0 && <p className="text-sm text-muted-foreground">No quizzes yet.</p>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
