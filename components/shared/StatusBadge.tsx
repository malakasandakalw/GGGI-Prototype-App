import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Cfg = { label: string; className: string };

const statusConfig: Record<string, Cfg> = {
  submitted: { label: "Submitted", className: "bg-slate-100 text-slate-700" },
  "under-review": { label: "Under Review", className: "bg-indigo-100 text-indigo-700" },
  "payment-pending": { label: "Payment Pending", className: "bg-yellow-100 text-yellow-800" },
  "payment-confirmed": { label: "Payment Confirmed", className: "bg-blue-100 text-blue-800" },
  enrolled: { label: "Enrolled", className: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700" },
  waitlisted: { label: "Waitlisted", className: "bg-purple-100 text-purple-800" },
  draft: { label: "Draft", className: "bg-slate-100 text-slate-600" },
  published: { label: "Published", className: "bg-emerald-100 text-emerald-800" },
  verified: { label: "Verified", className: "bg-emerald-100 text-emerald-800" },
  "pending-verification": { label: "Pending Verification", className: "bg-orange-100 text-orange-800" },
  active: { label: "Active", className: "bg-emerald-100 text-emerald-800" },
  archived: { label: "Archived", className: "bg-slate-100 text-slate-600" },
  approved: { label: "Approved", className: "bg-emerald-100 text-emerald-800" },
  graded: { label: "Graded", className: "bg-emerald-100 text-emerald-800" },
  "not-submitted": { label: "Not Submitted", className: "bg-red-100 text-red-700" },
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  closed: { label: "Closed", className: "bg-slate-100 text-slate-600" },
  inactive: { label: "Inactive", className: "bg-slate-100 text-slate-600" },
  suspended: { label: "Suspended", className: "bg-orange-100 text-orange-800" },
  upcoming: { label: "Upcoming", className: "bg-blue-100 text-blue-800" },
  completed: { label: "Completed", className: "bg-emerald-100 text-emerald-800" },
  open: { label: "Open", className: "bg-emerald-100 text-emerald-800" },
  free: { label: "Free", className: "bg-emerald-100 text-emerald-800" },
  paid: { label: "Paid", className: "bg-amber-100 text-amber-800" },
  beginner: { label: "Beginner", className: "bg-emerald-100 text-emerald-800" },
  intermediate: { label: "Intermediate", className: "bg-amber-100 text-amber-800" },
  advanced: { label: "Advanced", className: "bg-red-100 text-red-700" },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const cfg = statusConfig[status] ?? { label: status, className: "bg-slate-100 text-slate-700" };
  return (
    <Badge variant="ghost" className={cn("border-0 font-medium", cfg.className, className)}>
      {cfg.label}
    </Badge>
  );
}
