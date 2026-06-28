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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/lib/store/provider";
import { DEPARTMENTS } from "@/lib/mock-data/users";
import type { User } from "@/lib/types";

export default function HODsPage() {
  const { users, programs, addUser, updateUser } = useStore();
  const hods = users.filter((u) => u.role === "hod");
  const [open, setOpen] = useState(false);
  const [dept, setDept] = useState(DEPARTMENTS[0]);

  const programsManaged = (u: User) => programs.filter((p) => u.programIds?.includes(p.id)).length;

  const columns: Column<User>[] = [
    { key: "name", header: "Name", render: (u) => <span className="font-medium">{u.name}</span> },
    { key: "email", header: "Email", render: (u) => <span className="text-muted-foreground">{u.email}</span> },
    { key: "department", header: "Department" },
    { key: "programs", header: "Programs", render: (u) => programsManaged(u) },
    { key: "status", header: "Status", render: (u) => <StatusBadge status={u.status} /> },
    {
      key: "actions", header: "", className: "w-12",
      render: (u) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toast.info(`Viewing ${u.name}`)}>View Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { updateUser(u.id, { status: "inactive" }); toast.success("Account deactivated"); }}>Deactivate</DropdownMenuItem>
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
    </div>
  );
}
