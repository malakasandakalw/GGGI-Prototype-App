"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { MoreHorizontal, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/lib/store/provider";
import { roleLabels } from "@/lib/nav-config";
import { formatDate } from "@/lib/utils/date";
import type { Role, User } from "@/lib/types";

const ALL_ROLES: Role[] = ["super-admin", "program-admin", "registrar", "hod", "lecturer", "cohort-student", "ol-student"];

export default function UsersPage() {
  const { users, addUser, updateUser } = useStore();
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [deactivate, setDeactivate] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<Role>("program-admin");

  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          (roleFilter === "all" || u.role === roleFilter) &&
          (statusFilter === "all" || u.status === statusFilter),
      ),
    [users, roleFilter, statusFilter],
  );

  const columns: Column<User>[] = [
    { key: "name", header: "Name", render: (u) => <span className="font-medium">{u.name}</span> },
    { key: "email", header: "Email", render: (u) => <span className="text-muted-foreground">{u.email}</span> },
    { key: "role", header: "Role", render: (u) => roleLabels[u.role] },
    { key: "status", header: "Status", render: (u) => <StatusBadge status={u.status} /> },
    { key: "createdAt", header: "Created", render: (u) => formatDate(u.createdAt) },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (u) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreHorizontal className="size-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toast.info(`Viewing ${u.name}'s profile`)}>View Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.success("Password reset email sent (simulated)")}>Reset Password</DropdownMenuItem>
            <DropdownMenuItem
              disabled={u.status === "inactive"}
              onClick={() => setDeactivate(u)}
            >
              Deactivate Account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addUser({
      name: String(fd.get("name")),
      email: String(fd.get("email")),
      role: newRole,
      department: fd.get("department") ? String(fd.get("department")) : undefined,
    });
    setCreateOpen(false);
    toast.success("Account created successfully");
  }

  return (
    <div>
      <PageHeader
        title="User Management"
        description="View, create and manage all accounts across the system."
        action={{ label: "Create Account", icon: UserPlus, onClick: () => setCreateOpen(true) }}
      />

      <DataTable
        columns={columns}
        data={filtered}
        searchKeys={["name", "email"]}
        searchPlaceholder="Search by name or email"
        filters={
          <>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {ALL_ROLES.map((r) => <SelectItem key={r} value={r}>{roleLabels[r]}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Account</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Full Name</Label>
              <Input name="name" required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input name="email" type="email" required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Role</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as Role)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="program-admin">Program Admin</SelectItem>
                  <SelectItem value="registrar">Registrar</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Super Admin can create Program Admin and Registrar accounts. HOD, Lecturer and Student accounts are created downstream.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Temporary Password</Label>
              <Input readOnly value="Welcome@2026" className="font-mono" />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit">Create Account</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deactivate}
        onOpenChange={(o) => !o && setDeactivate(null)}
        title="Deactivate this account?"
        description={`${deactivate?.name} will no longer be able to sign in.`}
        confirmLabel="Deactivate"
        destructive
        onConfirm={() => {
          if (deactivate) {
            updateUser(deactivate.id, { status: "inactive" });
            toast.success(`${deactivate.name} deactivated`);
          }
          setDeactivate(null);
        }}
      />
    </div>
  );
}
