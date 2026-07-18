"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { useStore } from "@/lib/store/provider";
import { navConfig, roleLabels, studentNavItems } from "@/lib/nav-config";
import { useStudentAccess } from "@/hooks/use-student-access";
import { isStudentRole } from "@/lib/utils/student-access";
import { cn } from "@/lib/utils";

export function SidebarNav() {
  const pathname = usePathname();
  const { currentRole } = useStore();
  const { hasCohortAccess } = useStudentAccess();
  if (!currentRole) return null;

  // Students get one unified, enrollment-driven nav; staff keep their fixed role nav.
  const items = isStudentRole(currentRole)
    ? studentNavItems({ role: currentRole, hasCohortAccess })
    : navConfig[currentRole];

  return (
    <aside className="w-60 shrink-0 bg-card border-r border-border/60 shadow-sm flex flex-col h-screen sticky top-0 z-40">
      <div className="px-5 py-5 border-b border-border/60">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="size-9 rounded-xl bg-linear-to-br from-primary to-[color-mix(in_oklch,var(--primary),#000_22%)] text-primary-foreground flex items-center justify-center shadow-sm ring-1 ring-white/10">
            <GraduationCap className="size-5" />
          </div>
          <div className="leading-tight">
            <p className="font-heading font-semibold text-sm tracking-tight">University LMS</p>
            <p className="text-[11px] text-muted-foreground">{roleLabels[currentRole]}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-primary-foreground/70" />
              )}
              <Icon className="size-4 shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-3 border-t text-[11px] text-muted-foreground">
        Prototype — simulated data
      </div>
    </aside>
  );
}
