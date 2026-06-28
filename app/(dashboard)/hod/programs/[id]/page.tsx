"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store/provider";
import { uid } from "@/lib/utils";
import type { Module } from "@/lib/types";

export default function ProgramBuilder() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { programs, modules, users, addSemesterToProgram, addModule, updateModule, updateProgram } = useStore();
  const program = programs.find((p) => p.id === id);
  const [selModule, setSelModule] = useState<Module | null>(null);
  const [semOpen, setSemOpen] = useState(false);
  const [modOpen, setModOpen] = useState<string | null>(null);
  const [submit, setSubmit] = useState(false);

  if (!program) return <div className="p-8">Program not found.</div>;
  const editable = program.status === "draft";
  const lecturerName = (lid: string) => users.find((u) => u.id === lid)?.name ?? "Unassigned";

  function addSemester(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addSemesterToProgram(program!.id, {
      id: uid("sem"),
      programId: program!.id,
      name: String(fd.get("name")),
      year: Number(fd.get("year")),
      semesterNumber: Number(fd.get("num")),
      startDate: String(fd.get("start")),
      endDate: String(fd.get("end")),
      status: "upcoming",
      moduleIds: [],
    });
    setSemOpen(false);
    toast.success("Semester added");
  }

  function addModuleToSem(e: React.FormEvent<HTMLFormElement>, semId: string) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addModule({
      code: String(fd.get("code")),
      name: String(fd.get("name")),
      programId: program!.id,
      semesterId: semId,
      creditValue: Number(fd.get("credits")),
      learningOutcomes: String(fd.get("outcomes")),
    });
    setModOpen(null);
    toast.success("Module added");
  }

  const canSubmit = program.semesters.length > 0 && program.semesters.some((s) => s.moduleIds.length > 0);

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-2" onClick={() => router.push("/hod/programs")}><ArrowLeft className="size-4" /> Back</Button>
      <PageHeader title={program.name} description={`${program.code} · ${program.totalCredits} credits`}>
        <StatusBadge status={program.status} />
        {editable && (
          <Button disabled={!canSubmit} onClick={() => setSubmit(true)}>Submit for Review</Button>
        )}
      </PageHeader>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {editable && <Button variant="outline" size="sm" onClick={() => setSemOpen(true)}><Plus className="size-4" /> Add Semester</Button>}
          {program.semesters.map((s) => (
            <Collapsible key={s.id} defaultOpen>
              <Card>
                <CardContent className="pt-4">
                  <CollapsibleTrigger className="flex w-full items-center justify-between">
                    <span className="font-medium">{s.name}</span>
                    <span className="text-xs text-muted-foreground">{s.moduleIds.length} modules</span>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 space-y-2">
                    {s.moduleIds.map((mid) => {
                      const m = modules.find((x) => x.id === mid);
                      if (!m) return null;
                      return (
                        <button key={mid} onClick={() => setSelModule(m)} className="w-full text-left rounded-md border px-3 py-2 hover:bg-muted text-sm flex justify-between">
                          <span>{m.code} — {m.name}</span>
                          <span className="text-muted-foreground">{m.creditValue} cr · {lecturerName(m.primaryLecturerId)}</span>
                        </button>
                      );
                    })}
                    {editable && (
                      <Button size="sm" variant="ghost" onClick={() => setModOpen(s.id)}><Plus className="size-4" /> Add Module</Button>
                    )}
                  </CollapsibleContent>
                </CardContent>
              </Card>

              <Dialog open={modOpen === s.id} onOpenChange={(o) => !o && setModOpen(null)}>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Module to {s.name}</DialogTitle></DialogHeader>
                  <form onSubmit={(e) => addModuleToSem(e, s.id)} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5"><Label className="text-xs">Code</Label><Input name="code" required /></div>
                      <div className="space-y-1.5"><Label className="text-xs">Credits</Label><Input name="credits" type="number" defaultValue={15} /></div>
                    </div>
                    <div className="space-y-1.5"><Label className="text-xs">Name</Label><Input name="name" required /></div>
                    <div className="space-y-1.5"><Label className="text-xs">Learning Outcomes</Label><Textarea name="outcomes" /></div>
                    <DialogFooter><Button type="submit">Add Module</Button></DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </Collapsible>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6">
            {selModule ? (
              <div className="space-y-3">
                <p className="font-medium">{selModule.code} — {selModule.name}</p>
                <div className="space-y-1.5"><Label className="text-xs">Credit Value</Label>
                  <Input type="number" defaultValue={selModule.creditValue} disabled={!editable} onBlur={(e) => updateModule(selModule.id, { creditValue: Number(e.target.value) })} />
                </div>
                <div className="space-y-1.5"><Label className="text-xs">Learning Outcomes</Label>
                  <Textarea defaultValue={selModule.learningOutcomes} disabled={!editable} onBlur={(e) => updateModule(selModule.id, { learningOutcomes: e.target.value })} />
                </div>
                <p className="text-xs font-medium">Assessment Breakdown</p>
                <div className="grid grid-cols-3 gap-2">
                  {(["assignments", "quizzes", "finalExam"] as const).map((k) => (
                    <div key={k} className="space-y-1">
                      <Label className="text-[10px] capitalize">{k}</Label>
                      <Input type="number" defaultValue={selModule.assessmentBreakdown[k]} disabled={!editable} />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Total: {selModule.assessmentBreakdown.assignments + selModule.assessmentBreakdown.quizzes + selModule.assessmentBreakdown.finalExam}%</p>
                {editable && <Button size="sm" onClick={() => toast.success("Module saved")}>Save Module</Button>}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Select a module to edit its details.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={semOpen} onOpenChange={setSemOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Semester</DialogTitle></DialogHeader>
          <form onSubmit={addSemester} className="space-y-3">
            <div className="space-y-1.5"><Label className="text-xs">Semester Name</Label><Input name="name" placeholder="Year 2 - Semester 1" required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Year</Label><Input name="year" type="number" defaultValue={1} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Semester #</Label><Input name="num" type="number" defaultValue={1} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Start Date</Label><Input name="start" type="date" /></div>
              <div className="space-y-1.5"><Label className="text-xs">End Date</Label><Input name="end" type="date" /></div>
            </div>
            <DialogFooter><Button type="submit">Add Semester</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={submit}
        onOpenChange={setSubmit}
        title="Submit program for review?"
        description="Once submitted, the program cannot be edited until returned by the Program Admin."
        confirmLabel="Submit"
        onConfirm={() => { updateProgram(program.id, { status: "submitted" }); toast.success("Program submitted for review"); setSubmit(false); }}
      />
    </div>
  );
}
