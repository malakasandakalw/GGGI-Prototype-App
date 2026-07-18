"use client";

import { toast } from "sonner";
import { Download } from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList,
} from "recharts";
import { PageHeader } from "@/components/shared/PageHeader";
import { AcademicYearSelect } from "@/components/shared/AcademicYearSelect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useYearScope } from "@/hooks/use-year-scope";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useStore } from "@/lib/store/provider";
import { studentsInModule } from "@/lib/utils/student-access";

const BANDS = [
  { b: "A", min: 70 },
  { b: "B", min: 60 },
  { b: "C", min: 50 },
  { b: "D", min: 40 },
  { b: "F", min: 0 },
];
const bandOf = (pct: number) => BANDS.find((x) => pct >= x.min)!.b;
const bandCounts = (marks: number[]) => ({
  A: marks.filter((m) => bandOf(m) === "A").length,
  B: marks.filter((m) => bandOf(m) === "B").length,
  C: marks.filter((m) => bandOf(m) === "C").length,
  D: marks.filter((m) => bandOf(m) === "D").length,
  F: marks.filter((m) => bandOf(m) === "F").length,
});

const submissionConfig: ChartConfig = { rate: { label: "Submitted (%)", color: "var(--chart-1)" } };

// Horizontal bar of submission rate per assessment (submitted vs enrolled).
function SubmissionChart({ data }: { data: { name: string; rate: number; info: string }[] }) {
  return (
    <ChartContainer config={submissionConfig} className="aspect-auto w-full" style={{ height: Math.max(140, data.length * 46) }}>
      <BarChart accessibilityLayer data={data} layout="vertical" margin={{ left: 12, right: 44 }}>
        <CartesianGrid horizontal={false} />
        <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={150} />
        <XAxis type="number" domain={[0, 100]} hide />
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="rate" fill="var(--color-rate)" radius={4}>
          <LabelList dataKey="info" position="right" offset={8} className="fill-foreground text-xs" />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
// Semantic grade colours (A green → F red), kept out of the neutral --chart-* palette on purpose.
const gradeConfig: ChartConfig = {
  A: { label: "A", color: "#10b981" },
  B: { label: "B", color: "#3b82f6" },
  C: { label: "C", color: "#f59e0b" },
  D: { label: "D", color: "#f97316" },
  F: { label: "F", color: "#ef4444" },
};

export default function LecturerReports() {
  const { currentUser, modules, programs, assignments, submissions, quizzes, quizSubmissions, users } = useStore();
  const { isModuleInYear } = useYearScope();
  const myModules = modules.filter((m) => m.lecturerIds.includes(currentUser?.id ?? "") && isModuleInYear(m.id));
  const myAssignments = assignments.filter((a) => myModules.some((m) => m.id === a.moduleId));
  const myQuizzes = quizzes.filter((q) => myModules.some((m) => m.id === q.moduleId));

  // By enrollment — includes cross-enrolled Open Learning students.
  const enrolledIn = (moduleId: string) => studentsInModule(users, programs, moduleId);
  const isCorrect = (ans: string | string[] | undefined, correct: string | string[]) =>
    ans === undefined ? false : Array.isArray(correct) ? JSON.stringify([...(ans as string[] ?? [])].sort()) === JSON.stringify([...correct].sort()) : ans === correct;

  const students = Array.from(new Map(myModules.flatMap((m) => enrolledIn(m.id)).map((s) => [s.id, s])).values());

  // ---- Submission rates (per assessment: submitted vs enrolled) ----
  const asgSubmission = myAssignments.map((a) => {
    const total = enrolledIn(a.moduleId).length;
    const done = submissions.filter((s) => s.assignmentId === a.id).length;
    return { name: a.title, rate: total ? Math.round((done / total) * 100) : 0, info: `${done}/${total}` };
  });
  const quizSubmission = myQuizzes.map((q) => {
    const total = enrolledIn(q.moduleId).length;
    const done = quizSubmissions.filter((s) => s.quizId === q.id).length;
    return { name: q.title, rate: total ? Math.round((done / total) * 100) : 0, info: `${done}/${total}` };
  });

  // ---- Grade distribution (A–F per assessment) ----
  const asgGrades = myAssignments.map((a) => {
    const marks = submissions.filter((s) => s.assignmentId === a.id && s.gradingStatus === "graded").map((s) => Math.round(((s.marks ?? 0) / a.maxMarks) * 100));
    return { name: a.title, graded: marks.length, ...bandCounts(marks) };
  });
  const quizGrades = myQuizzes.map((q) => {
    const marks = quizSubmissions.filter((s) => s.quizId === q.id).map((s) => Math.round((s.finalScore / q.totalMarks) * 100));
    return { name: q.title, graded: marks.length, ...bandCounts(marks) };
  });
  const gradeDist = [...asgGrades, ...quizGrades].filter((d) => d.graded > 0);

  const exportBtn = <Button variant="outline" size="sm" onClick={() => toast.success("Report exported successfully")}><Download className="size-4" /> Export</Button>;

  return (
    <div>
      <PageHeader title="Reports" description="Submission rates, grade distributions, student progress and quiz analytics across your modules.">
        <AcademicYearSelect />
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
          <Card><CardContent className="pt-6 space-y-6">
            <div>
              <p className="text-sm font-medium mb-2">Assignments</p>
              {asgSubmission.length ? <SubmissionChart data={asgSubmission} /> : <p className="text-sm text-muted-foreground">No assignments yet.</p>}
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Quizzes</p>
              {quizSubmission.length ? <SubmissionChart data={quizSubmission} /> : <p className="text-sm text-muted-foreground">No quizzes yet.</p>}
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="grades">
          <Card><CardContent className="pt-6">
            <p className="text-sm font-medium mb-3">Grade distribution by assessment (A–F)</p>
            {gradeDist.length ? (
              <ChartContainer config={gradeConfig} className="aspect-auto w-full" style={{ height: Math.max(160, gradeDist.length * 48) }}>
                <BarChart accessibilityLayer data={gradeDist} layout="vertical" margin={{ left: 12, right: 12 }}>
                  <CartesianGrid horizontal={false} />
                  <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={150} />
                  <XAxis type="number" hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  {BANDS.map((band) => <Bar key={band.b} dataKey={band.b} stackId="a" fill={`var(--color-${band.b})`} />)}
                </BarChart>
              </ChartContainer>
            ) : <p className="text-sm text-muted-foreground">No graded assessments yet.</p>}
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
