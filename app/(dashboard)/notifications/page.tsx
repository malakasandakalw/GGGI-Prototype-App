"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, BookOpen, HelpCircle, ClipboardList, Award, ArrowLeftRight, Megaphone, Settings, CheckCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store/provider";
import { relativeTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils";
import type { NotificationType } from "@/lib/types";

const typeIcon: Record<NotificationType, typeof FileText> = {
  application: ClipboardList, lecture: BookOpen, quiz: HelpCircle, assignment: FileText,
  grade: Award, enrollment: ArrowLeftRight, announcement: Megaphone, system: Settings,
};

export default function NotificationsPage() {
  const router = useRouter();
  const { currentUser, notifications, markNotificationRead, markAllNotificationsRead } = useStore();
  const [tab, setTab] = useState("all");
  const [type, setType] = useState("all");

  const mine = useMemo(() => notifications.filter((n) => n.recipientId === currentUser?.id), [notifications, currentUser]);
  const filtered = mine.filter((n) => (tab === "all" || !n.read) && (type === "all" || n.type === type));

  function open(id: string, link?: string) {
    markNotificationRead(id);
    if (link) router.push(link);
  }

  return (
    <div>
      <PageHeader title="Notifications" description="Your alerts and updates.">
        <Button variant="outline" onClick={() => currentUser && markAllNotificationsRead(currentUser.id)}><CheckCheck className="size-4" /> Mark All Read</Button>
      </PageHeader>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="unread">Unread</TabsTrigger></TabsList>
        </Tabs>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {(["assignment", "grade", "lecture", "quiz", "enrollment", "announcement", "application", "system"] as NotificationType[]).map((t) => (
              <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {filtered.map((n) => {
          const Icon = typeIcon[n.type];
          return (
            <Card key={n.id} className={cn("p-4 flex items-start gap-3 cursor-pointer hover:bg-muted/40", !n.read && "border-primary/40 bg-primary/5")} onClick={() => open(n.id, n.linkTo)}>
              <div className="size-9 rounded-full bg-muted flex items-center justify-center shrink-0"><Icon className="size-4 text-muted-foreground" /></div>
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm", !n.read && "font-semibold")}>{n.title}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{n.body}</p>
                <p className="text-xs text-muted-foreground mt-1">{relativeTime(n.createdAt)}</p>
              </div>
              {!n.read && <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); markNotificationRead(n.id); }}>Mark read</Button>}
            </Card>
          );
        })}
        {filtered.length === 0 && <Card className="p-0"><EmptyState title="No notifications" /></Card>}
      </div>
    </div>
  );
}
