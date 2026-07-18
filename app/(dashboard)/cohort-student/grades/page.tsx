"use client";

import { useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/shared/PageHeader";
import { AcademicYearSelect } from "@/components/shared/AcademicYearSelect";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from "@/components/ui/chart";
import { useStore } from "@/lib/store/provider";
import { useYearScope } from "@/hooks/use-year-scope";
import { useStudentAccess } from "@/hooks/use-student-access";
import { gpa, academicClass } from "@/lib/utils/gpa";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { Module, ModuleGrade } from "@/lib/types";

const trendConfig: ChartConfig = { sgpa: { label: "Semester GPA", color: "var(--chart-1)" } };

export default function CohortGrades() {
  const { currentUser, programs, modules, moduleGrades } = useStore();
  const { isSemesterInYear, activeAcademicYear, activeAcademicYearId } = useYearScope();
  const { hasProgram } = useStudentAccess();
  const program = programs.find((p) => p.id === currentUser?.programId);
  // Semester results shown for the active year only; CGPA below stays cumulative.
  const semesters = (program?.semesters ?? []).filter((s) => isSemesterInYear(s.id));
  const myGrades = moduleGrades.filter((g) => g.studentId === currentUser?.id);
  const cgpa = gpa(myGrades.filter((g) => g.published), modules);
  const cls = academicClass(cgpa);
  // Cross-enrolled modules aren't part of the student's programme semesters, so list them separately.
  const crossModules = modules.filter((m) => currentUser?.crossEnrolledModuleIds?.includes(m.id));

  // GPA trajectory: SGPA per graded semester across ALL years (ignores the year filter), against the CGPA line.
  const gpaTrend = (program?.semesters ?? [])
    .filter((s) => myGrades.some((g) => g.published && s.moduleIds.includes(g.moduleId)))
    .sort((a, b) => a.year - b.year || a.semesterNumber - b.semesterNumber)
    .map((s) => {
      const semGrades = myGrades.filter((g) => g.published && s.moduleIds.includes(g.moduleId));
      return { label: `Y${s.year}S${s.semesterNumber}`, sgpa: Number(gpa(semGrades, modules).toFixed(2)) };
    });

  return (
    <div>
      <PageHeader title="Grades" description={hasProgram ? "Your academic results by semester." : "Your cohort module results."}>
        {hasProgram && <AcademicYearSelect />}
      </PageHeader>
      {hasProgram && semesters.length === 0 && (
        <EmptyState title="No results for this academic year" description={`You have no registered semesters in ${activeAcademicYear?.label ?? "this year"}. Your cumulative CGPA below still reflects all years.`} />
      )}
      {hasProgram && (
      <Tabs key={activeAcademicYearId} defaultValue={semesters[0]?.id}>
        <TabsList className="flex-wrap h-auto">{semesters.map((s) => <TabsTrigger key={s.id} value={s.id}>{s.name}</TabsTrigger>)}</TabsList>
        {semesters.map((s) => {
          const semModules = modules.filter((m) => s.moduleIds.includes(m.id));
          const semGrades = myGrades.filter((g) => semModules.some((m) => m.id === g.moduleId) && g.published);
          const sgpa = gpa(semGrades, modules);
          return (
            <TabsContent key={s.id} value={s.id} className="space-y-4">
              <Card className="p-0">
                <Table>
                  <TableHeader><TableRow><TableHead>Module</TableHead><TableHead>Credits</TableHead><TableHead>CA</TableHead><TableHead>Final</TableHead><TableHead>Total</TableHead><TableHead>Grade</TableHead><TableHead>GP</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {semModules.map((m) => {
                      const g = myGrades.find((x) => x.moduleId === m.id);
                      if (!g?.published) return (
                        <TableRow key={m.id}><TableCell>{m.code} — {m.name}</TableCell><TableCell>{m.creditValue}</TableCell><TableCell colSpan={5} className="text-muted-foreground text-sm">In progress</TableCell></TableRow>
                      );
                      return <GradeRow key={m.id} module={m} grade={g} />;
                    })}
                  </TableBody>
                </Table>
              </Card>
              <Card><CardContent className="pt-6 flex items-center justify-between"><span className="text-sm text-muted-foreground">Semester GPA (SGPA)</span><span className="text-2xl font-bold">{sgpa.toFixed(2)}</span></CardContent></Card>
            </TabsContent>
          );
        })}
      </Tabs>
      )}

      {hasProgram && gpaTrend.length >= 2 && (
        <Card className="mt-6">
          <CardHeader><CardTitle className="text-base">GPA Trend</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={trendConfig} className="aspect-auto h-[240px] w-full">
              <LineChart accessibilityLayer data={gpaTrend} margin={{ left: 4, right: 12, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis domain={[0, 4]} tickLine={false} axisLine={false} width={28} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <ReferenceLine y={cgpa} stroke="var(--muted-foreground)" strokeDasharray="4 4" label={{ value: `CGPA ${cgpa.toFixed(2)}`, position: "insideTopRight", fill: "var(--muted-foreground)", fontSize: 11 }} />
                <Line dataKey="sgpa" type="monotone" stroke="var(--color-sgpa)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {crossModules.length > 0 && (
        <div className={hasProgram ? "mt-6" : ""}>
          {hasProgram && <h3 className="font-semibold mb-3">Cross-Enrolled Modules</h3>}
          <Card className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Module</TableHead><TableHead>Credits</TableHead><TableHead>CA</TableHead><TableHead>Final</TableHead><TableHead>Total</TableHead><TableHead>Grade</TableHead><TableHead>GP</TableHead></TableRow></TableHeader>
              <TableBody>
                {crossModules.map((m) => {
                  const g = myGrades.find((x) => x.moduleId === m.id);
                  if (!g?.published) return (
                    <TableRow key={m.id}><TableCell>{m.code} — {m.name}</TableCell><TableCell>{m.creditValue}</TableCell><TableCell colSpan={5} className="text-muted-foreground text-sm">In progress</TableCell></TableRow>
                  );
                  return <GradeRow key={m.id} module={m} grade={g} />;
                })}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {!hasProgram && crossModules.length === 0 && (
        <EmptyState title="No cohort results yet" description="You're not enrolled in any cohort modules. Request cross-enrollment to join one." />
      )}

      <Card className="mt-6"><CardContent className="pt-6 flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-sm text-muted-foreground">Cumulative GPA (CGPA)</p><p className="font-heading text-3xl font-bold tabular-nums">{cgpa.toFixed(2)}</p></div>
        <div className="text-right"><p className="text-sm text-muted-foreground mb-1">Academic Class</p><Badge variant="ghost" className={cls.tone}>{cls.label}</Badge></div>
      </CardContent></Card>
    </div>
  );
}

function GradeRow({ module: m, grade: g }: { module: Module; grade: ModuleGrade }) {
  const [open, setOpen] = useState(false);
  const ca = Math.round((g.assignmentMarks + g.quizMarks) / 2);
  return (
    <>
      <TableRow>
        <TableCell>
          <button className="flex items-center gap-1 hover:underline" onClick={() => setOpen((o) => !o)}>
            {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />} {m.code} — {m.name}
          </button>
        </TableCell>
        <TableCell>{m.creditValue}</TableCell><TableCell>{ca}</TableCell><TableCell>{g.finalExamMark}</TableCell>
        <TableCell>{g.weightedTotal}</TableCell><TableCell className="font-semibold">{g.grade}</TableCell><TableCell>{g.gradePoint.toFixed(1)}</TableCell>
      </TableRow>
      {open && (
        <TableRow><TableCell colSpan={7} className="bg-muted/40 text-sm">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
            <Mini label="Assignment Marks" value={g.assignmentMarks} />
            <Mini label="Quiz Marks" value={g.quizMarks} />
            <Mini label="CA Total" value={ca} />
            <Mini label="Final Exam" value={g.finalExamMark} />
          </div>
          <p className="text-xs text-muted-foreground">Weighted = CA × {m.assessmentBreakdown.assignments + m.assessmentBreakdown.quizzes}% + Final × {m.assessmentBreakdown.finalExam}% = {g.weightedTotal}</p>
        </TableCell></TableRow>
      )}
    </>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return <div><p className="text-[11px] text-muted-foreground">{label}</p><p className="font-medium">{value}</p></div>;
}
