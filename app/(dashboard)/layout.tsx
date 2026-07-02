"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Wrench } from "lucide-react";
import { useStore } from "@/lib/store/provider";
import { SidebarNav } from "@/components/shared/SidebarNav";
import { TopNav } from "@/components/shared/TopNav";
import { RoleSwitcher } from "@/components/shared/RoleSwitcher";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentRole, systemSettings } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (currentRole === null) router.replace("/");
  }, [currentRole, router]);

  if (!currentRole) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Redirecting to login…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <SidebarNav />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        {systemSettings.maintenanceMode && (
          <div className="flex items-center gap-2 bg-yellow-100 text-yellow-900 border-b border-yellow-200 px-6 py-2 text-sm">
            <Wrench className="size-4 shrink-0" />
            <span><span className="font-medium">Maintenance mode is active.</span> The system is undergoing scheduled maintenance — some features may be temporarily unavailable.</span>
          </div>
        )}
        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
      <RoleSwitcher />
    </div>
  );
}
