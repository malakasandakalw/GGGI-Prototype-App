"use client";

import Link from "next/link";
import { BookOpen, CheckCircle, Award, TrendingUp, Globe } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store/provider";

export default function OLDashboard() {
  const { currentUser, olCourses, olEnrollments, users } = useStore();
  const mine = olEnrollments.filter((e) => e.studentId === currentUser?.id);
  const inProgress = mine.filter((e) => e.completionPercentage < 100);
  const completed = mine.filter((e) => e.completionPercentage >= 100);
  const certs = mine.filter((e) => e.certificateIssued).length;
  const lecturerName = (id: string) => users.find((u) => u.id === id)?.name ?? "—";
  const recommendations = olCourses.filter((c) => c.status === "published" && !mine.some((e) => e.courseId === c.id)).slice(0, 3);

  return (
    <div>
      <PageHeader title={`Welcome back, ${currentUser?.name}`} description="Continue your learning journey." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Courses Enrolled" value={mine.length} icon={BookOpen} />
        <StatCard title="Completed" value={completed.length} icon={CheckCircle} variant="success" />
        <StatCard title="Certificates" value={certs} icon={Award} variant="success" />
        <StatCard title="Lessons This Week" value={3} icon={TrendingUp} />
      </div>

      <h3 className="font-semibold mt-6 mb-3">Continue Learning</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {inProgress.map((e) => {
          const c = olCourses.find((x) => x.id === e.courseId);
          if (!c) return null;
          return (
            <Card key={e.courseId} className="overflow-hidden p-0">
              <div className="h-20 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white/80 text-xs font-medium">{c.category}</div>
              <CardContent className="p-4 space-y-2">
                <p className="font-semibold leading-tight">{c.title}</p>
                <p className="text-xs text-muted-foreground">{lecturerName(c.lecturerId)}</p>
                <Progress value={e.completionPercentage} />
                <p className="text-xs text-muted-foreground">{e.completionPercentage}% complete</p>
                <Button asChild size="sm" className="w-full"><Link href={`/ol-student/courses/${c.id}`}>Continue</Link></Button>
              </CardContent>
            </Card>
          );
        })}
        {inProgress.length === 0 && <p className="text-sm text-muted-foreground">No courses in progress. Browse the catalog to start.</p>}
      </div>

      {completed.length > 0 && (
        <>
          <h3 className="font-semibold mt-6 mb-3">Completed Courses</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {completed.map((e) => {
              const c = olCourses.find((x) => x.id === e.courseId);
              if (!c) return null;
              return (
                <Card key={e.courseId}><CardContent className="pt-6 space-y-2">
                  <div className="flex items-center justify-between"><p className="font-semibold">{c.title}</p><Badge className="bg-emerald-100 text-emerald-800" variant="ghost">Completed</Badge></div>
                  <Button asChild size="sm" variant="outline" className="w-full"><Link href="/ol-student/certificates">View Certificate</Link></Button>
                </CardContent></Card>
              );
            })}
          </div>
        </>
      )}

      <h3 className="font-semibold mt-6 mb-3 flex items-center gap-2"><Globe className="size-4" /> You Might Like</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((c) => (
          <Card key={c.id}><CardContent className="pt-6 space-y-2">
            <Badge variant="secondary" className="text-[10px]">{c.category}</Badge>
            <p className="font-semibold">{c.title}</p>
            <Button asChild size="sm" variant="outline" className="w-full"><Link href={`/ol-student/catalog/${c.id}`}>View Course</Link></Button>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}
