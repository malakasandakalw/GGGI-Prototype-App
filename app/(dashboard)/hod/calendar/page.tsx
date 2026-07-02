"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { CalendarView, eventColors } from "@/components/shared/CalendarView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store/provider";
import { formatDate } from "@/lib/utils/date";
import type { CalendarEvent, CalendarEventType } from "@/lib/types";

const EVENT_TYPES: { value: CalendarEventType; label: string }[] = [
  { value: "exam", label: "Final Exam" },
  { value: "mid-semester", label: "Mid-Semester Assessment" },
  { value: "quiz", label: "Quiz" },
  { value: "deadline", label: "Deadline" },
  { value: "results-publication", label: "Results Publication" },
  { value: "semester", label: "Semester" },
  { value: "holiday", label: "Holiday" },
];
const typeLabel = (t: string) => EVENT_TYPES.find((x) => x.value === t)?.label ?? t;

export default function HODCalendar() {
  const { currentUser, modules, programs, calendarEvents, addCalendarEvent, deleteCalendarEvent } = useStore();
  const myModules = modules.filter((m) => programs.find((p) => p.id === m.programId)?.department === currentUser?.department);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<CalendarEvent | null>(null);
  const [date, setDate] = useState("");
  const [type, setType] = useState<CalendarEventType>("exam");
  const [moduleId, setModuleId] = useState(myModules[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [venue, setVenue] = useState("");
  const [instr, setInstr] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("");

  const clash = date && moduleId ? calendarEvents.find((e) => e.date === date && e.moduleId === moduleId) : null;
  const upcoming = [...calendarEvents].sort((a, b) => a.date.localeCompare(b.date));
  const timed = ["exam", "quiz", "mid-semester"].includes(type);

  function save() {
    addCalendarEvent({
      title, date, type, moduleId, venue, notes: instr,
      startTime: timed && startTime ? startTime : undefined,
      durationHours: timed && duration ? Number(duration) : undefined,
    });
    toast.success("Event added");
    setOpen(false); setTitle(""); setVenue(""); setInstr(""); setStartTime(""); setDuration("");
  }

  return (
    <div>
      <PageHeader title="Exam Calendar" description="Schedule examinations and assessments for your modules." action={{ label: "Add Event", icon: Plus, onClick: () => { setDate("2026-07-10"); setOpen(true); } }} />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CalendarView events={calendarEvents} onDateClick={(d) => { setDate(d); setOpen(true); }} onEventClick={setDetail} initialMonth={new Date("2026-07-01")} />
          <div className="flex flex-wrap gap-3 mt-3 text-xs">
            {Object.keys(eventColors).map((k) => <span key={k} className={`px-2 py-0.5 rounded border ${eventColors[k]} capitalize`}>{k}</span>)}
          </div>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base">Upcoming Events</CardTitle></CardHeader>
          <CardContent className="space-y-2 max-h-[520px] overflow-y-auto">
            {upcoming.map((e) => (
              <button key={e.id} onClick={() => setDetail(e)} className="w-full text-left text-sm border-b last:border-0 pb-2 hover:bg-muted rounded px-1">
                <p className="font-medium">{e.title}</p>
                <p className="text-xs text-muted-foreground">{formatDate(e.date)} · {typeLabel(e.type)}</p>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Calendar Event</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label className="text-xs">Event Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as CalendarEventType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{EVENT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Module</Label>
              <Select value={moduleId} onValueChange={setModuleId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{myModules.map((m) => <SelectItem key={m.id} value={m.id}>{m.code} — {m.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs">Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Venue</Label><Input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Hall A" /></div>
            </div>
            {timed && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs">Start Time</Label><Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Duration (hours)</Label><Input type="number" step="0.5" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="2" /></div>
              </div>
            )}
            <div className="space-y-1.5"><Label className="text-xs">Special Instructions</Label><Textarea value={instr} onChange={(e) => setInstr(e.target.value)} /></div>
            {clash && <Alert className="bg-amber-50 border-amber-200"><AlertDescription>⚠ Clash detected: {clash.title} is already scheduled on this date for this module.</AlertDescription></Alert>}
          </div>
          <DialogFooter><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={!title || !date} onClick={save}>Add Event</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent>
          {detail && (
            <>
              <DialogHeader><DialogTitle>{detail.title}</DialogTitle></DialogHeader>
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Date:</span> {formatDate(detail.date)}</p>
                <p><span className="text-muted-foreground">Type:</span> {typeLabel(detail.type)}</p>
                {detail.moduleId && <p><span className="text-muted-foreground">Module:</span> {modules.find((m) => m.id === detail.moduleId)?.name}</p>}
                {detail.venue && <p><span className="text-muted-foreground">Venue:</span> {detail.venue}</p>}
                {detail.startTime && <p><span className="text-muted-foreground">Time:</span> {detail.startTime}{detail.durationHours ? ` · ${detail.durationHours}h` : ""}</p>}
                {detail.notes && <p><span className="text-muted-foreground">Notes:</span> {detail.notes}</p>}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { deleteCalendarEvent(detail.id); setDetail(null); toast.success("Event deleted"); }}>Delete</Button>
                <Button onClick={() => setDetail(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
