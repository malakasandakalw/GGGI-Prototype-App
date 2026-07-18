"use client";

import { toast } from "sonner";
import { Download } from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList,
} from "recharts";
import { PageHeader } from "@/components/shared/PageHeader";
import { AcademicYearSelect } from "@/components/shared/AcademicYearSelect";
import { AcrossYearsReport } from "@/components/shared/AcrossYearsReport";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useStore } from "@/lib/store/provider";
import { useYearScope } from "@/hooks/use-year-scope";
import { formatDate } from "@/lib/utils/date";

const enrollChartConfig: ChartConfig = { count: { label: "Students", color: "var(--chart-1)" } };
const perfChartConfig: ChartConfig = {
  pass: { label: "Pass Rate", color: "var(--chart-2)" },
  fail: { label: "Fail Rate", color: "var(--chart-4)" },
};

export default function ProgramAdminReports() {
  const { programs, modules, lectures, users, moduleGrades, intakes, calendarEvents } = useStore();
  const { isModuleInYear, inYear } = useYearScope();
  const myPrograms = programs.filter((p) => p.status !== "archived");
  const yearModules = modules.filter((m) => isModuleInYear(m.id));
  // Modules across ALL years for the managed programmes — feeds the cross-year comparison tab.
  const programModulesAllYears = modules.filter((m) => myPrograms.some((p) => p.id === m.programId));
  const programName = (id?: string) => programs.find((p) => p.id === id)?.name ?? "All programs";

  const enrollmentData = myPrograms.map((p) => ({
    name: p.name,
    count: users.filter((u) => u.role === "cohort-student" && u.programId === p.id).length,
  }));

  // Pass/fail rate per programme (scoped to the active year) — feeds the stacked bar + the detail table.
  const perfData = myPrograms.map((p) => {
    const grades = moduleGrades.filter((g) => modules.find((m) => m.id === g.moduleId)?.programId === p.id && g.published && isModuleInYear(g.moduleId));
    const passed = grades.filter((g) => g.gradePoint >= 2).length;
    const rate = grades.length ? Math.round((passed / grades.length) * 100) : 0;
    const avg = grades.length ? (grades.reduce((s, g) => s + g.gradePoint, 0) / grades.length).toFixed(2) : "—";
    return { name: p.name, pass: rate, fail: grades.length ? 100 - rate : 0, avg, graded: grades.length };
  });

  // Item I — per-intake enrollment breakdown (scoped to the active academic year)
  const intakeData = intakes.filter((i) => inYear(i.academicYearId)).map((i) => ({
    id: i.id,
    label: i.label,
    program: programName(i.programId),
    status: i.status,
    enrolled: i.enrolledStudentIds.length,
    capacity: i.maxCapacity,
  }));

  // Item I — exam schedule overview across all programs
  const examEvents = [...calendarEvents]
    .filter((e) => e.type === "exam" && (e.academicYearId ? inYear(e.academicYearId) : e.moduleId ? isModuleInYear(e.moduleId) : true))
    .sort((a, b) => a.date.localeCompare(b.date));

  const exportBtn = <Button variant="outline" size="sm" onClick={() => toast.success("Report exported successfully")}><Download className="size-4" /> Export (Mock)</Button>;

  return (
    <div>
      <PageHeader title="Reports" description="Enrollment, performance and content insights.">
        <AcademicYearSelect />
      </PageHeader>
      <Tabs defaultValue="enrollment">
        <TabsList>
          <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
          <TabsTrigger value="performance">Academic Performance</TabsTrigger>
          <TabsTrigger value="content">Content Status</TabsTrigger>
          <TabsTrigger value="exams">Exam Schedule</TabsTrigger>
          <TabsTrigger value="workload">Lecturer Workload</TabsTrigger>
          <TabsTrigger value="across-years">Across Years</TabsTrigger>
        </TabsList>

        <TabsContent value="enrollment">
          <Card><CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Enrollment per Program</p>
              {exportBtn}
            </div>
            <ChartContainer config={enrollChartConfig} className="aspect-auto h-[260px] w-full">
              <BarChart accessibilityLayer data={enrollmentData} layout="vertical" margin={{ left: 12, right: 32 }}>
                <CartesianGrid horizontal={false} />
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={150} />
                <XAxis type="number" dataKey="count" hide />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={4}>
                  <LabelList dataKey="count" position="right" offset={8} className="fill-foreground text-xs" />
                </Bar>
              </BarChart>
            </ChartContainer>
            <p className="text-sm font-medium mt-8 mb-3">Enrollment per Intake</p>
            <Table>
              <TableHeader><TableRow><TableHead>Intake</TableHead><TableHead>Program</TableHead><TableHead>Status</TableHead><TableHead>Enrolled</TableHead><TableHead>Capacity</TableHead></TableRow></TableHeader>
              <TableBody>
                {intakeData.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>{i.label}</TableCell>
                    <TableCell>{i.program}</TableCell>
                    <TableCell className="capitalize">{i.status}</TableCell>
                    <TableCell>{i.enrolled}</TableCell>
                    <TableCell>{i.capacity ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card><CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Pass vs Fail Rate per Program</p>
              {exportBtn}
            </div>
            <ChartContainer config={perfChartConfig} className="aspect-auto h-[260px] w-full">
              <BarChart accessibilityLayer data={perfData} layout="vertical" margin={{ left: 12, right: 12 }}>
                <CartesianGrid horizontal={false} />
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={150} />
                <XAxis type="number" domain={[0, 100]} hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="pass" stackId="a" fill="var(--color-pass)" radius={[4, 0, 0, 4]} />
                <Bar dataKey="fail" stackId="a" fill="var(--color-fail)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
            <Table className="mt-4">
              <TableHeader><TableRow><TableHead>Program</TableHead><TableHead>Avg CGPA</TableHead><TableHead>Pass Rate</TableHead><TableHead>Fail Rate</TableHead></TableRow></TableHeader>
              <TableBody>
                {perfData.map((p) => (
                  <TableRow key={p.name}><TableCell>{p.name}</TableCell><TableCell>{p.avg}</TableCell><TableCell>{p.pass}%</TableCell><TableCell>{p.graded ? 100 - p.pass : 0}%</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="content">
          <Card><CardContent className="pt-6">
            <div className="flex justify-end mb-4">{exportBtn}</div>
            <Table>
              <TableHeader><TableRow><TableHead>Module</TableHead><TableHead>Published</TableHead><TableHead>Draft</TableHead></TableRow></TableHeader>
              <TableBody>
                {yearModules.filter((m) => m.status === "active").map((m) => {
                  const ls = lectures.filter((l) => l.moduleId === m.id);
                  return <TableRow key={m.id}>
                    <TableCell>{m.code} — {m.name}</TableCell>
                    <TableCell>{ls.filter((l) => l.status === "published").length}</TableCell>
                    <TableCell>{ls.filter((l) => l.status === "draft").length}</TableCell>
                  </TableRow>;
                })}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="exams">
          <Card><CardContent className="pt-6">
            <div className="flex justify-end mb-4">{exportBtn}</div>
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Exam</TableHead><TableHead>Program</TableHead><TableHead>Time</TableHead><TableHead>Venue</TableHead></TableRow></TableHeader>
              <TableBody>
                {examEvents.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{formatDate(e.date)}</TableCell>
                    <TableCell>{e.title}</TableCell>
                    <TableCell>{programName(e.programId)}</TableCell>
                    <TableCell>{e.startTime ? `${e.startTime}${e.endTime ? `–${e.endTime}` : ""}` : "—"}</TableCell>
                    <TableCell>{e.venue ?? "—"}</TableCell>
                  </TableRow>
                ))}
                {examEvents.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No exams scheduled.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="workload">
          <Card><CardContent className="pt-6">
            <div className="flex justify-end mb-4">{exportBtn}</div>
            <Table>
              <TableHeader><TableRow><TableHead>Lecturer</TableHead><TableHead>Modules</TableHead><TableHead>Lectures</TableHead></TableRow></TableHeader>
              <TableBody>
                {users.filter((u) => u.role === "lecturer").map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>{l.name}</TableCell>
                    <TableCell>{l.assignedModuleIds?.length ?? 0}</TableCell>
                    <TableCell>{lectures.filter((lec) => lec.createdByLecturerId === l.id).length}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="across-years">
          <AcrossYearsReport modules={programModulesAllYears} emptyLabel="No programme modules offered yet." />
        </TabsContent>
      </Tabs>
    </div>
  );
}
