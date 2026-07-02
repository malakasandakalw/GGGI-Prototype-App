"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe, Mail, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store/provider";

type Step = "form" | "verify" | "done";

export default function RegisterPage() {
  const { addUser, login } = useStore();
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  function submitForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setName(String(fd.get("name")));
    setEmail(String(fd.get("email")));
    setStep("verify");
  }

  function verify() {
    // Simulated email verification — create the OL account and enter the platform.
    addUser({ name, email, role: "ol-student" });
    setStep("done");
  }

  function enter() {
    login("ol-student");
    router.push("/ol-student/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
      <Card className="max-w-md w-full">
        {step === "form" && (
          <>
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="size-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center"><Globe className="size-5" /></span>
                <div><CardTitle>Create your Open Learning account</CardTitle><p className="text-xs text-muted-foreground mt-0.5">Open registration — no institutional approval needed.</p></div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitForm} className="space-y-3">
                <div className="space-y-1.5"><Label className="text-xs">Full Name</Label><Input name="name" required /></div>
                <div className="space-y-1.5"><Label className="text-xs">Email</Label><Input name="email" type="email" required /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label className="text-xs">Date of Birth</Label><Input name="dob" type="date" /></div>
                  <div className="space-y-1.5"><Label className="text-xs">Password</Label><Input name="password" type="password" required /></div>
                </div>
                <Button type="submit" className="w-full">Create Account</Button>
              </form>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Already have an account? <Link href="/" className="text-primary font-medium hover:underline">Log in</Link>
              </p>
            </CardContent>
          </>
        )}

        {step === "verify" && (
          <CardContent className="pt-8 pb-8 flex flex-col items-center gap-3 text-center">
            <Mail className="size-12 text-emerald-500" />
            <h1 className="text-xl font-bold">Verify your email</h1>
            <p className="text-sm text-muted-foreground">We sent a verification link to <span className="font-medium">{email}</span>. (Email delivery is simulated for this prototype.)</p>
            <Button className="w-full mt-2" onClick={verify}>Click to verify (simulated)</Button>
          </CardContent>
        )}

        {step === "done" && (
          <CardContent className="pt-8 pb-8 flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="size-14 text-emerald-500" />
            <h1 className="text-2xl font-bold">Welcome, {name.split(" ")[0]}!</h1>
            <p className="text-sm text-muted-foreground">Your Open Learning account is ready. You can browse the catalog and enroll in courses instantly — no approval needed for free courses.</p>
            <Button className="w-full mt-2" onClick={enter}>Start Learning</Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
