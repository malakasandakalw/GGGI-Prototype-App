"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store/provider";
import { InfoDialog } from "./InfoDialog";

// One-time-per-session explainer shown the first time the user changes the active academic
// year (from the header switcher OR any on-page selector — both drive the same global year).
// Mounted once in the dashboard layout so it covers every switch path.
export function YearSwitchExplainer() {
  const { currentUser, activeAcademicYearId, activeAcademicYear } = useStore();
  const prev = useRef(activeAcademicYearId);
  const armed = useRef(false);
  const shown = useRef(false);
  const [open, setOpen] = useState(false);

  // Arm only after the first paint so the localStorage restore (which may change the year on
  // load) doesn't count as a user switch.
  useEffect(() => {
    const id = requestAnimationFrame(() => { armed.current = true; });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!armed.current) { prev.current = activeAcademicYearId; return; }
    if (prev.current !== activeAcademicYearId) {
      prev.current = activeAcademicYearId;
      if (!shown.current && currentUser && currentUser.role !== "ol-student") {
        shown.current = true;
        setOpen(true);
      }
    }
  }, [activeAcademicYearId, currentUser]);

  const archived = activeAcademicYear?.status !== "active";

  return (
    <InfoDialog
      open={open}
      onOpenChange={setOpen}
      title={`Now viewing ${activeAcademicYear?.label ?? "another year"}`}
      description={
        <>
          Changing the academic year re-scopes the whole app to that year — modules, results,
          gradebooks, intakes, calendars and reports now show <strong>{activeAcademicYear?.label}</strong>.
          {archived
            ? " This is an archived year, so it's view-only — you can't create or edit records in a closed year."
            : " New records you create will be stamped with this year."}
          {" "}Cumulative records — <strong>transcripts, CGPA and progression</strong> — always span every
          year and are never hidden by this filter.
        </>
      }
    />
  );
}
