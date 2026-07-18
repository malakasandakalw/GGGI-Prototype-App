"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { ArchivedYearBanner } from "@/components/shared/ArchivedYearBanner";
import { useYearScope } from "@/hooks/use-year-scope";
import { useStore } from "@/lib/store/provider";
import { formatDate } from "@/lib/utils/date";
import type { Program } from "@/lib/types";

export default function ProgramAdminPrograms() {
  const { currentUser, programs, modules, users, intakes, activeAcademicYear, updateProgram, addIntake, addNotification } = useStore();
  const { activeYearEditable } = useYearScope();
  const myPrograms = programs.filter((p) => currentUser?.programIds?.includes(p.id));
  const pending = myPrograms.filter((p) => p.status === "submitted");
  const [review, setReview] = useState<Program | null>(null);
  const [feedback, setFeedback] = useState("");
  const [showReturn, setShowReturn] = useState(false);
  const [approvedInfo, setApprovedInfo] = useState<Program | null>(null);
  const [returnedInfo, setReturnedInfo] = useState<Program | null>(null);
  // Item E — open intake
  const [intakeFor, setIntakeFor] = useState<Program | null>(null);
  const [intakeInfo, setIntakeInfo] = useState<{ program: Program; open: string; close: string } | null>(null);
  const [inLabel, setInLabel] = useState("");
  const [inOpen, setInOpen] = useState("");
  const [inClose, setInClose] = useState("");
  const [inStart, setInStart] = useState("");
  const [inCap, setInCap] = useState("");

  const hodName = (id: string) => users.find((u) => u.id === id)?.name ?? "—";

  function approve(p: Program) {
    updateProgram(p.id, { status: "approved" });
    addNotification({ recipientId: p.hodId, title: "Program approved", body: `${p.name} was approved and sent for Super Admin activation.`, type: "system" });
    toast.success("Program approved and sent for Super Admin activation");
    setReview(null);
    setApprovedInfo(p);
  }
  function returnToHod(p: Program) {
    updateProgram(p.id, { status: "draft", hodComments: feedback });
    addNotification({ recipientId: p.hodId, title: "Program returned", body: `${p.name} was returned with feedback.`, type: "system" });
    toast.success("Returned to HOD with feedback");
    setReview(null); setFeedback(""); setShowReturn(false);
    setReturnedInfo(p);
  }
  function openIntakeFor(p: Program) {
    setIntakeFor(p);
    setInLabel(`${new Date().getFullYear() + 1} Intake`);
    setInOpen(""); setInClose(""); setInStart(""); setInCap("");
  }
  function saveIntake() {
    if (!intakeFor) return;
    addIntake({
      programId: intakeFor.id,
      label: inLabel,
      applicationOpenDate: inOpen,
      applicationCloseDate: inClose,
      academicStartDate: inStart,
      maxCapacity: inCap ? Number(inCap) : undefined,
      status: "open",
    });
    addNotification({ recipientId: "u-reg", title: "Intake opened", body: `${inLabel} for ${intakeFor.name} is now accepting applications.`, type: "application" });
    toast.success("Intake opened — now live on the application portal");
    setIntakeInfo({ program: intakeFor, open: inOpen, close: inClose });
    setIntakeFor(null);
  }

  const Row = ({ p }: { p: Program }) => (
    <TableRow>
      <TableCell className="font-medium">{p.name}</TableCell>
      <TableCell>{p.department}</TableCell>
      <TableCell>{hodName(p.hodId)}</TableCell>
      <TableCell className="uppercase text-xs">{p.level}</TableCell>
      <TableCell><StatusBadge status={p.status} /></TableCell>
      <TableCell className="text-right space-x-2">
        {p.status === "active" && (
          <Button size="sm" variant="outline" disabled={!activeYearEditable} onClick={() => openIntakeFor(p)}>Open Intake</Button>
        )}
        <Button size="sm" variant={p.status === "submitted" ? "default" : "outline"} onClick={() => { setReview(p); setShowReturn(false); }}>
          {p.status === "submitted" ? "Review" : "View"}
        </Button>
      </TableCell>
    </TableRow>
  );

  return (
    <div>
      <PageHeader title="Programs" description="Review programs submitted by HODs and manage their lifecycle." />
      <ArchivedYearBanner />
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Programs</TabsTrigger>
          <TabsTrigger value="pending">Pending Review {pending.length > 0 && `(${pending.length})`}</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Card className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Program</TableHead><TableHead>Department</TableHead><TableHead>HOD</TableHead><TableHead>Level</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>{myPrograms.map((p) => <Row key={p.id} p={p} />)}</TableBody>
            </Table>
          </Card>
        </TabsContent>
        <TabsContent value="pending">
          {pending.length > 0 && (
            <Alert className="mb-4 bg-amber-50 border-amber-200">
              <AlertTitle>You have {pending.length} program(s) awaiting your review.</AlertTitle>
              <AlertDescription>Review and approve or return each submitted program.</AlertDescription>
            </Alert>
          )}
          <Card className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Program</TableHead><TableHead>Department</TableHead><TableHead>HOD</TableHead><TableHead>Level</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>{pending.map((p) => <Row key={p.id} p={p} />)}</TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      <Sheet open={!!review} onOpenChange={(o) => !o && setReview(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          {review && (
            <>
              <SheetHeader>
                <SheetTitle>{review.name}</SheetTitle>
                <SheetDescription>{review.code} · {review.department} · {hodName(review.hodId)}</SheetDescription>
              </SheetHeader>
              <div className="px-4 pb-6 space-y-4">
                <p className="text-sm text-muted-foreground">{review.description}</p>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <Info label="Level" value={review.level} />
                  <Info label="Duration" value={`${review.durationYears} yr`} />
                  <Info label="Credits" value={review.totalCredits} />
                </div>
                <Accordion type="single" collapsible>
                  {review.semesters.map((s) => (
                    <AccordionItem key={s.id} value={s.id}>
                      <AccordionTrigger className="text-sm">{s.name}</AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-1 text-sm">
                          {s.moduleIds.map((mid) => {
                            const m = modules.find((x) => x.id === mid);
                            return m ? <li key={mid} className="flex justify-between"><span>{m.code} — {m.name}</span><span className="text-muted-foreground">{m.creditValue} cr</span></li> : null;
                          })}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                {review.hodComments && (
                  <div>
                    <p className="text-sm font-medium mb-1">HOD Comments</p>
                    <p className="text-sm text-muted-foreground bg-muted rounded p-3">{review.hodComments}</p>
                  </div>
                )}
                {review.status === "active" && (
                  <div className="pt-2 border-t space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Application Intakes</p>
                      <Button size="sm" variant="outline" disabled={!activeYearEditable} onClick={() => openIntakeFor(review)}>Open Intake</Button>
                    </div>
                    {intakes.filter((i) => i.programId === review.id).map((i) => (
                      <div key={i.id} className="flex items-center justify-between rounded border p-2 text-sm">
                        <span>{i.label} <span className="text-xs text-muted-foreground">· {formatDate(i.applicationOpenDate)}–{formatDate(i.applicationCloseDate)}</span></span>
                        <Badge variant="secondary" className="capitalize">{i.status}</Badge>
                      </div>
                    ))}
                    {intakes.filter((i) => i.programId === review.id).length === 0 && <p className="text-xs text-muted-foreground">No intakes yet.</p>}
                  </div>
                )}
                {review.status === "submitted" && (
                  <div className="space-y-3 pt-2 border-t">
                    {showReturn && (
                      <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Feedback for the HOD..." />
                    )}
                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={() => approve(review)}>Approve Program</Button>
                      {!showReturn ? (
                        <Button variant="outline" className="flex-1" onClick={() => setShowReturn(true)}>Return to HOD</Button>
                      ) : (
                        <Button variant="outline" className="flex-1" disabled={!feedback.trim()} onClick={() => returnToHod(review)}>Send Return</Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Item E — Open Intake dialog */}
      <Dialog open={!!intakeFor} onOpenChange={(o) => !o && setIntakeFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Open Application Intake</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground -mt-2">{intakeFor?.name}</p>
          <div className="space-y-4">
            <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">Academic Year: <span className="font-medium text-foreground">{activeAcademicYear?.label}</span> — this intake and its applications belong to the active year.</div>
            <div className="space-y-1.5"><Label className="text-xs">Intake Label</Label><Input value={inLabel} onChange={(e) => setInLabel(e.target.value)} placeholder="e.g. 2027 Intake" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Applications Open</Label><Input type="date" value={inOpen} onChange={(e) => setInOpen(e.target.value)} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Applications Close</Label><Input type="date" value={inClose} onChange={(e) => setInClose(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Academic Start</Label><Input type="date" value={inStart} onChange={(e) => setInStart(e.target.value)} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Capacity</Label><Input type="number" value={inCap} onChange={(e) => setInCap(e.target.value)} placeholder="e.g. 120" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIntakeFor(null)}>Cancel</Button>
            <Button disabled={!inLabel || !inOpen || !inClose} onClick={saveIntake}>Open Intake</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <InfoDialog
        open={!!approvedInfo}
        onOpenChange={(o) => !o && setApprovedInfo(null)}
        title="Program approved & escalated"
        description={<><strong>{approvedInfo?.name}</strong> approved and escalated to the <strong>Super Admin</strong> for final activation. The HOD has been notified. Once the Super Admin activates it, an intake can be opened and it appears on the public portal.</>}
      />
      <InfoDialog
        open={!!returnedInfo}
        onOpenChange={(o) => !o && setReturnedInfo(null)}
        title="Returned to HOD"
        description={<><strong>{returnedInfo?.name}</strong> returned to the <strong>HOD</strong> with your comments. It moves back to <em>Draft</em> so the HOD can revise the structure and resubmit.</>}
      />
      <InfoDialog
        open={!!intakeInfo}
        onOpenChange={(o) => !o && setIntakeInfo(null)}
        title="Intake opened"
        description={<>Intake opened for <strong>{intakeInfo?.program.name}</strong> ({intakeInfo && formatDate(intakeInfo.open)}–{intakeInfo && formatDate(intakeInfo.close)}). The program now appears on the <strong>public application portal</strong>; submitted applications go to the <strong>Registrar</strong>.</>}
      />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return <div className="bg-muted rounded-lg p-2"><p className="text-[11px] text-muted-foreground">{label}</p><p className="font-medium capitalize">{value}</p></div>;
}
