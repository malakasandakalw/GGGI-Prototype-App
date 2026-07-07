"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { useStore } from "@/lib/store/provider";

export default function OLCourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const { currentUser, olCourses, olEnrollments, users, enrollOL, addCrossEnrollment } = useStore();
  const course = olCourses.find((c) => c.id === courseId);
  const [payOpen, setPayOpen] = useState(false);
  const [freeInfo, setFreeInfo] = useState(false);
  const [paidInfo, setPaidInfo] = useState(false);

  if (!course) return <div className="p-8">Course not found.</div>;
  const enrolled = olEnrollments.some((e) => e.studentId === currentUser?.id && e.courseId === course.id);
  const lecturer = users.find((u) => u.id === course.lecturerId);

  function enroll() {
    if (course!.pricing === "free") {
      enrollOL(currentUser!.id, course!.id);
      toast.success("Enrolled! Happy learning.");
      setFreeInfo(true);
    } else setPayOpen(true);
  }
  function requestPaid() {
    addCrossEnrollment({ studentId: currentUser!.id, studentName: currentUser!.name, type: "cohort-to-ol", targetCourseId: course!.id, reason: "Paid OL enrollment" });
    setPayOpen(false);
    setPaidInfo(true);
  }

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-2" onClick={() => router.push("/ol-student/catalog")}><ArrowLeft className="size-4" /> Back to catalog</Button>

      <Card className="mb-6 overflow-hidden p-0">
        <div className="bg-muted/40 border-b p-8">
          <div className="flex gap-2 mb-3"><StatusBadge status={course.difficulty} /><StatusBadge status={course.pricing} /></div>
          <h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">{course.description}</p>
          <p className="text-sm text-muted-foreground mt-3">{course.category} · {course.estimatedHours} hours</p>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h3 className="font-semibold mb-2">What You&apos;ll Learn</h3>
            <ul className="space-y-1">
              {course.whatYouLearn.map((w) => <li key={w} className="flex items-start gap-2 text-sm"><CheckCircle2 className="size-4 text-emerald-500 mt-0.5 shrink-0" /> {w}</li>)}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Course Content</h3>
            <Accordion type="single" collapsible>
              {course.sections.map((s) => (
                <AccordionItem key={s.id} value={s.id}>
                  <AccordionTrigger className="text-sm">{s.title} ({s.lessons.length} lessons)</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1 text-sm text-muted-foreground">{s.lessons.map((l) => <li key={l.id}>• {l.title}</li>)}</ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
              {course.sections.length === 0 && <p className="text-sm text-muted-foreground">Content coming soon.</p>}
            </Accordion>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Prerequisites</h3>
            <p className="text-sm text-muted-foreground">{course.prerequisitesText || "None"}</p>
          </div>
        </div>

        <div className="space-y-4">
          <Card><CardContent className="pt-6 space-y-3">
            <p className="text-2xl font-bold">{course.pricing === "free" ? "Free" : `LKR ${course.price?.toLocaleString()}`}</p>
            {enrolled ? <Button asChild className="w-full"><a href={`/ol-student/courses/${course.id}`}>Continue Learning</a></Button> : <Button className="w-full" onClick={enroll}>{course.pricing === "free" ? "Enroll Now" : "Enroll"}</Button>}
          </CardContent></Card>
          <Card><CardContent className="pt-6">
            <p className="text-sm font-medium mb-2">Instructor</p>
            <div className="flex items-center gap-3">
              <Avatar><AvatarFallback>{lecturer?.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}</AvatarFallback></Avatar>
              <div><p className="text-sm font-medium">{lecturer?.name}</p><p className="text-xs text-muted-foreground">Lecturer, Department of {lecturer?.department}</p></div>
            </div>
          </CardContent></Card>
        </div>
      </div>

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Paid Course</DialogTitle><DialogDescription>This is a paid course (LKR {course.price?.toLocaleString()}). Click confirm to send an enrollment request. Our team will contact you with payment details.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="ghost" onClick={() => setPayOpen(false)}>Cancel</Button><Button onClick={requestPaid}>Confirm</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <InfoDialog
        open={freeInfo}
        onOpenChange={(o) => { setFreeInfo(o); if (!o) router.push(`/ol-student/courses/${course.id}`); }}
        title="You're enrolled — it's free"
        description={<>Free Open Learning courses grant <strong>instant access</strong> — no payment or approval needed. Work through the lessons in order, attempt quizzes and assignments, and once you finish you&apos;ll earn a <strong>certificate of completion</strong>. Let&apos;s go to your course.</>}
        actionLabel="Start Learning"
      />

      <InfoDialog
        open={paidInfo}
        onOpenChange={setPaidInfo}
        title="Request sent to the Registrar"
        description={<>Paid courses need a payment step. Your request for <strong>{course.title}</strong> (LKR {course.price?.toLocaleString()}) has been sent to the <strong>Registrar</strong>, who will share payment details. Once payment is confirmed, the course appears under <strong>My Courses</strong> and you can begin.</>}
      />
    </div>
  );
}
