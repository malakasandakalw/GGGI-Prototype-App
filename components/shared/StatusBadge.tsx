import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "info" | "indigo" | "purple" | "neutral";

const toneClass: Record<Tone, string> = {
  success: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
  warning: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  danger: "bg-red-500/12 text-red-700 dark:text-red-400",
  info: "bg-blue-500/12 text-blue-700 dark:text-blue-400",
  indigo: "bg-indigo-500/12 text-indigo-700 dark:text-indigo-400",
  purple: "bg-purple-500/12 text-purple-700 dark:text-purple-400",
  neutral: "bg-slate-500/12 text-slate-700 dark:text-slate-300",
};

type Cfg = { label: string; tone: Tone };

const statusConfig: Record<string, Cfg> = {
  submitted: { label: "Submitted", tone: "neutral" },
  "under-review": { label: "Under Review", tone: "indigo" },
  "payment-pending": { label: "Payment Pending", tone: "warning" },
  "payment-confirmed": { label: "Payment Confirmed", tone: "info" },
  enrolled: { label: "Enrolled", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
  waitlisted: { label: "Waitlisted", tone: "purple" },
  draft: { label: "Draft", tone: "neutral" },
  published: { label: "Published", tone: "success" },
  verified: { label: "Verified", tone: "success" },
  "pending-verification": { label: "Pending Verification", tone: "warning" },
  active: { label: "Active", tone: "success" },
  archived: { label: "Archived", tone: "neutral" },
  approved: { label: "Approved", tone: "success" },
  graded: { label: "Graded", tone: "success" },
  "not-submitted": { label: "Not Submitted", tone: "danger" },
  pending: { label: "Pending", tone: "warning" },
  closed: { label: "Closed", tone: "neutral" },
  inactive: { label: "Inactive", tone: "neutral" },
  suspended: { label: "Suspended", tone: "warning" },
  upcoming: { label: "Upcoming", tone: "info" },
  completed: { label: "Completed", tone: "success" },
  open: { label: "Open", tone: "success" },
  free: { label: "Free", tone: "success" },
  paid: { label: "Paid", tone: "warning" },
  beginner: { label: "Beginner", tone: "success" },
  intermediate: { label: "Intermediate", tone: "warning" },
  advanced: { label: "Advanced", tone: "danger" },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const cfg = statusConfig[status] ?? { label: status, tone: "neutral" as Tone };
  return (
    <Badge variant="ghost" className={cn("border-0 font-medium", toneClass[cfg.tone], className)}>
      {cfg.label}
    </Badge>
  );
}
