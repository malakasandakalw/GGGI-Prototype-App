"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/store/provider";

export default function CohortModules() {
  const { currentUser, programs, modules, lectures, moduleGrades } = useStore();
  const program = programs.find((p) => p.id === currentUser?.programId);
  const semesters = program?.semesters ?? [];
  const [tab, setTab] = useState(currentUser?.currentSemesterId ?? semesters[0]?.id);
  const crossModules = modules.filter((m) => currentUser?.crossEnrolledModuleIds?.includes(m.id));

  return (
    <div>
      <PageHeader title="My Modules" description="Browse your modules across semesters." />
      <Tabs value={tab} onValueChange={setTab}>
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

      {crossModules.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold mb-3">Cross-Enrolled Modules</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {crossModules.map((m) => (
              <Card key={m.id}><CardContent className="pt-6 space-y-2">
                <div className="flex items-start justify-between"><div><p className="font-medium">{m.name}</p><p className="text-xs text-muted-foreground">{m.code}</p></div><Badge variant="secondary" className="text-[10px]">Cross-Program</Badge></div>
                <Button asChild size="sm" className="w-full"><Link href={`/cohort-student/modules/${m.id}`}>Open</Link></Button>
              </CardContent></Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
