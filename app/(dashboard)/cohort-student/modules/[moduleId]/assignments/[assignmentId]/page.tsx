"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Upload } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useStore } from "@/lib/store/provider";
import { formatDateTime, daysUntil } from "@/lib/utils/date";

export default function CohortAssignment() {
  const { moduleId, assignmentId } = useParams<{ moduleId: string; assignmentId: string }>();
  const router = useRouter();
  const { currentUser, assignments, submissions, upsertSubmission } = useStore();
  const assignment = assignments.find((a) => a.id === assignmentId);
  const sub = submissions.find((s) => s.assignmentId === assignmentId && s.studentId === currentUser?.id);
  const [text, setText] = useState(sub?.textContent ?? "");
  const [fileName, setFileName] = useState(sub?.fileName ?? "");
  const [info, setInfo] = useState(false);

  if (!assignment) return <div className="p-8">Assignment not found.</div>;
  const days = daysUntil(assignment.dueDate);
  const closed = days < 0;

  function submit() {
    const isNew = !sub;
    upsertSubmission({
      assignmentId: assignment!.id,
      studentId: currentUser!.id,
      textContent: text || undefined,
      fileName: fileName || undefined,
      fileUrl: fileName ? "#" : undefined,
      gradingStatus: "submitted",
      submittedAt: new Date().toISOString(),
    });
    toast.success(isNew ? "Assignment submitted successfully." : "Submission updated.");
    if (isNew) setInfo(true);
  }

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-2" onClick={() => router.push(`/cohort-student/modules/${moduleId}`)}><ArrowLeft className="size-4" /> Back to module</Button>
      <PageHeader title={assignment.title} description={`Max ${assignment.maxMarks} marks`} />

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Instructions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">{assignment.description}</p>
            <p className="text-xs text-muted-foreground">Due: {formatDateTime(assignment.dueDate)}</p>
            {!closed && days <= 1 && <Alert className="bg-amber-50 border-amber-200"><AlertDescription>Due soon — {days <= 0 ? "today" : `in ${days} day`}.</AlertDescription></Alert>}
            {closed && <Alert className="bg-red-50 border-red-200"><AlertDescription>Submission window closed.</AlertDescription></Alert>}

            {sub?.gradingStatus === "graded" ? (
              <Card className="bg-emerald-50 border-emerald-200"><CardContent className="pt-4">
                <p className="font-semibold">Graded: {sub.marks}/{assignment.maxMarks}</p>
                {sub.feedback && <p className="text-sm text-muted-foreground mt-1">Feedback: {sub.feedback}</p>}
              </CardContent></Card>
            ) : !closed ? (
              <div className="space-y-3 border-t pt-4">
                {(assignment.submissionType === "file" || assignment.submissionType === "both") && (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg py-8 cursor-pointer hover:bg-muted/40">
                    <Upload className="size-6 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">{fileName || "Click to upload your file"}</span>
                    <span className="text-[11px] text-muted-foreground mt-1">Allowed: {assignment.allowedFileTypes.join(", ")}</span>
                    <input type="file" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")} />
                  </label>
                )}
                {(assignment.submissionType === "text" || assignment.submissionType === "both") && (
                  <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your answer here..." rows={6} />
                )}
                <p className="text-sm text-muted-foreground">{sub ? `Submitted ${formatDateTime(sub.submittedAt)}${sub.fileName ? ` — ${sub.fileName}` : ""}` : "No submission yet"}</p>
                <Button onClick={submit}>{sub ? "Update Submission" : "Submit Assignment"}</Button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-sm space-y-2">
            <p className="text-muted-foreground">Status</p>
            <Badge variant="secondary">{sub?.gradingStatus === "graded" ? "Graded" : sub ? "Submitted" : "Not Started"}</Badge>
            {sub && <p className="text-xs text-muted-foreground">Submitted {formatDateTime(sub.submittedAt)}</p>}
          </CardContent>
        </Card>
      </div>

      <InfoDialog
        open={info}
        onOpenChange={setInfo}
        title="Assignment submitted"
        description={<>Your <strong>Lecturer</strong> will grade it, and you&apos;ll be notified when your marks and feedback are available. You can update your submission any time before the deadline.</>}
      />
    </div>
  );
}
