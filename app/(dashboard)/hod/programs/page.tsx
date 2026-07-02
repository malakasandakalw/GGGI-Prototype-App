"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store/provider";
import type { Program, ProgramLevel } from "@/lib/types";

export default function HODPrograms() {
  const router = useRouter();
  const { currentUser, programs, addProgram, addAudit } = useStore();
  const myPrograms = programs.filter((p) => currentUser?.programIds?.includes(p.id) || p.hodId === currentUser?.id);
  const [open, setOpen] = useState(false);
  const [level, setLevel] = useState<ProgramLevel>("degree");
  const [duration, setDuration] = useState("3");
  const [intake, setIntake] = useState<Program | null>(null);
  const [intakeOpened, setIntakeOpened] = useState<string | null>(null);

  function openIntake(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!intake) return;
    const fd = new FormData(e.currentTarget);
    const label = String(fd.get("label"));
    addAudit({ action: "Program Activated", details: `Opened intake "${label}" for ${intake.name}` });
    toast.success("Application intake opened");
    setIntakeOpened(`${intake.name} · ${label}`);
    setIntake(null);
  }

  function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const p = addProgram({
      name: String(fd.get("name")),
      code: String(fd.get("code")),
      description: String(fd.get("description")),
      level,
      durationYears: Number(duration),
      totalCredits: Number(fd.get("credits")),
      entryRequirements: String(fd.get("entry")),
      department: currentUser?.department ?? "",
      hodId: currentUser?.id ?? "",
    });
    setOpen(false);
    toast.success("Program created as draft");
    router.push(`/hod/programs/${p.id}`);
  }

  return (
    <div>
      <PageHeader title="My Programs" description="Create and manage academic program structures." action={{ label: "Create Program", icon: Plus, onClick: () => setOpen(true) }} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {myPrograms.map((p) => (
          <Card key={p.id}>
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-xs text-muted-foreground uppercase">{p.level} · {p.code}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>{p.semesters.length} semesters</span>
                <span>{p.totalCredits} credits</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => router.push(`/hod/programs/${p.id}`)}>Manage</Button>
                {p.status === "active" && <Button size="sm" className="flex-1" onClick={() => setIntake(p)}>Open Intake</Button>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!intake} onOpenChange={(o) => !o && setIntake(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Open Application Intake — {intake?.name}</DialogTitle></DialogHeader>
          <form onSubmit={openIntake} className="space-y-3">
            <div className="space-y-1.5"><Label className="text-xs">Intake Label</Label><Input name="label" placeholder="2026 Intake" required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Applications Open</Label><Input name="open" type="date" required /></div>
              <div className="space-y-1.5"><Label className="text-xs">Applications Close</Label><Input name="close" type="date" required /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Capacity</Label><Input name="capacity" type="number" defaultValue={60} /></div>
            <DialogFooter><Button type="button" variant="ghost" onClick={() => setIntake(null)}>Cancel</Button><Button type="submit">Open Intake</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <InfoDialog
        open={!!intakeOpened}
        onOpenChange={(o) => !o && setIntakeOpened(null)}
        title="Intake opened"
        description={<>Intake <strong>{intakeOpened}</strong> is now open. It appears on the public application portal for prospective students, and the <strong>Program Admin / Registrar</strong> will process incoming applications.</>}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create Program</DialogTitle></DialogHeader>
          <form onSubmit={create} className="space-y-4">
            <div className="space-y-1.5"><Label className="text-xs">Program Name</Label><Input name="name" required /></div>
            <div className="space-y-1.5"><Label className="text-xs">Program Code</Label><Input name="code" required /></div>
            <div className="space-y-1.5"><Label className="text-xs">Description</Label><Textarea name="description" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Level</Label>
                <Select value={level} onValueChange={(v) => setLevel(v as ProgramLevel)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["certificate", "diploma", "hnd", "degree", "postgraduate"].map((l) => <SelectItem key={l} value={l} className="capitalize">{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Duration</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["1", "2", "3", "4"].map((d) => <SelectItem key={d} value={d}>{d} year{d !== "1" && "s"}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Total Credits</Label><Input name="credits" type="number" defaultValue={360} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Department</Label><Input value={currentUser?.department} readOnly /></div>
            <div className="space-y-1.5"><Label className="text-xs">Entry Requirements</Label><Textarea name="entry" /></div>
            <DialogFooter><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Create Program</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
