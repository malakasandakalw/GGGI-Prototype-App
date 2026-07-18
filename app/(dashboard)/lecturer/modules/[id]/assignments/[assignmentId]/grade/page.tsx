"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store/provider";
import { formatDateTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils";
import { studentsInModule } from "@/lib/utils/student-access";

export default function GradeAssignment() {
  const { id, assignmentId } = useParams<{ id: string; assignmentId: string }>();
  const router = useRouter();
  const { assignments, submissions, programs, users, upsertSubmission, addNotification } = useStore();
  const assignment = assignments.find((a) => a.id === assignmentId);
  // Grade list by enrollment — includes cross-enrolled Open Learning students.
  const enrolled = studentsInModule(users, programs, id);
  const [selectedId, setSelectedId] = useState<string>(enrolled[0]?.id ?? "");
  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");
  const [gradedInfo, setGradedInfo] = useState(false);

  const subFor = (sid: string) => submissions.find((s) => s.assignmentId === assignmentId && s.studentId === sid);
  const graded = enrolled.filter((s) => subFor(s.id)?.gradingStatus === "graded");
  const gradedMarks = graded.map((s) => subFor(s.id)!.marks ?? 0);
  const avg = gradedMarks.length ? Math.round(gradedMarks.reduce((a, b) => a + b, 0) / gradedMarks.length) : 0;

  const selectedSub = subFor(selectedId);
  const selectedStudent = enrolled.find((s) => s.id === selectedId);

  function selectStudent(sid: string) {
    setSelectedId(sid);
    const sub = submissions.find((s) => s.assignmentId === assignmentId && s.studentId === sid);
    setMarks(sub?.marks?.toString() ?? "");
    setFeedback(sub?.feedback ?? "");
  }

  if (!assignment) return <div className="p-8">Assignment not found.</div>;

  function save(finalise: boolean) {
    upsertSubmission({
      assignmentId: assignment!.id,
      studentId: selectedId,
      marks: Number(marks),
      feedback,
      gradingStatus: finalise ? "graded" : "submitted",
      submittedAt: selectedSub?.submittedAt ?? new Date().toISOString(),
    });
    if (finalise) {
      addNotification({ recipientId: selectedId, title: "Assignment graded", body: `${assignment!.title}: ${marks}/${assignment!.maxMarks}`, type: "grade", linkTo: "/cohort-student/grades" });
      toast.success("Grade posted. Student notified (simulated).");
      setGradedInfo(true);
    } else toast.success("Draft saved");
  }

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-2" onClick={() => router.push(`/lecturer/modules/${id}`)}><ArrowLeft className="size-4" /> Back to module</Button>
      <PageHeader title={`Grade: ${assignment.title}`} description={`Max ${assignment.maxMarks} marks · ${graded.length}/${enrolled.length} graded · Class avg ${avg}`} />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          {enrolled.map((s) => {
            const sub = subFor(s.id);
            const status = sub?.gradingStatus ?? "not-submitted";
            return (
              <button key={s.id} onClick={() => selectStudent(s.id)} className={cn("w-full text-left rounded-lg border p-3 hover:bg-muted", selectedId === s.id && "border-primary bg-primary/5")}>
                <div className="flex items-center justify-between"><p className="font-medium text-sm">{s.name}</p><StatusBadge status={status} /></div>
                <p className="text-xs text-muted-foreground">{sub ? formatDateTime(sub.submittedAt) : "No submission"}</p>
              </button>
            );
          })}
        </div>

        <Card className="lg:col-span-2"><CardContent className="pt-6 space-y-4">
          {selectedStudent && (
            <>
              <div className="flex items-center justify-between">
                <div><p className="font-semibold">{selectedStudent.name}</p><p className="text-xs text-muted-foreground">{selectedStudent.studentId}</p></div>
                {!selectedSub && <Badge variant="destructive">Not Submitted</Badge>}
              </div>
              {selectedSub ? (
                <>
                  <p className="text-sm text-muted-foreground">Submitted {formatDateTime(selectedSub.submittedAt)}</p>
                  {selectedSub.fileName && <Button variant="outline" size="sm" onClick={() => toast.info("Download simulated.")}>Download Submission (Mock) — {selectedSub.fileName}</Button>}
                  {selectedSub.textContent && <Card className="bg-muted"><CardContent className="pt-4 text-sm max-h-40 overflow-y-auto">{selectedSub.textContent}</CardContent></Card>}
                </>
              ) : <p className="text-sm text-muted-foreground">This student has not submitted. You may record a zero.</p>}

              <div className="space-y-1.5"><Label className="text-xs">Marks (out of {assignment.maxMarks})</Label><Input type="number" value={marks} onChange={(e) => setMarks(e.target.value)} placeholder={selectedSub ? "" : "0"} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Feedback</Label><Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Optional feedback to student..." /></div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => save(false)}>Save Draft</Button>
                <Button onClick={() => save(true)}>Finalise Grade</Button>
              </div>
            </>
          )}
        </CardContent></Card>
      </div>

      <InfoDialog
        open={gradedInfo}
        onOpenChange={setGradedInfo}
        title="Grade posted"
        description={<>Grade posted. The <strong>student</strong> has been notified and can now view their marks and feedback. The mark feeds their module CA total.</>}
      />
    </div>
  );
}
