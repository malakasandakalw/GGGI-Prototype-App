"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useStore } from "@/lib/store/provider";
import { navConfig, roleLabels } from "@/lib/nav-config";
import type { Role } from "@/lib/types";
import { Repeat } from "lucide-react";
import { cn } from "@/lib/utils";

const roles: Role[] = [
  "super-admin",
  "program-admin",
  "registrar",
  "hod",
  "lecturer",
  "cohort-student",
  "ol-student",
];

export function RoleSwitcher() {
  const { currentRole, login } = useStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function switchTo(role: Role) {
    login(role);
    setOpen(false);
    router.push(navConfig[role][0].href);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="sm"
          variant="secondary"
          className="fixed bottom-5 right-5 z-50 shadow-lg border"
        >
          <Repeat className="size-4" />
          Switch Role (Demo)
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Switch Role</SheetTitle>
          <SheetDescription>
            Prototype affordance — instantly view the app as any user role.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-2 px-4 pb-4">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => switchTo(r)}
              className={cn(
                "text-left rounded-lg border px-4 py-3 text-sm transition-colors hover:bg-muted",
                currentRole === r && "border-primary bg-primary/5 font-medium",
              )}
            >
              {roleLabels[r]}
              {currentRole === r && <span className="text-xs text-primary ml-2">(current)</span>}
            </button>
          ))}
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            Cohort and Open Learning students share one unified experience — an Open Learning student who
            cross-enrolls into a module gains full cohort access (modules, assignments, quizzes, grades) while
            keeping their Open Learning courses.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
