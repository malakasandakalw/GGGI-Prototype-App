"use client";

import Link from "next/link";
import { ClipboardList, CreditCard, UserCheck, ArrowLeftRight, UserCog } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { AcademicYearChip } from "@/components/shared/AcademicYearChip";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store/provider";
import { formatDate } from "@/lib/utils/date";

export default function RegistrarDashboard() {
  const { applications, programs, crossEnrollments, modules, olCourses, clerks } = useStore();
  const activeClerks = clerks.filter((c) => c.status === "active").length;
  const newApps = applications.filter((a) => a.status === "submitted").length;
  const awaitingPay = applications.filter((a) => a.status === "payment-pending").length;
  const enrolled = applications.filter((a) => a.status === "enrolled").length;
  const pendingCE = crossEnrollments.filter((c) => c.status === "pending");

  const programName = (id: string) => programs.find((p) => p.id === id)?.name ?? "—";
  const targetName = (c: typeof crossEnrollments[number]) =>
    c.targetModuleId ? modules.find((m) => m.id === c.targetModuleId)?.name : olCourses.find((o) => o.id === c.targetCourseId)?.title;

  return (
    <div>
      <PageHeader title="Registrar Dashboard" description="Your application and enrollment queues."><AcademicYearChip /></PageHeader>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="New Applications" value={newApps} icon={ClipboardList} variant="warning" />
        <StatCard title="Awaiting Payment" value={awaitingPay} icon={CreditCard} variant="warning" />
        <StatCard title="Enrolled (Total)" value={enrolled} icon={UserCheck} variant="success" />
        <StatCard title="Cross-Enrollments Pending" value={pendingCE.length} icon={ArrowLeftRight} variant="warning" />
      </div>

      <Card className="mt-4">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><UserCog className="size-5" /></div>
            <div>
              <p className="font-medium text-sm">Program Clerks</p>
              <p className="text-xs text-muted-foreground">{activeClerks} active · manage the clerk accounts that handle each program&apos;s applications</p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm"><Link href="/registrar/clerks">Manage Clerks</Link></Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2 mt-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Applications</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {applications.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm border-b last:border-0 pb-2">
                <div>
                  <p className="font-medium">{a.applicantName}</p>
                  <p className="text-xs text-muted-foreground">{programName(a.programId)} · {formatDate(a.submittedAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={a.status} />
                  <Button asChild size="sm" variant="outline"><Link href={`/registrar/applications/${a.id}`}>Review</Link></Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Cross-Enrollment Requests</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {pendingCE.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">No pending requests.</p>}
            {pendingCE.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-sm border-b last:border-0 pb-2">
                <div>
                  <p className="font-medium">{c.studentName}</p>
                  <p className="text-xs text-muted-foreground">{c.type} · {targetName(c)}</p>
                </div>
                <Button asChild size="sm" variant="outline"><Link href="/registrar/cross-enrollment">Action</Link></Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
