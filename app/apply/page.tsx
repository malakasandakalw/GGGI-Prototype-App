"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, GraduationCap, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { useStore } from "@/lib/store/provider";

export default function ApplyPage() {
  const { programs, addApplication } = useStore();
  const activePrograms = programs.filter((p) => p.status === "active");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [programId, setProgramId] = useState(activePrograms[0]?.id ?? "");
  const [files, setFiles] = useState<string[]>([]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const app = addApplication({
      applicantName: String(fd.get("name") || "New Applicant"),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      nic: String(fd.get("nic") || ""),
      dateOfBirth: String(fd.get("dob") || ""),
      gender: String(fd.get("gender") || ""),
      address: String(fd.get("address") || ""),
      qualifications: String(fd.get("qualifications") || ""),
      documents: files.length ? files : ["A_L_Certificate.pdf", "NIC_Copy.pdf"],
      programId,
    });
    setSubmitted(app.referenceNumber);
    setInfo(app.referenceNumber);
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8 flex flex-col items-center gap-3">
            <CheckCircle2 className="size-14 text-emerald-500" />
            <h1 className="text-2xl font-bold">Application Submitted</h1>
            <p className="text-muted-foreground text-sm">
              Thank you for applying. Your application has been received and the Registrar&apos;s
              office will be in touch shortly.
            </p>
            <div className="bg-muted rounded-lg px-4 py-3 mt-2">
              <p className="text-xs text-muted-foreground">Your reference number</p>
              <p className="text-lg font-bold tracking-wider">{submitted}</p>
            </div>
            <Button asChild className="mt-3">
              <Link href="/">Return to home</Link>
            </Button>
          </CardContent>
        </Card>
        <InfoDialog
          open={!!info}
          onOpenChange={(o) => !o && setInfo(null)}
          title="Application received"
          description={<>Application received — your reference number is <strong>{info}</strong>. The <strong>Registrar</strong> will review your application and contact you about payment. Once payment is confirmed, your student account is created and login details are emailed to you.</>}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <GraduationCap className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Admission Application</h1>
            <p className="text-sm text-muted-foreground">University LMS — Cohort Programs</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <Field label="Full Name" required><Input name="name" required placeholder="e.g. Nimal Perera" /></Field>
              <Field label="NIC Number" required><Input name="nic" required placeholder="200012345678" /></Field>
              <Field label="Date of Birth" required><Input name="dob" type="date" required /></Field>
              <Field label="Gender">
                <Select name="gender" defaultValue="Male">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Email" required><Input name="email" type="email" required placeholder="you@example.com" /></Field>
              <Field label="Phone" required><Input name="phone" required placeholder="+94 7X XXX XXXX" /></Field>
              <div className="sm:col-span-2">
                <Field label="Address"><Textarea name="address" placeholder="Residential address" /></Field>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Program & Qualifications</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field label="Program Applied For" required>
                <Select value={programId} onValueChange={setProgramId}>
                  <SelectTrigger><SelectValue placeholder="Select a program" /></SelectTrigger>
                  <SelectContent>
                    {activePrograms.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Academic Qualifications" required>
                <Textarea name="qualifications" required placeholder="e.g. A/L 2023 — Maths A, Physics B, Chemistry B" />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Supporting Documents</CardTitle></CardHeader>
            <CardContent>
              <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg py-8 cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="size-6 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Click to upload (A/L certificate, NIC copy…)</span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => setFiles(Array.from(e.target.files ?? []).map((f) => f.name))}
                />
              </label>
              {files.length > 0 && (
                <ul className="mt-3 text-sm space-y-1">
                  {files.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="size-4 text-emerald-500" /> {f}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">
            I declare that the information provided is true and accurate to the best of my knowledge.
          </p>

          <div className="flex justify-between">
            <Button type="button" variant="ghost" asChild><Link href="/">Cancel</Link></Button>
            <Button type="submit">Submit Application</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}{required && <span className="text-destructive"> *</span>}</Label>
      {children}
    </div>
  );
}
