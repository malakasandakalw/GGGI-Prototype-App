"use client";

import { toast } from "sonner";
import { Download, Activity, Users, UserCheck } from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList, Cell,
  Area, AreaChart, Pie, PieChart,
} from "recharts";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { AcademicYearSelect } from "@/components/shared/AcademicYearSelect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useStore } from "@/lib/store/provider";
import { useYearScope } from "@/hooks/use-year-scope";
import { chartColor, paletteConfig } from "@/lib/chart-config";
import { roleLabels } from "@/lib/nav-config";
import type { Role } from "@/lib/types";

const ROLE_ORDER: Role[] = ["super-admin", "program-admin", "registrar", "hod", "lecturer", "cohort-student", "ol-student"];

// Mock time-series for registrations & usage (no backend in prototype).
const REGISTRATIONS = [
  { month: "Jan", count: 12 }, { month: "Feb", count: 18 }, { month: "Mar", count: 25 },
  { month: "Apr", count: 21 }, { month: "May", count: 34 }, { month: "Jun", count: 41 },
];

const FUNNEL: { label: string; statuses: string[] }[] = [
  { label: "Submitted", statuses: ["submitted", "under-review", "payment-pending", "payment-confirmed", "enrolled"] },
  { label: "Under Review", statuses: ["under-review", "payment-pending", "payment-confirmed", "enrolled"] },
  { label: "Payment Stage", statuses: ["payment-pending", "payment-confirmed", "enrolled"] },
  { label: "Enrolled", statuses: ["enrolled"] },
  { label: "Rejected", statuses: ["rejected"] },
];

const roleChartConfig: ChartConfig = { count: { label: "Users", color: "var(--chart-1)" } };
const regChartConfig: ChartConfig = { count: { label: "Registrations", color: "var(--chart-1)" } };

