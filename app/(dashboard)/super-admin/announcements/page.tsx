"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Megaphone, Paperclip } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { InfoDialog } from "@/components/shared/InfoDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store/provider";
import { roleLabels } from "@/lib/nav-config";
import { formatDate } from "@/lib/utils/date";

export default function SuperAdminAnnouncements() {
  const { programs, announcements, addAnnouncement, addAudit } = useStore();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [info, setInfo] = useState(false);

  function publish() {
    addAnnouncement({ title, body, target: "all" });
    addAudit({ action: "Announcement Posted", details: `System-wide announcement: ${title}` });
    toast.success("System-wide announcement published");
    setTitle(""); setBody("");
    setInfo(true);
  }

  return (
    <div>
      <PageHeader title="System-Wide Announcements" description="Broadcast a message to every user across both streams." />
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Past Announcements</CardTitle></CardHeader>
          <CardContent className="space-y-3 max-h-[520px] overflow-y-auto">
            {announcements.map((a) => (
              <div key={a.id} className="border-b last:border-0 pb-3">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{a.title}</p>
                  {a.authorRole === "super-admin" && a.target === "all" && <Badge variant="secondary" className="text-[10px]">System-wide</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{a.authorName} · {roleLabels[a.authorRole]} · {formatDate(a.createdAt)} · {a.target === "all" ? "All Users" : programs.find((p) => p.id === a.target)?.name ?? a.target}</p>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.body}</p>
              </div>
            ))}
            {announcements.length === 0 && <p className="text-sm text-muted-foreground">No announcements yet.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Megaphone className="size-4" /> Compose</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">Audience: <span className="font-medium text-foreground">All users (system-wide)</span> — Super Admins, staff and students across the Cohort and Open Learning streams.</div>
            <div className="space-y-1.5"><Label className="text-xs">Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Body <span className="text-muted-foreground">(Rich text editor — to be integrated)</span></Label><Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} /></div>
            <Button variant="outline" size="sm" onClick={() => toast.info("File attached (simulated)")}><Paperclip className="size-4" /> Attach File</Button>
            <div><Button disabled={!title || !body} onClick={publish}>Publish System-Wide</Button></div>
          </CardContent>
        </Card>
      </div>

      <InfoDialog
        open={info}
        onOpenChange={setInfo}
        title="Announcement published"
        description={<>Your announcement has been published to <strong>all users</strong> across both streams. It appears on every dashboard and is emailed (simulated).</>}
      />
    </div>
  );
}
