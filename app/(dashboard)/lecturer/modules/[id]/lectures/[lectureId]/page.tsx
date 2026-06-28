"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Plus, Video, FileText, Presentation, BookOpen, File } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  const { lectures, updateLecture, addResource, addNotification } = useStore();
  const lecture = lectures.find((l) => l.id === lectureId);
  const [resOpen, setResOpen] = useState(false);
  const [resType, setResType] = useState<Resource["type"]>("slides");
  const [method, setMethod] = useState("file");
  const [downloadable, setDownloadable] = useState(true);
  const [fileName, setFileName] = useState("");

  if (!lecture) return <div className="p-8">Lecture not found.</div>;

  function submit() {
    updateLecture(lecture!.id, { status: "submitted", hodFeedback: undefined });
    addNotification({ recipientId: "u-hod", title: "Lecture submitted for verification", body: `${lecture!.title} is awaiting your review.`, type: "lecture", linkTo: "/hod/verification/lectures" });
    toast.success("Lecture submitted. HOD will be notified.");
  }
  function saveResource(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addResource(lecture!.id, {
      title: String(fd.get("title")),
      type: resType,
      url: method === "url" ? String(fd.get("url")) : "#",
      isDownloadable: downloadable,
      format: method === "url" ? "External" : (fileName.split(".").pop()?.toUpperCase() || "PDF"),
    });
    setResOpen(false); setFileName("");
    toast.success("Resource added");
  }

  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-2" onClick={() => router.push(`/lecturer/modules/${id}`)}><ArrowLeft className="size-4" /> Back to module</Button>
      <PageHeader title={lecture.title} description={`Lecture ${lecture.order} · ${formatDate(lecture.lectureDate)}`}>
        <StatusBadge status={lecture.status} />
        {(lecture.status === "draft") && <Button onClick={submit}>Submit for Verification</Button>}
      </PageHeader>

      {lecture.hodFeedback && (
        <Alert className="mb-4 bg-red-50 border-red-200">
          <AlertTitle>Returned by HOD</AlertTitle>
          <AlertDescription>{lecture.hodFeedback}</AlertDescription>
        </Alert>
      )}

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
              {lecture.resources.map((r) => {
                const Icon = resIcon[r.type];
                return (
                  <div key={r.id} className="flex items-center justify-between rounded-lg border p-2.5 text-sm">
                    <span className="flex items-center gap-2"><Icon className="size-4 text-muted-foreground" /> {r.title} <Badge>{r.format}</Badge></span>
                    <span className="text-xs text-muted-foreground">{r.isDownloadable ? "Downloadable" : "View only"}</span>
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
            <p className="text-muted-foreground text-xs">Draft → Submit for Verification → HOD Approves → Published</p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={resOpen} onOpenChange={setResOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Resource</DialogTitle></DialogHeader>
          <form onSubmit={saveResource} className="space-y-3">
            <div className="space-y-1.5"><Label className="text-xs">Resource Title</Label><Input name="title" required /></div>
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
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{children}</span>;
}
