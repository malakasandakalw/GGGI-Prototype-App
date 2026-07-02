"use client";

import { toast } from "sonner";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStore } from "@/lib/store/provider";
import { formatDate } from "@/lib/utils/date";

export default function ProgramAdminReports() {
  const { programs, modules, lectures, users, moduleGrades, intakes, calendarEvents } = useStore();
  const myPrograms = programs.filter((p) => p.status !== "archived");
  const programName = (id?: string) => programs.find((p) => p.id === id)?.name ?? "All programs";

  const enrollmentData = myPrograms.map((p) => ({
    name: p.name,
    count: users.filter((u) => u.role === "cohort-student" && u.programId === p.id).length,
  }));
  const maxEnroll = Math.max(1, ...enrollmentData.map((d) => d.count));

  // Item I — per-intake enrollment breakdown
  const intakeData = intakes.map((i) => ({
    id: i.id,
    label: i.label,
    program: programName(i.programId),
    status: i.status,
    enrolled: i.enrolledStudentIds.length,
    capacity: i.maxCapacity,
  }));

  // Item I — exam schedule overview across all programs
  const examEvents = [...calendarEvents]
    .filter((e) => e.type === "exam")
    .sort((a, b) => a.date.localeCompare(b.date));

  const exportBtn = <Button variant="outline" size="sm" onClick={() => toast.success("Report exported successfully")}><Download className="size-4" /> Export (Mock)</Button>;

  return (
    <div>
      <PageHeader title="Reports" description="Enrollment, performance and content insights." />
      <Tabs defaultValue="enrollment">
        <TabsList>
          <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
          <TabsTrigger value="performance">Academic Performance</TabsTrigger>
          <TabsTrigger value="content">Content Status</TabsTrigger>
          <TabsTrigger value="exams">Exam Schedule</TabsTrigger>
          <TabsTrigger value="workload">Lecturer Workload</TabsTrigger>
        </TabsList>

        <TabsContent value="enrollment">
          <Card><CardContent className="pt-6">
            <div className="flex justify-end mb-4">{exportBtn}</div>
            <p className="text-sm font-medium mb-3">Enrollment per Program</p>
            <div className="space-y-4">
              {enrollmentData.map((d) => (
                <div key={d.name}>
                  <div className="flex justify-between text-sm mb-1"><span>{d.name}</span><span className="font-medium">{d.count}</span></div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${(d.count / maxEnroll) * 100}%` }} /></div>
                </div>
              ))}
            </div>
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
            <div className="flex justify-end mb-4">{exportBtn}</div>
            <Table>
              <TableHeader><TableRow><TableHead>Program</TableHead><TableHead>Avg CGPA</TableHead><TableHead>Pass Rate</TableHead><TableHead>Fail Rate</TableHead></TableRow></TableHeader>
              <TableBody>
                {myPrograms.map((p) => {
                  const grades = moduleGrades.filter((g) => modules.find((m) => m.id === g.moduleId)?.programId === p.id && g.published);
                  const pass = grades.filter((g) => g.gradePoint >= 2).length;
                  const rate = grades.length ? Math.round((pass / grades.length) * 100) : 0;
                  const avg = grades.length ? (grades.reduce((s, g) => s + g.gradePoint, 0) / grades.length).toFixed(2) : "—";
                  return <TableRow key={p.id}><TableCell>{p.name}</TableCell><TableCell>{avg}</TableCell><TableCell>{rate}%</TableCell><TableCell>{100 - rate}%</TableCell></TableRow>;
                })}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="content">
          <Card><CardContent className="pt-6">
            <div className="flex justify-end mb-4">{exportBtn}</div>
            <Table>
              <TableHeader><TableRow><TableHead>Module</TableHead><TableHead>Published</TableHead><TableHead>Pending</TableHead><TableHead>Draft</TableHead></TableRow></TableHeader>
              <TableBody>
                {modules.filter((m) => m.status === "active").map((m) => {
                  const ls = lectures.filter((l) => l.moduleId === m.id);
                  return <TableRow key={m.id}>
                    <TableCell>{m.code} — {m.name}</TableCell>
                    <TableCell>{ls.filter((l) => l.status === "published").length}</TableCell>
                    <TableCell>{ls.filter((l) => l.status === "submitted").length}</TableCell>
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
      </Tabs>
    </div>
  );
}
