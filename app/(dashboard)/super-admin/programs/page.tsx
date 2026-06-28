"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { useStore } from "@/lib/store/provider";
import type { Program } from "@/lib/types";

export default function SuperAdminPrograms() {
  const { programs, modules, users, updateProgram } = useStore();
  const [status, setStatus] = useState("all");
  const [level, setLevel] = useState("all");
  const [view, setView] = useState<Program | null>(null);
  const [archive, setArchive] = useState<Program | null>(null);

  const hodName = (id: string) => users.find((u) => u.id === id)?.name ?? "—";

  const filtered = useMemo(
    () => programs.filter((p) => (status === "all" || p.status === status) && (level === "all" || p.level === level)),
    [programs, status, level],
  );

  const columns: Column<Program>[] = [
    { key: "name", header: "Program", render: (p) => <span className="font-medium">{p.name}</span> },
    { key: "code", header: "Code" },
    { key: "department", header: "Department" },
    { key: "level", header: "Level", render: (p) => <span className="uppercase text-xs">{p.level}</span> },
    { key: "hod", header: "HOD", render: (p) => hodName(p.hodId) },
    { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
    {
      key: "actions",
      header: "",
      render: (p) => (
        <div className="flex justify-end gap-2">
          {(p.status === "submitted" || p.status === "approved") && (
            <Button size="sm" onClick={() => { updateProgram(p.id, { status: "active" }); toast.success(`${p.name} activated`); }}>
              Activate
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => setView(p)}>View</Button>
          {p.status !== "archived" && (
            <Button size="sm" variant="ghost" onClick={() => setArchive(p)}>Archive</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Program Management" description="View all programs and manage their lifecycle." />
      <DataTable
        columns={columns}
        data={filtered}
        searchKeys={["name", "code"]}
        searchPlaceholder="Search by program name"
        filters={
          <>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                {["all", "draft", "submitted", "approved", "active", "archived"].map((s) => (
                  <SelectItem key={s} value={s}>{s === "all" ? "All Status" : s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Level" /></SelectTrigger>
              <SelectContent>
                {["all", "certificate", "diploma", "hnd", "degree", "postgraduate"].map((s) => (
                  <SelectItem key={s} value={s}>{s === "all" ? "All Levels" : s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
      />

      <Sheet open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {view && (
            <>
              <SheetHeader>
                <SheetTitle>{view.name}</SheetTitle>
                <SheetDescription>{view.code} · {view.department}</SheetDescription>
              </SheetHeader>
              <div className="px-4 pb-6 space-y-4">
                <p className="text-sm text-muted-foreground">{view.description}</p>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <Info label="Level" value={view.level} />
                  <Info label="Duration" value={`${view.durationYears} yr`} />
                  <Info label="Credits" value={view.totalCredits} />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Semester Structure</p>
                  <Accordion type="single" collapsible className="w-full">
                    {view.semesters.map((s) => (
                      <AccordionItem key={s.id} value={s.id}>
                        <AccordionTrigger className="text-sm">{s.name}</AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-1 text-sm">
                            {s.moduleIds.map((mid) => {
                              const m = modules.find((x) => x.id === mid);
                              return m ? (
                                <li key={mid} className="flex justify-between">
                                  <span>{m.code} — {m.name}</span>
                                  <span className="text-muted-foreground">{m.creditValue} cr</span>
                                </li>
                              ) : null;
                            })}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Status</p>
                  <StatusBadge status={view.status} />
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!archive}
        onOpenChange={(o) => !o && setArchive(null)}
        title="Archive this program?"
        description={`${archive?.name} will be moved to the archive.`}
        confirmLabel="Archive"
        destructive
        onConfirm={() => {
          if (archive) { updateProgram(archive.id, { status: "archived" }); toast.success("Program archived"); }
          setArchive(null);
        }}
      />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-muted rounded-lg p-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="font-medium capitalize">{value}</p>
    </div>
  );
}
