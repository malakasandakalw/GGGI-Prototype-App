"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MoreHorizontal, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/lib/store/provider";
import { formatDate } from "@/lib/utils/date";
import type { Clerk } from "@/lib/types";

export default function ClerksPage() {
  const { clerks, programs, addClerk, updateClerk } = useStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [programId, setProgramId] = useState("");
  const [deactivate, setDeactivate] = useState<Clerk | null>(null);
  const [createdInfo, setCreatedInfo] = useState<{ name: string; program: string } | null>(null);

  const programName = (id: string) => programs.find((p) => p.id === id)?.name ?? "—";
  // One active clerk per program — only offer programmes that don't already have one.
  const assignedProgramIds = new Set(clerks.filter((c) => c.status === "active").map((c) => c.programId));
  const availablePrograms = programs.filter((p) => !assignedProgramIds.has(p.id));

  function openCreate() {
    setName(""); setEmail(""); setProgramId(availablePrograms[0]?.id ?? "");
    setOpen(true);
  }

  function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    addClerk({ name, email, programId });
    setOpen(false);
    toast.success("Clerk account created — welcome email sent (simulated)");
    setCreatedInfo({ name, program: programName(programId) });
  }

  const columns: Column<Clerk>[] = [
    { key: "name", header: "Name", render: (c) => <span className="font-medium">{c.name}</span> },
    { key: "email", header: "Email", render: (c) => <span className="text-muted-foreground">{c.email}</span> },
    { key: "program", header: "Program", render: (c) => programName(c.programId) },
    { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
    { key: "createdAt", header: "Created", render: (c) => formatDate(c.createdAt) },
    {
      key: "actions", header: "", className: "w-12",
      render: (c) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {c.status === "active" ? (
              <DropdownMenuItem className="text-destructive" onClick={() => setDeactivate(c)}>Deactivate</DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => { updateClerk(c.id, { status: "active" }); toast.success("Clerk account reactivated"); }}>Reactivate</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Program Clerks"
        description="Create and manage the clerk accounts that handle each program's applications."
        action={{ label: "Create Clerk", icon: UserPlus, onClick: openCreate }}
      />
      <DataTable columns={columns} data={clerks} searchKeys={["name", "email"]} searchPlaceholder="Search clerks" emptyTitle="No clerk accounts yet" />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Clerk Account</DialogTitle></DialogHeader>
          <form onSubmit={create} className="space-y-4">
            <div className="space-y-1.5"><Label className="text-xs">Full Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div className="space-y-1.5"><Label className="text-xs">Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div className="space-y-1.5">
              <Label className="text-xs">Program</Label>
              <Select value={programId} onValueChange={setProgramId}>
                <SelectTrigger><SelectValue placeholder="Select a program" /></SelectTrigger>
                <SelectContent>{availablePrograms.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
              {availablePrograms.length === 0 && <p className="text-[11px] text-muted-foreground">Every program already has an active clerk. Deactivate one to reassign.</p>}
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Temporary Password</Label><Input readOnly value="Welcome@2026" className="font-mono" /></div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!name || !email || !programId}>Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deactivate}
        onOpenChange={(o) => !o && setDeactivate(null)}
        title={`Deactivate ${deactivate?.name}?`}
        description="This clerk will lose access to application management until reactivated. The program can then be assigned a new clerk."
        confirmLabel="Deactivate"
        destructive
        onConfirm={() => { if (deactivate) { updateClerk(deactivate.id, { status: "inactive" }); toast.success("Clerk account deactivated"); } setDeactivate(null); }}
      />

      <InfoDialog
        open={!!createdInfo}
        onOpenChange={(o) => !o && setCreatedInfo(null)}
        title="Clerk account created"
        description={<>Clerk account created for <strong>{createdInfo?.name}</strong> on <strong>{createdInfo?.program}</strong> (temporary password emailed, simulated). This clerk is registered under the Registrar and handles that program&apos;s application management.</>}
      />
    </div>
  );
}
