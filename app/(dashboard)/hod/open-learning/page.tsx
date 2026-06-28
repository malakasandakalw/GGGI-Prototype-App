"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Globe, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { useStore } from "@/lib/store/provider";
import type { OLCourse } from "@/lib/types";

export default function HODOpenLearning() {
  const { currentUser, olCourses, olCategories, olEnrollments, users, addOLCourse, updateOLCourse } = useStore();
  const lecturers = users.filter((u) => u.role === "lecturer" && u.department === currentUser?.department);
  const [open, setOpen] = useState(false);
  const [manage, setManage] = useState<OLCourse | null>(null);
  const [category, setCategory] = useState(olCategories[0]);
  const [difficulty, setDifficulty] = useState("beginner");
  const [pricing, setPricing] = useState("free");
  const [lecturerId, setLecturerId] = useState(lecturers[0]?.id ?? "");

  const enrollCount = (id: string) => olEnrollments.filter((e) => e.courseId === id).length;

  function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addOLCourse({
      title: String(fd.get("title")),
      description: String(fd.get("description")),
      category, difficulty: difficulty as OLCourse["difficulty"],
      estimatedHours: Number(fd.get("hours")),
      pricing: pricing as OLCourse["pricing"],
      price: pricing === "paid" ? Number(fd.get("price")) : undefined,
      minimumPassScore: Number(fd.get("pass")),
      prerequisitesText: String(fd.get("prereq")),
      lecturerId,
      hodId: currentUser?.id ?? "",
    });
    setOpen(false);
    toast.success("Course created as draft");
  }

  return (
    <div>
      <PageHeader title="Open Learning Courses" description="Create and manage OL courses in your department." action={{ label: "Create Course", icon: Plus, onClick: () => setOpen(true) }} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {olCourses.filter((c) => c.hodId === currentUser?.id || true).map((c) => (
          <Card key={c.id} className="overflow-hidden p-0">
            <div className="h-20 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center"><Globe className="size-7 text-white/80" /></div>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="secondary" className="text-[10px]">{c.category}</Badge>
                <StatusBadge status={c.status} />
              </div>
              <p className="font-semibold leading-tight">{c.title}</p>
              <p className="text-xs text-muted-foreground capitalize">{c.difficulty} · {c.pricing} · {enrollCount(c.id)} enrolled</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <Button size="sm" variant="outline" onClick={() => setManage(c)}>Manage</Button>
                {c.status === "draft" && <Button size="sm" onClick={() => { updateOLCourse(c.id, { status: "published" }); toast.success("Course published"); }}>Publish</Button>}
                {c.status !== "archived" && <Button size="sm" variant="ghost" onClick={() => { updateOLCourse(c.id, { status: "archived" }); toast.success("Archived"); }}>Archive</Button>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create OL Course</DialogTitle></DialogHeader>
          <form onSubmit={create} className="space-y-3">
            <div className="space-y-1.5"><Label className="text-xs">Course Title</Label><Input name="title" required /></div>
            <div className="space-y-1.5"><Label className="text-xs">Description</Label><Textarea name="description" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Category</Label>
                <Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{olCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["beginner", "intermediate", "advanced"].map((d) => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}</SelectContent></Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Estimated Hours</Label><Input name="hours" type="number" defaultValue={10} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Min Pass Score %</Label><Input name="pass" type="number" defaultValue={50} /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Pricing</Label>
              <RadioGroup value={pricing} onValueChange={setPricing} className="flex gap-4">
                <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="free" /> Free</label>
                <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="paid" /> Paid</label>
              </RadioGroup>
            </div>
            {pricing === "paid" && <div className="space-y-1.5"><Label className="text-xs">Price (LKR)</Label><Input name="price" type="number" defaultValue={5000} /></div>}
            <div className="space-y-1.5"><Label className="text-xs">Prerequisites</Label><Textarea name="prereq" /></div>
            <div className="space-y-1.5"><Label className="text-xs">Assign Lecturer</Label>
              <Select value={lecturerId} onValueChange={setLecturerId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{lecturers.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent></Select>
            </div>
            <DialogFooter><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Create Course</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Sheet open={!!manage} onOpenChange={(o) => !o && setManage(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {manage && (
            <>
              <SheetHeader><SheetTitle>{manage.title}</SheetTitle><SheetDescription>Course content — sections &amp; lessons</SheetDescription></SheetHeader>
              <div className="px-4 pb-6 space-y-4">
                {manage.sections.length === 0 && <p className="text-sm text-muted-foreground">No sections yet.</p>}
                {manage.sections.map((s) => (
                  <div key={s.id} className="rounded-lg border p-3">
                    <p className="font-medium text-sm">{s.title}</p>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {s.lessons.map((l) => <li key={l.id} className="flex items-center justify-between"><span>{l.title}</span>{l.isSequential && <Badge variant="outline" className="text-[10px]">Sequential</Badge>}</li>)}
                    </ul>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={() => toast.info("Section editor — simulated")}><Plus className="size-4" /> Add Section</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
