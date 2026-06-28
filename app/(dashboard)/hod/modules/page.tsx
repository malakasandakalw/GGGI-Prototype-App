"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { MoreHorizontal, X } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import type { Module } from "@/lib/types";

export default function HODModules() {
  const { currentUser, modules, programs, users, updateModule } = useStore();
  const dept = currentUser?.department;
  const deptModules = modules.filter((m) => programs.find((p) => p.id === m.programId)?.department === dept);
  const lecturers = users.filter((u) => u.role === "lecturer" && u.department === dept);
  const [program, setProgram] = useState("all");
  const [status, setStatus] = useState("all");
  const [assign, setAssign] = useState<Module | null>(null);
  const [addLec, setAddLec] = useState("");

  const programName = (id: string) => programs.find((p) => p.id === id)?.name ?? "—";
  const semName = (m: Module) => programs.find((p) => p.id === m.programId)?.semesters.find((s) => s.id === m.semesterId)?.name ?? "—";
  const lecNames = (m: Module) => m.lecturerIds.map((id) => users.find((u) => u.id === id)?.name).filter(Boolean).join(", ") || "Unassigned";

  const filtered = useMemo(
    () => deptModules.filter((m) => (program === "all" || m.programId === program) && (status === "all" || m.status === status)),
    [deptModules, program, status],
  );

  function addLecturer() {
    if (!assign || !addLec) return;
    const ids = Array.from(new Set([...assign.lecturerIds, addLec]));
    updateModule(assign.id, { lecturerIds: ids, primaryLecturerId: assign.primaryLecturerId || addLec });
    setAssign({ ...assign, lecturerIds: ids, primaryLecturerId: assign.primaryLecturerId || addLec });
    setAddLec("");
    toast.success("Lecturer assigned");
  }
  function removeLecturer(id: string) {
    if (!assign) return;
    const ids = assign.lecturerIds.filter((x) => x !== id);
    updateModule(assign.id, { lecturerIds: ids, primaryLecturerId: assign.primaryLecturerId === id ? (ids[0] ?? "") : assign.primaryLecturerId });
    setAssign({ ...assign, lecturerIds: ids });
  }

  const columns: Column<Module>[] = [
    { key: "code", header: "Code", render: (m) => <span className="font-mono text-xs">{m.code}</span> },
    { key: "name", header: "Name", render: (m) => <span className="font-medium">{m.name}</span> },
    { key: "program", header: "Program", render: (m) => programName(m.programId) },
    { key: "sem", header: "Semester", render: (m) => semName(m) },
    { key: "creditValue", header: "Credits" },
    { key: "lecturers", header: "Lecturer(s)", render: (m) => <span className="text-sm">{lecNames(m)}</span> },
    { key: "status", header: "Status", render: (m) => <StatusBadge status={m.status} /> },
    {
      key: "actions", header: "", className: "w-12",
      render: (m) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setAssign(m)}>Assign Lecturer</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { updateModule(m.id, { isCrossStreamEnabled: !m.isCrossStreamEnabled }); toast.success(m.isCrossStreamEnabled ? "Cross-stream disabled" : "Cross-stream enabled"); }}>
              {m.isCrossStreamEnabled ? "Disable" : "Enable"} Cross-Stream
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { updateModule(m.id, { status: "archived" }); toast.success("Module archived"); }}>Archive Module</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Modules" description="Manage all modules across your department." />
      <DataTable
        columns={columns}
        data={filtered}
        searchKeys={["name", "code"]}
        searchPlaceholder="Search module name or code"
        filters={
          <>
            <Select value={program} onValueChange={setProgram}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Program" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Programs</SelectItem>{programs.filter((p) => p.department === dept).map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>{["all", "active", "draft", "archived"].map((s) => <SelectItem key={s} value={s} className="capitalize">{s === "all" ? "All" : s}</SelectItem>)}</SelectContent>
            </Select>
          </>
        }
      />

      <Dialog open={!!assign} onOpenChange={(o) => !o && setAssign(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Lecturers — {assign?.code}</DialogTitle></DialogHeader>
          {assign && (
            <div className="space-y-4">
              <div className="space-y-2">
                {assign.lecturerIds.length === 0 && <p className="text-sm text-muted-foreground">No lecturers assigned.</p>}
                {assign.lecturerIds.map((id) => (
                  <div key={id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                    <span className="flex items-center gap-2">
                      {users.find((u) => u.id === id)?.name}
                      {assign.primaryLecturerId === id && <Badge variant="secondary" className="text-[10px]">Primary</Badge>}
                    </span>
                    <div className="flex items-center gap-2">
                      {assign.primaryLecturerId !== id && (
                        <Button size="sm" variant="ghost" onClick={() => { updateModule(assign.id, { primaryLecturerId: id }); setAssign({ ...assign, primaryLecturerId: id }); }}>Set Primary</Button>
                      )}
                      <Button size="icon" variant="ghost" onClick={() => removeLecturer(id)}><X className="size-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Select value={addLec} onValueChange={setAddLec}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Add lecturer" /></SelectTrigger>
                  <SelectContent>{lecturers.filter((l) => !assign.lecturerIds.includes(l.id)).map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                </Select>
                <Button onClick={addLecturer}>Add</Button>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setAssign(null)}>Done</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
