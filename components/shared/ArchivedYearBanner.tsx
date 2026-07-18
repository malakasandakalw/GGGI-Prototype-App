"use client";

import { Lock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useYearScope } from "@/hooks/use-year-scope";

// Shown on creation pages when the active academic year is archived/closed. Records can only
// be created into the current (active) year — past years are view-only history. Renders
// nothing while the active year is editable.
export function ArchivedYearBanner({ className }: { className?: string }) {
  const { activeYearEditable, activeAcademicYear } = useYearScope();
  if (activeYearEditable) return null;
  return (
    <Alert className={`border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300 ${className ?? "mb-4"}`}>
      <Lock className="size-4" />
      <AlertTitle>{activeAcademicYear?.label} is a closed academic year (view-only)</AlertTitle>
      <AlertDescription>
        You&apos;re viewing an archived year, so creating or editing records is disabled. Switch to the current
        academic year to make changes.
      </AlertDescription>
    </Alert>
  );
}
