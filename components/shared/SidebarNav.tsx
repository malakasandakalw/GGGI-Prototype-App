"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { useStore } from "@/lib/store/provider";
import { navConfig, roleLabels } from "@/lib/nav-config";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function SidebarNav() {
  const pathname = usePathname();
  const { currentRole, lectures, quizzes } = useStore();
  if (!currentRole) return null;

  const items = navConfig[currentRole];
  const pendingLectures = lectures.filter((l) => l.status === "submitted").length;
  const pendingQuizzes = quizzes.filter((q) => q.status === "submitted").length;

  return (
    <aside className="w-60 shrink-0 bg-card border-r flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b">
        <div className="flex items-center gap-2 mb-1">
          <div className="size-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center">
            <GraduationCap className="size-5" />
          </div>
          <div className="leading-tight">
            <p className="font-semibold text-sm">University LMS</p>
            <p className="text-[11px] text-muted-foreground">{roleLabels[currentRole]}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const count = item.badge === "pending-lectures" ? pendingLectures : item.badge === "pending-quizzes" ? pendingQuizzes : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                active ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && count > 0 && (
                <Badge variant="destructive" className="h-5 min-w-5 px-1.5 justify-center">
                  {count}
                </Badge>
              )}
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
