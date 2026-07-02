"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useStore } from "@/lib/store/provider";
import type { Module } from "@/lib/types";

const BRACKETS = ["A", "B", "C", "D", "F"];

export default function HODResults() {
  const { currentUser, modules, programs, users, moduleGrades, publishResults } = useStore();
  const myModules = modules.filter((m) => m.status === "active" && programs.find((p) => p.id === m.programId)?.department === currentUser?.department);
  const [confirm, setConfirm] = useState<Module | null>(null);
  const [review, setReview] = useState<Module | null>(null);
  const [published, setPublished] = useState<string | null>(null);

  function statusOf(m: Module) {
    const gs = moduleGrades.filter((g) => g.moduleId === m.id);
    if (gs.length === 0) return "Awaiting Final Marks";
    if (gs.every((g) => g.published)) return "Published";
    if (gs.every((g) => g.finalExamMark > 0 || g.specialCode)) return "Ready to Publish";
    return "Awaiting Final Marks";
  }
  function distribution(m: Module) {
    const gs = moduleGrades.filter((g) => g.moduleId === m.id);
    return BRACKETS.map((b) => ({ b, n: gs.filter((g) => g.grade.startsWith(b)).length }));
  }
  const studentName = (id: string) => users.find((u) => u.id === id)?.name ?? id;

  const readyCount = myModules.filter((m) => statusOf(m) === "Ready to Publish").length;

  return (
    <div>
      <PageHeader title="Results" description="Review and publish module results to students.">
        {readyCount > 0 && (
          <Button onClick={() => { myModules.filter((m) => statusOf(m) === "Ready to Publish").forEach((m) => publishResults(m.id)); toast.success("All eligible modules published"); }}>
            Publish All Eligible ({readyCount})
          </Button>
        )}
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2">
        {myModules.map((m) => {
          const status = statusOf(m);
          const dist = distribution(m);
          const maxN = Math.max(1, ...dist.map((d) => d.n));
          const count = moduleGrades.filter((g) => g.moduleId === m.id).length;
          return (
            <Card key={m.id}>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{m.code} — {m.name}</p>
                    <p className="text-xs text-muted-foreground">{count} students</p>
                  </div>
                  <Badge variant={status === "Published" ? "default" : status === "Ready to Publish" ? "secondary" : "outline"}>{status}</Badge>
                </div>
                <div className="flex items-end gap-2 h-20">
                  {dist.map((d) => (
                    <div key={d.b} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-blue-500 rounded-t" style={{ height: `${(d.n / maxN) * 60}px` }} />
                      <span className="text-[10px] text-muted-foreground">{d.b} ({d.n})</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setReview(m)}>Review Results</Button>
                  <Button size="sm" disabled={status !== "Ready to Publish"} onClick={() => setConfirm(m)}>Publish Results</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Sheet open={!!review} onOpenChange={(o) => !o && setReview(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {review && (
            <>
              <SheetHeader><SheetTitle>{review.name}</SheetTitle><SheetDescription>Full results list</SheetDescription></SheetHeader>
              <div className="px-4 pb-6">
                <Table>
                  <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Weighted</TableHead><TableHead>Grade</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {moduleGrades.filter((g) => g.moduleId === review.id).map((g) => (
                      <TableRow key={g.studentId}>
                        <TableCell>{studentName(g.studentId)}</TableCell>
                        <TableCell>{g.specialCode ?? g.weightedTotal}</TableCell>
                        <TableCell className="font-semibold">{g.grade}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="Publish results?"
        description="Once published, all students will be notified and can view their grades. This cannot be undone."
        confirmLabel="Publish"
        onConfirm={() => { if (confirm) { publishResults(confirm.id); toast.success("Results published. Students notified."); setPublished(`${confirm.code} — ${confirm.name}`); } setConfirm(null); }}
      />

      <InfoDialog
        open={!!published}
        onOpenChange={(o) => !o && setPublished(null)}
        title="Results published"
        description={<>Results published for <strong>{published}</strong>. All <strong>students</strong> in the module have been notified and can now view their grades, updated GPA and transcript.</>}
      />
    </div>
  );
}
