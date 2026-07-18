"use client";

import { useState } from "react";
import { Eye, Lock } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { AcademicYearSelect } from "@/components/shared/AcademicYearSelect";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useYearScope } from "@/hooks/use-year-scope";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { useStore } from "@/lib/store/provider";
import { isStudentRole } from "@/lib/utils/student-access";
import type { User } from "@/lib/types";

export default function ProgramAdminResults() {
  const { currentUser, programs, modules, users, moduleGrades } = useStore();
  const { isModuleInYear } = useYearScope();
  const myPrograms = programs.filter((p) => currentUser?.programIds?.includes(p.id));
  const myProgramIds = myPrograms.map((p) => p.id);
  const [program, setProgram] = useState(myProgramIds[0] ?? "all");
  const [view, setView] = useState<User | null>(null);

  // Enrollment-based: the programme's own students PLUS any student (incl. cross-enrolled
  // Open Learning learners) taking a module owned by the scoped programme(s).
  const scopedProgramIds = program === "all" ? myProgramIds : [program];
  const scopedModuleIds = new Set(modules.filter((m) => scopedProgramIds.includes(m.programId)).map((m) => m.id));
  const students = users.filter((u) => {
    if (!isStudentRole(u.role)) return false;
    const isHome = !!u.programId && scopedProgramIds.includes(u.programId);
    const isCrossEnrolled = !!u.crossEnrolledModuleIds?.some((id) => scopedModuleIds.has(id));
    return isHome || isCrossEnrolled;
  });
  const programName = (id?: string) => programs.find((p) => p.id === id)?.name ?? "—";
  const moduleName = (id: string) => { const m = modules.find((x) => x.id === id); return m ? `${m.code} — ${m.name}` : id; };

  // Scoped to the active academic year's module offerings (GPA shown is for that year).
  const studentGrades = (sid: string) => moduleGrades.filter((g) => g.studentId === sid && g.published && isModuleInYear(g.moduleId));
  const cgpa = (sid: string) => {
    const gs = studentGrades(sid);
    return gs.length ? (gs.reduce((s, g) => s + g.gradePoint, 0) / gs.length).toFixed(2) : "—";
  };

  return (
    <div>
      <PageHeader title="Student Results" description="Read-only view of published student results within your programs.">
        <AcademicYearSelect />
      </PageHeader>

      <Alert className="mb-4">
        <Lock className="size-4" />
        <AlertDescription>Read-only view. Program Admins can monitor results but cannot enter or change grades — grading stays with Lecturers and HODs.</AlertDescription>
      </Alert>

      <div className="mb-4 max-w-xs">
        <Select value={program} onValueChange={setProgram}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Programs</SelectItem>
            {myPrograms.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Student ID</TableHead><TableHead>Program</TableHead><TableHead>Modules Graded</TableHead><TableHead>GPA (Year)</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {students.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell className="text-muted-foreground">{s.studentId ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{programName(s.programId)}</TableCell>
                <TableCell>{studentGrades(s.id).length}</TableCell>
                <TableCell className="font-medium">{cgpa(s.id)}</TableCell>
                <TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => setView(s)}><Eye className="size-4" /> View</Button></TableCell>
              </TableRow>
            ))}
            {students.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No students found.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>

      <Sheet open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {view && (
            <>
              <SheetHeader>
                <SheetTitle>{view.name}</SheetTitle>
                <SheetDescription>{view.studentId} · {programName(view.programId)} · GPA (Year) {cgpa(view.id)}</SheetDescription>
              </SheetHeader>
              <div className="px-4 pb-6 space-y-3 text-sm">
                <p className="font-medium">Module Results</p>
                {studentGrades(view.id).length === 0 && <p className="text-xs text-muted-foreground">No published results yet.</p>}
                {studentGrades(view.id).map((g) => (
                  <div key={g.moduleId} className="rounded border p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{moduleName(g.moduleId)}</span>
                      <Badge variant={g.gradePoint >= 2 ? "secondary" : "destructive"}>{g.specialCode ?? g.grade}</Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                      <span>CA (Asg): {g.assignmentMarks}</span>
                      <span>Quiz: {g.quizMarks}</span>
                      <span>Final: {g.finalExamMark}</span>
                      <span>Total: {g.weightedTotal}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
