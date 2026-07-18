"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Clock, MapPin, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { AcademicYearSelect } from "@/components/shared/AcademicYearSelect";
import { ArchivedYearBanner } from "@/components/shared/ArchivedYearBanner";
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
import { useYearScope } from "@/hooks/use-year-scope";
import { formatDate } from "@/lib/utils/date";
import type { CalendarEventType } from "@/lib/types";

export default function ProgramAdminCalendar() {
  const { currentUser, programs, calendarEvents, addCalendarEvent } = useStore();
  const { isModuleInYear, inYear, activeAcademicYear, activeYearEditable } = useYearScope();
  const myPrograms = programs.filter((p) => currentUser?.programIds?.includes(p.id));
  const yearEvents = calendarEvents.filter((e) => (e.academicYearId ? inYear(e.academicYearId) : e.moduleId ? isModuleInYear(e.moduleId) : true));
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [type, setType] = useState<CalendarEventType>("semester");
  const [programId, setProgramId] = useState(myPrograms[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [venue, setVenue] = useState("");
  const [durationHours, setDurationHours] = useState("");

  const needsDetails = type === "exam" || type === "semester";

  const clash = date && programId
    ? calendarEvents.find((e) => e.date === date && e.programId === programId)
    : null;

  const upcoming = [...yearEvents].sort((a, b) => a.date.localeCompare(b.date));

  function openOn(d: string) { setDate(d); setOpen(true); }
  function save() {
    addCalendarEvent({
      title, date, type, programId, notes,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      venue: venue || undefined,
      durationHours: durationHours ? Number(durationHours) : undefined,
    });
    toast.success("Event added to calendar");
    setOpen(false); setTitle(""); setNotes(""); setStartTime(""); setEndTime(""); setVenue(""); setDurationHours("");
  }

  return (
    <div>
      <PageHeader title="Academic Calendar" description="Manage semester dates and program-wide events." action={{ label: "Add Event", icon: Plus, onClick: () => { setDate("2026-06-28"); setOpen(true); }, disabled: !activeYearEditable }}>
        <AcademicYearSelect />
      </PageHeader>
      <ArchivedYearBanner />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CalendarView events={yearEvents} onDateClick={openOn} initialMonth={new Date(activeAcademicYear?.startDate ?? "2026-06-01")} />
          <div className="flex flex-wrap gap-3 mt-3 text-xs">
            {Object.keys(eventColors).map((k) => (
              <span key={k} className={`px-2 py-0.5 rounded border ${eventColors[k]} capitalize`}>{k}</span>
            ))}
          </div>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base">Events</CardTitle></CardHeader>
          <CardContent className="space-y-2 max-h-[520px] overflow-y-auto">
            {upcoming.map((e) => (
              <div key={e.id} className="text-sm border-b last:border-0 pb-2">
                <p className="font-medium">{e.title}</p>
                <p className="text-xs text-muted-foreground">{formatDate(e.date)} · <span className="capitalize">{e.type}</span></p>
                {(e.startTime || e.venue || e.durationHours) && (
                  <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    {e.startTime && <span className="inline-flex items-center gap-1"><Clock className="size-3" />{e.startTime}{e.endTime ? `–${e.endTime}` : ""}</span>}
                    {e.durationHours && <span>· {e.durationHours}h</span>}
                    {e.venue && <span className="inline-flex items-center gap-1">· <MapPin className="size-3" />{e.venue}</span>}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Calendar Event</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">Academic Year: <span className="font-medium text-foreground">{activeAcademicYear?.label}</span> — this event is scheduled under the active year.</div>
            <div className="space-y-1.5"><Label className="text-xs">Event Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as CalendarEventType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["semester", "exam", "application", "holiday", "deadline"].map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div className="space-y-1.5"><Label className="text-xs">Program</Label>
              <Select value={programId} onValueChange={setProgramId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{myPrograms.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {needsDetails && (
              <div className="space-y-4 rounded-lg border bg-muted/40 p-3">
                <p className="text-xs font-medium text-muted-foreground capitalize">{type} schedule details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label className="text-xs">Start Time</Label><Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">End Time</Label><Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label className="text-xs">Venue</Label><Input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="e.g. Main Hall" /></div>
                  <div className="space-y-1.5"><Label className="text-xs">Duration (hrs)</Label><Input type="number" step="0.5" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} placeholder="e.g. 3" /></div>
                </div>
              </div>
            )}
            <div className="space-y-1.5"><Label className="text-xs">Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
            {clash && (
              <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="size-4" />
                <AlertDescription>An event ({clash.title}) is already scheduled on this date for this program.</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={!title || !date} onClick={save}>Add Event</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
