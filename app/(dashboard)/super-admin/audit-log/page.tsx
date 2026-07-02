"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store/provider";
import { AUDIT_ACTION_TYPES } from "@/lib/mock-data/audit";
import { roleLabels } from "@/lib/nav-config";
import { formatDateTime } from "@/lib/utils/date";
import type { AuditEvent } from "@/lib/types";

export default function AuditLogPage() {
  const { auditEvents } = useStore();
  const [action, setAction] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(
    () =>
      auditEvents.filter((e) => {
        if (action !== "all" && e.action !== action) return false;
        const d = e.timestamp.slice(0, 10);
        if (from && d < from) return false;
        if (to && d > to) return false;
        return true;
      }),
    [auditEvents, action, from, to],
  );

  const columns: Column<AuditEvent>[] = [
    { key: "timestamp", header: "Timestamp", render: (e) => <span className="text-xs">{formatDateTime(e.timestamp)}</span> },
    { key: "userName", header: "User", render: (e) => <span className="font-medium">{e.userName}</span> },
    { key: "role", header: "Role", render: (e) => roleLabels[e.role] },
    { key: "action", header: "Action", render: (e) => <Badge variant="secondary">{e.action}</Badge> },
    { key: "details", header: "Details", render: (e) => <span className="text-muted-foreground">{e.details}</span> },
    { key: "ipAddress", header: "IP", render: (e) => <span className="font-mono text-xs">{e.ipAddress}</span> },
  ];

  return (
    <div>
      <PageHeader title="Audit Log" description="Searchable log of all significant system actions.">
        <Button variant="outline" size="sm" onClick={() => toast.success(`Exported ${filtered.length} audit entries (simulated)`)}><Download className="size-4" /> Export Log</Button>
      </PageHeader>
      <DataTable
        columns={columns}
        data={filtered}
        searchKeys={["userName", "details"]}
        searchPlaceholder="Search by user or details"
        filters={
          <>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" />
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" />
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger className="w-52"><SelectValue placeholder="Action" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {AUDIT_ACTION_TYPES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </>
        }
      />
    </div>
  );
}
