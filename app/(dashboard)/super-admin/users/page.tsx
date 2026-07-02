"use client";

import { useMemo, useState } from "react";
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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/lib/store/provider";
import { roleLabels } from "@/lib/nav-config";
import { formatDate, formatDateTime } from "@/lib/utils/date";
import type { Role, User } from "@/lib/types";

const ALL_ROLES: Role[] = ["super-admin", "program-admin", "registrar", "hod", "lecturer", "cohort-student", "ol-student"];
const CREATABLE_ROLES: Role[] = ["program-admin", "registrar", "hod", "lecturer", "cohort-student", "ol-student"];
const DEPT_ROLES: Role[] = ["hod", "lecturer"];

const ROLE_DUTIES: Record<Role, string> = {
  "super-admin": "administers the whole system.",
  "program-admin": "oversees programs and creates HOD accounts.",
  registrar: "processes admissions, enrollment and payments.",
  hod: "designs programs, creates Lecturers, verifies content and publishes results.",
  lecturer: "builds lectures, quizzes and assignments and grades students.",
  "cohort-student": "studies enrolled modules in a program cohort.",
  "ol-student": "self-enrolls in Open Learning courses.",
};

export default function UsersPage() {
  const { users, addUser, updateUser, addAudit } = useStore();
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [deactivate, setDeactivate] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<Role>("program-admin");
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [roleChange, setRoleChange] = useState<User | null>(null);
  const [roleChangeTo, setRoleChangeTo] = useState<Role>("program-admin");
  const [createdInfo, setCreatedInfo] = useState<{ role: Role } | null>(null);
  const [deactivatedInfo, setDeactivatedInfo] = useState<string | null>(null);

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
            <DropdownMenuItem onClick={() => setViewUser(u)}>View Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setRoleChange(u); setRoleChangeTo(u.role); }}>Change Role</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.success("Password reset email sent (simulated)")}>Reset Password</DropdownMenuItem>
            {u.status === "inactive"
              ? <DropdownMenuItem onClick={() => { updateUser(u.id, { status: "active" }); addAudit({ action: "Account Reactivated", details: `Reactivated ${u.role} account for ${u.name}` }); toast.success(`${u.name} reactivated`); }}>Reactivate Account</DropdownMenuItem>
              : <DropdownMenuItem onClick={() => setDeactivate(u)}>Deactivate Account</DropdownMenuItem>}
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
    setCreatedInfo({ role: newRole });
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

      {/* Create Account */}
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
                  {CREATABLE_ROLES.map((r) => <SelectItem key={r} value={r}>{roleLabels[r]}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                As Super Admin you can create any account type. HOD, Lecturer and Student accounts are usually created downstream by Program Admins / HODs / Registrar.
              </p>
            </div>
            {DEPT_ROLES.includes(newRole) && (
              <div className="space-y-1.5">
                <Label className="text-xs">Department</Label>
                <Input name="department" placeholder="e.g. Computing" />
              </div>
            )}
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

      {/* View Profile */}
      <Sheet open={!!viewUser} onOpenChange={(o) => !o && setViewUser(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{viewUser?.name}</SheetTitle>
            <SheetDescription>{viewUser && roleLabels[viewUser.role]}</SheetDescription>
          </SheetHeader>
          {viewUser && (
            <div className="px-4 space-y-3 text-sm">
              <Row label="Email" value={viewUser.email} />
              <Row label="Role" value={roleLabels[viewUser.role]} />
              <Row label="Status" value={<StatusBadge status={viewUser.status} />} />
              {viewUser.department && <Row label="Department" value={viewUser.department} />}
              {viewUser.studentId && <Row label="Student ID" value={viewUser.studentId} />}
              <Row label="Created" value={formatDate(viewUser.createdAt)} />
              <Row label="Last Login" value={viewUser.lastLogin ? formatDateTime(viewUser.lastLogin) : "—"} />
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Change Role */}
      <Dialog open={!!roleChange} onOpenChange={(o) => !o && setRoleChange(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Change Role — {roleChange?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">New Role</Label>
              <Select value={roleChangeTo} onValueChange={(v) => setRoleChangeTo(v as Role)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ALL_ROLES.map((r) => <SelectItem key={r} value={r}>{roleLabels[r]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <p className="text-[11px] text-muted-foreground">Changing a role updates the user&apos;s access immediately (simulated).</p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRoleChange(null)}>Cancel</Button>
            <Button onClick={() => {
              if (roleChange && roleChangeTo !== roleChange.role) {
                updateUser(roleChange.id, { role: roleChangeTo });
                addAudit({ action: "Role Changed", details: `${roleChange.name}: ${roleLabels[roleChange.role]} → ${roleLabels[roleChangeTo]}` });
                toast.success(`${roleChange.name} is now ${roleLabels[roleChangeTo]}`);
              }
              setRoleChange(null);
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deactivate}
        onOpenChange={(o) => !o && setDeactivate(null)}
        title="Deactivate this account?"
        description={`${deactivate?.name} will no longer be able to sign in. Their data is preserved and you can reactivate them later.`}
        confirmLabel="Deactivate"
        destructive
        onConfirm={() => {
          if (deactivate) {
            updateUser(deactivate.id, { status: "inactive" });
            addAudit({ action: "Account Deactivated", details: `Deactivated ${deactivate.role} account for ${deactivate.name}` });
            toast.success(`${deactivate.name} deactivated`);
            setDeactivatedInfo(deactivate.name);
          }
          setDeactivate(null);
        }}
      />

      <InfoDialog
        open={!!createdInfo}
        onOpenChange={(o) => !o && setCreatedInfo(null)}
        title="Account created"
        description={createdInfo && <>A temporary password was emailed (simulated). This <strong>{roleLabels[createdInfo.role]}</strong> can now log in and {ROLE_DUTIES[createdInfo.role]}</>}
      />

      <InfoDialog
        open={!!deactivatedInfo}
        onOpenChange={(o) => !o && setDeactivatedInfo(null)}
        title="Account deactivated"
        description={<><strong>{deactivatedInfo}</strong> can no longer sign in. Their historical data is preserved — accounts are never deleted (SRS §10.3). You can reactivate them at any time from the row menu.</>}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="flex justify-between gap-4 border-b pb-2"><span className="text-muted-foreground">{label}</span><span className="font-medium text-right">{value}</span></div>;
}
