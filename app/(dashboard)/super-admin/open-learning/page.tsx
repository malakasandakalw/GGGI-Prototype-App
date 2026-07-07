"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Globe, Plus, Tag, X } from "lucide-react";
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
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { useStore } from "@/lib/store/provider";
import type { OLCourse } from "@/lib/types";

export default function SuperAdminOL() {
  const { olCourses, olCategories, olEnrollments, users, addOLCategory, removeOLCategory, updateOLCourse, addAudit } = useStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [catOpen, setCatOpen] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [view, setView] = useState<OLCourse | null>(null);
  const [publishedInfo, setPublishedInfo] = useState(false);

  const lecturerName = (id: string) => users.find((u) => u.id === id)?.name ?? "Unassigned";
  const enrollCount = (cid: string) => olEnrollments.filter((e) => e.courseId === cid).length;

  const filtered = useMemo(
    () =>
      olCourses.filter(
        (c) =>
          c.title.toLowerCase().includes(search.toLowerCase()) &&
          (category === "all" || c.category === category) &&
          (status === "all" || c.status === status) &&
          (difficulty === "all" || c.difficulty === difficulty),
      ),
    [olCourses, search, category, status, difficulty],
  );

  function publish(c: OLCourse) {
    updateOLCourse(c.id, { status: "published" });
    addAudit({ action: "Content Verified", details: `Approved & published OL course: ${c.title}` });
    toast.success("Course approved & published");
    setView(null);
    setPublishedInfo(true);
  }

  return (
    <div>
      <PageHeader title="Open Learning Catalog" description="System-level view of all open learning courses.">
        <Button variant="outline" onClick={() => setCatOpen(true)}><Tag className="size-4" /> Manage Categories</Button>
      </PageHeader>

      <div className="flex flex-wrap gap-3 mb-5">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courses..." className="max-w-xs" />
        <FilterSelect value={category} onChange={setCategory} all="All Categories" options={olCategories} />
        <FilterSelect value={status} onChange={setStatus} all="All Status" options={["draft", "published", "archived"]} />
        <FilterSelect value={difficulty} onChange={setDifficulty} all="All Levels" options={["beginner", "intermediate", "advanced"]} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
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
              <div className="flex flex-wrap gap-2 pt-1">
                <Button size="sm" variant="outline" onClick={() => setView(c)}>View</Button>
                {c.status === "draft" && <Button size="sm" onClick={() => publish(c)}>Approve &amp; Publish</Button>}
                {c.status !== "archived" && (
                  <Button size="sm" variant="ghost" onClick={() => { updateOLCourse(c.id, { status: "archived" }); toast.success("Course archived"); }}>Archive</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Course detail */}
      <Sheet open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{view?.title}</SheetTitle>
            <SheetDescription>{view?.category} · {view?.difficulty}</SheetDescription>
          </SheetHeader>
          {view && (
            <div className="px-4 space-y-4 text-sm">
              <div className="flex items-center gap-2"><StatusBadge status={view.status} /><StatusBadge status={view.pricing} /><Badge variant="secondary">{view.estimatedHours}h</Badge></div>
              <p className="text-muted-foreground">{view.description}</p>
              <div className="grid grid-cols-2 gap-2">
                <Row label="Lecturer" value={lecturerName(view.lecturerId)} />
                <Row label="Enrolled" value={String(enrollCount(view.id))} />
                <Row label="Pass score" value={`${view.minimumPassScore}%`} />
                <Row label="Sections" value={String(view.sections.length)} />
              </div>
              <div>
                <p className="font-medium mb-2">Content</p>
                <div className="space-y-2">
                  {view.sections.map((s) => (
                    <div key={s.id} className="rounded border p-2">
                      <p className="font-medium text-xs">{s.title}</p>
                      <ul className="mt-1 space-y-0.5">
                        {s.lessons.map((l) => <li key={l.id} className="text-xs text-muted-foreground">• {l.title}</li>)}
                      </ul>
                    </div>
                  ))}
                  {view.sections.length === 0 && <p className="text-xs text-muted-foreground">No content added yet.</p>}
                </div>
              </div>
              {view.status === "draft" && <Button className="w-full" onClick={() => publish(view)}>Approve &amp; Publish</Button>}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Manage Categories */}
      <Dialog open={catOpen} onOpenChange={setCatOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Manage Categories</DialogTitle></DialogHeader>
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
        open={publishedInfo}
        onOpenChange={setPublishedInfo}
        title="Course published"
        description={<>The course is now live in the <strong>Open Learning catalog</strong>. Prospective and enrolled students can discover and enroll in it (free immediately; paid via the Registrar).</>}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex flex-col"><span className="text-xs text-muted-foreground">{label}</span><span className="font-medium">{value}</span></div>;
}

function FilterSelect({ value, onChange, all, options }: { value: string; onChange: (v: string) => void; all: string; options: string[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{all}</SelectItem>
        {options.map((o) => <SelectItem key={o} value={o} className="capitalize">{o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
