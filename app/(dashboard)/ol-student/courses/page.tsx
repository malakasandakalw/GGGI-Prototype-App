"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/store/provider";
import type { OLCourse, OLEnrollment, User } from "@/lib/types";

function Grid({ rows, olCourses, users }: { rows: OLEnrollment[]; olCourses: OLCourse[]; users: User[] }) {
  const lecturerName = (id: string) => users.find((u) => u.id === id)?.name ?? "—";
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((e) => {
        const c = olCourses.find((x) => x.id === e.courseId);
        if (!c) return null;
        return (
          <Card key={e.courseId} className="overflow-hidden p-0">
            <div className="h-20 bg-muted border-b flex items-center justify-center text-muted-foreground text-xs">{c.category}</div>
            <CardContent className="p-4 space-y-2">
              <p className="font-semibold leading-tight">{c.title}</p>
              <p className="text-xs text-muted-foreground">{lecturerName(c.lecturerId)}</p>
              <Progress value={e.completionPercentage} />
              <p className="text-xs text-muted-foreground">{e.completionPercentage}% complete{e.completionPercentage < 100 ? ` — needs ${c.minimumPassScore}% for certificate` : ""}</p>
              <Button asChild size="sm" className="w-full"><Link href={`/ol-student/courses/${c.id}`}>Continue</Link></Button>
            </CardContent>
          </Card>
        );
      })}
      {rows.length === 0 && <p className="text-sm text-muted-foreground">No courses here.</p>}
    </div>
  );
}

export default function OLMyCourses() {
  const { currentUser, olCourses, olEnrollments, users } = useStore();
  const mine = olEnrollments.filter((e) => e.studentId === currentUser?.id);

  return (
    <div>
      <PageHeader title="My Courses" description="Your enrolled open learning courses." />
      <Tabs defaultValue="progress">
        <TabsList>
          <TabsTrigger value="progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        <TabsContent value="progress"><Grid rows={mine.filter((e) => e.completionPercentage < 100)} olCourses={olCourses} users={users} /></TabsContent>
        <TabsContent value="completed"><Grid rows={mine.filter((e) => e.completionPercentage >= 100)} olCourses={olCourses} users={users} /></TabsContent>
        <TabsContent value="all"><Grid rows={mine} olCourses={olCourses} users={users} /></TabsContent>
      </Tabs>
    </div>
  );
}
