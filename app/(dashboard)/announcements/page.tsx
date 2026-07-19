"use client";

import { Megaphone } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store/provider";
import { roleLabels } from "@/lib/nav-config";
import { formatDateTime } from "@/lib/utils/date";
import type { Announcement } from "@/lib/types";

export default function AnnouncementsFeed() {
  const { currentUser, announcements, modules, programs } = useStore();

  // Which modules can this user see announcements for?
  const myModuleIds = new Set<string>();
  if (currentUser?.role === "lecturer") {
    modules.filter((m) => m.lecturerIds.includes(currentUser.id)).forEach((m) => myModuleIds.add(m.id));
  } else {
    // student: modules in their programme + any cross-enrolled modules
    modules.filter((m) => m.programId === currentUser?.programId).forEach((m) => myModuleIds.add(m.id));
    (currentUser?.crossEnrolledModuleIds ?? []).forEach((id) => myModuleIds.add(id));
  }

  // Which programmes are "mine"?
  const myProgramIds = new Set<string>(
    currentUser?.programIds ?? (currentUser?.programId ? [currentUser.programId] : []),
  );
  // students see the programme of their cross-enrolled modules too
  modules.filter((m) => myModuleIds.has(m.id)).forEach((m) => myProgramIds.add(m.programId));

  const visible = announcements.filter((a) => {
    if (a.moduleId) return myModuleIds.has(a.moduleId);
    if (a.target === "all") return true;
    return myProgramIds.has(a.target);
  });

  const scopeLabel = (a: Announcement) => {
    if (a.moduleId) return modules.find((m) => m.id === a.moduleId)?.code ?? "Module";
    if (a.target === "all") return "Everyone";
    return programs.find((p) => p.id === a.target)?.name ?? "Program";
  };

  return (
    <div>
      <PageHeader title="Announcements" description="Institution, programme and module announcements addressed to you." />
      {visible.length === 0 ? (
        <EmptyState icon={Megaphone} title="No announcements" description="You have no announcements right now." />
      ) : (
        <div className="space-y-4">
          {visible.map((a) => (
            <Card key={a.id}>
              <CardContent className="pt-6 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium">{a.title}</p>
                  <Badge variant="secondary" className="shrink-0">{scopeLabel(a)}</Badge>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{a.body}</p>
                <p className="text-xs text-muted-foreground">
                  {a.authorName} · {roleLabels[a.authorRole]} · {formatDateTime(a.createdAt)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
