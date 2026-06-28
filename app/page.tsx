"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck, Users, ClipboardList, GraduationCap, BookOpen, User, Globe,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store/provider";
import { navConfig } from "@/lib/nav-config";
import type { Role } from "@/lib/types";

const roleCards: { role: Role; title: string; desc: string; icon: typeof Users; accent?: boolean }[] = [
  { role: "super-admin", title: "Super Admin", desc: "System-wide administration & settings", icon: ShieldCheck },
  { role: "program-admin", title: "Program Admin", desc: "Oversee programs & approvals", icon: Users },
  { role: "registrar", title: "Registrar", desc: "Applications, enrollment & payments", icon: ClipboardList },
  { role: "hod", title: "Head of Department", desc: "Programs, verification & results", icon: GraduationCap },
  { role: "lecturer", title: "Lecturer", desc: "Lectures, assignments & grading", icon: BookOpen },
  { role: "cohort-student", title: "Cohort Student", desc: "Learn, submit & track progress", icon: User },
  { role: "ol-student", title: "Open Learning Student", desc: "Browse & complete open courses", icon: Globe, accent: true },
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
      <div className="p-8 lg:p-14 flex flex-col justify-center bg-background">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Select a role to continue</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Choose how you want to explore the system.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {roleCards.map((c) => {
            const Icon = c.icon;
            return (
              <Card key={c.role} className="p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className={`size-9 rounded-lg flex items-center justify-center ${c.accent ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{c.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.desc}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => go(c.role)}>
                  Log in as {c.title}
                </Button>
              </Card>
            );
          })}
        </div>
        <div className="mt-6 text-sm text-muted-foreground">
          Prospective student?{" "}
          <Link href="/apply" className="text-primary font-medium hover:underline">
            Apply for admission →
          </Link>
        </div>
      </div>
    </div>
  );
}
