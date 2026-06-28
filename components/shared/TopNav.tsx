"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/lib/store/provider";
import { roleLabels } from "@/lib/nav-config";
import { relativeTime } from "@/lib/utils/date";

export function TopNav() {
  const router = useRouter();
  const { currentUser, notifications, logout, markNotificationRead } = useStore();
  if (!currentUser) return null;

  const myNotifs = notifications.filter((n) => n.recipientId === currentUser.id);
  const unread = myNotifs.filter((n) => !n.read).length;
  const initials = currentUser.name.split(" ").map((p) => p[0]).slice(0, 2).join("");

  function openNotif(id: string, link?: string) {
    markNotificationRead(id);
    if (link) router.push(link);
  }

  return (
    <header className="h-14 border-b bg-card flex items-center gap-3 px-5 sticky top-0 z-30">
      <div className="relative max-w-sm flex-1 hidden md:block">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search..." className="pl-9 h-9" />
      </div>
      <div className="flex-1 md:hidden" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="size-5" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            Notifications
            {unread > 0 && <span className="text-xs text-muted-foreground">{unread} unread</span>}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {myNotifs.slice(0, 5).map((n) => (
            <DropdownMenuItem
              key={n.id}
              className="flex flex-col items-start gap-0.5 py-2"
              onClick={() => openNotif(n.id, n.linkTo)}
            >
              <span className={n.read ? "text-sm" : "text-sm font-semibold"}>{n.title}</span>
              <span className="text-xs text-muted-foreground line-clamp-2">{n.body}</span>
              <span className="text-[10px] text-muted-foreground">{relativeTime(n.createdAt)}</span>
            </DropdownMenuItem>
          ))}
          {myNotifs.length === 0 && (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">No notifications</div>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/notifications" className="justify-center text-sm">View all notifications</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2">
            <Avatar className="size-8">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="font-medium">{currentUser.name}</div>
            <div className="text-xs text-muted-foreground font-normal">{roleLabels[currentUser.role]}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => { logout(); router.push("/"); }}>
            <LogOut className="size-4" /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
