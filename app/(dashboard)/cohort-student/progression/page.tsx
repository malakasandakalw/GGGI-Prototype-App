"use client";

import { CheckCircle2, XCircle, AlertCircle, ArrowRight, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useStore } from "@/lib/store/provider";
import { useStudentAccess } from "@/hooks/use-student-access";
import { isPassingGrade, isFailingGrade, MAX_CARRIED_FAILURES } from "@/lib/utils/gpa";
import type { ModuleGrade } from "@/lib/types";

const progressionConfig: ChartConfig = {
  passed: { label: "Passed", color: "#10b981" },
  failed: { label: "Failed / Referred", color: "#ef4444" },
};

export default function Progression() {
  const { currentUser, programs, modules, moduleGrades, academicYears } = useStore();
  const { hasProgram } = useStudentAccess();
  const program = programs.find((p) => p.id === currentUser?.programId);
  const myGrades = moduleGrades.filter((g) => g.studentId === currentUser?.id && g.published);

  // Map each module to its study level + calendar year via the programme structure.
  const semInfo = new Map<string, { level: number; ayId?: string }>();
  program?.semesters.forEach((s) => s.moduleIds.forEach((mid) => semInfo.set(mid, { level: s.year, ayId: s.academicYearId })));
  const yearLabel = (id?: string) => academicYears.find((y) => y.id === id)?.label ?? "—";
  const moduleName = (mid: string) => modules.find((m) => m.id === mid)?.name ?? mid;
  const moduleCode = (mid: string) => modules.find((m) => m.id === mid)?.code ?? mid;

  const levels = [...new Set(myGrades.map((g) => semInfo.get(g.moduleId)?.level).filter((x): x is number => x != null))].sort((a, b) => a - b);

  // Cumulative failed/referred count carried year to year (UGC-style ≤5 progression gate).
  const rows = levels.reduce<{ level: number; levelGrades: ModuleGrade[]; passed: ModuleGrade[]; failed: ModuleGrade[]; cumulativeFailed: number; eligible: boolean }[]>((acc, level) => {
    const levelGrades = myGrades.filter((g) => semInfo.get(g.moduleId)?.level === level);
    const passed = levelGrades.filter(isPassingGrade);
    const failed = levelGrades.filter(isFailingGrade);
    const cumulativeFailed = (acc.length ? acc[acc.length - 1].cumulativeFailed : 0) + failed.length;
    acc.push({ level, levelGrades, passed, failed, cumulativeFailed, eligible: cumulativeFailed <= MAX_CARRIED_FAILURES });
    return acc;
  }, []);
  const maxLevel = program?.durationYears ?? Math.max(0, ...levels);
  const progressionChart = rows.map((r) => ({ label: `Year ${r.level}`, passed: r.passed.length, failed: r.failed.length }));

  const statusBadge = (g: ModuleGrade) => {
    if (isPassingGrade(g)) return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100"><CheckCircle2 className="size-3" /> Pass · {g.grade}</Badge>;
    if (g.specialCode) return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100"><AlertCircle className="size-3" /> Referred · {g.specialCode}</Badge>;
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="size-3" /> Fail · {g.grade}</Badge>;
  };

  if (!hasProgram) {
    return (
      <div>
        <PageHeader title="Academic Progression" description="Year-to-year standing for full-programme students." />
        <Alert>
          <TrendingUp className="size-4" />
          <AlertTitle>Not applicable to your enrolment</AlertTitle>
          <AlertDescription>
            Progression tracking follows a full degree programme year by year. As an Open Learning student with
            cross-enrolled module(s), you don&apos;t follow a degree structure — your module results appear under{" "}
            <strong>Grades</strong> instead.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Academic Progression" description="Your year-to-year standing across all academic years — repeat/referred modules and progression eligibility." />

      <Alert className="mb-6">
        <TrendingUp className="size-4" />
        <AlertTitle>How progression works</AlertTitle>
        <AlertDescription>
          You progress from one study year to the next while carrying no more than {MAX_CARRIED_FAILURES} failed or
          referred modules. This record is <strong>cumulative</strong> and spans every academic year — it is not affected
          by the academic-year filter.
        </AlertDescription>
      </Alert>

      {rows.length === 0 && (
        <Card><CardContent className="pt-6 text-sm text-muted-foreground text-center py-10">No published results yet — your progression standing will appear here once results are released.</CardContent></Card>
      )}

      {progressionChart.length > 0 && (
        <Card className="mb-4">
          <CardHeader><CardTitle className="text-base">Passed vs Failed / Referred by Year</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={progressionConfig} className="aspect-auto h-[220px] w-full">
              <BarChart accessibilityLayer data={progressionChart} margin={{ left: 4, right: 12, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="passed" stackId="a" fill="var(--color-passed)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="failed" stackId="a" fill="var(--color-failed)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {rows.map((r) => (
          <Card key={r.level}>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base">Year {r.level}</CardTitle>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-emerald-700">{r.passed.length} passed</span>
                  <span className={r.failed.length ? "text-red-600" : "text-muted-foreground"}>{r.failed.length} failed/referred</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {r.levelGrades.map((g) => (
                <div key={g.moduleId} className="flex flex-wrap items-center justify-between gap-2 border-b last:border-0 pb-2 text-sm">
                  <div>
                    <span className="font-mono text-xs text-muted-foreground">{moduleCode(g.moduleId)}</span> — {moduleName(g.moduleId)}
                    <span className="text-xs text-muted-foreground"> · {yearLabel(semInfo.get(g.moduleId)?.ayId)}</span>
                  </div>
                  {statusBadge(g)}
                </div>
              ))}

              {r.level < maxLevel ? (
                <div className={`mt-3 flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${r.eligible ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"}`}>
                  {r.eligible ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
                  <span className="flex items-center gap-1 font-medium">Year {r.level} <ArrowRight className="size-3.5" /> Year {r.level + 1}:</span>
                  {r.eligible
                    ? <span>Eligible to progress ({r.cumulativeFailed}/{MAX_CARRIED_FAILURES} carried).</span>
                    : <span>Held back — {r.cumulativeFailed} carried modules exceed the limit of {MAX_CARRIED_FAILURES}. Clear referrals to progress.</span>}
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-primary">
                  <TrendingUp className="size-4" /> <span className="font-medium">Final study year</span> — complete all modules to qualify for graduation.
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
