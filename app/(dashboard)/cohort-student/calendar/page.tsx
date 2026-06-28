"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { CalendarView, eventColors } from "@/components/shared/CalendarView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store/provider";
import { formatDate } from "@/lib/utils/date";
import type { CalendarEvent } from "@/lib/types";

export default function CohortCalendar() {
  const { currentUser, programs, modules, calendarEvents } = useStore();
  const program = programs.find((p) => p.id === currentUser?.programId);
  const sem = program?.semesters.find((s) => s.id === currentUser?.currentSemesterId);
  const myModules = modules.filter((m) => sem?.moduleIds.includes(m.id) || currentUser?.crossEnrolledModuleIds?.includes(m.id));
  const [filter, setFilter] = useState("all");
  const [detail, setDetail] = useState<CalendarEvent | null>(null);

  const events = calendarEvents.filter((e) =>
    (filter === "all" || e.moduleId === filter) &&
    (!e.moduleId || myModules.some((m) => m.id === e.moduleId) || e.programId === program?.id || !e.moduleId),
  );
  const upcoming = [...events].sort((a, b) => a.date.localeCompare(b.date)).filter((e) => e.date >= "2026-06-28").slice(0, 10);

  return (
    <div>
      <PageHeader title="Exam Calendar" description="All events for your enrolled modules.">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filter module" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Modules</SelectItem>{myModules.map((m) => <SelectItem key={m.id} value={m.id}>{m.code}</SelectItem>)}</SelectContent>
        </Select>
      </PageHeader>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CalendarView events={events} onEventClick={setDetail} initialMonth={new Date("2026-07-01")} />
          <div className="flex flex-wrap gap-3 mt-3 text-xs">{Object.keys(eventColors).map((k) => <span key={k} className={`px-2 py-0.5 rounded border ${eventColors[k]} capitalize`}>{k}</span>)}</div>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base">Upcoming Events</CardTitle></CardHeader>
          <CardContent className="space-y-2 max-h-[520px] overflow-y-auto">
            {upcoming.map((e) => (
              <button key={e.id} onClick={() => setDetail(e)} className="w-full text-left text-sm border-b last:border-0 pb-2 hover:bg-muted rounded px-1">
                <p className="font-medium">{e.title}</p>
                <p className="text-xs text-muted-foreground">{formatDate(e.date)} · <span className="capitalize">{e.type}</span></p>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent>
          {detail && (
            <>
              <DialogHeader><DialogTitle>{detail.title}</DialogTitle></DialogHeader>
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Date:</span> {formatDate(detail.date)}</p>
                <p><span className="text-muted-foreground">Type:</span> <span className="capitalize">{detail.type}</span></p>
                {detail.moduleId && <p><span className="text-muted-foreground">Module:</span> {modules.find((m) => m.id === detail.moduleId)?.name}</p>}
                {detail.venue && <p><span className="text-muted-foreground">Venue:</span> {detail.venue}</p>}
                {detail.startTime && <p><span className="text-muted-foreground">Time:</span> {detail.startTime}–{detail.endTime}</p>}
                {detail.notes && <p><span className="text-muted-foreground">Notes:</span> {detail.notes}</p>}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
