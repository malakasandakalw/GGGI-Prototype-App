"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Copy, FileText } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store/provider";
import { formatDate, formatDateTime } from "@/lib/utils/date";
import type { ApplicationStatus } from "@/lib/types";

const NEXT_STATUSES: ApplicationStatus[] = ["under-review", "payment-pending", "payment-confirmed", "enrolled", "rejected", "waitlisted"];

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { applications, programs, intakes, updateApplication, addUser, addNotification } = useStore();
  const app = applications.find((a) => a.id === id);

  const [status, setStatus] = useState<ApplicationStatus | "">("");
  const [notes, setNotes] = useState(app?.registrarNotes ?? "");
  const [payRef, setPayRef] = useState(app?.paymentReference ?? "");
  const [createOpen, setCreateOpen] = useState(false);
  const [intakeId, setIntakeId] = useState("");

  if (!app) return <div className="p-8">Application not found.</div>;
  const program = programs.find((p) => p.id === app.programId);
  const programIntakes = intakes.filter((i) => i.programId === app.programId);

  function applyStatus() {
    if (!status) return;
    updateApplication(app!.id, { status, paymentReference: payRef || app!.paymentReference, paymentConfirmedAt: status === "payment-confirmed" ? new Date().toISOString() : app!.paymentConfirmedAt });
    addNotification({ recipientId: "u-reg", title: "Application updated", body: `${app!.applicantName} → ${status}`, type: "application" });
    toast.success(`Status updated to ${status.replace("-", " ")}`);
    setStatus("");
  }

  function createStudent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const u = addUser({
      name: String(fd.get("name")),
      email: app!.email,
      role: "cohort-student",
      studentId: String(fd.get("studentId")),
      programId: app!.programId,
      intakeId,
      currentSemesterId: program?.semesters[0]?.id,
    });
    updateApplication(app!.id, { status: "enrolled" });
    addNotification({ recipientId: u.id, title: "Welcome to the University", body: "Your student account has been created.", type: "system" });
    setCreateOpen(false);
    toast.success("Student account created. Welcome email sent (simulated).");
  }

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-2" onClick={() => router.push("/registrar/applications")}>
        <ArrowLeft className="size-4" /> Back to applications
      </Button>
      <PageHeader title={app.applicantName} description={`${app.referenceNumber} · ${program?.name}`} />

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Application Details</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <Section title="Personal Information">
              <Detail label="Full Name" value={app.applicantName} />
              <Detail label="NIC" value={app.nic} />
              <Detail label="Date of Birth" value={app.dateOfBirth} />
              <Detail label="Gender" value={app.gender} />
              <Detail label="Email" value={app.email} />
              <Detail label="Phone" value={app.phone} />
              <Detail label="Address" value={app.address} full />
            </Section>
            <Section title="Academic Qualifications">
              <Detail label="Qualifications" value={app.qualifications} full />
            </Section>
            <div>
              <p className="text-sm font-medium mb-2">Submitted Documents</p>
              <div className="space-y-1.5">
                {app.documents.map((d) => (
                  <button key={d} onClick={() => toast.info("Download simulated")} className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <FileText className="size-4" /> {d}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground italic">
              I declare that the information provided is true and accurate to the best of my knowledge.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Status</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current</span>
                <StatusBadge status={app.status} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Update Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as ApplicationStatus)}>
                  <SelectTrigger><SelectValue placeholder="Select next status" /></SelectTrigger>
                  <SelectContent>{NEXT_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace("-", " ")}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {status === "payment-pending" && (
                <Alert><AlertDescription className="text-xs">Please contact the applicant externally to arrange payment.</AlertDescription></Alert>
              )}
              {(status === "payment-pending" || status === "payment-confirmed" || ["payment-pending", "payment-confirmed", "enrolled"].includes(app.status)) && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Payment Reference</Label>
                  <Input value={payRef} onChange={(e) => setPayRef(e.target.value)} placeholder="e.g. BT-558831" />
                </div>
              )}
              <Button className="w-full" disabled={!status} onClick={applyStatus}>Update Status</Button>
              {app.status === "payment-confirmed" && (
                <Button variant="outline" className="w-full" onClick={() => setCreateOpen(true)}>Create Student Account</Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Status History</CardTitle></CardHeader>
            <CardContent>
              <ol className="relative border-l ml-2 space-y-4">
                {app.history.map((h, i) => (
                  <li key={i} className="ml-4">
                    <div className="absolute -left-1.5 size-3 rounded-full bg-primary" />
                    <StatusBadge status={h.status} />
                    <p className="text-xs text-muted-foreground mt-1">{formatDateTime(h.date)}{h.note ? ` — ${h.note}` : ""}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Registrar Notes</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Log communication, dates contacted, payment discussions..." />
              <Button size="sm" variant="outline" onClick={() => { updateApplication(app.id, { registrarNotes: notes }); toast.success("Notes saved"); }}>Save Notes</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Student Account & Enroll</DialogTitle></DialogHeader>
          <form onSubmit={createStudent} className="space-y-4">
            <div className="space-y-1.5"><Label className="text-xs">Student ID</Label><Input name="studentId" defaultValue={`CS2026${app.referenceNumber.replace(/\D/g, "").slice(-3)}`} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Full Name</Label><Input name="name" defaultValue={app.applicantName} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Email</Label><Input defaultValue={app.email} readOnly /></div>
            <div className="space-y-1.5"><Label className="text-xs">Program</Label><Input defaultValue={program?.name} readOnly /></div>
            <div className="space-y-1.5"><Label className="text-xs">Intake</Label>
              <Select value={intakeId} onValueChange={setIntakeId}>
                <SelectTrigger><SelectValue placeholder="Select intake" /></SelectTrigger>
                <SelectContent>{programIntakes.map((i) => <SelectItem key={i.id} value={i.id}>{i.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Temporary Password</Label>
              <div className="flex gap-2">
                <Input readOnly value="Welcome@2026" className="font-mono" />
                <Button type="button" variant="outline" size="icon" onClick={() => toast.success("Copied")}><Copy className="size-4" /></Button>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!intakeId}>Create Account &amp; Enroll</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-medium mb-2">{title}</p>
      <div className="grid sm:grid-cols-2 gap-3">{children}</div>
    </div>
  );
}
function Detail({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm">{value || "—"}</p>
    </div>
  );
}
