"use client";

import { toast } from "sonner";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStore } from "@/lib/store/provider";

export default function ProgramAdminReports() {
  const { programs, modules, lectures, users, moduleGrades } = useStore();
  const myPrograms = programs.filter((p) => p.status !== "archived");

  const enrollmentData = myPrograms.map((p) => ({
    name: p.name,
    count: users.filter((u) => u.role === "cohort-student" && u.programId === p.id).length,
  }));
  const maxEnroll = Math.max(1, ...enrollmentData.map((d) => d.count));

  const exportBtn = <Button variant="outline" size="sm" onClick={() => toast.success("Report exported successfully")}><Download className="size-4" /> Export (Mock)</Button>;

  return (
    <div>
      <PageHeader title="Reports" description="Enrollment, performance and content insights." />
      <Tabs defaultValue="enrollment">
        <TabsList>
          <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
          <TabsTrigger value="performance">Academic Performance</TabsTrigger>
          <TabsTrigger value="content">Content Status</TabsTrigger>
          <TabsTrigger value="workload">Lecturer Workload</TabsTrigger>
        </TabsList>

        <TabsContent value="enrollment">
          <Card><CardContent className="pt-6">
            <div className="flex justify-end mb-4">{exportBtn}</div>
            <div className="space-y-4">
              {enrollmentData.map((d) => (
                <div key={d.name}>
                  <div className="flex justify-between text-sm mb-1"><span>{d.name}</span><span className="font-medium">{d.count}</span></div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${(d.count / maxEnroll) * 100}%` }} /></div>
                </div>
              ))}
            </div>
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
