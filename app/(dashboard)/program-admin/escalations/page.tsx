"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils/date";

interface Escalation {
  id: string;
  title: string;
  raisedBy: string;
  against: string;
  program: string;
  detail: string;
  raisedAt: string;
  status: "open" | "resolved";
  resolution?: string;
}

const seed: Escalation[] = [
  {
    id: "esc-1",
    title: "Disagreement over lecture publishing timeline",
    raisedBy: "Dr. Nimal Perera (HOD, Computing)",
    against: "Mr. Kasun Silva (Lecturer)",
    program: "BSc (Hons) Computer Science",
    detail: "The HOD reports repeated delays in publishing lecture content, leaving students without materials on time.",
    raisedAt: "2026-06-24",
    status: "open",
  },
  {
    id: "esc-2",
    title: "Assessment weighting dispute for CS201",
    raisedBy: "Ms. Ayesha Fernando (Lecturer)",
    against: "Dr. Nimal Perera (HOD, Computing)",
    program: "BSc (Hons) Computer Science",
    detail: "Lecturer requests review of the assignment/quiz split imposed for the module against the approved breakdown.",
    raisedAt: "2026-06-19",
    status: "open",
  },
  {
    id: "esc-3",
    title: "Shared module ownership clarification",
    raisedBy: "Dr. Ruwan Jayasuriya (HOD, Business)",
    against: "Mr. Kasun Silva (Lecturer)",
    program: "Diploma in Business Management",
    detail: "Question over who is responsible for grading a cross-stream shared module.",
    raisedAt: "2026-06-10",
    status: "resolved",
    resolution: "Confirmed the primary lecturer owns grading; secondary lecturer supports content only.",
  },
];

export default function ProgramAdminEscalations() {
  const [items, setItems] = useState<Escalation[]>(seed);
  const [resolve, setResolve] = useState<Escalation | null>(null);
  const [note, setNote] = useState("");
  const [resolvedInfo, setResolvedInfo] = useState(false);

  const open = items.filter((i) => i.status === "open");
  const resolved = items.filter((i) => i.status === "resolved");

  function submitResolution() {
    if (!resolve) return;
    setItems((prev) => prev.map((i) => (i.id === resolve.id ? { ...i, status: "resolved", resolution: note } : i)));
    toast.success("Escalation resolved");
    setResolve(null); setNote("");
    setResolvedInfo(true);
  }

  const Item = ({ e }: { e: Escalation }) => (
    <Card>
      <CardContent className="pt-6 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <p className="font-medium">{e.title}</p>
          <Badge variant={e.status === "open" ? "destructive" : "secondary"} className="capitalize shrink-0">{e.status}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">{e.program} · raised {formatDate(e.raisedAt)}</p>
        <p className="text-sm"><span className="text-muted-foreground">Raised by</span> {e.raisedBy} <span className="text-muted-foreground">against</span> {e.against}</p>
        <p className="text-sm text-muted-foreground">{e.detail}</p>
        {e.resolution && <p className="text-sm rounded bg-muted p-2"><span className="font-medium">Resolution: </span>{e.resolution}</p>}
        {e.status === "open" && (
          <Button size="sm" onClick={() => { setResolve(e); setNote(""); }}><CheckCircle2 className="size-4" /> Resolve</Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div>
      <PageHeader title="Escalations" description="Resolve issues escalated between HODs and Lecturers within your programs." />

      <h3 className="font-semibold mb-3 flex items-center gap-2"><MessageSquare className="size-4" /> Open ({open.length})</h3>
      <div className="grid gap-4 lg:grid-cols-2">
        {open.map((e) => <Item key={e.id} e={e} />)}
        {open.length === 0 && <p className="text-sm text-muted-foreground">No open escalations.</p>}
      </div>

      {resolved.length > 0 && (
        <>
          <h3 className="font-semibold mt-8 mb-3">Resolved ({resolved.length})</h3>
          <div className="grid gap-4 lg:grid-cols-2">
            {resolved.map((e) => <Item key={e.id} e={e} />)}
          </div>
        </>
      )}

      <Dialog open={!!resolve} onOpenChange={(o) => !o && setResolve(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Resolve Escalation</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground -mt-2">{resolve?.title}</p>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Describe the resolution and the decision..." rows={4} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setResolve(null)}>Cancel</Button>
            <Button disabled={!note.trim()} onClick={submitResolution}>Mark Resolved</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <InfoDialog
        open={resolvedInfo}
        onOpenChange={setResolvedInfo}
        title="Escalation resolved"
        description={<>The escalation is closed and both the <strong>HOD</strong> and <strong>Lecturer</strong> are notified of your decision (simulated). Your resolution is recorded for reference.</>}
      />
    </div>
  );
}
