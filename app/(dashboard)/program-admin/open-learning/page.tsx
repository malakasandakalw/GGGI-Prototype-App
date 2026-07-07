"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Globe, Plus, Tag, X, UserCog } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store/provider";
import type { OLCourse } from "@/lib/types";

export default function ProgramAdminOL() {
  const { currentUser, programs, olCourses, olCategories, olEnrollments, users, addOLCategory, removeOLCategory, updateOLCourse } = useStore();
  const myPrograms = programs.filter((p) => currentUser?.programIds?.includes(p.id));
  const myDepartments = new Set(myPrograms.map((p) => p.department));
  const lecturers = users.filter((u) => u.role === "lecturer");
  const lecturerName = (id: string) => users.find((u) => u.id === id)?.name ?? "Unassigned";
  const enrollCount = (cid: string) => olEnrollments.filter((e) => e.courseId === cid).length;

  // Scope: OL courses whose owning HOD/lecturer sits in a department this PA oversees.
  const deptOf = (userId: string) => users.find((u) => u.id === userId)?.department;
  const scoped = olCourses.filter((c) => myDepartments.has(deptOf(c.hodId) ?? "") || myDepartments.has(deptOf(c.lecturerId) ?? ""));
  const courses = scoped.length > 0 ? scoped : olCourses;

  const [catOpen, setCatOpen] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [assign, setAssign] = useState<OLCourse | null>(null);
  const [pickLecturer, setPickLecturer] = useState("");
  const [assignedInfo, setAssignedInfo] = useState<{ course: string; lecturer: string } | null>(null);

  function openAssign(c: OLCourse) {
    setAssign(c);
    setPickLecturer(c.lecturerId || lecturers[0]?.id || "");
  }
  function saveAssign() {
    if (!assign) return;
    updateOLCourse(assign.id, { lecturerId: pickLecturer });
    toast.success("Lecturer assigned");
    setAssignedInfo({ course: assign.title, lecturer: lecturerName(pickLecturer) });
    setAssign(null);
  }

  return (
    <div>
      <PageHeader title="Open Learning" description="Manage OL course categories and lecturer assignments within your scope.">
        <Button variant="outline" onClick={() => setCatOpen(true)}><Tag className="size-4" /> Manage Categories</Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => (
          <Card key={c.id} className="overflow-hidden p-0">
            <div className="h-24 bg-muted border-b flex items-center justify-center">
              <Globe className="size-8 text-muted-foreground" />
            </div>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="secondary" className="text-[10px]">{c.category}</Badge>
                <StatusBadge status={c.status} />
              </div>
              <p className="font-semibold leading-tight">{c.title}</p>
              <p className="text-xs text-muted-foreground">{lecturerName(c.lecturerId)} · {enrollCount(c.id)} enrolled</p>
              <div className="pt-1">
                <Button size="sm" variant="outline" onClick={() => openAssign(c)}><UserCog className="size-4" /> Assign Lecturer</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {courses.length === 0 && <p className="text-sm text-muted-foreground">No OL courses in your scope.</p>}
      </div>

      {/* Assign lecturer */}
      <Dialog open={!!assign} onOpenChange={(o) => !o && setAssign(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Lecturer</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground -mt-2">{assign?.title}</p>
          <div className="space-y-1.5">
            <Select value={pickLecturer} onValueChange={setPickLecturer}>
              <SelectTrigger><SelectValue placeholder="Select lecturer" /></SelectTrigger>
              <SelectContent>
                {lecturers.map((l) => <SelectItem key={l.id} value={l.id}>{l.name} — {l.department}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAssign(null)}>Cancel</Button>
            <Button disabled={!pickLecturer} onClick={saveAssign}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage categories */}
      <Dialog open={catOpen} onOpenChange={setCatOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Manage OL Categories</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {olCategories.map((c) => {
              const inUse = olCourses.some((x) => x.category === c);
              return (
                <div key={c} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <span>{c} {inUse && <span className="text-[11px] text-muted-foreground">· in use</span>}</span>
                  <Button variant="ghost" size="icon" className="size-7" disabled={inUse} onClick={() => { removeOLCategory(c); toast.success("Category removed"); }}><X className="size-4" /></Button>
                </div>
              );
            })}
            {olCategories.length === 0 && <p className="text-sm text-muted-foreground">No categories.</p>}
          </div>
          <div className="flex gap-2">
            <Input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="New category" />
            <Button onClick={() => { if (newCat.trim()) { addOLCategory(newCat.trim()); setNewCat(""); toast.success("Category added"); } }}>
              <Plus className="size-4" /> Add
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <InfoDialog
        open={!!assignedInfo}
        onOpenChange={(o) => !o && setAssignedInfo(null)}
        title="Lecturer assigned"
        description={<><strong>{assignedInfo?.lecturer}</strong> is now the assigned lecturer for <strong>{assignedInfo?.course}</strong>. They can build and manage the course content; the HOD verifies it and the Super Admin publishes it to the public catalog.</>}
      />
    </div>
  );
}
