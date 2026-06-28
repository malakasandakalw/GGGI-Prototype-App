"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store/provider";

export default function LecturerModules() {
  const { currentUser, modules, programs, lectures } = useStore();
  const myModules = modules.filter((m) => m.lecturerIds.includes(currentUser?.id ?? ""));

  return (
    <div>
      <PageHeader title="My Modules" description="The modules you teach." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {myModules.map((m) => {
          const ls = lectures.filter((l) => l.moduleId === m.id);
          const pub = ls.filter((l) => l.status === "published").length;
          const prog = programs.find((p) => p.id === m.programId);
          return (
            <Card key={m.id}>
              <CardContent className="pt-6 space-y-3">
                <div>
                  <p className="font-semibold">{m.code} — {m.name}</p>
                  <p className="text-xs text-muted-foreground">{prog?.name}</p>
                </div>
                <div><div className="flex justify-between text-xs mb-1"><span>{pub} of {ls.length} published</span></div><Progress value={ls.length ? (pub / ls.length) * 100 : 0} /></div>
                <Button asChild size="sm" className="w-full"><Link href={`/lecturer/modules/${m.id}`}>Manage Module</Link></Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
