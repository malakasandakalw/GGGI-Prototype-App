"use client";

import { useState } from "react";
import { Eye, Lock } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import type { Module } from "@/lib/types";

export default function ProgramAdminModules() {
  const { currentUser, programs, modules, lectures, users } = useStore();
  const myPrograms = programs.filter((p) => currentUser?.programIds?.includes(p.id));
  const myProgramIds = myPrograms.map((p) => p.id);
  const [program, setProgram] = useState("all");
  const [view, setView] = useState<Module | null>(null);

  const scoped = modules.filter((m) => myProgramIds.includes(m.programId));
  const filtered = program === "all" ? scoped : scoped.filter((m) => m.programId === program);

  const programName = (id: string) => programs.find((p) => p.id === id)?.name ?? "—";
  const lecturerName = (id: string) => users.find((u) => u.id === id)?.name ?? "Unassigned";
  const moduleLectures = (id: string) => lectures.filter((l) => l.moduleId === id).sort((a, b) => a.order - b.order);

  return (
    <div>
      <PageHeader title="Modules" description="Read-only oversight of module content, lecturer assignments and lectures across your programs." />

      <Alert className="mb-4">
        <Lock className="size-4" />
        <AlertDescription>Read-only view. Program Admins can review module structure but cannot edit content or enter grades — that stays with Lecturers and HODs.</AlertDescription>
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
          <TableHeader><TableRow><TableHead>Module</TableHead><TableHead>Program</TableHead><TableHead>Lecturer</TableHead><TableHead>Credits</TableHead><TableHead>Lectures</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {filtered.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.code} — {m.name}</TableCell>
                <TableCell className="text-muted-foreground">{programName(m.programId)}</TableCell>
                <TableCell>{lecturerName(m.primaryLecturerId)}</TableCell>
                <TableCell>{m.creditValue}</TableCell>
                <TableCell>{moduleLectures(m.id).length}</TableCell>
                <TableCell><StatusBadge status={m.status} /></TableCell>
                <TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => setView(m)}><Eye className="size-4" /> View</Button></TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No modules found.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>

      <Sheet open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          {view && (
            <>
              <SheetHeader>
                <SheetTitle>{view.code} — {view.name}</SheetTitle>
                <SheetDescription>{programName(view.programId)} · {view.creditValue} credits</SheetDescription>
              </SheetHeader>
              <div className="px-4 pb-6 space-y-5 text-sm">
                <div className="flex items-center gap-2"><StatusBadge status={view.status} />{view.isShared && <Badge variant="secondary">Shared</Badge>}{view.isCrossStreamEnabled && <Badge variant="secondary">Cross-stream</Badge>}</div>

                {view.learningOutcomes && (
                  <div>
                    <p className="font-medium mb-1">Learning Outcomes</p>
                    <p className="text-muted-foreground">{view.learningOutcomes}</p>
                  </div>
                )}

                <div>
                  <p className="font-medium mb-2">Lecturers Assigned</p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between rounded border p-2">
                      <span>{lecturerName(view.primaryLecturerId)}</span><Badge variant="secondary">Primary</Badge>
                    </div>
                    {view.lecturerIds.filter((id) => id !== view.primaryLecturerId).map((id) => (
                      <div key={id} className="flex items-center justify-between rounded border p-2"><span>{lecturerName(id)}</span></div>
                    ))}
                    {view.lecturerIds.length === 0 && !view.primaryLecturerId && <p className="text-xs text-muted-foreground">No lecturers assigned.</p>}
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">Assessment Breakdown</p>
                  <div className="grid grid-cols-3 gap-2">
                    <Stat label="Assignments" value={`${view.assessmentBreakdown.assignments}%`} />
                    <Stat label="Quizzes" value={`${view.assessmentBreakdown.quizzes}%`} />
                    <Stat label="Final Exam" value={`${view.assessmentBreakdown.finalExam}%`} />
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">Lectures ({moduleLectures(view.id).length})</p>
                  <div className="space-y-1">
                    {moduleLectures(view.id).map((l) => (
                      <div key={l.id} className="flex items-center justify-between rounded border p-2">
                        <span>{l.order}. {l.title}</span>
                        <StatusBadge status={l.status} />
                      </div>
                    ))}
                    {moduleLectures(view.id).length === 0 && <p className="text-xs text-muted-foreground">No lectures yet.</p>}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="bg-muted rounded-lg p-2 text-center"><p className="text-[11px] text-muted-foreground">{label}</p><p className="font-medium">{value}</p></div>;
}
