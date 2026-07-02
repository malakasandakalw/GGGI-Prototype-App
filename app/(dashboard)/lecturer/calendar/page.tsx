"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { CalendarView, eventColors } from "@/components/shared/CalendarView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store/provider";
import { formatDate } from "@/lib/utils/date";
import type { CalendarEvent } from "@/lib/types";

export default function LecturerCalendar() {
  const { currentUser, modules, calendarEvents } = useStore();
  const myModuleIds = modules.filter((m) => m.lecturerIds.includes(currentUser?.id ?? "")).map((m) => m.id);
  const events = calendarEvents.filter((e) => !e.moduleId || myModuleIds.includes(e.moduleId));
  const [detail, setDetail] = useState<CalendarEvent | null>(null);
  const upcoming = [...events].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <PageHeader title="Exam Calendar" description="Read-only view of exams and assessments for your modules." />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CalendarView events={events} onEventClick={setDetail} initialMonth={new Date("2026-07-01")} />
          <div className="flex flex-wrap gap-3 mt-3 text-xs">
            {Object.keys(eventColors).map((k) => <span key={k} className={`px-2 py-0.5 rounded border ${eventColors[k]}`}>{k}</span>)}
          </div>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base">Upcoming Events</CardTitle></CardHeader>
          <CardContent className="space-y-2 max-h-[520px] overflow-y-auto">
            {upcoming.map((e) => (
              <button key={e.id} onClick={() => setDetail(e)} className="w-full text-left text-sm border-b last:border-0 pb-2 hover:bg-muted rounded px-1">
                <p className="font-medium">{e.title}</p>
                <p className="text-xs text-muted-foreground">{formatDate(e.date)} · {e.type}</p>
              </button>
            ))}
            {upcoming.length === 0 && <p className="text-sm text-muted-foreground">No scheduled events for your modules.</p>}
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
                <p><span className="text-muted-foreground">Type:</span> {detail.type}</p>
                {detail.moduleId && <p><span className="text-muted-foreground">Module:</span> {modules.find((m) => m.id === detail.moduleId)?.name}</p>}
                {detail.venue && <p><span className="text-muted-foreground">Venue:</span> {detail.venue}</p>}
                {detail.startTime && <p><span className="text-muted-foreground">Time:</span> {detail.startTime}{detail.durationHours ? ` · ${detail.durationHours}h` : ""}</p>}
                {detail.notes && <p><span className="text-muted-foreground">Notes:</span> {detail.notes}</p>}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
