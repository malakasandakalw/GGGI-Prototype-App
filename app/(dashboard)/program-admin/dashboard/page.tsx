"use client";

import Link from "next/link";
import { BookMarked, Users, Layers, FileClock, Calendar } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store/provider";
import { formatDate, relativeTime } from "@/lib/utils/date";

export default function ProgramAdminDashboard() {
  const { currentUser, programs, users, modules, auditEvents, calendarEvents } = useStore();
  const myPrograms = programs.filter((p) => currentUser?.programIds?.includes(p.id));
  const students = users.filter((u) => u.role === "cohort-student" && myPrograms.some((p) => p.id === u.programId));
  const pendingModules = modules.filter((m) => m.status === "draft").length;
  const pendingReview = myPrograms.filter((p) => p.status === "submitted").length;
  const upcoming = [...calendarEvents].sort((a, b) => a.date.localeCompare(b.date)).filter((e) => e.date >= "2026-06-28").slice(0, 5);

  return (
    <div>
      <PageHeader title="Program Admin Dashboard" description="Oversight across your programs and departments." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Programs Managed" value={myPrograms.length} icon={BookMarked} />
        <StatCard title="Total Students" value={students.length} icon={Users} />
        <StatCard title="Modules Awaiting Activation" value={pendingModules} icon={Layers} variant="warning" />
        <StatCard title="Pending HOD Reviews" value={pendingReview} icon={FileClock} variant={pendingReview > 0 ? "warning" : "default"} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 mt-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Program Status Overview</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {myPrograms.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm border-b last:border-0 pb-2 last:pb-0">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.department}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={p.status} />
                  <Link href="/program-admin/programs" className="text-primary text-xs hover:underline">Review</Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
          <CardContent className="space-y-3 max-h-[280px] overflow-y-auto">
            {auditEvents.slice(0, 8).map((e) => (
              <div key={e.id} className="flex items-start gap-3 text-sm">
                <div className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div><p>{e.details}</p><p className="text-xs text-muted-foreground">{relativeTime(e.timestamp)}</p></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Calendar className="size-4" /> Upcoming Academic Events</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {upcoming.map((e) => (
            <Link key={e.id} href="/program-admin/calendar" className="rounded-lg border p-3 hover:bg-muted transition-colors">
              <p className="text-xs text-muted-foreground">{formatDate(e.date)}</p>
              <p className="text-sm font-medium leading-tight mt-1">{e.title}</p>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
