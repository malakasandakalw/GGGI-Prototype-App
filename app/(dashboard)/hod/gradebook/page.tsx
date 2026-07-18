"use client";

import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { AcademicYearSelect } from "@/components/shared/AcademicYearSelect";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useYearScope } from "@/hooks/use-year-scope";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store/provider";
import { studentsInModule } from "@/lib/utils/student-access";
import type { Module, ModuleGrade } from "@/lib/types";

export default function HODGradebook() {
  const { currentUser, modules, programs, users, moduleGrades, updateGrade } = useStore();
  const { isModuleInYear, activeAcademicYear } = useYearScope();
  const myModules = modules.filter((m) => m.status === "active" && isModuleInYear(m.id) && programs.find((p) => p.id === m.programId)?.department === currentUser?.department);

  if (myModules.length === 0) {
    return (
      <div>
        <PageHeader title="Gradebook" description="Enter final examination marks and manage grades."><AcademicYearSelect /></PageHeader>
        <EmptyState title="No modules for this academic year" description={`No active modules ran in ${activeAcademicYear?.label ?? "this year"}. Switch the academic year to enter grades for another year.`} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Gradebook" description="Enter final examination marks and manage grades."><AcademicYearSelect /></PageHeader>
      <Tabs defaultValue={myModules[0].id}>
        <TabsList className="flex-wrap h-auto">
          {myModules.map((m) => <TabsTrigger key={m.id} value={m.id}>{m.code}</TabsTrigger>)}
        </TabsList>
        {myModules.map((m) => (
          <TabsContent key={m.id} value={m.id}>
            <ModuleGradeTable module={m} students={studentsInModule(users, programs, m.id)} grades={moduleGrades} onUpdate={updateGrade} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function ModuleGradeTable({
  module: m, students, grades, onUpdate,
}: {
  module: Module;
  students: { id: string; name: string; studentId?: string }[];
  grades: ModuleGrade[];
  onUpdate: (sid: string, mid: string, patch: Partial<ModuleGrade>) => void;
}) {
  const caWeight = m.assessmentBreakdown.assignments + m.assessmentBreakdown.quizzes;
  const get = (sid: string) => grades.find((g) => g.studentId === sid && g.moduleId === m.id);

  return (
    <Card className="p-0">
      <div className="flex items-center justify-between p-4 border-b">
        <p className="text-sm text-muted-foreground">CA: {caWeight}% | Final Exam: {100 - caWeight}%</p>
        <Button size="sm" onClick={() => toast.success("All grades saved")}>Save All</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead><TableHead>ID</TableHead>
            <TableHead>Assign Avg</TableHead><TableHead>Quiz Avg</TableHead><TableHead>CA Total</TableHead>
            <TableHead>Final Exam</TableHead><TableHead>Weighted</TableHead><TableHead>Grade</TableHead><TableHead>Special</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((s) => {
            const g = get(s.id);
            const caTotal = g ? Math.round((g.assignmentMarks + g.quizMarks) / 2) : 0;
            return (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell className="font-mono text-xs">{s.studentId}</TableCell>
                <TableCell>{g?.assignmentMarks ?? "—"}</TableCell>
                <TableCell>{g?.quizMarks ?? "—"}</TableCell>
                <TableCell>{caTotal}</TableCell>
                <TableCell>
                  <Input
                    type="number" min={0} max={100}
                    className="w-20"
                    defaultValue={g?.finalExamMark || ""}
                    disabled={!!g?.specialCode}
                    onChange={(e) => onUpdate(s.id, m.id, { finalExamMark: Number(e.target.value) })}
                  />
                </TableCell>
                <TableCell>{g?.specialCode ? "—" : g?.weightedTotal || "—"}</TableCell>
                <TableCell className="font-semibold">{g?.grade ?? "—"}</TableCell>
                <TableCell>
                  <Select value={g?.specialCode ?? "none"} onValueChange={(v) => onUpdate(s.id, m.id, { specialCode: v === "none" ? undefined : v as ModuleGrade["specialCode"] })}>
                    <SelectTrigger className="w-20 h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["none", "I", "N", "W", "AB"].map((c) => <SelectItem key={c} value={c}>{c === "none" ? "—" : c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
