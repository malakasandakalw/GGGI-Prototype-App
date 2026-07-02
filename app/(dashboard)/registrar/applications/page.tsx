"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/lib/store/provider";
import { formatDate } from "@/lib/utils/date";
import type { Application, ApplicationStatus } from "@/lib/types";

const STATUSES: ApplicationStatus[] = ["submitted", "under-review", "payment-pending", "payment-confirmed", "enrolled", "rejected", "waitlisted"];
// Quick-status is limited to safe transitions; payment-confirmed / enrolled must go
// through the application detail (payment gate + account creation, SRS §5.1.3).
const QUICK_STATUSES: ApplicationStatus[] = ["under-review", "payment-pending", "waitlisted", "rejected"];

export default function ApplicationsPage() {
  const router = useRouter();
  const { applications, programs, updateApplication } = useStore();
  const [program, setProgram] = useState("all");
  const [status, setStatus] = useState("all");

  const programName = (id: string) => programs.find((p) => p.id === id)?.name ?? "—";

  const filtered = useMemo(
    () => applications.filter((a) => (program === "all" || a.programId === program) && (status === "all" || a.status === status)),
    [applications, program, status],
  );

  const columns: Column<Application>[] = [
    { key: "referenceNumber", header: "Ref #", render: (a) => <span className="font-mono text-xs">{a.referenceNumber}</span> },
    { key: "applicantName", header: "Applicant", render: (a) => <span className="font-medium">{a.applicantName}</span> },
    { key: "program", header: "Program", render: (a) => programName(a.programId) },
    { key: "submittedAt", header: "Submitted", render: (a) => formatDate(a.submittedAt) },
    { key: "status", header: "Status", render: (a) => <StatusBadge status={a.status} /> },
    {
      key: "actions", header: "", className: "w-12",
      render: (a) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/registrar/applications/${a.id}`)}>View Application</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs">Quick status</DropdownMenuLabel>
            {QUICK_STATUSES.map((s) => (
              <DropdownMenuItem key={s} onClick={() => updateApplication(a.id, { status: s })}>
                <StatusBadge status={s} />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Applications" description="Review and process student applications." />
      <DataTable
        columns={columns}
        data={filtered}
        searchKeys={["applicantName", "nic", "referenceNumber"]}
        searchPlaceholder="Search name, NIC, reference..."
        onRowClick={(a) => router.push(`/registrar/applications/${a.id}`)}
        filters={
          <>
            <Select value={program} onValueChange={setProgram}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Program" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                {programs.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace("-", " ")}</SelectItem>)}
              </SelectContent>
            </Select>
          </>
        }
      />
    </div>
  );
}
