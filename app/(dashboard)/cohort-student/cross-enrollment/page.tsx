"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store/provider";
import { formatDate } from "@/lib/utils/date";
import type { Module } from "@/lib/types";

export default function CohortCrossEnrollment() {
  const { currentUser, modules, programs, users, moduleGrades, crossEnrollments, addCrossEnrollment } = useStore();
  const available = modules.filter((m) => m.isCrossStreamEnabled && m.programId !== currentUser?.programId && m.status === "active");
  const myRequests = crossEnrollments.filter((c) => c.studentId === currentUser?.id);
  const [target, setTarget] = useState<Module | null>(null);
  const [reason, setReason] = useState("");
  const [info, setInfo] = useState(false);

  const programName = (id: string) => programs.find((p) => p.id === id)?.name ?? "—";
  const lecturerName = (id: string) => users.find((u) => u.id === id)?.name ?? "—";

  // Prerequisite check (SRS §5.12.1): a prereq is met if the student has a published passing grade for it.
  const prereqStatus = (m: Module) =>
    m.prerequisiteModuleIds.map((pid) => {
      const g = moduleGrades.find((x) => x.studentId === currentUser?.id && x.moduleId === pid && x.published);
      return { module: modules.find((x) => x.id === pid), met: !!g && g.gradePoint > 0 };
    });
  const unmet = target ? prereqStatus(target).filter((p) => !p.met) : [];

  function submit() {
    if (!target) return;
    addCrossEnrollment({ studentId: currentUser!.id, studentName: currentUser!.name, type: "cohort-to-cohort", targetModuleId: target.id, reason });
    toast.success("Enrollment request submitted. The Registrar will contact you.");
    setTarget(null); setReason("");
    setInfo(true);
  }

  return (
    <div>
      <PageHeader title="Cross-Enrollment" description="Enroll in modules from other Cohort programs." />

      <h3 className="font-semibold mb-3">Available Modules</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {available.map((m) => (
          <Card key={m.id}><CardContent className="pt-6 space-y-2">
            <div><p className="font-medium">{m.name}</p><p className="text-xs text-muted-foreground">{m.code} · {programName(m.programId)}</p></div>
            <p className="text-xs text-muted-foreground">Lecturer: {lecturerName(m.primaryLecturerId)} · {m.creditValue} credits</p>
            {m.prerequisiteModuleIds.length > 0 && <p className="text-xs text-muted-foreground">Prerequisites: {m.prerequisiteModuleIds.map((pid) => modules.find((x) => x.id === pid)?.code ?? pid).join(", ")}</p>}
            <Button size="sm" className="w-full" onClick={() => setTarget(m)}>Enroll</Button>
          </CardContent></Card>
        ))}
        {available.length === 0 && <p className="text-sm text-muted-foreground">No cross-stream modules available.</p>}
      </div>

      <h3 className="font-semibold mb-3">My Requests</h3>
      <Card className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Module</TableHead><TableHead>Requested</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {myRequests.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.targetModuleId ? modules.find((m) => m.id === r.targetModuleId)?.name : "—"}</TableCell>
                <TableCell>{formatDate(r.requestedAt)}</TableCell>
                <TableCell><StatusBadge status={r.status} /></TableCell>
              </TableRow>
            ))}
            {myRequests.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-6">No requests yet</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request Enrollment</DialogTitle></DialogHeader>
          {target && (
            <div className="space-y-3">
              <div className="bg-muted rounded-lg p-3 text-sm"><p className="font-medium">{target.name}</p><p className="text-xs text-muted-foreground">{target.code} · {programName(target.programId)}</p></div>
              {target.prerequisiteModuleIds.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Prerequisites</Label>
                  <div className="space-y-1">
                    {prereqStatus(target).map((p) => (
                      <p key={p.module?.id} className={`text-xs flex items-center gap-1 ${p.met ? "text-emerald-700" : "text-amber-700"}`}>
                        {p.met ? <CheckCircle2 className="size-3.5" /> : <AlertTriangle className="size-3.5" />}
                        {p.module?.code ?? "—"} — {p.met ? "Completed" : "Not yet completed"}
                      </p>
                    ))}
                  </div>
                  {unmet.length > 0 && <p className="text-xs text-amber-700">You haven&apos;t completed all prerequisites. You can still request — the Registrar and target Lecturer will review eligibility.</p>}
                </div>
              )}
              <div className="space-y-1.5"><Label className="text-xs">Reason for enrollment</Label><Textarea value={reason} onChange={(e) => setReason(e.target.value)} /></div>
            </div>
          )}
          <DialogFooter><Button variant="ghost" onClick={() => setTarget(null)}>Cancel</Button><Button onClick={submit}>Submit Request</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <InfoDialog
        open={info}
        onOpenChange={setInfo}
        title="Request sent to the Registrar"
        description={<>The <strong>Registrar</strong> will contact you about payment and, once confirmed, approve access. The module then appears in your dashboard and its <strong>Lecturer</strong> is notified so they can include you.</>}
      />
    </div>
  );
}
