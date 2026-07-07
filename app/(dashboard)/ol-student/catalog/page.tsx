"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Globe, Star } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useStore } from "@/lib/store/provider";

export default function OLCatalog() {
  const { olCourses, olCategories } = useStore();
  const published = olCourses.filter((c) => c.status === "published");
  const [search, setSearch] = useState("");
  const [cats, setCats] = useState<string[]>([]);
  const [diffs, setDiffs] = useState<string[]>([]);
  const [pricing, setPricing] = useState("all");

  function toggle(arr: string[], v: string, set: (a: string[]) => void) {
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  }

  const filtered = useMemo(() => published.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) &&
    (cats.length === 0 || cats.includes(c.category)) &&
    (diffs.length === 0 || diffs.includes(c.difficulty)) &&
    (pricing === "all" || c.pricing === pricing),
  ), [published, search, cats, diffs, pricing]);

  return (
    <div>
      <PageHeader title="Course Catalog" description="Discover open learning courses." />
      <div className="grid lg:grid-cols-4 gap-6">
        <Card className="h-fit"><CardContent className="pt-6 space-y-4">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courses..." />
          <div>
            <p className="text-xs font-medium mb-2">Category</p>
            {olCategories.map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm py-0.5"><Checkbox checked={cats.includes(c)} onCheckedChange={() => toggle(cats, c, setCats)} /> {c}</label>
            ))}
          </div>
          <div>
            <p className="text-xs font-medium mb-2">Difficulty</p>
            {["beginner", "intermediate", "advanced"].map((d) => (
              <label key={d} className="flex items-center gap-2 text-sm py-0.5 capitalize"><Checkbox checked={diffs.includes(d)} onCheckedChange={() => toggle(diffs, d, setDiffs)} /> {d}</label>
            ))}
          </div>
          <div>
            <p className="text-xs font-medium mb-2">Pricing</p>
            <RadioGroup value={pricing} onValueChange={setPricing}>
              {["all", "free", "paid"].map((p) => <label key={p} className="flex items-center gap-2 text-sm py-0.5 capitalize"><RadioGroupItem value={p} /> {p === "all" ? "All" : p}</label>)}
            </RadioGroup>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={() => { setSearch(""); setCats([]); setDiffs([]); setPricing("all"); }}>Clear Filters</Button>
        </CardContent></Card>

        <div className="lg:col-span-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <Card key={c.id} className="overflow-hidden p-0 hover:shadow-md transition-shadow">
              <div className="h-24 bg-muted border-b flex items-center justify-center"><Globe className="size-8 text-muted-foreground" /></div>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between"><StatusBadge status={c.difficulty} /><StatusBadge status={c.pricing} /></div>
                <p className="font-semibold leading-tight">{c.title}</p>
                <p className="text-xs text-muted-foreground">{c.category}</p>
                <div className="flex items-center gap-1 text-xs text-amber-500">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-3" fill={i < Math.round(c.rating) ? "currentColor" : "none"} />)}<span className="text-muted-foreground ml-1">{c.estimatedHours}h</span></div>
                <Button asChild size="sm" className="w-full"><Link href={`/ol-student/catalog/${c.id}`}>View Course</Link></Button>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && <p className="text-sm text-muted-foreground">No courses match your filters.</p>}
        </div>
      </div>
    </div>
  );
}
