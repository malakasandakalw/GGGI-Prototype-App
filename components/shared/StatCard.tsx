import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  variant?: "default" | "warning" | "success" | "danger";
}

const tones: Record<string, string> = {
  default: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-indigo-500/20",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20",
  danger: "bg-red-500/10 text-red-600 dark:text-red-400 ring-red-500/20",
};

export function StatCard({ title, value, description, icon: Icon, variant = "default" }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground truncate">{title}</p>
          <p className="font-heading text-3xl font-bold tracking-tight tabular-nums mt-1.5">{value}</p>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </div>
        <div className={cn("size-11 rounded-xl flex items-center justify-center shrink-0 ring-1", tones[variant])}>
          <Icon className="size-5" />
        </div>
      </div>
    </Card>
  );
}
