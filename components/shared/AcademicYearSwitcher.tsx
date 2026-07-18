"use client";

import { CalendarDays, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/lib/store/provider";

// Global academic-year switcher shown in the top header. Sets the app-wide active year
// that scoped pages read. Hidden for Open Learning students (not tied to academic years).
export function AcademicYearSwitcher() {
  const { currentUser, academicYears, activeAcademicYear, activeAcademicYearId, setActiveAcademicYear } = useStore();
  if (!currentUser || currentUser.role === "ol-student") return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 h-9 rounded-full font-medium">
          <CalendarDays className="size-4 text-muted-foreground" />
          <span className="hidden sm:inline text-muted-foreground">Academic Year</span>
          <span>{activeAcademicYear?.label ?? "—"}</span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Academic Year</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {academicYears.map((y) => (
          <DropdownMenuItem
            key={y.id}
            className="flex items-center justify-between gap-2"
            onClick={() => setActiveAcademicYear(y.id)}
          >
            <span className="flex items-center gap-2">
              <Check className={`size-4 ${y.id === activeAcademicYearId ? "opacity-100" : "opacity-0"}`} />
              {y.label}
            </span>
            {y.isCurrent && <span className="text-[10px] rounded-full bg-primary/10 text-primary px-1.5 py-0.5">Current</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
