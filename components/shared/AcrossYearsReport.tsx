"use client";

import { Layers } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useStore } from "@/lib/store/provider";
import { gpa, isPassingGrade } from "@/lib/utils/gpa";
import type { Module } from "@/lib/types";

const trendConfig: ChartConfig = {
  passRate: { label: "Pass Rate (%)", color: "var(--chart-2)" },
  avgGpa: { label: "Avg GPA", color: "var(--chart-1)" },
};

// Cross-year ("All years") comparison. Unlike the year-scoped tabs, this deliberately spans
// EVERY academic year so trends can be compared side by side. Pass the role-relevant modules
// across all years (e.g. a department's or programme's modules — not year-filtered).
export function AcrossYearsReport({ modules: relevant, emptyLabel = "No modules offered yet." }: { modules: Module[]; emptyLabel?: string }) {
  const { academicYears, programs, modules, moduleGrades } = useStore();

  const rows = [...academicYears]
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .map((ay) => {
      const semIds = new Set<string>();
      programs.forEach((p) => p.semesters.forEach((s) => { if (s.academicYearId === ay.id) semIds.add(s.id); }));
      const yearModules = relevant.filter((m) => semIds.has(m.semesterId));
      const yearModuleIds = new Set(yearModules.map((m) => m.id));
      const grades = moduleGrades.filter((g) => g.published && yearModuleIds.has(g.moduleId));
      const passed = grades.filter(isPassingGrade).length;
      return {
        id: ay.id,
        label: ay.label,
        isCurrent: ay.isCurrent,
        status: ay.status,
        moduleCount: yearModules.length,
        graded: grades.length,
        passRate: grades.length ? Math.round((passed / grades.length) * 100) : null,
        avgGpa: grades.length ? gpa(grades, modules) : null,
      };
    });

  const hasAny = rows.some((r) => r.moduleCount > 0 || r.graded > 0);
  // Only the years that actually produced results carry a meaningful trend point.
  const trendData = rows.filter((r) => r.graded > 0).map((r) => ({ label: r.label, passRate: r.passRate, avgGpa: r.avgGpa }));

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Layers className="size-4" />
          <span>Comparison across <strong className="text-foreground">all academic years</strong> — this view ignores the year filter above.</span>
        </div>

        {trendData.length > 0 && (
          <ChartContainer config={trendConfig} className="aspect-auto h-[260px] w-full">
            <LineChart accessibilityLayer data={trendData} margin={{ left: 4, right: 12, top: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis yAxisId="left" domain={[0, 100]} tickLine={false} axisLine={false} width={34} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 4]} tickLine={false} axisLine={false} width={34} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line yAxisId="left" dataKey="passRate" type="monotone" stroke="var(--color-passRate)" strokeWidth={2} dot={{ r: 3 }} connectNulls />
              <Line yAxisId="right" dataKey="avgGpa" type="monotone" stroke="var(--color-avgGpa)" strokeWidth={2} dot={{ r: 3 }} connectNulls />
            </LineChart>
          </ChartContainer>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Academic Year</TableHead>
              <TableHead>Modules Offered</TableHead>
              <TableHead>Results Published</TableHead>
              <TableHead>Pass Rate</TableHead>
              <TableHead>Avg GPA</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">
                  {r.label}
                  {r.isCurrent && <span className="ml-2 text-[10px] rounded-full bg-primary/10 text-primary px-1.5 py-0.5">Current</span>}
                  {r.status === "archived" && <span className="ml-2 text-[10px] rounded-full bg-muted text-muted-foreground px-1.5 py-0.5">Archived</span>}
                </TableCell>
                <TableCell>{r.moduleCount}</TableCell>
                <TableCell>{r.graded}</TableCell>
                <TableCell>{r.passRate == null ? "—" : `${r.passRate}%`}</TableCell>
                <TableCell>{r.avgGpa == null ? "—" : r.avgGpa.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!hasAny && <p className="text-sm text-muted-foreground text-center py-4">{emptyLabel}</p>}
      </CardContent>
    </Card>
  );
}
