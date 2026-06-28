"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Globe, Plus, Tag } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function SuperAdminOL() {
  const { olCourses, olCategories, olEnrollments, users, addOLCategory, updateOLCourse } = useStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [catOpen, setCatOpen] = useState(false);
  const [newCat, setNewCat] = useState("");

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
            <div className="h-24 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Globe className="size-8 text-white/80" />
            </div>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="secondary" className="text-[10px]">{c.category}</Badge>
                <StatusBadge status={c.status} />
              </div>
              <p className="font-semibold leading-tight">{c.title}</p>
              <p className="text-xs text-muted-foreground">{lecturerName(c.lecturerId)} · {enrollCount(c.id)} enrolled</p>
              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="outline" onClick={() => toast.info(`Viewing ${c.title}`)}>View</Button>
                {c.status !== "archived" && (
                  <Button size="sm" variant="ghost" onClick={() => { updateOLCourse(c.id, { status: "archived" }); toast.success("Course archived"); }}>Archive</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={catOpen} onOpenChange={setCatOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Manage Categories</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {olCategories.map((c) => (
              <div key={c} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                <span>{c}</span>
              </div>
            ))}
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
    </div>
  );
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
