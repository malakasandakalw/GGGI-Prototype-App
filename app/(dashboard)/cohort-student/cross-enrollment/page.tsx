"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
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
  const { currentUser, modules, programs, users, crossEnrollments, addCrossEnrollment } = useStore();
  const available = modules.filter((m) => m.isCrossStreamEnabled && m.programId !== currentUser?.programId && m.status === "active");
  const myRequests = crossEnrollments.filter((c) => c.studentId === currentUser?.id);
  const [target, setTarget] = useState<Module | null>(null);
  const [reason, setReason] = useState("");

  const programName = (id: string) => programs.find((p) => p.id === id)?.name ?? "—";
  const lecturerName = (id: string) => users.find((u) => u.id === id)?.name ?? "—";

  function submit() {
    if (!target) return;
    addCrossEnrollment({ studentId: currentUser!.id, studentName: currentUser!.name, type: "cohort-to-cohort", targetModuleId: target.id, reason });
    toast.success("Enrollment request submitted. The Registrar will contact you.");
    setTarget(null); setReason("");
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
              <div className="space-y-1.5"><Label className="text-xs">Reason for enrollment</Label><Textarea value={reason} onChange={(e) => setReason(e.target.value)} /></div>
            </div>
          )}
          <DialogFooter><Button variant="ghost" onClick={() => setTarget(null)}>Cancel</Button><Button onClick={submit}>Submit Request</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
