"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [selModuleId, setSelModuleId] = useState<string | null>(null);
  const [semOpen, setSemOpen] = useState(false);
  const [modOpen, setModOpen] = useState<string | null>(null);
  const [submit, setSubmit] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!program) return <div className="p-8">Program not found.</div>;
  const editable = program.status === "draft";
  const lecturerName = (lid: string) => users.find((u) => u.id === lid)?.name ?? "Unassigned";
  const programModules = modules.filter((m) => m.programId === program.id);
  const selModule = programModules.find((m) => m.id === selModuleId) ?? null;

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

  function addModuleToSem(e: React.FormEvent<HTMLFormElement>, semId: string, prereqs: string[]) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const assignments = Number(fd.get("ca-assignments"));
    const quizzes = Number(fd.get("ca-quizzes"));
    const finalExam = Number(fd.get("ca-final"));
    addModule({
      code: String(fd.get("code")),
      name: String(fd.get("name")),
      programId: program!.id,
      semesterId: semId,
      creditValue: Number(fd.get("credits")),
      learningOutcomes: String(fd.get("outcomes")),
      prerequisiteModuleIds: prereqs,
      assessmentBreakdown: { assignments, quizzes, finalExam },
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
                        <button key={mid} onClick={() => setSelModuleId(m.id)} className="w-full text-left rounded-md border px-3 py-2 hover:bg-muted text-sm flex justify-between">
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

              <AddModuleDialog
                open={modOpen === s.id}
                onOpenChange={(o) => !o && setModOpen(null)}
                semName={s.name}
                existingModules={programModules}
                onSubmit={(e, prereqs) => addModuleToSem(e, s.id, prereqs)}
              />
            </Collapsible>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6">
            {selModule ? (
              <ModuleDetail
                key={selModule.id}
                module={selModule}
                editable={editable}
                programModules={programModules}
                onSave={(patch) => { updateModule(selModule.id, patch); toast.success("Module saved"); }}
                onFieldBlur={(patch) => updateModule(selModule.id, patch)}
              />
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
        onConfirm={() => { updateProgram(program.id, { status: "submitted" }); toast.success("Program submitted for review"); setSubmit(false); setSubmitted(true); }}
      />

      <InfoDialog
        open={submitted}
        onOpenChange={setSubmitted}
        title="Submitted for review"
        description={<><strong>{program.name}</strong> has been submitted to the <strong>Program Admin</strong> for review. It&apos;s now locked from editing until they approve it (→ Super Admin activation) or return it with comments.</>}
      />
    </div>
  );
}

function AddModuleDialog({
  open, onOpenChange, semName, existingModules, onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  semName: string;
  existingModules: Module[];
  onSubmit: (e: React.FormEvent<HTMLFormElement>, prereqs: string[]) => void;
}) {
  const [prereqs, setPrereqs] = useState<string[]>([]);
  const toggle = (id: string) => setPrereqs((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) setPrereqs([]); onOpenChange(o); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Add Module to {semName}</DialogTitle></DialogHeader>
        <form onSubmit={(e) => onSubmit(e, prereqs)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label className="text-xs">Code</Label><Input name="code" required /></div>
            <div className="space-y-1.5"><Label className="text-xs">Credits</Label><Input name="credits" type="number" defaultValue={15} /></div>
          </div>
          <div className="space-y-1.5"><Label className="text-xs">Name</Label><Input name="name" required /></div>
          <div className="space-y-1.5"><Label className="text-xs">Learning Outcomes</Label><Textarea name="outcomes" /></div>
          <div className="space-y-1.5">
            <Label className="text-xs">Assessment Breakdown (%)</Label>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1"><Label className="text-[10px]">Assignments</Label><Input name="ca-assignments" type="number" defaultValue={40} /></div>
              <div className="space-y-1"><Label className="text-[10px]">Quizzes</Label><Input name="ca-quizzes" type="number" defaultValue={10} /></div>
              <div className="space-y-1"><Label className="text-[10px]">Final Exam</Label><Input name="ca-final" type="number" defaultValue={50} /></div>
            </div>
          </div>
          {existingModules.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs">Prerequisites</Label>
              <div className="rounded-md border p-2 space-y-1.5 max-h-40 overflow-y-auto">
                {existingModules.map((m) => (
                  <label key={m.id} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={prereqs.includes(m.id)} onCheckedChange={() => toggle(m.id)} />
                    {m.code} — {m.name}
                  </label>
                ))}
              </div>
            </div>
          )}
          <DialogFooter><Button type="submit">Add Module</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ModuleDetail({
  module, editable, programModules, onSave, onFieldBlur,
}: {
  module: Module;
  editable: boolean;
  programModules: Module[];
  onSave: (patch: Partial<Module>) => void;
  onFieldBlur: (patch: Partial<Module>) => void;
}) {
  const [ab, setAb] = useState(module.assessmentBreakdown);
  const [prereqs, setPrereqs] = useState<string[]>(module.prerequisiteModuleIds);
  const total = ab.assignments + ab.quizzes + ab.finalExam;
  const valid = total === 100;
  const otherModules = programModules.filter((m) => m.id !== module.id);
  const toggle = (id: string) => setPrereqs((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  return (
    <div className="space-y-3">
      <p className="font-medium">{module.code} — {module.name}</p>
      <div className="space-y-1.5"><Label className="text-xs">Credit Value</Label>
        <Input type="number" defaultValue={module.creditValue} disabled={!editable} onBlur={(e) => onFieldBlur({ creditValue: Number(e.target.value) })} />
      </div>
      <div className="space-y-1.5"><Label className="text-xs">Learning Outcomes</Label>
        <Textarea defaultValue={module.learningOutcomes} disabled={!editable} onBlur={(e) => onFieldBlur({ learningOutcomes: e.target.value })} />
      </div>
      <p className="text-xs font-medium">Assessment Breakdown</p>
      <div className="grid grid-cols-3 gap-2">
        {([["assignments", "Assignments"], ["quizzes", "Quizzes"], ["finalExam", "Final Exam"]] as const).map(([k, label]) => (
          <div key={k} className="space-y-1">
            <Label className="text-[10px]">{label}</Label>
            <Input type="number" value={ab[k]} disabled={!editable} onChange={(e) => setAb((prev) => ({ ...prev, [k]: Number(e.target.value) }))} />
          </div>
        ))}
      </div>
      <p className={`text-xs ${valid ? "text-muted-foreground" : "text-red-600"}`}>Total: {total}% {!valid && "— must equal 100%"}</p>

      {otherModules.length > 0 && (
        <div className="space-y-1.5">
          <Label className="text-xs">Prerequisites</Label>
          <div className="rounded-md border p-2 space-y-1.5 max-h-32 overflow-y-auto">
            {otherModules.map((m) => (
              <label key={m.id} className="flex items-center gap-2 text-sm">
                <Checkbox checked={prereqs.includes(m.id)} disabled={!editable} onCheckedChange={() => toggle(m.id)} />
                {m.code} — {m.name}
              </label>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">Enforced for cross-enrollment eligibility.</p>
        </div>
      )}

      {editable && <Button size="sm" disabled={!valid} onClick={() => onSave({ assessmentBreakdown: ab, prerequisiteModuleIds: prereqs })}>Save Module</Button>}
    </div>
  );
}
