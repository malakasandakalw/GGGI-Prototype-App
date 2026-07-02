"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { useStore } from "@/lib/store/provider";
import { formatDate } from "@/lib/utils/date";
import type { CrossEnrollmentRequest } from "@/lib/types";

const typeLabel: Record<string, string> = {
  "cohort-to-cohort": "Cohort → Cohort",
  "ol-to-cohort": "OL → Cohort",
  "cohort-to-ol": "Cohort → OL",
};

export default function RegistrarCrossEnrollment() {
  const { crossEnrollments, modules, olCourses, updateCrossEnrollment, addNotification } = useStore();
  const [process, setProcess] = useState<CrossEnrollmentRequest | null>(null);
  const [payment, setPayment] = useState("pending");
  const [notes, setNotes] = useState("");
  const [approvedInfo, setApprovedInfo] = useState<string | null>(null);
  const [declinedInfo, setDeclinedInfo] = useState(false);

  const target = (c: CrossEnrollmentRequest) =>
    c.targetModuleId ? modules.find((m) => m.id === c.targetModuleId)?.name : olCourses.find((o) => o.id === c.targetCourseId)?.title;

  function approve() {
    if (!process) return;
    updateCrossEnrollment(process.id, { status: "approved", paymentStatus: payment as "pending" | "confirmed", registrarNotes: notes });
    if (process.targetModuleId) {
      const m = modules.find((x) => x.id === process.targetModuleId);
      if (m?.primaryLecturerId) addNotification({ recipientId: m.primaryLecturerId, title: "New cross-enrolled student", body: `${process.studentName} was granted access to ${m.name}.`, type: "enrollment" });
    }
    toast.success("Enrollment approved. Student and Lecturer notified (simulated).");
    setApprovedInfo(target(process) ?? "the module");
    setProcess(null); setNotes("");
  }
  function decline() {
    if (!process) return;
    updateCrossEnrollment(process.id, { status: "rejected", registrarNotes: notes });
    toast.error("Request declined. Student notified.");
    setDeclinedInfo(true);
    setProcess(null); setNotes("");
  }

  const renderTbl = (rows: CrossEnrollmentRequest[]) => (
    <Card className="p-0">
      <Table>
        <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Type</TableHead><TableHead>Target</TableHead><TableHead>Requested</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>
          {rows.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.studentName}</TableCell>
              <TableCell>{typeLabel[c.type]}</TableCell>
              <TableCell>{target(c)}</TableCell>
              <TableCell>{formatDate(c.requestedAt)}</TableCell>
              <TableCell><StatusBadge status={c.status} /></TableCell>
              <TableCell className="text-right">
                {c.status === "pending"
                  ? <Button size="sm" onClick={() => { setProcess(c); setPayment(c.paymentStatus ?? "pending"); setNotes(c.registrarNotes ?? ""); }}>Process</Button>
                  : <span className="text-xs text-muted-foreground">—</span>}
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No requests</TableCell></TableRow>}
        </TableBody>
      </Table>
    </Card>
  );

  return (
    <div>
      <PageHeader title="Cross-Enrollment Requests" description="Process cross-stream and cross-program requests." />
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="c2c">Cohort → Cohort</TabsTrigger>
          <TabsTrigger value="ol2c">OL → Cohort</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">{renderTbl(crossEnrollments.filter((c) => c.status === "pending"))}</TabsContent>
        <TabsContent value="c2c">{renderTbl(crossEnrollments.filter((c) => c.type === "cohort-to-cohort"))}</TabsContent>
        <TabsContent value="ol2c">{renderTbl(crossEnrollments.filter((c) => c.type === "ol-to-cohort"))}</TabsContent>
      </Tabs>

      <Dialog open={!!process} onOpenChange={(o) => !o && setProcess(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Process Request</DialogTitle></DialogHeader>
          {process && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-3 text-sm space-y-1">
                <p><span className="text-muted-foreground">Student:</span> {process.studentName}</p>
                <p><span className="text-muted-foreground">Type:</span> {typeLabel[process.type]}</p>
                <p><span className="text-muted-foreground">Target:</span> {target(process)}</p>
                <p className="text-muted-foreground italic mt-1">&quot;{process.reason}&quot;</p>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Payment Status</Label>
                <Select value={payment} onValueChange={setPayment}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="confirmed">Confirmed</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Payment Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={decline}>Decline Request</Button>
            <Button onClick={approve}>Approve Enrollment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <InfoDialog
        open={!!approvedInfo}
        onOpenChange={(o) => !o && setApprovedInfo(null)}
        title="Cross-enrollment approved"
        description={<>Enrollment approved. The student is granted access to <strong>{approvedInfo}</strong> only, the module&apos;s <strong>Lecturer has been notified</strong>, and the module now appears on the student&apos;s dashboard.</>}
      />
      <InfoDialog
        open={declinedInfo}
        onOpenChange={setDeclinedInfo}
        title="Request declined"
        description={<>Request declined. The student has been notified and can submit a new request if needed.</>}
      />
    </div>
  );
}
