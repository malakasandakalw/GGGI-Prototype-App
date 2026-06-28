"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store/provider";
import { SidebarNav } from "@/components/shared/SidebarNav";
import { TopNav } from "@/components/shared/TopNav";
import { RoleSwitcher } from "@/components/shared/RoleSwitcher";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentRole } = useStore();
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
        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
      <RoleSwitcher />
    </div>
  );
}
