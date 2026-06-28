"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Award, Download, Link2, Copy } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store/provider";

export default function OLCertificates() {
  const { currentUser, olCourses, olEnrollments } = useStore();
  const mine = olEnrollments.filter((e) => e.studentId === currentUser?.id);
  const earned = mine.filter((e) => e.certificateIssued);
  const inProgress = mine.filter((e) => !e.certificateIssued);
  const [verify, setVerify] = useState<string | null>(null);

  const courseTitle = (id: string) => olCourses.find((c) => c.id === id)?.title ?? "—";

  return (
    <div>
      <PageHeader title="Certificates" description="Your earned certificates." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {earned.map((e) => (
          <Card key={e.courseId}><CardContent className="pt-6 space-y-3 text-center">
            <Award className="size-10 text-amber-500 mx-auto" />
            <p className="font-semibold">{courseTitle(e.courseId)}</p>
            <p className="text-xs text-muted-foreground">Certificate ID: {e.certificateId}</p>
            <div className="flex flex-col gap-2">
              <Button size="sm" variant="outline" onClick={() => toast.success("Certificate PDF download simulated.")}><Download className="size-4" /> Download (Mock)</Button>
              <Button size="sm" variant="ghost" onClick={() => setVerify(e.certificateId!)}><Link2 className="size-4" /> Verification URL</Button>
            </div>
          </CardContent></Card>
        ))}
        {inProgress.map((e) => (
          <Card key={e.courseId} className="opacity-70"><CardContent className="pt-6 space-y-2 text-center">
            <Award className="size-10 text-muted-foreground mx-auto" />
            <p className="font-semibold">{courseTitle(e.courseId)}</p>
            <p className="text-xs text-muted-foreground">Course in Progress — Certificate pending ({100 - e.completionPercentage}% remaining)</p>
          </CardContent></Card>
        ))}
        {mine.length === 0 && <p className="text-sm text-muted-foreground">No courses yet.</p>}
      </div>

      <Dialog open={!!verify} onOpenChange={(o) => !o && setVerify(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Certificate Verification</DialogTitle></DialogHeader>
          <div className="flex gap-2">
            <Input readOnly value={`https://lms.institution.ac.lk/verify/${verify}`} className="font-mono text-xs" />
            <Button variant="outline" size="icon" onClick={() => toast.success("Copied")}><Copy className="size-4" /></Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
