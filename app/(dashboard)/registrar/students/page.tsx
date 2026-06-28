"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { MoreHorizontal } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/lib/store/provider";
import { gpa } from "@/lib/utils/gpa";
import { formatDate } from "@/lib/utils/date";
import type { User } from "@/lib/types";

export default function StudentsPage() {
  const { users, programs, intakes, modules, moduleGrades, updateUser } = useStore();
  const students = users.filter((u) => u.role === "cohort-student");
  const [program, setProgram] = useState("all");
  const [statusF, setStatusF] = useState("all");
  const [view, setView] = useState<User | null>(null);

  const programName = (id?: string) => programs.find((p) => p.id === id)?.name ?? "—";
  const intakeName = (id?: string) => intakes.find((i) => i.id === id)?.label ?? "—";
  const semName = (u: User) => programs.find((p) => p.id === u.programId)?.semesters.find((s) => s.id === u.currentSemesterId)?.name ?? "—";

  const filtered = useMemo(
    () => students.filter((s) => (program === "all" || s.programId === program) && (statusF === "all" || s.status === statusF)),
    [students, program, statusF],
  );

  const columns: Column<User>[] = [
    { key: "studentId", header: "Student ID", render: (u) => <span className="font-mono text-xs">{u.studentId}</span> },
    { key: "name", header: "Name", render: (u) => <span className="font-medium">{u.name}</span> },
    { key: "program", header: "Program", render: (u) => programName(u.programId) },
    { key: "intake", header: "Intake", render: (u) => intakeName(u.intakeId) },
    { key: "sem", header: "Semester", render: (u) => semName(u) },
    { key: "status", header: "Status", render: (u) => <StatusBadge status={u.status} /> },
    { key: "lastLogin", header: "Last Login", render: (u) => u.lastLogin ? formatDate(u.lastLogin) : "—" },
    {
      key: "actions", header: "", className: "w-12",
      render: (u) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setView(u)}>View Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { updateUser(u.id, { status: "suspended" }); toast.success("Student suspended"); }}>Suspend</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { updateUser(u.id, { status: "inactive" }); toast.success("Account deactivated"); }}>Deactivate</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Student Register" description="View and manage all enrolled students." />
      <DataTable
        columns={columns}
        data={filtered}
        searchKeys={["name", "studentId", "email"]}
        searchPlaceholder="Search name, ID, email"
        filters={
          <>
            <Select value={program} onValueChange={setProgram}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Program" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Programs</SelectItem>{programs.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={statusF} onValueChange={setStatusF}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>{["all", "active", "suspended", "inactive"].map((s) => <SelectItem key={s} value={s} className="capitalize">{s === "all" ? "All Status" : s}</SelectItem>)}</SelectContent>
            </Select>
          </>
        }
      />

      <Sheet open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          {view && (
            <>
              <SheetHeader>
                <SheetTitle>{view.name}</SheetTitle>
                <SheetDescription>{view.studentId} · {programName(view.programId)}</SheetDescription>
              </SheetHeader>
              <div className="px-4 pb-6 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <Info label="Intake" value={intakeName(view.intakeId)} />
                  <Info label="Semester" value={semName(view)} />
                  <Info label="CGPA" value={gpa(moduleGrades.filter((g) => g.studentId === view.id && g.published), modules).toFixed(2)} />
                  <Info label="Status" value={view.status} />
                </div>
                <div>
                  <p className="font-medium mb-2">Published Grades</p>
                  <div className="space-y-1">
                    {moduleGrades.filter((g) => g.studentId === view.id && g.published).map((g) => (
                      <div key={g.moduleId} className="flex justify-between border-b last:border-0 pb-1">
                        <span>{modules.find((m) => m.id === g.moduleId)?.code}</span>
                        <span className="font-medium">{g.grade}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="bg-muted rounded-lg p-2"><p className="text-[11px] text-muted-foreground">{label}</p><p className="font-medium capitalize">{value}</p></div>;
}
