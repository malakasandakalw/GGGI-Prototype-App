"use client";

import Link from "next/link";
import { Users, BookMarked, ClipboardList, Globe, GraduationCap, UserCheck, CheckCircle, ArrowLeftRight } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store/provider";
import { relativeTime } from "@/lib/utils/date";

export default function SuperAdminDashboard() {
  const { users, programs, applications, olCourses, lectures, crossEnrollments, auditEvents } = useStore();
  const openApps = applications.filter((a) => !["enrolled", "rejected"].includes(a.status)).length;

  return (
    <div>
      <PageHeader title="System Overview" description="Institution-wide health and activity at a glance." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={users.length} icon={Users} />
        <StatCard title="Active Programs" value={programs.filter((p) => p.status === "active").length} icon={BookMarked} variant="success" />
        <StatCard title="Open Applications" value={openApps} icon={ClipboardList} variant={openApps > 0 ? "warning" : "default"} />
        <StatCard title="OL Courses Published" value={olCourses.filter((c) => c.status === "published").length} icon={Globe} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
        <StatCard title="Cohort Students" value={users.filter((u) => u.role === "cohort-student").length} icon={GraduationCap} />
        <StatCard title="OL Students" value={users.filter((u) => u.role === "ol-student").length} icon={UserCheck} />
        <StatCard title="Lectures Pending Verification" value={lectures.filter((l) => l.status === "submitted").length} icon={CheckCircle} variant="warning" />
        <StatCard title="Cross-Enrollments Pending" value={crossEnrollments.filter((c) => c.status === "pending").length} icon={ArrowLeftRight} variant="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3 mt-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
          <CardContent className="space-y-3 max-h-[420px] overflow-y-auto">
            {auditEvents.slice(0, 10).map((e) => (
              <div key={e.id} className="flex items-start gap-3 text-sm">
                <div className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="min-w-0">
                  <p><span className="font-medium">{e.action}</span> — {e.details}</p>
                  <p className="text-xs text-muted-foreground">{e.userName} · {relativeTime(e.timestamp)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button asChild variant="outline" className="justify-start"><Link href="/super-admin/users">Create Program Admin Account</Link></Button>
            <Button asChild variant="outline" className="justify-start"><Link href="/super-admin/programs">Activate Pending Program</Link></Button>
            <Button asChild variant="outline" className="justify-start"><Link href="/super-admin/reports">View Reports</Link></Button>
            <Button asChild variant="outline" className="justify-start"><Link href="/super-admin/announcements">Post Announcement</Link></Button>
            <Button asChild variant="outline" className="justify-start"><Link href="/super-admin/audit-log">View Audit Log</Link></Button>
            <Button asChild variant="outline" className="justify-start"><Link href="/super-admin/settings">System Settings</Link></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
