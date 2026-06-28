"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MoreHorizontal, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/lib/store/provider";
import type { User } from "@/lib/types";

export default function HODLecturers() {
  const { currentUser, users, modules, lectures, addUser, updateUser } = useStore();
  const lecturers = users.filter((u) => u.role === "lecturer" && u.department === currentUser?.department);
  const [open, setOpen] = useState(false);

  const moduleCount = (u: User) => modules.filter((m) => m.lecturerIds.includes(u.id)).length;
  const lectureCount = (u: User) => lectures.filter((l) => l.createdByLecturerId === u.id && l.status === "published").length;

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
            <DropdownMenuItem onClick={() => toast.info(`Viewing ${u.name}`)}>View Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { updateUser(u.id, { status: "inactive" }); toast.success("Deactivated"); }}>Deactivate</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addUser({ name: String(fd.get("name")), email: String(fd.get("email")), role: "lecturer", department: currentUser?.department, specialisation: String(fd.get("spec")) });
    setOpen(false);
    toast.success("Lecturer account created");
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
    </div>
  );
}
