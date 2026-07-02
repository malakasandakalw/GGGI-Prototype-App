"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Award, Link2, Copy, Printer, Eye } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store/provider";
import { formatDate } from "@/lib/utils/date";
import type { OLEnrollment } from "@/lib/types";

export default function OLCertificates() {
  const { currentUser, olCourses, olEnrollments } = useStore();
  const mine = olEnrollments.filter((e) => e.studentId === currentUser?.id);
  const earned = mine.filter((e) => e.certificateIssued);
  const inProgress = mine.filter((e) => !e.certificateIssued);
  const [verify, setVerify] = useState<string | null>(null);
  const [preview, setPreview] = useState<OLEnrollment | null>(null);

  const courseTitle = (id: string) => olCourses.find((c) => c.id === id)?.title ?? "—";
  const verifyUrl = (id?: string) => `https://lms.institution.ac.lk/verify/${id}`;

  function printCertificate(e: OLEnrollment) {
    const w = window.open("", "_blank", "width=900,height=650");
    if (!w) { toast.error("Allow pop-ups to print the certificate."); return; }
    w.document.write(`
      <html><head><title>Certificate ${e.certificateId}</title>
      <style>
        body{font-family:Georgia,serif;margin:0;background:#f8fafc;display:flex;align-items:center;justify-content:center;height:100vh}
        .cert{width:760px;padding:56px;border:10px solid #0d9488;background:#fff;text-align:center}
        .cert h2{letter-spacing:6px;color:#0d9488;font-size:14px;margin:0 0 24px;text-transform:uppercase}
        .cert .name{font-size:38px;margin:20px 0;border-bottom:2px solid #e2e8f0;display:inline-block;padding:0 40px 8px}
        .cert .course{font-size:22px;color:#0f172a;margin:16px 0}
        .cert .meta{color:#64748b;font-size:12px;margin-top:36px}
        @media print{body{background:#fff}}
      </style></head><body>
      <div class="cert">
        <h2>Certificate of Completion</h2>
        <p>This is to certify that</p>
        <div class="name">${currentUser?.name ?? "Student"}</div>
        <p>has successfully completed the course</p>
        <div class="course">${courseTitle(e.courseId)}</div>
        <div class="meta">
          Certificate ID: ${e.certificateId}<br/>
          Issued: ${formatDate(new Date().toISOString())}<br/>
          Verify at ${verifyUrl(e.certificateId)}
        </div>
      </div>
      <script>window.onload=function(){window.print()}</script>
      </body></html>`);
    w.document.close();
  }

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
              <Button size="sm" onClick={() => setPreview(e)}><Eye className="size-4" /> View Certificate</Button>
              <Button size="sm" variant="outline" onClick={() => printCertificate(e)}><Printer className="size-4" /> Print / Save as PDF</Button>
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

      {/* Visual certificate preview (J) */}
      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Certificate Preview</DialogTitle></DialogHeader>
          {preview && (
            <>
              <div className="border-8 border-teal-600 bg-white p-10 text-center">
                <p className="text-xs uppercase tracking-[0.35em] text-teal-700 font-semibold">Certificate of Completion</p>
                <p className="mt-6 text-sm text-muted-foreground">This is to certify that</p>
                <p className="my-3 text-3xl font-serif border-b-2 border-slate-200 inline-block px-8 pb-1">{currentUser?.name}</p>
                <p className="text-sm text-muted-foreground">has successfully completed the course</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{courseTitle(preview.courseId)}</p>
                <div className="mt-8 text-xs text-muted-foreground space-y-0.5">
                  <p>Certificate ID: {preview.certificateId}</p>
                  <p>Issued: {formatDate(new Date().toISOString())}</p>
                  <p>Verify at {verifyUrl(preview.certificateId)}</p>
                </div>
              </div>
              <Button onClick={() => printCertificate(preview)}><Printer className="size-4" /> Print / Save as PDF</Button>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!verify} onOpenChange={(o) => !o && setVerify(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Certificate Verification</DialogTitle></DialogHeader>
          <div className="flex gap-2">
            <Input readOnly value={verifyUrl(verify ?? undefined)} className="font-mono text-xs" />
            <Button variant="outline" size="icon" onClick={() => toast.success("Copied")}><Copy className="size-4" /></Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
