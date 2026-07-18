"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { MoreHorizontal, FileText, Printer, CalendarPlus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { AcademicYearSelect } from "@/components/shared/AcademicYearSelect";
import { ArchivedYearBanner } from "@/components/shared/ArchivedYearBanner";
import { useYearScope } from "@/hooks/use-year-scope";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store/provider";
import { gpa } from "@/lib/utils/gpa";
import { formatDate } from "@/lib/utils/date";
import type { User } from "@/lib/types";

export default function StudentsPage() {
  const { users, programs, intakes, modules, moduleGrades, submissions, quizSubmissions, updateUser, addIntake, addNotification } = useStore();
  const { inYear, activeAcademicYear, activeYearEditable } = useYearScope();
  const students = users.filter((u) => u.role === "cohort-student");
  const activePrograms = programs.filter((p) => p.status === "active");
  const [program, setProgram] = useState("all");
  const [intake, setIntake] = useState("all");
  const [statusF, setStatusF] = useState("all");
  const [view, setView] = useState<User | null>(null);
  const [transcript, setTranscript] = useState<User | null>(null);
  // Item K — open intake
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [inProgram, setInProgram] = useState(activePrograms[0]?.id ?? "");
  const [inLabel, setInLabel] = useState("");
  const [inOpenDate, setInOpenDate] = useState("");
  const [inCloseDate, setInCloseDate] = useState("");
  const [inStart, setInStart] = useState("");
  const [inCap, setInCap] = useState("");
  const [intakeInfo, setIntakeInfo] = useState<string | null>(null);

  function saveIntake() {
    const prog = programs.find((p) => p.id === inProgram);
    addIntake({
      programId: inProgram,
      label: inLabel,
      applicationOpenDate: inOpenDate,
      applicationCloseDate: inCloseDate,
      academicStartDate: inStart,
      maxCapacity: inCap ? Number(inCap) : undefined,
      status: "open",
    });
    addNotification({ recipientId: "u-pa", title: "Intake opened", body: `${inLabel} for ${prog?.name} is now accepting applications.`, type: "application" });
    toast.success("Intake opened — now live on the application portal");
    setIntakeInfo(prog?.name ?? "the program");
    setIntakeOpen(false);
    setInLabel(""); setInOpenDate(""); setInCloseDate(""); setInStart(""); setInCap("");
  }

  const programName = (id?: string) => programs.find((p) => p.id === id)?.name ?? "—";
  const intakeName = (id?: string) => intakes.find((i) => i.id === id)?.label ?? "—";
  const semName = (u: User) => programs.find((p) => p.id === u.programId)?.semesters.find((s) => s.id === u.currentSemesterId)?.name ?? "—";

  // Intake filter is scoped to the active academic year (continuing students still show
  // under "All Intakes" — a batch that entered in an earlier year keeps progressing).
  const intakeOptions = intakes.filter((i) => inYear(i.academicYearId) && (program === "all" || i.programId === program));

  const filtered = useMemo(
    () => students.filter((s) =>
      (program === "all" || s.programId === program) &&
      (intake === "all" || s.intakeId === intake) &&
      (statusF === "all" || s.status === statusF),
    ),
    [students, program, intake, statusF],
  );

  const studentGrades = (id: string) => moduleGrades.filter((g) => g.studentId === id && g.published);
  const enrolledModules = (u: User) => {
    const own = modules.filter((m) => m.programId === u.programId);
    const cross = modules.filter((m) => u.crossEnrolledModuleIds?.includes(m.id));
    return [...own, ...cross];
  };

  function printTranscript(u: User) {
    const w = window.open("", "_blank", "width=900,height=650");
    if (!w) { toast.error("Allow pop-ups to print the transcript."); return; }
    const rows = studentGrades(u.id).map((g) => {
      const m = modules.find((x) => x.id === g.moduleId);
      return `<tr><td>${m?.code ?? g.moduleId}</td><td>${m?.name ?? ""}</td><td>${m?.creditValue ?? "—"}</td><td style="text-align:center">${g.specialCode ?? g.grade}</td></tr>`;
    }).join("");
    w.document.write(`
      <html><head><title>Transcript — ${u.name}</title>
      <style>
        body{font-family:Georgia,serif;margin:40px;color:#0f172a}
        h1{font-size:20px;margin:0}
        .sub{color:#64748b;font-size:13px;margin-top:4px}
        table{width:100%;border-collapse:collapse;margin-top:24px;font-size:13px}
        th,td{border:1px solid #e2e8f0;padding:8px 10px;text-align:left}
        th{background:#f1f5f9}
        .cgpa{margin-top:20px;font-size:15px;font-weight:bold}
        .note{margin-top:32px;color:#94a3b8;font-size:11px}
      </style></head><body>
        <h1>Official Academic Transcript</h1>
        <div class="sub">${u.name} · ${u.studentId ?? ""} · ${programName(u.programId)} · ${intakeName(u.intakeId)}</div>
        <table><thead><tr><th>Code</th><th>Module</th><th>Credits</th><th>Grade</th></tr></thead><tbody>${rows || `<tr><td colspan="4" style="text-align:center">No published results</td></tr>`}</tbody></table>
        <p class="cgpa">CGPA: ${gpa(studentGrades(u.id), modules).toFixed(2)}</p>
        <p class="note">Generated by the University LMS (prototype) — for demonstration only.</p>
        <script>window.onload=function(){window.print()}</script>
      </body></html>`);
    w.document.close();
  }

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
            <DropdownMenuItem onClick={() => setTranscript(u)}>View Transcript</DropdownMenuItem>
            {u.status === "active" && <DropdownMenuItem onClick={() => { updateUser(u.id, { status: "suspended" }); toast.success("Student suspended"); }}>Suspend</DropdownMenuItem>}
            {u.status === "active" && <DropdownMenuItem className="text-destructive" onClick={() => { updateUser(u.id, { status: "inactive" }); toast.success("Account deactivated"); }}>Deactivate</DropdownMenuItem>}
            {u.status === "suspended" && <DropdownMenuItem onClick={() => { updateUser(u.id, { status: "active" }); toast.success("Suspension lifted"); }}>Lift Suspension</DropdownMenuItem>}
            {u.status === "inactive" && <DropdownMenuItem onClick={() => { updateUser(u.id, { status: "active" }); toast.success("Account reactivated"); }}>Reactivate</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Student Register" description="View and manage all enrolled students." action={{ label: "Open Intake", icon: CalendarPlus, onClick: () => setIntakeOpen(true), disabled: !activeYearEditable }}>
        <AcademicYearSelect />
      </PageHeader>
      <ArchivedYearBanner />
      <DataTable
        columns={columns}
        data={filtered}
        searchKeys={["name", "studentId", "email"]}
        searchPlaceholder="Search name, ID, email"
        filters={
          <>
            <Select value={program} onValueChange={(v) => { setProgram(v); setIntake("all"); }}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Program" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Programs</SelectItem>{programs.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={intake} onValueChange={setIntake}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Intake" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Intakes</SelectItem>{intakeOptions.map((i) => <SelectItem key={i.id} value={i.id}>{i.label}</SelectItem>)}</SelectContent>
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
                  <Info label="CGPA" value={gpa(studentGrades(view.id), modules).toFixed(2)} />
                  <Info label="Status" value={view.status} />
                </div>

                {/* Item I — read-only academic progress */}
                <div>
                  <p className="font-medium mb-2">Academic Progress <span className="text-xs text-muted-foreground">(read-only)</span></p>
                  <div className="grid grid-cols-2 gap-3">
                    <Info label="Modules Enrolled" value={String(enrolledModules(view).length)} />
                    <Info label="Lectures Completed" value={String(view.completedLectureIds?.length ?? 0)} />
                    <Info label="Assignments Submitted" value={String(submissions.filter((s) => s.studentId === view.id).length)} />
                    <Info label="Quizzes Attempted" value={String(quizSubmissions.filter((s) => s.studentId === view.id).length)} />
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">Published Grades</p>
                  <div className="space-y-1">
                    {studentGrades(view.id).map((g) => (
                      <div key={g.moduleId} className="flex justify-between border-b last:border-0 pb-1">
                        <span>{modules.find((m) => m.id === g.moduleId)?.code}</span>
                        <span className="font-medium">{g.specialCode ?? g.grade}</span>
                      </div>
                    ))}
                    {studentGrades(view.id).length === 0 && <p className="text-xs text-muted-foreground">No published grades yet.</p>}
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full" onClick={() => setTranscript(view)}><FileText className="size-4" /> View Transcript</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Item L — read-only transcript */}
      <Dialog open={!!transcript} onOpenChange={(o) => !o && setTranscript(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Academic Transcript</DialogTitle></DialogHeader>
          {transcript && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">{transcript.name} · {transcript.studentId} · {programName(transcript.programId)} · {intakeName(transcript.intakeId)}</div>
              <div className="rounded border">
                <div className="grid grid-cols-[1fr_auto] gap-2 px-3 py-2 text-xs font-medium bg-muted"><span>Module</span><span>Grade</span></div>
                {studentGrades(transcript.id).map((g) => {
                  const m = modules.find((x) => x.id === g.moduleId);
                  return (
                    <div key={g.moduleId} className="grid grid-cols-[1fr_auto] gap-2 px-3 py-2 text-sm border-t">
                      <span>{m?.code} — {m?.name}</span>
                      <span className="font-medium">{g.specialCode ?? g.grade}</span>
                    </div>
                  );
                })}
                {studentGrades(transcript.id).length === 0 && <p className="px-3 py-3 text-sm text-muted-foreground">No published results.</p>}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">CGPA: {gpa(studentGrades(transcript.id), modules).toFixed(2)}</p>
                <Button size="sm" onClick={() => printTranscript(transcript)}><Printer className="size-4" /> Print / Download (Mock)</Button>
              </div>
              <p className="text-xs text-muted-foreground">Read-only view — the Registrar can view and download transcripts but cannot modify grades.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Item K — Open Intake */}
      <Dialog open={intakeOpen} onOpenChange={setIntakeOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Open Application Intake</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">Academic Year: <span className="font-medium text-foreground">{activeAcademicYear?.label}</span> — this intake and its applications belong to the active year.</div>
            <div className="space-y-1.5"><Label className="text-xs">Program</Label>
              <Select value={inProgram} onValueChange={setInProgram}>
                <SelectTrigger><SelectValue placeholder="Select program" /></SelectTrigger>
                <SelectContent>{activePrograms.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Intake Label</Label><Input value={inLabel} onChange={(e) => setInLabel(e.target.value)} placeholder="e.g. 2027 Intake" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Applications Open</Label><Input type="date" value={inOpenDate} onChange={(e) => setInOpenDate(e.target.value)} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Applications Close</Label><Input type="date" value={inCloseDate} onChange={(e) => setInCloseDate(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Academic Start</Label><Input type="date" value={inStart} onChange={(e) => setInStart(e.target.value)} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Capacity</Label><Input type="number" value={inCap} onChange={(e) => setInCap(e.target.value)} placeholder="e.g. 120" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIntakeOpen(false)}>Cancel</Button>
            <Button disabled={!inProgram || !inLabel || !inOpenDate || !inCloseDate} onClick={saveIntake}>Open Intake</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <InfoDialog
        open={!!intakeInfo}
        onOpenChange={(o) => !o && setIntakeInfo(null)}
        title="Intake opened"
        description={<>Intake opened for <strong>{intakeInfo}</strong>. The program now appears on the <strong>public application portal</strong>; submitted applications arrive in your <strong>Applications</strong> queue.</>}
      />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="bg-muted rounded-lg p-2"><p className="text-[11px] text-muted-foreground">{label}</p><p className="font-medium capitalize">{value}</p></div>;
}
