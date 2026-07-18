"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Download } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { AcademicYearSelect } from "@/components/shared/AcademicYearSelect";
import { AcrossYearsReport } from "@/components/shared/AcrossYearsReport";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useYearScope } from "@/hooks/use-year-scope";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Bar, BarChart, CartesianGrid, XAxis, YAxis,
} from "recharts";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useStore } from "@/lib/store/provider";
import type { Module } from "@/lib/types";

const BRACKETS = ["A", "B", "C", "D", "F"];
// Semantic grade colours (A green → F red), kept out of the neutral --chart-* palette on purpose.
const gradeConfig: ChartConfig = {
  A: { label: "A", color: "#10b981" },
  B: { label: "B", color: "#3b82f6" },
  C: { label: "C", color: "#f59e0b" },
  D: { label: "D", color: "#f97316" },
  F: { label: "F", color: "#ef4444" },
};

export default function HODReports() {
  const { currentUser, modules, programs, lectures, quizzes, users, moduleGrades } = useStore();
  const { isModuleInYear } = useYearScope();
  const myModules = modules.filter((m) => m.status === "active" && isModuleInYear(m.id) && programs.find((p) => p.id === m.programId)?.department === currentUser?.department);
  // Department modules across ALL years (not year-scoped) — for the cross-year comparison tab.
  const deptModulesAllYears = modules.filter((m) => programs.find((p) => p.id === m.programId)?.department === currentUser?.department);
  const myQuizzes = quizzes.filter((q) => isModuleInYear(q.moduleId));
  const students = users.filter((u) => u.role === "cohort-student");
  const [atRisk, setAtRisk] = useState<Module | null>(null);

  // Grade distribution per module (A–F counts) for the stacked bar chart.
  const gradeDist = myModules.map((m) => {
    const gs = moduleGrades.filter((g) => g.moduleId === m.id && g.grade !== "—");
    return {
      code: m.code,
      A: gs.filter((g) => g.grade.startsWith("A")).length,
      B: gs.filter((g) => g.grade.startsWith("B")).length,
      C: gs.filter((g) => g.grade.startsWith("C")).length,
      D: gs.filter((g) => g.grade.startsWith("D")).length,
      F: gs.filter((g) => g.grade.startsWith("F")).length,
      total: gs.length,
    };
  });

  const caAvg = (sid: string, mid: string) => {
    const g = moduleGrades.find((x) => x.studentId === sid && x.moduleId === mid);
    return g ? Math.round((g.assignmentMarks + g.quizMarks) / 2) : 0;
  };

  return (
    <div>
      <PageHeader title="Reports" description="Departmental teaching and performance insights.">
        <AcademicYearSelect />
        <Button variant="outline" size="sm" onClick={() => toast.success("Report exported successfully")}><Download className="size-4" /> Export</Button>
      </PageHeader>
      <Tabs defaultValue="lectures">
        <TabsList>
          <TabsTrigger value="lectures">Lecture Status</TabsTrigger>
          <TabsTrigger value="progress">Student Progress</TabsTrigger>
          <TabsTrigger value="grades">Grade Distributions</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <TabsTrigger value="across-years">Across Years</TabsTrigger>
        </TabsList>

        <TabsContent value="lectures">
          <Card><CardContent className="pt-6"><Table>
            <TableHeader><TableRow><TableHead>Module</TableHead><TableHead>Total</TableHead><TableHead>Published</TableHead><TableHead>Draft</TableHead><TableHead>% Complete</TableHead></TableRow></TableHeader>
            <TableBody>
              {myModules.map((m) => {
                const ls = lectures.filter((l) => l.moduleId === m.id);
                const pub = ls.filter((l) => l.status === "published").length;
                const pct = ls.length ? Math.round((pub / ls.length) * 100) : 0;
                return <TableRow key={m.id}>
                  <TableCell>{m.code}</TableCell><TableCell>{ls.length}</TableCell><TableCell>{pub}</TableCell>
                  <TableCell>{ls.filter((l) => l.status === "draft").length}</TableCell>
                  <TableCell className="flex items-center gap-1">{pct}% {pct < 100 && <AlertTriangle className="size-3.5 text-amber-500" />}</TableCell>
                </TableRow>;
              })}
            </TableBody>
          </Table></CardContent></Card>
        </TabsContent>

        <TabsContent value="progress">
          <Card><CardContent className="pt-6"><Table>
            <TableHeader><TableRow><TableHead>Module</TableHead><TableHead>Students</TableHead><TableHead>Avg CA</TableHead><TableHead>At-Risk (&lt;40%)</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>
              {myModules.map((m) => {
                const avg = Math.round(students.reduce((s, st) => s + caAvg(st.id, m.id), 0) / students.length);
                const risk = students.filter((st) => caAvg(st.id, m.id) > 0 && caAvg(st.id, m.id) < 40).length;
                return <TableRow key={m.id}>
                  <TableCell>{m.code}</TableCell><TableCell>{students.length}</TableCell><TableCell>{avg}%</TableCell><TableCell>{risk}</TableCell>
                  <TableCell className="text-right"><Button size="sm" variant="ghost" onClick={() => setAtRisk(m)}>View At-Risk</Button></TableCell>
                </TableRow>;
              })}
            </TableBody>
          </Table></CardContent></Card>
        </TabsContent>

        <TabsContent value="grades">
          <Card><CardContent className="pt-6">
            <p className="text-sm font-medium mb-3">Grade distribution by module (A–F)</p>
            <ChartContainer config={gradeConfig} className="aspect-auto w-full" style={{ height: Math.max(180, gradeDist.length * 52) }}>
              <BarChart accessibilityLayer data={gradeDist} layout="vertical" margin={{ left: 12, right: 12 }}>
                <CartesianGrid horizontal={false} />
                <YAxis type="category" dataKey="code" tickLine={false} axisLine={false} width={70} />
                <XAxis type="number" hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                {BRACKETS.map((b) => <Bar key={b} dataKey={b} stackId="a" fill={`var(--color-${b})`} />)}
              </BarChart>
            </ChartContainer>
            {gradeDist.every((d) => d.total === 0) && <p className="text-sm text-muted-foreground text-center py-4">No published grades yet.</p>}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="quizzes">
          <Card><CardContent className="pt-6"><Table>
            <TableHeader><TableRow><TableHead>Quiz</TableHead><TableHead>Module</TableHead><TableHead>Questions</TableHead><TableHead>Marks</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {myQuizzes.map((q) => (
                <TableRow key={q.id}>
                  <TableCell>{q.title}</TableCell>
                  <TableCell>{modules.find((m) => m.id === q.moduleId)?.code}</TableCell>
                  <TableCell>{q.questions.length}</TableCell>
                  <TableCell>{q.totalMarks}</TableCell>
                  <TableCell className="capitalize">{q.status}</TableCell>
                </TableRow>
              ))}
              {myQuizzes.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No quizzes for this academic year.</TableCell></TableRow>}
            </TableBody>
          </Table></CardContent></Card>
        </TabsContent>

        <TabsContent value="across-years">
          <AcrossYearsReport modules={deptModulesAllYears} emptyLabel="No departmental modules offered yet." />
        </TabsContent>
      </Tabs>

      <Dialog open={!!atRisk} onOpenChange={(o) => !o && setAtRisk(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>At-Risk Students — {atRisk?.code}</DialogTitle></DialogHeader>
          <div className="space-y-1 text-sm">
            {atRisk && students.filter((st) => caAvg(st.id, atRisk.id) > 0 && caAvg(st.id, atRisk.id) < 40).map((st) => (
              <div key={st.id} className="flex justify-between border-b last:border-0 pb-1"><span>{st.name}</span><span className="text-red-600">{caAvg(st.id, atRisk.id)}% CA</span></div>
            ))}
            {atRisk && students.filter((st) => caAvg(st.id, atRisk.id) > 0 && caAvg(st.id, atRisk.id) < 40).length === 0 && <p className="text-muted-foreground">No at-risk students.</p>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
