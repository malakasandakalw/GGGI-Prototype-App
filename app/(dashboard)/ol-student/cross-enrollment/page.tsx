"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Award } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store/provider";
import { formatDate } from "@/lib/utils/date";
import { moduleProgress } from "@/lib/utils/progress";
import type { Module } from "@/lib/types";

export default function OLCrossEnrollment() {
  const { currentUser, modules, programs, users, lectures, assignments, quizzes, submissions, quizSubmissions, crossEnrollments, addCrossEnrollment } = useStore();
  const available = modules.filter((m) => m.isCrossStreamEnabled && m.status === "active");
  const myRequests = crossEnrollments.filter((c) => c.studentId === currentUser?.id && c.type === "ol-to-cohort");
  const enrolledModules = modules.filter((m) => currentUser?.crossEnrolledModuleIds?.includes(m.id));
  const [target, setTarget] = useState<Module | null>(null);
  const [reason, setReason] = useState("");
  const [search, setSearch] = useState("");
  const [requested, setRequested] = useState<string | null>(null);
  const [certModule, setCertModule] = useState<Module | null>(null);

  const programName = (id: string) => programs.find((p) => p.id === id)?.name ?? "—";
  const lecturerName = (id: string) => users.find((u) => u.id === id)?.name ?? "—";
  const enrolled = (mid: string) => currentUser?.crossEnrolledModuleIds?.includes(mid);
  const progressOf = (mid: string) => moduleProgress(mid, currentUser?.id ?? "", {
    lectures, assignments, quizzes, completedLectureIds: currentUser?.completedLectureIds ?? [], submissions, quizSubmissions,
  });

  function submit() {
    if (!target) return;
    addCrossEnrollment({ studentId: currentUser!.id, studentName: currentUser!.name, type: "ol-to-cohort", targetModuleId: target.id, reason });
    toast.success("Request submitted.");
    setRequested(target.name);
    setTarget(null); setReason("");
  }

  const filtered = available.filter((m) => !enrolled(m.id) && (m.name.toLowerCase().includes(search.toLowerCase()) || m.code.toLowerCase().includes(search.toLowerCase())));

  return (
    <div>
      <PageHeader title="Cohort Modules" description="Request access to individual Cohort modules and study them alongside your OL courses." />

      {enrolledModules.length > 0 && (
        <>
          <h3 className="font-semibold mb-3">My Cross-Enrolled Modules</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {enrolledModules.map((m) => {
              const prog = progressOf(m.id);
              const complete = prog.percent >= 100;
              return (
                <Card key={m.id}><CardContent className="pt-6 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div><p className="font-medium">{m.name}</p><p className="text-xs text-muted-foreground">{m.code} · {programName(m.programId)}</p></div>
                    {complete && <Badge className="bg-emerald-100 text-emerald-800">Complete</Badge>}
                  </div>
                  <Progress value={prog.percent} />
                  <p className="text-xs text-muted-foreground">{prog.percent}% · {prog.lectures.done}/{prog.lectures.total} lectures</p>
                  <div className="flex gap-2">
                    <Button asChild size="sm" className="flex-1"><Link href={`/cohort-student/modules/${m.id}`}>Open Module</Link></Button>
                    {complete && <Button size="sm" variant="outline" onClick={() => setCertModule(m)}><Award className="size-4" /></Button>}
                  </div>
                </CardContent></Card>
              );
            })}
          </div>
        </>
      )}

      <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search modules..." className="max-w-xs mb-4" />
      <h3 className="font-semibold mb-3">Available Cohort Modules</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {filtered.map((m) => (
          <Card key={m.id}><CardContent className="pt-6 space-y-2">
            <div><p className="font-medium">{m.name}</p><p className="text-xs text-muted-foreground">{m.code} · {programName(m.programId)}</p></div>
            <p className="text-xs text-muted-foreground">Lecturer: {lecturerName(m.primaryLecturerId)} · {m.creditValue} credits</p>
            <div className="flex items-center justify-between"><Badge variant="secondary">Paid</Badge>
              <Button size="sm" onClick={() => setTarget(m)}>Request Access</Button>
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

      <InfoDialog
        open={!!requested}
        onOpenChange={(o) => !o && setRequested(null)}
        title="Request sent to the Registrar"
        description={<>Your request for <strong>{requested}</strong> was sent to the <strong>Registrar</strong>. After they confirm payment and approve, you&apos;ll get access to <strong>this module only</strong> — its lectures, assignments and quizzes — and the module&apos;s <strong>Lecturer</strong> is notified. You do not join the full program.</>}
      />

      <InfoDialog
        open={!!certModule}
        onOpenChange={(o) => !o && setCertModule(null)}
        title="Module completed"
        description={<>You completed <strong>{certModule?.name}</strong>. A <strong>module-level certificate</strong> has been issued with a unique ID and verification URL — download it below (simulated).</>}
        actionLabel="Download Certificate (Mock)"
      />
    </div>
  );
}
