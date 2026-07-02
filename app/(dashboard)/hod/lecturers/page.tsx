"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MoreHorizontal, UserPlus, Mail, BookOpen, Layers } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/lib/store/provider";
import { formatDate } from "@/lib/utils/date";
import type { User } from "@/lib/types";

export default function HODLecturers() {
  const { currentUser, users, modules, lectures, addUser, updateUser } = useStore();
  const lecturers = users.filter((u) => u.role === "lecturer" && u.department === currentUser?.department);
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<User | null>(null);
  const [deactivate, setDeactivate] = useState<User | null>(null);
  const [created, setCreated] = useState<string | null>(null);

  const moduleCount = (u: User) => modules.filter((m) => m.lecturerIds.includes(u.id)).length;
  const lectureCount = (u: User) => lectures.filter((l) => l.createdByLecturerId === u.id && l.status === "published").length;
  const moduleNames = (u: User) => modules.filter((m) => m.lecturerIds.includes(u.id));

  const columns: Column<User>[] = [
    { key: "name", header: "Name", render: (u) => <span className="font-medium">{u.name}</span> },
    { key: "email", header: "Email", render: (u) => <span className="text-muted-foreground">{u.email}</span> },
    { key: "specialisation", header: "Specialisation" },
    { key: "modules", header: "Modules", render: (u) => moduleCount(u) },
    { key: "lectures", header: "Lectures Published", render: (u) => lectureCount(u) },
    { key: "status", header: "Status", render: (u) => <StatusBadge status={u.status} /> },
    {
      key: "actions", header: "", className: "w-12",
      render: (u) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setProfile(u)}>View Profile</DropdownMenuItem>
            {u.status === "active"
              ? <DropdownMenuItem onClick={() => setDeactivate(u)}>Deactivate</DropdownMenuItem>
              : <DropdownMenuItem onClick={() => { updateUser(u.id, { status: "active" }); toast.success(`${u.name} reactivated`); }}>Reactivate</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name"));
    addUser({ name, email: String(fd.get("email")), role: "lecturer", department: currentUser?.department, specialisation: String(fd.get("spec")), tempPassword: "Welcome@2026" });
    setOpen(false);
    toast.success("Lecturer account created");
    setCreated(name);
  }

  return (
    <div>
      <PageHeader title="Lecturers" description="Manage lecturer accounts in your department." action={{ label: "Create Lecturer", icon: UserPlus, onClick: () => setOpen(true) }} />
      <DataTable columns={columns} data={lecturers} searchKeys={["name", "email"]} searchPlaceholder="Search lecturers" />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Lecturer Account</DialogTitle></DialogHeader>
          <form onSubmit={create} className="space-y-4">
            <div className="space-y-1.5"><Label className="text-xs">Full Name</Label><Input name="name" required /></div>
            <div className="space-y-1.5"><Label className="text-xs">Email</Label><Input name="email" type="email" required /></div>
            <div className="space-y-1.5"><Label className="text-xs">Specialisation</Label><Input name="spec" /></div>
            <div className="space-y-1.5"><Label className="text-xs">Department</Label><Input value={currentUser?.department} readOnly /></div>
            <div className="space-y-1.5"><Label className="text-xs">Temporary Password</Label><Input readOnly value="Welcome@2026" className="font-mono" /></div>
            <DialogFooter><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Create</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Sheet open={!!profile} onOpenChange={(o) => !o && setProfile(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          {profile && (
            <>
              <SheetHeader>
                <SheetTitle>{profile.name}</SheetTitle>
                <SheetDescription>{profile.specialisation ?? "Lecturer"} · {profile.department}</SheetDescription>
              </SheetHeader>
              <div className="px-4 pb-6 space-y-4">
                <div className="flex items-center gap-2 text-sm"><Mail className="size-4 text-muted-foreground" /> {profile.email}</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground flex items-center gap-1"><Layers className="size-3" /> Modules</p><p className="text-lg font-semibold">{moduleCount(profile)}</p></div>
                  <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground flex items-center gap-1"><BookOpen className="size-3" /> Lectures Published</p><p className="text-lg font-semibold">{lectureCount(profile)}</p></div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Assigned Modules</p>
                  <div className="space-y-1.5">
                    {moduleNames(profile).map((m) => (
                      <div key={m.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                        <span>{m.code} — {m.name}</span>
                        {m.primaryLecturerId === profile.id && <span className="text-xs text-muted-foreground">Primary</span>}
                      </div>
                    ))}
                    {moduleNames(profile).length === 0 && <p className="text-sm text-muted-foreground">No modules assigned yet.</p>}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Account created {formatDate(profile.createdAt)} · <StatusBadge status={profile.status} /></p>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deactivate}
        onOpenChange={(o) => !o && setDeactivate(null)}
        title="Deactivate this lecturer?"
        description={`${deactivate?.name} will lose access until reactivated. Their content remains intact.`}
        confirmLabel="Deactivate"
        destructive
        onConfirm={() => { if (deactivate) { updateUser(deactivate.id, { status: "inactive" }); toast.success("Lecturer deactivated"); } setDeactivate(null); }}
      />

      <InfoDialog
        open={!!created}
        onOpenChange={(o) => !o && setCreated(null)}
        title="Lecturer account created"
        description={<>Account for <strong>{created}</strong> created (temporary password emailed, simulated). You can now <strong>assign this lecturer to modules</strong> from the Modules page, after which they can create lectures, quizzes and assignments.</>}
      />
    </div>
  );
}
