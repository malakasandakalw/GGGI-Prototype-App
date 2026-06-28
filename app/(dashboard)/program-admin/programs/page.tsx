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
import { useStore } from "@/lib/store/provider";
import type { Program } from "@/lib/types";

export default function ProgramAdminPrograms() {
  const { currentUser, programs, modules, users, updateProgram, addNotification } = useStore();
  const myPrograms = programs.filter((p) => currentUser?.programIds?.includes(p.id));
  const pending = myPrograms.filter((p) => p.status === "submitted");
  const [review, setReview] = useState<Program | null>(null);
  const [feedback, setFeedback] = useState("");
  const [showReturn, setShowReturn] = useState(false);

  const hodName = (id: string) => users.find((u) => u.id === id)?.name ?? "—";

  function approve(p: Program) {
    updateProgram(p.id, { status: "approved" });
    addNotification({ recipientId: p.hodId, title: "Program approved", body: `${p.name} was approved and sent for Super Admin activation.`, type: "system" });
    toast.success("Program approved and sent for Super Admin activation");
    setReview(null);
  }
  function returnToHod(p: Program) {
    updateProgram(p.id, { status: "draft", hodComments: feedback });
    addNotification({ recipientId: p.hodId, title: "Program returned", body: `${p.name} was returned with feedback.`, type: "system" });
    toast.success("Returned to HOD with feedback");
    setReview(null); setFeedback(""); setShowReturn(false);
  }

  const Row = ({ p }: { p: Program }) => (
    <TableRow>
      <TableCell className="font-medium">{p.name}</TableCell>
      <TableCell>{p.department}</TableCell>
      <TableCell>{hodName(p.hodId)}</TableCell>
      <TableCell className="uppercase text-xs">{p.level}</TableCell>
      <TableCell><StatusBadge status={p.status} /></TableCell>
      <TableCell className="text-right">
        <Button size="sm" variant={p.status === "submitted" ? "default" : "outline"} onClick={() => { setReview(p); setShowReturn(false); }}>
          {p.status === "submitted" ? "Review" : "View"}
        </Button>
      </TableCell>
    </TableRow>
  );

  return (
    <div>
      <PageHeader title="Programs" description="Review programs submitted by HODs and manage their lifecycle." />
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
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return <div className="bg-muted rounded-lg p-2"><p className="text-[11px] text-muted-foreground">{label}</p><p className="font-medium capitalize">{value}</p></div>;
}
