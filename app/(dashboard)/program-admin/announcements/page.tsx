"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Megaphone, Paperclip } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { useStore } from "@/lib/store/provider";
import { formatDate } from "@/lib/utils/date";

export default function ProgramAdminAnnouncements() {
  const { currentUser, programs, announcements, addAnnouncement } = useStore();
  const myPrograms = programs.filter((p) => currentUser?.programIds?.includes(p.id));
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState("all");
  const [posted, setPosted] = useState<string | null>(null);

  function publish() {
    const label = target === "all" ? "all programs" : myPrograms.find((p) => p.id === target)?.name ?? target;
    addAnnouncement({ title, body, target });
    toast.success("Announcement published");
    setTitle(""); setBody("");
    setPosted(label);
  }

  return (
    <div>
      <PageHeader title="Announcements" description="Broadcast messages to your programs." />
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Past Announcements</CardTitle></CardHeader>
          <CardContent className="space-y-3 max-h-[520px] overflow-y-auto">
            {announcements.map((a) => (
              <div key={a.id} className="border-b last:border-0 pb-3">
                <p className="font-medium text-sm">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.authorName} · {formatDate(a.createdAt)} · {a.target === "all" ? "All Programs" : programs.find((p) => p.id === a.target)?.name ?? a.target}</p>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Megaphone className="size-4" /> Compose</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5"><Label className="text-xs">Target</Label>
              <Select value={target} onValueChange={setTarget}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {myPrograms.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Body <span className="text-muted-foreground">(Rich text editor — to be integrated)</span></Label><Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} /></div>
            <Button variant="outline" size="sm" onClick={() => toast.info("File attached (simulated)")}><Paperclip className="size-4" /> Attach File</Button>
            <div><Button disabled={!title || !body} onClick={publish}>Publish</Button></div>
          </CardContent>
        </Card>
      </div>

      <InfoDialog
        open={!!posted}
        onOpenChange={(o) => !o && setPosted(null)}
        title="Announcement published"
        description={<>Announcement published to all students and staff in <strong>{posted}</strong>. It appears on their dashboards and is emailed (simulated).</>}
      />
    </div>
  );
}
