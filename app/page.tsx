"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck, Users, ClipboardList, GraduationCap, BookOpen, User, Globe,
  CheckCircle2, Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store/provider";
import { navConfig } from "@/lib/nav-config";
import type { Role } from "@/lib/types";

const roleCards: {
  role: Role; title: string; desc: string; icon: typeof Users; chip: string; accent?: boolean;
}[] = [
    { role: "super-admin", title: "Super Admin", desc: "System-wide administration & settings", icon: ShieldCheck, chip: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300" },
    { role: "program-admin", title: "Program Admin", desc: "Oversee programs & approvals", icon: Users, chip: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300" },
    { role: "registrar", title: "Registrar", desc: "Applications, enrollment & payments", icon: ClipboardList, chip: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" },
    { role: "hod", title: "Head of Department", desc: "Programs, verification & results", icon: GraduationCap, chip: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" },
    { role: "lecturer", title: "Lecturer", desc: "Lectures, assignments & grading", icon: BookOpen, chip: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300" },
    { role: "cohort-student", title: "Cohort Student", desc: "Learn, submit & track progress", icon: User, chip: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300" },
    { role: "ol-student", title: "Open Learning Student", desc: "Browse & complete open courses", icon: Globe, chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300", accent: true },
  ];

const features = [
  "Role-based dashboards for every kind of user",
  "Cohort programs and open, self-paced learning",
  "Live grades, attendance, payments & approvals",
];

export default function LoginPage() {
  const { login } = useStore();
  const router = useRouter();

  function go(role: Role) {
    login(role);
    router.push(navConfig[role][0].href);
  }

  return (
    <div className="min-h-screen grid">

      {/* Right role selector */}
      <div className="hero-glow p-8 lg:p-14 flex flex-col justify-center">
        {/* Mobile-only brand line */}
        <div className="flex items-center gap-2.5 mb-8 lg:hidden">
          <div className="size-9 rounded-xl bg-linear-to-br from-primary to-[color-mix(in_oklch,var(--primary),#000_22%)] text-primary-foreground flex items-center justify-center shadow-sm">
            <GraduationCap className="size-5" />
          </div>
          <span className="font-heading font-semibold tracking-tight">University LMS</span>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Select a role to continue</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Choose how you want to explore the system.
          </p>
        </div>

        <div className="grid sm:grid-cols-4 gap-3">
          {roleCards.map((c) => {
            const Icon = c.icon;
            return (
              <Card
                key={c.role}
                className="p-5 flex flex-col gap-4 transition-colors hover:border-primary/40"
              >
                <div className="flex items-center gap-3">
                  <div className={`size-10 rounded-xl flex items-center justify-center ${c.chip}`}>
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm leading-tight">{c.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.desc}</p>
                  </div>
                </div>
                <Button variant={c.accent ? "default" : "secondary"} onClick={() => go(c.role)}>
                  Log in as {c.title}
                </Button>
                {c.role === "ol-student" && (
                  <Button asChild variant="ghost" size="sm" className="text-emerald-700 dark:text-emerald-400">
                    <Link href="/register">Or sign up free →</Link>
                  </Button>
                )}
              </Card>
            );
          })}
        </div>

        <div className="mt-6 text-sm text-muted-foreground flex flex-wrap gap-x-6 gap-y-1">
          <span>Prospective student?{" "}
            <Link href="/apply" className="text-primary font-medium hover:underline">Apply for admission →</Link>
          </span>
          <span>New to Open Learning?{" "}
            <Link href="/register" className="text-emerald-700 dark:text-emerald-400 font-medium hover:underline">Sign up free →</Link>
          </span>
        </div>
      </div>
    </div>
  );
}
