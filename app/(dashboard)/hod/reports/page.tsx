"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Download } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store/provider";
import type { Module } from "@/lib/types";

const BRACKETS = ["A", "B", "C", "D", "F"];
const bracketColor: Record<string, string> = { A: "bg-emerald-500", B: "bg-blue-500", C: "bg-amber-500", D: "bg-orange-500", F: "bg-red-500" };

export default function HODReports() {
  const { currentUser, modules, programs, lectures, quizzes, users, moduleGrades } = useStore();
  const myModules = modules.filter((m) => m.status === "active" && programs.find((p) => p.id === m.programId)?.department === currentUser?.department);
  const students = users.filter((u) => u.role === "cohort-student");
  const [atRisk, setAtRisk] = useState<Module | null>(null);

  const caAvg = (sid: string, mid: string) => {
    const g = moduleGrades.find((x) => x.studentId === sid && x.moduleId === mid);
    return g ? Math.round((g.assignmentMarks + g.quizMarks) / 2) : 0;
  };

  const turnaround = (submittedAt?: string, verifiedAt?: string) => {
    if (!submittedAt || !verifiedAt) return null;
    const ms = new Date(verifiedAt).getTime() - new Date(submittedAt).getTime();
    if (ms < 0) return null;
    const days = ms / 86_400_000;
    return days < 1 ? `${Math.round(days * 24)}h` : `${days.toFixed(1)}d`;
  };

  return (
    <div>
      <PageHeader title="Reports" description="Departmental teaching and performance insights.">
        <Button variant="outline" size="sm" onClick={() => toast.success("Report exported successfully")}><Download className="size-4" /> Export</Button>
      </PageHeader>
      <Tabs defaultValue="lectures">
        <TabsList>
          <TabsTrigger value="lectures">Lecture Status</TabsTrigger>
          <TabsTrigger value="progress">Student Progress</TabsTrigger>
          <TabsTrigger value="grades">Grade Distributions</TabsTrigger>
          <TabsTrigger value="quizzes">Quiz Turnaround</TabsTrigger>
        </TabsList>

        <TabsContent value="lectures">
          <Card><CardContent className="pt-6"><Table>
            <TableHeader><TableRow><TableHead>Module</TableHead><TableHead>Total</TableHead><TableHead>Published</TableHead><TableHead>Pending</TableHead><TableHead>Draft</TableHead><TableHead>% Complete</TableHead></TableRow></TableHeader>
            <TableBody>
              {myModules.map((m) => {
                const ls = lectures.filter((l) => l.moduleId === m.id);
                const pub = ls.filter((l) => l.status === "published").length;
                const pct = ls.length ? Math.round((pub / ls.length) * 100) : 0;
                return <TableRow key={m.id}>
                  <TableCell>{m.code}</TableCell><TableCell>{ls.length}</TableCell><TableCell>{pub}</TableCell>
                  <TableCell>{ls.filter((l) => l.status === "submitted").length}</TableCell>
                  <TableCell>{ls.filter((l) => l.status === "draft").length}</TableCell>
                  <TableCell className="flex items-center gap-1">{pct}% {pct < 100 && <AlertTriangle className="size-3.5 text-amber-500" />}</TableCell>
                </TableRow>;
              })}
            </TableBody>
          </Table></CardContent></Card>
        </TabsContent>

        <TabsContent value="progress">
          <Card><CardContent className="pt-6"><Table>
            <TableHeader><TableRow><TableHead>Module</TableHead><TableHead>Students</TableHead><TableHead>Avg CA</TableHead><TableHead>At-Risk (&lt;40%)</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>
              {myModules.map((m) => {
                const avg = Math.round(students.reduce((s, st) => s + caAvg(st.id, m.id), 0) / students.length);
                const risk = students.filter((st) => caAvg(st.id, m.id) > 0 && caAvg(st.id, m.id) < 40).length;
                return <TableRow key={m.id}>
                  <TableCell>{m.code}</TableCell><TableCell>{students.length}</TableCell><TableCell>{avg}%</TableCell><TableCell>{risk}</TableCell>
                  <TableCell className="text-right"><Button size="sm" variant="ghost" onClick={() => setAtRisk(m)}>View At-Risk</Button></TableCell>
                </TableRow>;
              })}
            </TableBody>
          </Table></CardContent></Card>
        </TabsContent>

        <TabsContent value="grades">
          <Card><CardContent className="pt-6 space-y-5">
            {myModules.map((m) => {
              const gs = moduleGrades.filter((g) => g.moduleId === m.id && g.grade !== "—");
              const total = gs.length || 1;
              return (
                <div key={m.id}>
                  <p className="text-sm font-medium mb-1">{m.code} — {m.name}</p>
                  <div className="flex h-6 rounded overflow-hidden border">
                    {BRACKETS.map((b) => {
                      const n = gs.filter((g) => g.grade.startsWith(b)).length;
                      const pct = (n / total) * 100;
                      return pct > 0 ? <div key={b} className={`${bracketColor[b]} flex items-center justify-center text-[10px] text-white`} style={{ width: `${pct}%` }}>{b}</div> : null;
                    })}
                  </div>
                </div>
              );
            })}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="quizzes">
          <Card><CardContent className="pt-6"><Table>
            <TableHeader><TableRow><TableHead>Quiz</TableHead><TableHead>Module</TableHead><TableHead>Status</TableHead><TableHead>Turnaround</TableHead></TableRow></TableHeader>
            <TableBody>
              {quizzes.map((q) => {
                const t = turnaround(q.submittedAt, q.verifiedAt);
                return (
                  <TableRow key={q.id}>
                    <TableCell>{q.title}</TableCell>
                    <TableCell>{modules.find((m) => m.id === q.moduleId)?.code}</TableCell>
                    <TableCell className="capitalize">{q.status}</TableCell>
                    <TableCell>{t ? <span className="text-emerald-700">{t}</span> : q.status === "submitted" ? <span className="text-amber-600">Pending</span> : "—"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table></CardContent></Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!atRisk} onOpenChange={(o) => !o && setAtRisk(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>At-Risk Students — {atRisk?.code}</DialogTitle></DialogHeader>
          <div className="space-y-1 text-sm">
            {atRisk && students.filter((st) => caAvg(st.id, atRisk.id) > 0 && caAvg(st.id, atRisk.id) < 40).map((st) => (
              <div key={st.id} className="flex justify-between border-b last:border-0 pb-1"><span>{st.name}</span><span className="text-red-600">{caAvg(st.id, atRisk.id)}% CA</span></div>
            ))}
            {atRisk && students.filter((st) => caAvg(st.id, atRisk.id) > 0 && caAvg(st.id, atRisk.id) < 40).length === 0 && <p className="text-muted-foreground">No at-risk students.</p>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
