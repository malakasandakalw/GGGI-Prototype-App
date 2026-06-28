"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store/provider";
import { formatDate } from "@/lib/utils/date";
import type { Module } from "@/lib/types";

export default function OLCrossEnrollment() {
  const { currentUser, modules, programs, users, crossEnrollments, addCrossEnrollment } = useStore();
  const available = modules.filter((m) => m.isCrossStreamEnabled && m.status === "active");
  const myRequests = crossEnrollments.filter((c) => c.studentId === currentUser?.id && c.type === "ol-to-cohort");
  const [target, setTarget] = useState<Module | null>(null);
  const [reason, setReason] = useState("");
  const [search, setSearch] = useState("");

  const programName = (id: string) => programs.find((p) => p.id === id)?.name ?? "—";
  const lecturerName = (id: string) => users.find((u) => u.id === id)?.name ?? "—";
  const enrolled = (mid: string) => currentUser?.crossEnrolledModuleIds?.includes(mid);

  function submit() {
    if (!target) return;
    addCrossEnrollment({ studentId: currentUser!.id, studentName: currentUser!.name, type: "ol-to-cohort", targetModuleId: target.id, reason });
    toast.success("Request submitted.");
    setTarget(null); setReason("");
  }

  const filtered = available.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.code.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader title="Cohort Modules" description="Request access to specific Cohort modules." />

      <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search modules..." className="max-w-xs mb-4" />
      <h3 className="font-semibold mb-3">Available Cohort Modules</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {filtered.map((m) => (
          <Card key={m.id}><CardContent className="pt-6 space-y-2">
            <div><p className="font-medium">{m.name}</p><p className="text-xs text-muted-foreground">{m.code} · {programName(m.programId)}</p></div>
            <p className="text-xs text-muted-foreground">Lecturer: {lecturerName(m.primaryLecturerId)} · {m.creditValue} credits</p>
            <div className="flex items-center justify-between"><Badge variant="secondary">Paid</Badge>
              {enrolled(m.id) ? <Button size="sm" variant="outline" disabled>Enrolled</Button> : <Button size="sm" onClick={() => setTarget(m)}>Request Access</Button>}
            </div>
          </CardContent></Card>
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground">No modules available.</p>}
      </div>

      <h3 className="font-semibold mb-3">My Requests</h3>
      <Card className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Module</TableHead><TableHead>Requested</TableHead><TableHead>Status</TableHead><TableHead>Notes</TableHead></TableRow></TableHeader>
          <TableBody>
            {myRequests.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{modules.find((m) => m.id === r.targetModuleId)?.name}</TableCell>
                <TableCell>{formatDate(r.requestedAt)}</TableCell>
                <TableCell><StatusBadge status={r.status} /></TableCell>
                <TableCell className="text-muted-foreground text-sm">{r.registrarNotes ?? "—"}</TableCell>
              </TableRow>
            ))}
            {myRequests.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">No requests yet</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request Access</DialogTitle></DialogHeader>
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
