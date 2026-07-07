"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Globe, Star } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store/provider";
import type { OLCourse } from "@/lib/types";

export default function CohortExplore() {
  const { currentUser, olCourses, olEnrollments, enrollOL, addCrossEnrollment } = useStore();
  const published = olCourses.filter((c) => c.status === "published");
  const myEnrollments = olEnrollments.filter((e) => e.studentId === currentUser?.id);
  const [payCourse, setPayCourse] = useState<OLCourse | null>(null);
  const [info, setInfo] = useState<{ title: string; description: React.ReactNode } | null>(null);

  const isEnrolled = (cid: string) => myEnrollments.some((e) => e.courseId === cid);

  function enroll(c: OLCourse) {
    if (c.pricing === "free") {
      enrollOL(currentUser!.id, c.id);
      toast.success("Enrolled! Happy learning.");
      setInfo({
        title: "You're enrolled",
        description: <><strong>{c.title}</strong> is now in <em>My OL Courses</em> and you can start immediately. Open Learning progress is tracked separately from your Cohort GPA.</>,
      });
    } else setPayCourse(c);
  }
  function requestPaid() {
    if (!payCourse) return;
    const title = payCourse.title;
    addCrossEnrollment({ studentId: currentUser!.id, studentName: currentUser!.name, type: "cohort-to-ol", targetCourseId: payCourse.id, reason: "Paid OL course enrollment" });
    toast.success("Request sent. The Registrar will contact you shortly.");
    setPayCourse(null);
    setInfo({
      title: "Request sent to the Registrar",
      description: <>Your request for <strong>{title}</strong> has gone to the <strong>Registrar</strong>, who will contact you about payment before granting access. Once confirmed, it appears in <em>My OL Courses</em>. OL courses are tracked separately from your Cohort GPA.</>,
    });
  }

  return (
    <div>
      <PageHeader title="Explore Open Learning" description="Browse and enroll in open learning courses." />
      <Tabs defaultValue="catalog">
        <TabsList>
          <TabsTrigger value="catalog">OL Courses</TabsTrigger>
          <TabsTrigger value="mine">My OL Courses ({myEnrollments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {published.map((c) => (
              <Card key={c.id} className="overflow-hidden p-0">
                <div className="h-24 bg-muted border-b flex items-center justify-center"><Globe className="size-8 text-muted-foreground" /></div>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between"><Badge variant="secondary" className="text-[10px]">{c.category}</Badge><StatusBadge status={c.difficulty} /></div>
                  <p className="font-semibold leading-tight">{c.title}</p>
                  <div className="flex items-center gap-1 text-xs text-amber-500">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-3" fill={i < Math.round(c.rating) ? "currentColor" : "none"} />)}<span className="text-muted-foreground ml-1">{c.estimatedHours}h</span></div>
                  <div className="flex items-center justify-between pt-1">
                    <StatusBadge status={c.pricing} />
                    {isEnrolled(c.id)
                      ? <Button asChild size="sm" variant="outline"><Link href={`/cohort-student/explore/${c.id}`}>Continue</Link></Button>
                      : <Button size="sm" onClick={() => enroll(c)}>{c.pricing === "free" ? "Enroll" : "Request"}</Button>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mine">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myEnrollments.map((e) => {
              const c = olCourses.find((x) => x.id === e.courseId);
              if (!c) return null;
              return (
                <Card key={e.courseId}><CardContent className="pt-6 space-y-3">
                  <p className="font-semibold">{c.title}</p>
                  <Progress value={e.completionPercentage} />
                  <p className="text-xs text-muted-foreground">{e.completionPercentage}% complete</p>
                  <Button asChild size="sm" className="w-full"><Link href={`/cohort-student/explore/${c.id}`}>{e.completionPercentage > 0 ? "Continue" : "Start Course"}</Link></Button>
                </CardContent></Card>
              );
            })}
            {myEnrollments.length === 0 && <p className="text-sm text-muted-foreground">No OL courses yet.</p>}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!payCourse} onOpenChange={(o) => !o && setPayCourse(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Paid Course</DialogTitle><DialogDescription>This is a paid course (LKR {payCourse?.price?.toLocaleString()}). Confirm to send an enrollment request — our team will contact you with payment details.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="ghost" onClick={() => setPayCourse(null)}>Cancel</Button><Button onClick={requestPaid}>Confirm Request</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <InfoDialog open={!!info} onOpenChange={(o) => !o && setInfo(null)} title={info?.title ?? ""} description={info?.description} />
    </div>
  );
}
