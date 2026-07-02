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
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useStore } from "@/lib/store/provider";
import { DEPARTMENTS } from "@/lib/mock-data/users";
import { formatDate } from "@/lib/utils/date";
import type { User } from "@/lib/types";

export default function HODsPage() {
  const { users, programs, addUser, updateUser } = useStore();
  const hods = users.filter((u) => u.role === "hod");
  const [open, setOpen] = useState(false);
  const [dept, setDept] = useState(DEPARTMENTS[0]);
  const [profile, setProfile] = useState<User | null>(null);
  const [deactivate, setDeactivate] = useState<User | null>(null);
  const [createdInfo, setCreatedInfo] = useState<string | null>(null);

  const programsManaged = (u: User) => programs.filter((p) => u.programIds?.includes(p.id));

  const columns: Column<User>[] = [
    { key: "name", header: "Name", render: (u) => <span className="font-medium">{u.name}</span> },
    { key: "email", header: "Email", render: (u) => <span className="text-muted-foreground">{u.email}</span> },
    { key: "department", header: "Department" },
    { key: "programs", header: "Programs", render: (u) => programsManaged(u).length },
    { key: "status", header: "Status", render: (u) => <StatusBadge status={u.status} /> },
    {
      key: "actions", header: "", className: "w-12",
      render: (u) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setProfile(u)}>View Profile</DropdownMenuItem>
            {u.status === "active" ? (
              <DropdownMenuItem className="text-destructive" onClick={() => setDeactivate(u)}>Deactivate</DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => { updateUser(u.id, { status: "active" }); toast.success("Account reactivated"); }}>Reactivate</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addUser({ name: String(fd.get("name")), email: String(fd.get("email")), role: "hod", department: dept });
    setOpen(false);
    toast.success("HOD account created");
    setCreatedInfo(dept);
  }

  return (
    <div>
      <PageHeader title="HOD Accounts" description="Create and manage Head of Department accounts." action={{ label: "Create HOD", icon: UserPlus, onClick: () => setOpen(true) }} />
      <DataTable columns={columns} data={hods} searchKeys={["name", "email"]} searchPlaceholder="Search HODs" />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create HOD Account</DialogTitle></DialogHeader>
          <form onSubmit={create} className="space-y-4">
            <div className="space-y-1.5"><Label className="text-xs">Full Name</Label><Input name="name" required /></div>
            <div className="space-y-1.5"><Label className="text-xs">Email</Label><Input name="email" type="email" required /></div>
            <div className="space-y-1.5">
              <Label className="text-xs">Department</Label>
              <Select value={dept} onValueChange={setDept}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Temporary Password</Label><Input readOnly value="Welcome@2026" className="font-mono" /></div>
            <DialogFooter><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Create</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Item B — read-only profile sheet */}
      <Sheet open={!!profile} onOpenChange={(o) => !o && setProfile(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          {profile && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3">
                  <Avatar><AvatarFallback>{profile.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}</AvatarFallback></Avatar>
                  {profile.name}
                </SheetTitle>
                <SheetDescription>{profile.email}</SheetDescription>
              </SheetHeader>
              <div className="px-4 pb-6 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Role" value="Head of Department" />
                  <Field label="Department" value={profile.department ?? "—"} />
                  <Field label="Status" value={<StatusBadge status={profile.status} />} />
                  <Field label="Joined" value={formatDate(profile.createdAt)} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Programs Managed ({programsManaged(profile).length})</p>
                  <div className="space-y-1">
                    {programsManaged(profile).map((p) => (
                      <div key={p.id} className="flex items-center justify-between rounded border p-2">
                        <span>{p.code} — {p.name}</span>
                        <StatusBadge status={p.status} />
                      </div>
                    ))}
                    {programsManaged(profile).length === 0 && <p className="text-xs text-muted-foreground">No programs assigned.</p>}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deactivate}
        onOpenChange={(o) => !o && setDeactivate(null)}
        title={`Deactivate ${deactivate?.name}?`}
        description="This HOD will lose access until reactivated. Programs and content they created are retained."
        confirmLabel="Deactivate"
        destructive
        onConfirm={() => { if (deactivate) { updateUser(deactivate.id, { status: "inactive" }); toast.success("Account deactivated"); } setDeactivate(null); }}
      />

      <InfoDialog
        open={!!createdInfo}
        onOpenChange={(o) => !o && setCreatedInfo(null)}
        title="HOD account created"
        description={<>HOD account created for the <strong>{createdInfo}</strong> department (temporary password emailed, simulated). This HOD can now <strong>design programs, create Lecturer accounts, verify content, and publish results</strong>.</>}
      />
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="bg-muted rounded-lg p-2"><p className="text-[11px] text-muted-foreground">{label}</p><div className="font-medium">{value}</div></div>;
}
