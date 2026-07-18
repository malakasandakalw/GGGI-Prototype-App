"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { CalendarView, eventColors } from "@/components/shared/CalendarView";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store/provider";
import { useYearScope } from "@/hooks/use-year-scope";
import { AcademicYearSelect } from "@/components/shared/AcademicYearSelect";
import { formatDate } from "@/lib/utils/date";
import type { CalendarEvent } from "@/lib/types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfWeek(d: Date) {
  const x = new Date(d);
  x.setDate(x.getDate() - x.getDay());
  x.setHours(0, 0, 0, 0);
  return x;
}
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function Legend() {
  return (
    <div className="flex flex-wrap gap-3 mt-3 text-xs">{Object.keys(eventColors).map((k) => <span key={k} className={`px-2 py-0.5 rounded border ${eventColors[k]} capitalize`}>{k}</span>)}</div>
  );
}

export default function CohortCalendar() {
  const { currentUser, programs, modules, calendarEvents } = useStore();
  const { isModuleInYear, inYear } = useYearScope();
  const program = programs.find((p) => p.id === currentUser?.programId);
  const sem = program?.semesters.find((s) => s.id === currentUser?.currentSemesterId);
  const myModules = modules.filter((m) => sem?.moduleIds.includes(m.id) || currentUser?.crossEnrolledModuleIds?.includes(m.id));

  const [view, setView] = useState("month");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [detail, setDetail] = useState<CalendarEvent | null>(null);
  const [weekCursor, setWeekCursor] = useState(startOfWeek(new Date("2026-07-01")));

  const semesterModuleIds = semesterFilter === "all"
    ? null
    : program?.semesters.find((s) => s.id === semesterFilter)?.moduleIds ?? [];

  const events = calendarEvents.filter((e) => {
    if (moduleFilter !== "all" && e.moduleId !== moduleFilter) return false;
    if (semesterModuleIds && !(e.moduleId && semesterModuleIds.includes(e.moduleId))) return false;
    if (fromDate && e.date < fromDate) return false;
    // scope to the active academic year
    if (e.academicYearId ? !inYear(e.academicYearId) : e.moduleId ? !isModuleInYear(e.moduleId) : false) return false;
    // scope to the student's modules / program
    return !e.moduleId || myModules.some((m) => m.id === e.moduleId) || e.programId === program?.id;
  });

  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = sorted.filter((e) => e.date >= "2026-06-28").slice(0, 10);

  // Week view cells
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekCursor);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div>
      <PageHeader title="Exam Calendar" description="All events for your enrolled modules.">
        <AcademicYearSelect />
        <Tabs value={view} onValueChange={setView}>
          <TabsList>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
        </Tabs>
      </PageHeader>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="space-y-1"><Label className="text-xs">Semester</Label>
          <Select value={semesterFilter} onValueChange={setSemesterFilter}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Semesters</SelectItem>{program?.semesters.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1"><Label className="text-xs">Module</Label>
          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Modules</SelectItem>{myModules.map((m) => <SelectItem key={m.id} value={m.id}>{m.code}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1"><Label className="text-xs">From date</Label>
          <div className="flex gap-1">
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-40" />
            {fromDate && <Button variant="ghost" size="sm" onClick={() => setFromDate("")}>Clear</Button>}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {view === "month" && (
            <>
              <CalendarView events={events} onEventClick={setDetail} initialMonth={new Date("2026-07-01")} />
              <Legend />
            </>
          )}

          {view === "week" && (
            <div className="rounded-lg border bg-card">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold text-sm">Week of {formatDate(iso(weekCursor))}</h3>
                <div className="flex gap-1">
                  <Button size="icon" variant="outline" onClick={() => { const d = new Date(weekCursor); d.setDate(d.getDate() - 7); setWeekCursor(d); }}><ChevronLeft className="size-4" /></Button>
                  <Button size="icon" variant="outline" onClick={() => { const d = new Date(weekCursor); d.setDate(d.getDate() + 7); setWeekCursor(d); }}><ChevronRight className="size-4" /></Button>
                </div>
              </div>
              <div className="grid grid-cols-7">
                {weekDays.map((d, i) => {
                  const dayEvents = events.filter((e) => e.date === iso(d));
                  return (
                    <div key={i} className="min-h-40 border-b border-r last:border-r-0 p-1.5 align-top">
                      <p className="text-xs text-muted-foreground">{DAYS[i]} {d.getDate()}</p>
                      <div className="space-y-1 mt-1">
                        {dayEvents.map((e) => (
                          <button key={e.id} onClick={() => setDetail(e)} className={cn("block w-full text-left text-[10px] px-1 py-0.5 rounded border truncate", eventColors[e.type])}>{e.title}</button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <Legend />
            </div>
          )}

          {view === "list" && (
            <Card><CardContent className="pt-6 space-y-2">
              {sorted.map((e) => (
                <button key={e.id} onClick={() => setDetail(e)} className="w-full text-left flex items-center justify-between border-b last:border-0 py-2 hover:bg-muted rounded px-1">
                  <div>
                    <p className="font-medium text-sm">{e.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(e.date)}{e.startTime ? ` · ${e.startTime}` : ""}{e.venue ? ` · ${e.venue}` : ""}</p>
                  </div>
                  <span className={cn("text-[10px] px-2 py-0.5 rounded border capitalize", eventColors[e.type])}>{e.type}</span>
                </button>
              ))}
              {sorted.length === 0 && <EmptyState title="No events match your filters" />}
            </CardContent></Card>
          )}
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
            {upcoming.length === 0 && <p className="text-sm text-muted-foreground">No upcoming events.</p>}
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
