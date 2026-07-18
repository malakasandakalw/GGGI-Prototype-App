"use client";

import { toast } from "sonner";
import { GraduationCap, Download, Printer } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/EmptyState";
import { useStore } from "@/lib/store/provider";
import { useStudentAccess } from "@/hooks/use-student-access";
import { gpa, academicClass } from "@/lib/utils/gpa";
import { formatDate } from "@/lib/utils/date";

export default function Transcript() {
  const { currentUser, programs, modules, moduleGrades, academicYears } = useStore();
  const { hasProgram } = useStudentAccess();
  const program = programs.find((p) => p.id === currentUser?.programId);
  const myGrades = moduleGrades.filter((g) => g.studentId === currentUser?.id && g.published);
  const cgpa = gpa(myGrades, modules);
  const cls = academicClass(cgpa);

  // Sri Lankan transcript layout: cumulative across ALL academic years (ignores the global
  // year filter), grouped Academic Year → study level → semester. Each semester already
  // carries both its calendar year (academicYearId) and its study level (year).
  const gradedSemesters = (program?.semesters ?? []).filter((s) =>
    myGrades.some((g) => s.moduleIds.includes(g.moduleId)),
  );
  const yearMeta = (id?: string) => academicYears.find((y) => y.id === id);
  const yearGroups = [...new Set(gradedSemesters.map((s) => s.academicYearId))]
    .sort((a, b) => (yearMeta(a)?.startDate ?? "9999").localeCompare(yearMeta(b)?.startDate ?? "9999"))
    .map((yid) => ({
      label: yearMeta(yid)?.label ?? "Unassigned Year",
      semesters: gradedSemesters
        .filter((s) => s.academicYearId === yid)
        .sort((a, b) => a.year - b.year || a.semesterNumber - b.semesterNumber),
    }));

  if (!hasProgram) {
    return (
      <div>
        <PageHeader title="Academic Transcript" description="A reference copy of your academic record." />
        <EmptyState
          icon={GraduationCap}
          title="No degree transcript for your enrolment"
          description="A full academic transcript is issued for degree-programme students. As an Open Learning student with cross-enrolled module(s), your module results are shown under Grades, and completed Open Learning courses appear under Certificates."
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Academic Transcript" description="A reference copy of your academic record.">
        <Button variant="outline" onClick={() => window.print()}><Printer className="size-4" /> Print / Save as PDF</Button>
        <Button variant="outline" onClick={() => toast.success("Transcript download simulated.")}><Download className="size-4" /> Download PDF (Mock)</Button>
      </PageHeader>

      <Card className="max-w-3xl mx-auto bg-white">
        <CardContent className="pt-8 pb-8 px-8 space-y-6">
          <div className="text-center border-b pb-4">
            <div className="flex items-center justify-center gap-2 mb-2"><GraduationCap className="size-7" /><span className="font-bold text-lg">University LMS</span></div>
            <h2 className="text-xl font-bold tracking-wide">ACADEMIC TRANSCRIPT</h2>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <p><span className="text-muted-foreground">Student Name:</span> {currentUser?.name}</p>
            <p><span className="text-muted-foreground">Student ID:</span> {currentUser?.studentId}</p>
            <p><span className="text-muted-foreground">Program:</span> {program?.name}</p>
            <p><span className="text-muted-foreground">Intake:</span> 2024 Intake</p>
          </div>

          {yearGroups.map((grp) => {
            const yearGrades = myGrades.filter((g) =>
              grp.semesters.some((s) => s.moduleIds.includes(g.moduleId)),
            );
            const ygpa = gpa(yearGrades, modules);
            return (
              <div key={grp.label} className="space-y-4">
                <div className="flex items-center justify-between border-b pb-1">
                  <p className="text-sm font-bold tracking-wide">Academic Year {grp.label}</p>
                  <p className="text-xs text-muted-foreground">Year GPA: <span className="font-semibold text-foreground">{ygpa.toFixed(2)}</span></p>
                </div>
                {grp.semesters.map((s) => {
                  const semModules = modules.filter((m) => s.moduleIds.includes(m.id));
                  const semGrades = myGrades.filter((g) => semModules.some((m) => m.id === g.moduleId));
                  if (semGrades.length === 0) return null;
                  const sgpa = gpa(semGrades, modules);
                  return (
                    <div key={s.id} className="pl-1">
                      <p className="text-sm font-semibold mb-1">Year {s.year} · {s.name}</p>
                      <Table>
                        <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Module</TableHead><TableHead>Credits</TableHead><TableHead>Grade</TableHead><TableHead>GP</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {semModules.map((m) => {
                            const g = myGrades.find((x) => x.moduleId === m.id);
                            if (!g) return null;
                            return <TableRow key={m.id}><TableCell className="font-mono text-xs">{m.code}</TableCell><TableCell>{m.name}</TableCell><TableCell>{m.creditValue}</TableCell><TableCell className="font-semibold">{g.specialCode ?? g.grade}</TableCell><TableCell>{g.gradePoint.toFixed(1)}</TableCell></TableRow>;
                          })}
                        </TableBody>
                      </Table>
                      <p className="text-sm text-right mt-1 font-medium">SGPA: {sgpa.toFixed(2)}</p>
                    </div>
                  );
                })}
              </div>
            );
          })}
          {yearGroups.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No published results yet.</p>}

          <div className="border-t pt-4 space-y-1 text-sm">
            <p className="font-bold">CGPA: {cgpa.toFixed(2)}</p>
            <p>Academic Standing: {cls.label}</p>
            <p className="text-muted-foreground">Date of Issue: {formatDate(new Date().toISOString())}</p>
            <p className="text-xs text-muted-foreground italic mt-2">This is a system-generated transcript for reference purposes. Official certified transcripts are issued by the Registrar&apos;s Office.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
