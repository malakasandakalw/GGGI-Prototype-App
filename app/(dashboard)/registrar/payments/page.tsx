"use client";

import { toast } from "sonner";
import { Download, Mail } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { AcademicYearSelect } from "@/components/shared/AcademicYearSelect";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store/provider";
import { useYearScope } from "@/hooks/use-year-scope";
import { formatDate, formatDateTime } from "@/lib/utils/date";

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
  const { applications, programs, sendPaymentReminder } = useStore();
  const { inYear } = useYearScope();
  const programName = (id: string) => programs.find((p) => p.id === id)?.name ?? "—";

  // Applicants awaiting payment (in the active academic year) — targets for reminders.
  const awaitingPayment = applications.filter((a) => a.status === "payment-pending" && inYear(a.academicYearId));
  function remindAll() {
    awaitingPayment.forEach((a) => sendPaymentReminder(a.id));
    toast.success(`Payment reminder emailed to ${awaitingPayment.length} applicant${awaitingPayment.length === 1 ? "" : "s"} (simulated)`);
  }

  const rows: PaymentRow[] = applications
    .filter((a) => a.paymentConfirmedAt && inYear(a.academicYearId))
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
      <PageHeader title="Payments" description="Chase pending payments and review confirmed ones.">
        <AcademicYearSelect />
        <Button variant="outline" onClick={() => toast.success("Report exported successfully")}><Download className="size-4" /> Export (Mock)</Button>
      </PageHeader>

      <Card className="mb-6">
        <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base">Awaiting Payment {awaitingPayment.length > 0 && <span className="text-muted-foreground font-normal">· {awaitingPayment.length}</span>}</CardTitle>
          {awaitingPayment.length > 0 && (
            <Button size="sm" variant="outline" onClick={remindAll}><Mail className="size-4" /> Remind All</Button>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {awaitingPayment.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No applicants are awaiting payment for this academic year.</p>}
          {awaitingPayment.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 border-b last:border-0 pb-2 text-sm">
              <div className="min-w-0">
                <p className="font-medium">{a.applicantName} <span className="font-mono text-xs text-muted-foreground">· {a.referenceNumber}</span></p>
                <p className="text-xs text-muted-foreground">
                  {programName(a.programId)}
                  {a.lastPaymentReminderAt
                    ? ` · last reminded ${formatDateTime(a.lastPaymentReminderAt)} (${a.paymentReminderCount})`
                    : " · not yet reminded"}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => { sendPaymentReminder(a.id); toast.success("Payment reminder emailed (simulated)"); }}>
                <Mail className="size-4" /> Send Reminder
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-sm font-medium mb-2">Payment Log</p>
      <DataTable columns={columns} data={rows} searchKeys={["studentName", "reference"]} searchPlaceholder="Search student or reference" emptyTitle="No payments recorded" />
    </div>
  );
}
