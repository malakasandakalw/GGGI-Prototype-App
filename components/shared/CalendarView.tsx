"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/lib/types";

export const eventColors: Record<string, string> = {
  semester: "bg-blue-100 text-blue-800 border-blue-200",
  exam: "bg-red-100 text-red-800 border-red-200",
  deadline: "bg-orange-100 text-orange-800 border-orange-200",
  holiday: "bg-slate-100 text-slate-700 border-slate-200",
  application: "bg-emerald-100 text-emerald-800 border-emerald-200",
  quiz: "bg-indigo-100 text-indigo-800 border-indigo-200",
  "mid-semester": "bg-purple-100 text-purple-800 border-purple-200",
  "results-publication": "bg-teal-100 text-teal-800 border-teal-200",
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarView({
  events,
  onDateClick,
  onEventClick,
  initialMonth = new Date("2026-06-15"),
}: {
  events: CalendarEvent[];
  onDateClick?: (dateISO: string) => void;
  onEventClick?: (e: CalendarEvent) => void;
  initialMonth?: Date;
}) {
  const [cursor, setCursor] = useState(new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1));
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const dateStr = (day: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const eventsOn = (day: number) => events.filter((e) => e.date === dateStr(day));

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">{MONTHS[month]} {year}</h3>
        <div className="flex gap-1">
          <Button size="icon" variant="outline" onClick={() => setCursor(new Date(year, month - 1, 1))}><ChevronLeft className="size-4" /></Button>
          <Button size="icon" variant="outline" onClick={() => setCursor(new Date(year, month + 1, 1))}><ChevronRight className="size-4" /></Button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-xs font-medium text-muted-foreground border-b">
        {DAYS.map((d) => <div key={d} className="p-2 text-center">{d}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, i) => (
          <div
            key={i}
            className={cn(
              "min-h-24 border-b border-r p-1 last:border-r-0 align-top",
              day && onDateClick && "cursor-pointer hover:bg-muted/50",
            )}
            onClick={() => day && onDateClick?.(dateStr(day))}
          >
            {day && (
              <>
                <span className="text-xs text-muted-foreground">{day}</span>
                <div className="space-y-1 mt-1">
                  {eventsOn(day).map((e) => (
                    <button
                      key={e.id}
                      onClick={(ev) => { ev.stopPropagation(); onEventClick?.(e); }}
                      className={cn("block w-full text-left text-[10px] px-1 py-0.5 rounded border truncate", eventColors[e.type])}
                    >
                      {e.title}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
