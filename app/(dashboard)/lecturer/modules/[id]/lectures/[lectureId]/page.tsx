"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Plus, Video, FileText, Presentation, BookOpen, File, ArrowUp, ArrowDown, Pencil } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store/provider";
import { formatDate } from "@/lib/utils/date";
import type { Resource } from "@/lib/types";

const resIcon: Record<Resource["type"], typeof Video> = { video: Video, slides: Presentation, notes: FileText, reading: BookOpen, file: File };

export default function LectureDetail() {
  const { id, lectureId } = useParams<{ id: string; lectureId: string }>();
  const router = useRouter();
  const { lectures, updateLecture, addResource } = useStore();
  const lecture = lectures.find((l) => l.id === lectureId);
  const [resOpen, setResOpen] = useState(false);
  const [resType, setResType] = useState<Resource["type"]>("slides");
  const [method, setMethod] = useState("file");
  const [downloadable, setDownloadable] = useState(true);
  const [fileName, setFileName] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [publishedInfo, setPublishedInfo] = useState(false);

  if (!lecture) return <div className="p-8">Lecture not found.</div>;
  const editable = lecture.status === "draft";

  function publish() {
    updateLecture(lecture!.id, { status: "published" });
    toast.success("Lecture published. Now visible to students.");
    setPublishedInfo(true);
  }
  function saveInfo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    updateLecture(lecture!.id, {
      title: String(fd.get("title")),
      order: Number(fd.get("order")),
      lectureDate: String(fd.get("date")),
      description: String(fd.get("desc")),
    });
    setEditOpen(false);
    toast.success("Lecture updated");
  }
  function saveResource(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addResource(lecture!.id, {
      title: String(fd.get("title")),
      description: String(fd.get("rdesc")) || undefined,
      type: resType,
      url: method === "url" ? String(fd.get("url")) : "#",
      isDownloadable: downloadable,
      format: method === "url" ? "External" : (fileName.split(".").pop()?.toUpperCase() || "PDF"),
    });
    setResOpen(false); setFileName("");
    toast.success("Resource added");
  }
  function moveResource(index: number, dir: -1 | 1) {
    const next = [...lecture!.resources];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    updateLecture(lecture!.id, { resources: next });
  }

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-2" onClick={() => router.push(`/lecturer/modules/${id}`)}><ArrowLeft className="size-4" /> Back to module</Button>
      <PageHeader title={lecture.title} description={`Lecture ${lecture.order} · ${formatDate(lecture.lectureDate)}`}>
        <StatusBadge status={lecture.status} />
        {editable && <Button variant="outline" onClick={() => setEditOpen(true)}><Pencil className="size-4" /> Edit Info</Button>}
        {editable && <Button onClick={publish}>Publish Lecture</Button>}
      </PageHeader>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Lecture Information</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">{lecture.description}</p>
            <div className="flex items-center justify-between border-t pt-3">
              <p className="text-sm font-medium">Resources</p>
              <Button size="sm" variant="outline" onClick={() => setResOpen(true)}><Plus className="size-4" /> Add Resource</Button>
            </div>
            <div className="space-y-2">
              {lecture.resources.map((r, i) => {
                const Icon = resIcon[r.type];
                return (
                  <div key={r.id} className="flex items-start justify-between rounded-lg border p-2.5 text-sm gap-2">
                    <div className="min-w-0">
                      <span className="flex items-center gap-2"><Icon className="size-4 text-muted-foreground shrink-0" /> {r.title} <Badge>{r.format}</Badge></span>
                      {r.description && <p className="text-xs text-muted-foreground mt-1">{r.description}</p>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-xs text-muted-foreground mr-1">{r.isDownloadable ? "Downloadable" : "View only"}</span>
                      <Button size="icon" variant="ghost" className="size-7" disabled={i === 0} onClick={() => moveResource(i, -1)}><ArrowUp className="size-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="size-7" disabled={i === lecture.resources.length - 1} onClick={() => moveResource(i, 1)}><ArrowDown className="size-3.5" /></Button>
                    </div>
                  </div>
                );
              })}
              {lecture.resources.length === 0 && <p className="text-sm text-muted-foreground">No resources yet.</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Status</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between"><span className="text-muted-foreground">Current</span><StatusBadge status={lecture.status} /></div>
            <p className="text-muted-foreground text-xs">Draft → Publish → Visible to students</p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={resOpen} onOpenChange={setResOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Resource</DialogTitle></DialogHeader>
          <form onSubmit={saveResource} className="space-y-3">
            <div className="space-y-1.5"><Label className="text-xs">Resource Title</Label><Input name="title" required /></div>
            <div className="space-y-1.5"><Label className="text-xs">Description (optional)</Label><Input name="rdesc" placeholder="Short description shown to students" /></div>
            <div className="space-y-1.5"><Label className="text-xs">Type</Label>
              <Select value={resType} onValueChange={(v) => setResType(v as Resource["type"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video Recording</SelectItem>
                  <SelectItem value="slides">Presentation Slides</SelectItem>
                  <SelectItem value="notes">Lecture Notes</SelectItem>
                  <SelectItem value="reading">Supplementary Reading</SelectItem>
                  <SelectItem value="file">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Upload Method</Label>
              <RadioGroup value={method} onValueChange={setMethod} className="flex gap-4">
                <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="file" /> File Upload</label>
                <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="url" /> External URL</label>
              </RadioGroup>
            </div>
            {method === "file"
              ? <div className="space-y-1.5"><Label className="text-xs">File</Label><Input type="file" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")} />{fileName && <p className="text-xs text-muted-foreground">{fileName}</p>}</div>
              : <div className="space-y-1.5"><Label className="text-xs">URL</Label><Input name="url" placeholder="YouTube / Vimeo URL" /></div>}
            <div className="flex items-center justify-between"><Label className="text-sm">Downloadable</Label><Switch checked={downloadable} onCheckedChange={setDownloadable} /></div>
            <DialogFooter><Button type="submit">Add Resource</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Lecture Info</DialogTitle></DialogHeader>
          <form onSubmit={saveInfo} className="space-y-3">
            <div className="space-y-1.5"><Label className="text-xs">Lecture Title</Label><Input name="title" defaultValue={lecture.title} required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Order</Label><Input name="order" type="number" defaultValue={lecture.order} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Lecture Date</Label><Input name="date" type="date" defaultValue={lecture.lectureDate} /></div>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Description / Objectives</Label><Textarea name="desc" defaultValue={lecture.description} /></div>
            <DialogFooter><Button type="submit">Save Changes</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <InfoDialog
        open={publishedInfo}
        onOpenChange={setPublishedInfo}
        title="Lecture published"
        description={<>Lecture published and <strong>immediately visible to students</strong> in this module, along with its resources. You&apos;re responsible for ensuring the content and materials are correct before publishing.</>}
      />
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{children}</span>;
}
