"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Megaphone, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store/provider";
import { formatDate } from "@/lib/utils/date";
import type { Escalation } from "@/lib/types";

interface Option { id: string; name: string }

/**
 * Shared "Raise & track escalations" surface used by both HOD and Lecturer.
 * `candidates` = who this user can escalate against; `programs` = the programme it relates to.
 */
export function EscalationsPanel({
  description,
  candidateLabel,
  candidates,
  programs,
}: {
  description: string;
  candidateLabel: string;
  candidates: Option[];
  programs: Option[];
}) {
  const { currentUser, escalations, addEscalation } = useStore();
  const mine = escalations.filter(
    (e) => e.raisedById === currentUser?.id || e.againstId === currentUser?.id,
  );
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [againstId, setAgainstId] = useState("");
  const [programId, setProgramId] = useState(programs[0]?.id ?? "");
  const [detail, setDetail] = useState("");
  const [raisedInfo, setRaisedInfo] = useState(false);

  function submit() {
    const against = candidates.find((c) => c.id === againstId);
    const program = programs.find((p) => p.id === programId);
    if (!title.trim() || !against || !detail.trim()) return;
    addEscalation({
      title,
      againstId: against.id,
      againstName: against.name,
      programId: program?.id,
      program: program?.name ?? "",
      detail,
    });
    toast.success("Escalation raised — sent to the Program Admin");
    setOpen(false);
    setTitle(""); setAgainstId(""); setDetail(""); setProgramId(programs[0]?.id ?? "");
    setRaisedInfo(true);
  }

  const openItems = mine.filter((i) => i.status === "open");
  const resolved = mine.filter((i) => i.status === "resolved");

  const Item = ({ e }: { e: Escalation }) => (
    <Card>
      <CardContent className="pt-6 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <p className="font-medium">{e.title}</p>
          <Badge variant={e.status === "open" ? "destructive" : "secondary"} className="capitalize shrink-0">{e.status}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">{e.program || "—"} · raised {formatDate(e.raisedAt)}</p>
        <p className="text-sm">
          <span className="text-muted-foreground">{e.raisedById === currentUser?.id ? "You raised this against" : "Raised by"}</span>{" "}
          {e.raisedById === currentUser?.id ? e.againstName : `${e.raisedByName} (against you)`}
        </p>
        <p className="text-sm text-muted-foreground">{e.detail}</p>
        {e.resolution && <p className="text-sm rounded bg-muted p-2"><span className="font-medium">Program Admin resolution: </span>{e.resolution}</p>}
      </CardContent>
    </Card>
  );

  return (
    <div>
      <PageHeader
        title="Escalations"
        description={description}
        action={{ label: "Raise Escalation", icon: Plus, onClick: () => setOpen(true) }}
      />

      <h3 className="font-semibold mb-3 flex items-center gap-2"><Megaphone className="size-4" /> Open ({openItems.length})</h3>
      <div className="grid gap-4 lg:grid-cols-2">
        {openItems.map((e) => <Item key={e.id} e={e} />)}
        {openItems.length === 0 && (
          <EmptyState icon={Megaphone} title="No open escalations" description="Raise one to route a dispute to the Program Admin." />
        )}
      </div>

      {resolved.length > 0 && (
        <>
          <h3 className="font-semibold mt-8 mb-3">Resolved ({resolved.length})</h3>
          <div className="grid gap-4 lg:grid-cols-2">
            {resolved.map((e) => <Item key={e.id} e={e} />)}
          </div>
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Raise an Escalation</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label className="text-xs">Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short summary of the issue" /></div>
            <div className="space-y-1.5">
              <Label className="text-xs">{candidateLabel}</Label>
              <Select value={againstId} onValueChange={setAgainstId}>
                <SelectTrigger><SelectValue placeholder={`Select ${candidateLabel.toLowerCase()}`} /></SelectTrigger>
                <SelectContent>{candidates.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {programs.length > 1 && (
              <div className="space-y-1.5">
                <Label className="text-xs">Program</Label>
                <Select value={programId} onValueChange={setProgramId}>
                  <SelectTrigger><SelectValue placeholder="Select program" /></SelectTrigger>
                  <SelectContent>{programs.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5"><Label className="text-xs">Details</Label><Textarea value={detail} onChange={(e) => setDetail(e.target.value)} rows={4} placeholder="Describe the issue for the Program Admin..." /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={!title.trim() || !againstId || !detail.trim()} onClick={submit}>Raise Escalation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <InfoDialog
        open={raisedInfo}
        onOpenChange={setRaisedInfo}
        title="Escalation raised"
        description={<>Your escalation has been sent to the <strong>Program Admin</strong> and the other party has been notified (simulated). You&apos;ll be notified here once it&apos;s resolved.</>}
      />
    </div>
  );
}
