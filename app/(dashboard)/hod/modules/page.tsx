"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { MoreHorizontal, X, Download } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { AcademicYearSelect } from "@/components/shared/AcademicYearSelect";
import { useYearScope } from "@/hooks/use-year-scope";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/lib/store/provider";
import { gpa, academicClass } from "@/lib/utils/gpa";
import type { Module, User } from "@/lib/types";

export default function HODModules() {
  const { currentUser, modules, programs, users, assignments, submissions, lectures, moduleGrades, updateModule } = useStore();
  const { isModuleInYear } = useYearScope();
  const dept = currentUser?.department;
  const deptModules = modules.filter((m) => isModuleInYear(m.id) && programs.find((p) => p.id === m.programId)?.department === dept);
  const lecturers = users.filter((u) => u.role === "lecturer" && u.department === dept);
  const [program, setProgram] = useState("all");
  const [status, setStatus] = useState("all");
  const [assign, setAssign] = useState<Module | null>(null);
  const [addLec, setAddLec] = useState("");
  const [oversight, setOversight] = useState<Module | null>(null);
  const [transcript, setTranscript] = useState<User | null>(null);
  const [crossInfo, setCrossInfo] = useState<Module | null>(null);
  const [assignInfo, setAssignInfo] = useState<{ module: string; lecturer: string } | null>(null);
  const [lastAssigned, setLastAssigned] = useState("");

  const programName = (id: string) => programs.find((p) => p.id === id)?.name ?? "—";
  const semName = (m: Module) => programs.find((p) => p.id === m.programId)?.semesters.find((s) => s.id === m.semesterId)?.name ?? "—";
  const lecNames = (m: Module) => m.lecturerIds.map((id) => users.find((u) => u.id === id)?.name).filter(Boolean).join(", ") || "Unassigned";
  const studentName = (id: string) => users.find((u) => u.id === id)?.name ?? id;

  const filtered = useMemo(
    () => deptModules.filter((m) => (program === "all" || m.programId === program) && (status === "all" || m.status === status)),
    [deptModules, program, status],
  );

  function addLecturer() {
    if (!assign || !addLec) return;
    const ids = Array.from(new Set([...assign.lecturerIds, addLec]));
    updateModule(assign.id, { lecturerIds: ids, primaryLecturerId: assign.primaryLecturerId || addLec });
    setAssign({ ...assign, lecturerIds: ids, primaryLecturerId: assign.primaryLecturerId || addLec });
    setLastAssigned(users.find((u) => u.id === addLec)?.name ?? "The lecturer");
    setAddLec("");
    toast.success("Lecturer assigned");
  }
  function finishAssign() {
    if (assign && lastAssigned) setAssignInfo({ module: `${assign.code} — ${assign.name}`, lecturer: lastAssigned });
    setAssign(null); setLastAssigned("");
  }
  function removeLecturer(id: string) {
    if (!assign) return;
    const ids = assign.lecturerIds.filter((x) => x !== id);
    updateModule(assign.id, { lecturerIds: ids, primaryLecturerId: assign.primaryLecturerId === id ? (ids[0] ?? "") : assign.primaryLecturerId });
    setAssign({ ...assign, lecturerIds: ids });
  }
  function toggleCrossStream(m: Module) {
    updateModule(m.id, { isCrossStreamEnabled: !m.isCrossStreamEnabled });
    if (m.isCrossStreamEnabled) toast.success("Cross-stream disabled");
    else { toast.success("Cross-stream enabled"); setCrossInfo(m); }
  }

  const columns: Column<Module>[] = [
    { key: "code", header: "Code", render: (m) => <span className="font-mono text-xs">{m.code}</span> },
    {
      key: "name", header: "Name", render: (m) => (
        <span className="font-medium flex items-center gap-2">
          {m.name}
          {m.isShared && <Badge variant="secondary" className="text-[10px]">Shared</Badge>}
          {m.isCrossStreamEnabled && <Badge variant="outline" className="text-[10px]">Cross-stream</Badge>}
        </span>
      ),
    },
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
            <DropdownMenuItem onClick={() => setOversight(m)}>View Content &amp; Submissions</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { updateModule(m.id, { isShared: !m.isShared }); toast.success(m.isShared ? "Shared designation removed" : "Marked as shared module"); }}>
              {m.isShared ? "Unmark" : "Mark as"} Shared Module
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleCrossStream(m)}>
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
      <p className="text-sm text-muted-foreground -mt-2 mb-4">
        Here you assign lecturers and oversee content. New modules are created within a programme —
        open <Link href="/hod/programs" className="text-primary underline underline-offset-2">Programs</Link>, choose a programme, then add a module to a semester.
      </p>
      <DataTable
        columns={columns}
        data={filtered}
        searchKeys={["name", "code"]}
        searchPlaceholder="Search module name or code"
        filters={
          <>
            <AcademicYearSelect />
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

      <Dialog open={!!assign} onOpenChange={(o) => !o && finishAssign()}>
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
          <DialogFooter><Button variant="outline" onClick={finishAssign}>Done</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* P — read-only content & submissions oversight */}
      <Sheet open={!!oversight} onOpenChange={(o) => !o && setOversight(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          {oversight && (
            <>
              <SheetHeader>
                <SheetTitle>{oversight.code} — {oversight.name}</SheetTitle>
                <SheetDescription>Read-only oversight of content and student submissions.</SheetDescription>
              </SheetHeader>
              <div className="px-4 pb-6 space-y-5">
                <div>
                  <p className="text-sm font-medium mb-2">Lectures</p>
                  <div className="space-y-1.5">
                    {lectures.filter((l) => l.moduleId === oversight.id).map((l) => (
                      <div key={l.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                        <span>{l.title}</span><StatusBadge status={l.status} />
                      </div>
                    ))}
                    {lectures.filter((l) => l.moduleId === oversight.id).length === 0 && <p className="text-sm text-muted-foreground">No lectures yet.</p>}
                  </div>
                </div>
                {assignments.filter((a) => a.moduleId === oversight.id).map((a) => {
                  const subs = submissions.filter((s) => s.assignmentId === a.id);
                  return (
                    <div key={a.id}>
                      <p className="text-sm font-medium mb-2">{a.title} <span className="text-xs text-muted-foreground">· {subs.length} submissions</span></p>
                      <Table>
                        <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Status</TableHead><TableHead>Marks</TableHead><TableHead /></TableRow></TableHeader>
                        <TableBody>
                          {subs.map((s) => (
                            <TableRow key={s.id}>
                              <TableCell>{studentName(s.studentId)}</TableCell>
                              <TableCell className="capitalize">{s.gradingStatus}</TableCell>
                              <TableCell>{s.marks != null ? `${s.marks}/${a.maxMarks}` : "—"}</TableCell>
                              <TableCell className="text-right">
                                <Button size="sm" variant="ghost" onClick={() => setTranscript(users.find((u) => u.id === s.studentId) ?? null)}>Transcript</Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          {subs.length === 0 && <TableRow><TableCell colSpan={4} className="text-muted-foreground text-sm">No submissions.</TableCell></TableRow>}
                        </TableBody>
                      </Table>
                    </div>
                  );
                })}
                {assignments.filter((a) => a.moduleId === oversight.id).length === 0 && <p className="text-sm text-muted-foreground">No assignments in this module.</p>}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* R — read-only transcript */}
      <Sheet open={!!transcript} onOpenChange={(o) => !o && setTranscript(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          {transcript && (() => {
            const grades = moduleGrades.filter((g) => g.studentId === transcript.id && g.published);
            const cgpa = gpa(grades, modules);
            const cls = academicClass(cgpa);
            return (
              <>
                <SheetHeader>
                  <SheetTitle>{transcript.name}</SheetTitle>
                  <SheetDescription>Read-only transcript · {transcript.studentId ?? "—"}</SheetDescription>
                </SheetHeader>
                <div className="px-4 pb-6 space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div><p className="text-xs text-muted-foreground">CGPA</p><p className="text-xl font-semibold">{cgpa.toFixed(2)}</p></div>
                    <Badge className={cls.tone}>{cls.label}</Badge>
                  </div>
                  <Table>
                    <TableHeader><TableRow><TableHead>Module</TableHead><TableHead>Grade</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {grades.map((g) => (
                        <TableRow key={g.moduleId}>
                          <TableCell>{modules.find((m) => m.id === g.moduleId)?.code ?? g.moduleId}</TableCell>
                          <TableCell className="font-semibold">{g.grade}</TableCell>
                        </TableRow>
                      ))}
                      {grades.length === 0 && <TableRow><TableCell colSpan={2} className="text-muted-foreground text-sm">No published results yet.</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                  <Button variant="outline" size="sm" onClick={() => toast.success("Transcript downloaded (simulated)")}><Download className="size-4" /> Download (Mock)</Button>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>

      <InfoDialog
        open={!!assignInfo}
        onOpenChange={(o) => !o && setAssignInfo(null)}
        title="Lecturer assigned"
        description={<><strong>{assignInfo?.lecturer}</strong> assigned to <strong>{assignInfo?.module}</strong> and notified. They can now upload lectures and build quizzes, which they <strong>publish directly to students</strong> — they&apos;re responsible for ensuring the content is correct.</>}
      />

      <InfoDialog
        open={!!crossInfo}
        onOpenChange={(o) => !o && setCrossInfo(null)}
        title="Cross-stream enrollment enabled"
        description={<><strong>{crossInfo?.code} — {crossInfo?.name}</strong> is now open for cross-stream enrollment. It will appear in the directories where <strong>Cohort students (other programs)</strong> and <strong>Open Learning students</strong> can request access — each request is approved by the <strong>Registrar</strong>.</>}
      />
    </div>
  );
}
