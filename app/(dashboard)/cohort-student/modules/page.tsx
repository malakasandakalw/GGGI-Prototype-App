"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { AcademicYearSelect } from "@/components/shared/AcademicYearSelect";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/store/provider";
import { useYearScope } from "@/hooks/use-year-scope";
import { useStudentAccess } from "@/hooks/use-student-access";

export default function CohortModules() {
  const { currentUser, programs, modules, lectures, moduleGrades } = useStore();
  const { isSemesterInYear, activeAcademicYear } = useYearScope();
  const { hasProgram } = useStudentAccess();
  const program = programs.find((p) => p.id === currentUser?.programId);
  // Show only the semesters that run in the active academic year.
  const semesters = (program?.semesters ?? []).filter((s) => isSemesterInYear(s.id));
  const [tab, setTab] = useState(currentUser?.currentSemesterId ?? "");
  const activeTab = semesters.some((s) => s.id === tab) ? tab : semesters[0]?.id;
  const crossModules = modules.filter((m) => currentUser?.crossEnrolledModuleIds?.includes(m.id));

  return (
    <div>
      <PageHeader title="My Modules" description={hasProgram ? "Browse your modules across semesters." : "The cohort modules you're enrolled in."}>
        {hasProgram && <AcademicYearSelect />}
      </PageHeader>

      {/* Programme students see their semesters; a cross-enrolled-only student skips this block. */}
      {hasProgram && (
        <>
          {semesters.length === 0 && (
            <EmptyState title="No modules for this academic year" description={`You have no semesters registered in ${activeAcademicYear?.label ?? "this year"}. Use the academic-year selector above to view another year.`} />
          )}
          <Tabs value={activeTab} onValueChange={setTab}>
            <TabsList className="flex-wrap h-auto">
              {semesters.map((s) => (
                <TabsTrigger key={s.id} value={s.id}>{s.name}{s.id === currentUser?.currentSemesterId && " (Current)"}</TabsTrigger>
              ))}
            </TabsList>
            {semesters.map((s) => (
              <TabsContent key={s.id} value={s.id}>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {modules.filter((m) => s.moduleIds.includes(m.id)).map((m) => {
                    const ls = lectures.filter((l) => l.moduleId === m.id && l.status === "published");
                    const grade = moduleGrades.find((g) => g.studentId === currentUser?.id && g.moduleId === m.id && g.published);
                    return (
                      <Card key={m.id}><CardContent className="pt-6 space-y-2">
                        <div className="flex items-start justify-between">
                          <div><p className="font-medium">{m.name}</p><p className="text-xs text-muted-foreground">{m.code} · {m.creditValue} cr</p></div>
                          {grade && <Badge className="bg-emerald-100 text-emerald-800" variant="ghost">{grade.grade}</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">{ls.length} lectures published</p>
                        <Button asChild size="sm" className="w-full"><Link href={`/cohort-student/modules/${m.id}`}>Open</Link></Button>
                      </CardContent></Card>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}

      {crossModules.length > 0 && (
        <div className={hasProgram ? "mt-8" : ""}>
          {hasProgram && <h3 className="font-semibold mb-3">Cross-Enrolled Modules</h3>}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {crossModules.map((m) => {
              const ls = lectures.filter((l) => l.moduleId === m.id && l.status === "published");
              return (
                <Card key={m.id}><CardContent className="pt-6 space-y-2">
                  <div className="flex items-start justify-between"><div><p className="font-medium">{m.name}</p><p className="text-xs text-muted-foreground">{m.code} · {m.creditValue} cr</p></div><Badge variant="secondary" className="text-[10px]">Cross-Program</Badge></div>
                  <p className="text-xs text-muted-foreground">{ls.length} lectures published</p>
                  <Button asChild size="sm" className="w-full"><Link href={`/cohort-student/modules/${m.id}`}>Open</Link></Button>
                </CardContent></Card>
              );
            })}
          </div>
        </div>
      )}

      {/* A student with neither a programme nor a cross-enrolled module. */}
      {!hasProgram && crossModules.length === 0 && (
        <EmptyState title="No cohort modules yet" description="You're not enrolled in any cohort modules. Request cross-enrollment to join one." />
      )}
    </div>
  );
}
