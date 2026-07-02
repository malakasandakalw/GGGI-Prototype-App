"use client";

import { toast } from "sonner";
import { Download, Activity, Users, UserCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStore } from "@/lib/store/provider";
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

export default function SuperAdminReports() {
  const { users, applications, crossEnrollments } = useStore();

  const roleCounts = ROLE_ORDER.map((r) => ({ role: r, count: users.filter((u) => u.role === r).length }));
  const maxRole = Math.max(1, ...roleCounts.map((d) => d.count));
  const maxReg = Math.max(1, ...REGISTRATIONS.map((d) => d.count));

  const funnel = FUNNEL.map((f) => ({ label: f.label, count: applications.filter((a) => f.statuses.includes(a.status)).length }));
  const maxFunnel = Math.max(1, ...funnel.map((f) => f.count));

  const ceByStatus = ["pending", "approved", "rejected"].map((s) => ({ status: s, count: crossEnrollments.filter((c) => c.status === s).length }));
  const ceByType = [
    { type: "Cohort → Cohort", key: "cohort-to-cohort" },
    { type: "Cohort → OL", key: "cohort-to-ol" },
    { type: "OL → Cohort", key: "ol-to-cohort" },
  ].map((t) => ({ type: t.type, count: crossEnrollments.filter((c) => c.type === t.key).length }));

  const exportBtn = <Button variant="outline" size="sm" onClick={() => toast.success("Report exported successfully")}><Download className="size-4" /> Export (Mock)</Button>;

  return (
    <div>
      <PageHeader title="Reports & Analytics" description="Institution-wide user, admissions, usage and cross-enrollment insights." />
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
          <Card><CardContent className="pt-6">
            <div className="flex justify-end mb-4">{exportBtn}</div>
            <div className="space-y-4">
              {roleCounts.map((d) => (
                <div key={d.role}>
                  <div className="flex justify-between text-sm mb-1"><span>{roleLabels[d.role]}</span><span className="font-medium">{d.count}</span></div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${(d.count / maxRole) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="registrations">
          <Card><CardContent className="pt-6">
            <div className="flex justify-end mb-4">{exportBtn}</div>
            <p className="text-sm text-muted-foreground mb-4">New registrations over time (2026)</p>
            <div className="flex items-end gap-4 h-48">
              {REGISTRATIONS.map((d) => (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-blue-500 rounded-t" style={{ height: `${(d.count / maxReg) * 100}%` }} />
                  <span className="text-xs text-muted-foreground">{d.month}</span>
                  <span className="text-xs font-medium">{d.count}</span>
                </div>
              ))}
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="funnel">
          <Card><CardContent className="pt-6">
            <div className="flex justify-end mb-4">{exportBtn}</div>
            <p className="text-sm text-muted-foreground mb-4">Application funnel — submitted → reviewed → enrolled / rejected</p>
            <div className="space-y-3">
              {funnel.map((f) => (
                <div key={f.label}>
                  <div className="flex justify-between text-sm mb-1"><span>{f.label}</span><span className="font-medium">{f.count}</span></div>
                  <div className="h-4 bg-muted rounded overflow-hidden"><div className={`h-full ${f.label === "Rejected" ? "bg-red-400" : "bg-emerald-500"}`} style={{ width: `${(f.count / maxFunnel) * 100}%` }} /></div>
                </div>
              ))}
            </div>
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
              <Table>
                <TableHeader><TableRow><TableHead>Status</TableHead><TableHead>Requests</TableHead></TableRow></TableHeader>
                <TableBody>{ceByStatus.map((d) => <TableRow key={d.status}><TableCell className="capitalize">{d.status}</TableCell><TableCell>{d.count}</TableCell></TableRow>)}</TableBody>
              </Table>
            </CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">By Type</CardTitle></CardHeader><CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Requests</TableHead></TableRow></TableHeader>
                <TableBody>{ceByType.map((d) => <TableRow key={d.type}><TableCell>{d.type}</TableCell><TableCell>{d.count}</TableCell></TableRow>)}</TableBody>
              </Table>
            </CardContent></Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
