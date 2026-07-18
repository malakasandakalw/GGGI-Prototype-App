"use client";

import { toast } from "sonner";
import { Download } from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList, Cell, Pie, PieChart,
} from "recharts";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AcademicYearSelect } from "@/components/shared/AcademicYearSelect";
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
import { chartColor, paletteConfig } from "@/lib/chart-config";
import { formatDate } from "@/lib/utils/date";
import type { ApplicationStatus } from "@/lib/types";

const APP_STATUSES: ApplicationStatus[] = ["submitted", "under-review", "payment-pending", "payment-confirmed", "enrolled", "rejected", "waitlisted"];
const typeLabel: Record<string, string> = {
  "cohort-to-cohort": "Cohort → Cohort",
  "ol-to-cohort": "OL → Cohort",
  "cohort-to-ol": "Cohort → OL",
};
const titleCase = (s: string) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const appChartConfig: ChartConfig = { count: { label: "Applications", color: "var(--chart-1)" } };
const enrollChartConfig: ChartConfig = { count: { label: "Students", color: "var(--chart-1)" } };

export default function RegistrarReports() {
  const { applications, programs, intakes, users, crossEnrollments } = useStore();
  const { inYear } = useYearScope();
  const students = users.filter((u) => u.role === "cohort-student");
  const yearApplications = applications.filter((a) => inYear(a.academicYearId));
  const yearIntakes = intakes.filter((i) => inYear(i.academicYearId));
  const programName = (id?: string) => programs.find((p) => p.id === id)?.name ?? "—";
  const intakeName = (id?: string) => intakes.find((i) => i.id === id)?.label ?? "—";

  const exportBtn = <Button variant="outline" size="sm" onClick={() => toast.success("Report exported successfully")}><Download className="size-4" /> Export (Mock)</Button>;

  const appByStatus = APP_STATUSES.map((s) => ({ status: s, label: titleCase(s), count: yearApplications.filter((a) => a.status === s).length }));

  const perIntake = yearIntakes.map((i) => ({
    id: i.id,
    label: i.label,
    program: programName(i.programId),
    status: i.status,
    enrolled: students.filter((s) => s.intakeId === i.id).length,
    capacity: i.maxCapacity,
  }));

  const perProgram = programs.map((p) => ({ id: p.id, name: p.name, count: students.filter((s) => s.programId === p.id).length }));

  const accountActivity = [
    { key: "active", label: "Active", count: students.filter((s) => s.status === "active").length },
    { key: "suspended", label: "Suspended", count: students.filter((s) => s.status === "suspended").length },
    { key: "inactive", label: "Inactive", count: students.filter((s) => s.status === "inactive").length },
  ];
  const activityConfig = paletteConfig(accountActivity.map((a) => ({ key: a.key, label: a.label })));

  return (
    <div>
      <PageHeader title="Reports" description="Enrollment, applications and registration analytics.">
        <AcademicYearSelect />
      </PageHeader>
      <Tabs defaultValue="applications">
        <TabsList>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
          <TabsTrigger value="cross">Cross-Enrollment</TabsTrigger>
          <TabsTrigger value="activity">Account Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="applications">
          <Card><CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Applications by Status</p>
              {exportBtn}
            </div>
            <ChartContainer config={appChartConfig} className="aspect-auto h-[300px] w-full">
              <BarChart accessibilityLayer data={appByStatus} layout="vertical" margin={{ left: 12, right: 32 }}>
                <CartesianGrid horizontal={false} />
                <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} width={130} />
                <XAxis type="number" dataKey="count" hide />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={4}>
                  <LabelList dataKey="count" position="right" offset={8} className="fill-foreground text-xs" />
                </Bar>
              </BarChart>
            </ChartContainer>
            <p className="text-xs text-muted-foreground mt-2">Total applications: {yearApplications.length}</p>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="enrollment">
          <Card><CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Students Enrolled per Program</p>
              {exportBtn}
            </div>
            <ChartContainer config={enrollChartConfig} className="aspect-auto h-[260px] w-full">
              <BarChart accessibilityLayer data={perProgram} layout="vertical" margin={{ left: 12, right: 32 }}>
                <CartesianGrid horizontal={false} />
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={150} />
                <XAxis type="number" dataKey="count" hide />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={4}>
                  <LabelList dataKey="count" position="right" offset={8} className="fill-foreground text-xs" />
                </Bar>
              </BarChart>
            </ChartContainer>
            <p className="text-sm font-medium mt-8 mb-3">Students Enrolled per Intake</p>
            <Table>
              <TableHeader><TableRow><TableHead>Intake</TableHead><TableHead>Program</TableHead><TableHead>Status</TableHead><TableHead>Enrolled</TableHead><TableHead>Capacity</TableHead></TableRow></TableHeader>
              <TableBody>
                {perIntake.map((i) => (
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

        <TabsContent value="cross">
          <Card><CardContent className="pt-6">
            <div className="flex justify-end mb-4">{exportBtn}</div>
            <Table>
              <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Type</TableHead><TableHead>Requested</TableHead><TableHead>Payment</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {crossEnrollments.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.studentName}</TableCell>
                    <TableCell>{typeLabel[c.type]}</TableCell>
                    <TableCell>{formatDate(c.requestedAt)}</TableCell>
                    <TableCell className="capitalize">{c.paymentStatus ?? "—"}</TableCell>
                    <TableCell><StatusBadge status={c.status} /></TableCell>
                  </TableRow>
                ))}
                {crossEnrollments.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No cross-enrollment requests.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card><CardContent className="pt-6">
            <div className="flex justify-end mb-4">{exportBtn}</div>
            <ChartContainer config={activityConfig} className="mx-auto aspect-square max-h-[240px]">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent nameKey="key" hideLabel />} />
                <Pie data={accountActivity} dataKey="count" nameKey="key" innerRadius={55} strokeWidth={2}>
                  {accountActivity.map((a, i) => <Cell key={a.key} fill={chartColor(i)} />)}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="key" />} className="flex-wrap" />
              </PieChart>
            </ChartContainer>
            <Table>
              <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Student ID</TableHead><TableHead>Program</TableHead><TableHead>Intake</TableHead><TableHead>Last Login</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="font-mono text-xs">{s.studentId ?? "—"}</TableCell>
                    <TableCell>{programName(s.programId)}</TableCell>
                    <TableCell>{intakeName(s.intakeId)}</TableCell>
                    <TableCell>{s.lastLogin ? formatDate(s.lastLogin) : "Never"}</TableCell>
                    <TableCell><StatusBadge status={s.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
