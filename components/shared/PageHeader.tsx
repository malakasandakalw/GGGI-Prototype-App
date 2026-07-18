import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void; icon?: LucideIcon; disabled?: boolean };
  children?: React.ReactNode;
}

export function PageHeader({ title, description, action, children }: PageHeaderProps) {
  const Icon = action?.icon;
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground text-sm mt-1">{description}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {children}
        {action && (
          <Button onClick={action.onClick} disabled={action.disabled}>
            {Icon && <Icon className="size-4" />}
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
