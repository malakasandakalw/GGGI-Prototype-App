"use client";

import { toast } from "sonner";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStore } from "@/lib/store/provider";
import { formatDate } from "@/lib/utils/date";
import type { ApplicationStatus } from "@/lib/types";

const APP_STATUSES: ApplicationStatus[] = ["submitted", "under-review", "payment-pending", "payment-confirmed", "enrolled", "rejected", "waitlisted"];
const typeLabel: Record<string, string> = {
  "cohort-to-cohort": "Cohort → Cohort",
  "ol-to-cohort": "OL → Cohort",
  "cohort-to-ol": "Cohort → OL",
};

export default function RegistrarReports() {
  const { applications, programs, intakes, users, crossEnrollments } = useStore();
  const students = users.filter((u) => u.role === "cohort-student");
  const programName = (id?: string) => programs.find((p) => p.id === id)?.name ?? "—";
  const intakeName = (id?: string) => intakes.find((i) => i.id === id)?.label ?? "—";

  const exportBtn = <Button variant="outline" size="sm" onClick={() => toast.success("Report exported successfully")}><Download className="size-4" /> Export (Mock)</Button>;

  const appByStatus = APP_STATUSES.map((s) => ({ status: s, count: applications.filter((a) => a.status === s).length }));
  const maxApp = Math.max(1, ...appByStatus.map((d) => d.count));

  const perIntake = intakes.map((i) => ({
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

  return (
    <div>
      <PageHeader title="Reports" description="Enrollment, applications and registration analytics." />
      <Tabs defaultValue="applications">
        <TabsList>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
          <TabsTrigger value="cross">Cross-Enrollment</TabsTrigger>
          <TabsTrigger value="activity">Account Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="applications">
          <Card><CardContent className="pt-6">
            <div className="flex justify-end mb-4">{exportBtn}</div>
            <p className="text-sm font-medium mb-3">Applications by Status</p>
            <div className="space-y-4">
              {appByStatus.map((d) => (
                <div key={d.status}>
                  <div className="flex justify-between text-sm mb-1"><span className="capitalize">{d.status.replace("-", " ")}</span><span className="font-medium">{d.count}</span></div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${(d.count / maxApp) * 100}%` }} /></div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">Total applications: {applications.length}</p>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="enrollment">
          <Card><CardContent className="pt-6">
            <div className="flex justify-end mb-4">{exportBtn}</div>
            <p className="text-sm font-medium mb-3">Students Enrolled per Program</p>
            <Table>
              <TableHeader><TableRow><TableHead>Program</TableHead><TableHead>Students</TableHead></TableRow></TableHeader>
              <TableBody>
                {perProgram.map((p) => <TableRow key={p.id}><TableCell>{p.name}</TableCell><TableCell>{p.count}</TableCell></TableRow>)}
              </TableBody>
            </Table>
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
            <div className="grid grid-cols-3 gap-3 mb-6">
              {accountActivity.map((a) => (
                <div key={a.key} className="rounded-lg border p-3 text-center">
                  <p className="text-2xl font-bold">{a.count}</p>
                  <p className="text-xs text-muted-foreground">{a.label}</p>
                </div>
              ))}
            </div>
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