export default function SuperAdminReports() {
  const { users, applications, crossEnrollments } = useStore();
  const { inYear } = useYearScope();

  const roleCounts = ROLE_ORDER.map((r) => ({ role: r, label: roleLabels[r], count: users.filter((u) => u.role === r).length }));

  // Application funnel is scoped to the active academic year's admission cycle.
  const yearApplications = applications.filter((a) => inYear(a.academicYearId));
  const funnel = FUNNEL.map((f) => ({ label: f.label, count: yearApplications.filter((a) => f.statuses.includes(a.status)).length }));

  const ceByStatus = ["pending", "approved", "rejected"].map((s) => ({ status: s, count: crossEnrollments.filter((c) => c.status === s).length }));
  const statusConfig = paletteConfig(ceByStatus.map((d) => ({ key: d.status, label: d.status[0].toUpperCase() + d.status.slice(1) })));

  const ceByType = [
    { type: "Cohort → Cohort", key: "cohort-to-cohort" },
    { type: "Cohort → OL", key: "cohort-to-ol" },
    { type: "OL → Cohort", key: "ol-to-cohort" },
  ].map((t) => ({ type: t.type, count: crossEnrollments.filter((c) => c.type === t.key).length }));
  const typeConfig = paletteConfig(ceByType.map((d) => ({ key: d.type, label: d.type })));

  const exportBtn = <Button variant="outline" size="sm" onClick={() => toast.success("Report exported successfully")}><Download className="size-4" /> Export (Mock)</Button>;

  return (
    <div>
      <PageHeader title="Reports & Analytics" description="Institution-wide user, admissions, usage and cross-enrollment insights.">
        <AcademicYearSelect />
      </PageHeader>
      <Tabs defaultValue="users">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="users">User Counts</TabsTrigger>
          <TabsTrigger value="registrations">Registrations</TabsTrigger>
          <TabsTrigger value="funnel">Application Funnel</TabsTrigger>
          <TabsTrigger value="usage">System Usage</TabsTrigger>
          <TabsTrigger value="cross">Cross-Enrollment</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="grid gap-4 sm:grid-cols-3 mb-4">
            <StatCard title="Total Users" value={users.length} icon={Users} />
            <StatCard title="Cohort Students" value={users.filter((u) => u.role === "cohort-student").length} icon={UserCheck} />
            <StatCard title="OL Students" value={users.filter((u) => u.role === "ol-student").length} icon={UserCheck} />
          </div>
          <Card><CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle className="text-base">Users by Role</CardTitle>{exportBtn}</CardHeader><CardContent>
            <ChartContainer config={roleChartConfig} className="aspect-auto h-[300px] w-full">
              <BarChart accessibilityLayer data={roleCounts} layout="vertical" margin={{ left: 12, right: 32 }}>
                <CartesianGrid horizontal={false} />
                <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} width={140} />
                <XAxis type="number" dataKey="count" hide />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={4}>
                  <LabelList dataKey="count" position="right" offset={8} className="fill-foreground text-xs" />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="registrations">
          <Card><CardHeader className="flex-row items-center justify-between space-y-0"><div><CardTitle className="text-base">New Registrations</CardTitle><p className="text-sm text-muted-foreground">Over time (2026)</p></div>{exportBtn}</CardHeader><CardContent>
            <ChartContainer config={regChartConfig} className="aspect-auto h-[280px] w-full">
              <AreaChart accessibilityLayer data={REGISTRATIONS} margin={{ left: 4, right: 12, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} width={28} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Area dataKey="count" type="monotone" stroke="var(--color-count)" fill="var(--color-count)" fillOpacity={0.2} strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="funnel">
          <Card><CardHeader className="flex-row items-center justify-between space-y-0"><div><CardTitle className="text-base">Application Funnel</CardTitle><p className="text-sm text-muted-foreground">Submitted → reviewed → enrolled / rejected</p></div>{exportBtn}</CardHeader><CardContent>
            <ChartContainer config={{ count: { label: "Applications" } }} className="aspect-auto h-[260px] w-full">
              <BarChart accessibilityLayer data={funnel} layout="vertical" margin={{ left: 12, right: 32 }}>
                <CartesianGrid horizontal={false} />
                <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} width={110} />
                <XAxis type="number" dataKey="count" hide />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="count" radius={4}>
                  {funnel.map((f) => <Cell key={f.label} fill={f.label === "Rejected" ? "var(--chart-4)" : "var(--chart-2)"} />)}
                  <LabelList dataKey="count" position="right" offset={8} className="fill-foreground text-xs" />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="usage">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard title="Active Today" value={38} icon={Activity} variant="success" />
            <StatCard title="Active This Week" value={142} icon={Activity} />
            <StatCard title="Active This Month" value={311} icon={Activity} />
          </div>
          <Card className="mt-4"><CardContent className="pt-6">
            <div className="flex justify-end mb-4">{exportBtn}</div>
            <p className="text-sm text-muted-foreground">System usage statistics are simulated for the prototype. In production these would be computed from session/activity logs.</p>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="cross">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card><CardHeader><CardTitle className="text-base">By Status</CardTitle></CardHeader><CardContent>
              <div className="flex justify-end mb-2">{exportBtn}</div>
              <ChartContainer config={statusConfig} className="mx-auto aspect-square max-h-[260px]">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent nameKey="status" hideLabel />} />
                  <Pie data={ceByStatus} dataKey="count" nameKey="status" innerRadius={55} strokeWidth={2}>
                    {ceByStatus.map((d, i) => <Cell key={d.status} fill={chartColor(i)} />)}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="status" />} className="flex-wrap" />
                </PieChart>
              </ChartContainer>
            </CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">By Type</CardTitle></CardHeader><CardContent>
              <ChartContainer config={typeConfig} className="mx-auto aspect-square max-h-[260px]">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent nameKey="type" hideLabel />} />
                  <Pie data={ceByType} dataKey="count" nameKey="type" innerRadius={55} strokeWidth={2}>
                    {ceByType.map((d, i) => <Cell key={d.type} fill={chartColor(i)} />)}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="type" />} className="flex-wrap" />
                </PieChart>
              </ChartContainer>
            </CardContent></Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
