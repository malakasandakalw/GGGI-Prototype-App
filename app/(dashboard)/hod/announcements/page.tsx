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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store/provider";
import { formatDate } from "@/lib/utils/date";

export default function HODAnnouncements() {
  const { currentUser, programs, modules, announcements, addAnnouncement, addAudit } = useStore();
  const dept = currentUser?.department;
  const deptPrograms = programs.filter((p) => p.department === dept);
  const deptModules = modules.filter((m) => deptPrograms.some((p) => p.id === m.programId));
  const [scope, setScope] = useState<"program" | "module">("program");
  const [targetId, setTargetId] = useState(deptPrograms[0]?.id ?? "");
  const [moduleId, setModuleId] = useState(deptModules[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [posted, setPosted] = useState<string | null>(null);

  const targetLabel = (t: string, mId?: string) => {
    if (mId) return modules.find((m) => m.id === mId)?.name ?? mId;
    return programs.find((p) => p.id === t)?.name ?? (t === "all" ? "All Programs" : t);
  };

  function publish() {
    const isModule = scope === "module";
    const audience = isModule ? targetLabel("", moduleId) : targetLabel(targetId);
    addAnnouncement({ title, body, target: isModule ? moduleId : targetId, moduleId: isModule ? moduleId : undefined });
    addAudit({ action: "Announcement Posted", details: `Posted "${title}" to ${audience}` });
    toast.success("Announcement published");
    setPosted(audience);
    setTitle(""); setBody("");
  }

  return (
    <div>
      <PageHeader title="Announcements" description="Broadcast to a program or a specific module in your department." />
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Past Announcements</CardTitle></CardHeader>
          <CardContent className="space-y-3 max-h-[520px] overflow-y-auto">
            {announcements.map((a) => (
              <div key={a.id} className="border-b last:border-0 pb-3">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{a.title}</p>
                  {a.moduleId && <Badge variant="outline" className="text-[10px]">Module</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{a.authorName} · {formatDate(a.createdAt)} · {targetLabel(a.target, a.moduleId)}</p>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.body}</p>
              </div>
            ))}
            {announcements.length === 0 && <p className="text-sm text-muted-foreground">No announcements yet.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Megaphone className="size-4" /> Compose</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Scope</Label>
                <Select value={scope} onValueChange={(v) => setScope(v as "program" | "module")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="program">Program</SelectItem>
                    <SelectItem value="module">Module</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">{scope === "program" ? "Program" : "Module"}</Label>
                {scope === "program" ? (
                  <Select value={targetId} onValueChange={setTargetId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{deptPrograms.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                ) : (
                  <Select value={moduleId} onValueChange={setModuleId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{deptModules.map((m) => <SelectItem key={m.id} value={m.id}>{m.code} — {m.name}</SelectItem>)}</SelectContent>
                  </Select>
                )}
              </div>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Body</Label><Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} /></div>
            <Button variant="outline" size="sm" onClick={() => toast.info("File attached (simulated)")}><Paperclip className="size-4" /> Attach File</Button>
            <div><Button disabled={!title || !body} onClick={publish}>Publish</Button></div>
          </CardContent>
        </Card>
      </div>

      <InfoDialog
        open={!!posted}
        onOpenChange={(o) => !o && setPosted(null)}
        title="Announcement posted"
        description={<>Your announcement was posted to <strong>{posted}</strong>. All enrolled <strong>students</strong> have been notified and will see it on their dashboard and module page.</>}
      />
    </div>
  );
}
