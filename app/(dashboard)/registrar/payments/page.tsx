"use client";

import { toast } from "sonner";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store/provider";
import { formatDate } from "@/lib/utils/date";

interface PaymentRow {
  date: string;
  studentName: string;
  type: string;
  program: string;
  reference: string;
  confirmedBy: string;
  notes: string;
}

export default function PaymentsPage() {
  const { applications, programs } = useStore();
  const programName = (id: string) => programs.find((p) => p.id === id)?.name ?? "—";

  const rows: PaymentRow[] = applications
    .filter((a) => a.paymentConfirmedAt)
    .map((a) => ({
      date: a.paymentConfirmedAt!,
      studentName: a.applicantName,
      type: "Admission Fee",
      program: programName(a.programId),
      reference: a.paymentReference ?? "—",
      confirmedBy: "Sanduni Jayawardena",
      notes: a.registrarNotes || "—",
    }));

  const columns: Column<PaymentRow>[] = [
    { key: "date", header: "Date", render: (r) => formatDate(r.date) },
    { key: "studentName", header: "Student", render: (r) => <span className="font-medium">{r.studentName}</span> },
    { key: "type", header: "Type" },
    { key: "program", header: "Program" },
    { key: "reference", header: "Reference", render: (r) => <span className="font-mono text-xs">{r.reference}</span> },
    { key: "confirmedBy", header: "Confirmed By" },
    { key: "notes", header: "Notes", render: (r) => <span className="text-muted-foreground text-xs">{r.notes}</span> },
  ];

  return (
    <div>
      <PageHeader title="Payment Log" description="Historical record of all payment confirmations.">
        <Button variant="outline" onClick={() => toast.success("Report exported successfully")}><Download className="size-4" /> Export (Mock)</Button>
      </PageHeader>
      <DataTable columns={columns} data={rows} searchKeys={["studentName", "reference"]} searchPlaceholder="Search student or reference" emptyTitle="No payments recorded" />
    </div>
  );
}
