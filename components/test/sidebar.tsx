"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard, BookOpen, ClipboardList, BarChart2,
  CalendarCheck, Calendar, FileText, CreditCard, User, LogOut,
} from "lucide-react";

const navItems = [
  { label: "Overview",          href: "/test/dashboard",            icon: LayoutDashboard },
  { label: "My Courses",        href: "/test/dashboard/courses",    icon: BookOpen },
  { label: "Assignments",       href: "/test/dashboard/assignments", icon: ClipboardList },
  { label: "Grades",            href: "/test/dashboard/grades",     icon: BarChart2 },
  { label: "Attendance",        href: "/test/dashboard/attendance", icon: CalendarCheck },
  { label: "Timetable",         href: "/test/dashboard/timetable",  icon: Calendar },
  { label: "Exam Registration", href: "/test/dashboard/exams",      icon: FileText },
  { label: "Fee Payment",       href: "/test/dashboard/fees",       icon: CreditCard },
  { label: "Profile",           href: "/test/dashboard/profile",    icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-gray-100 flex flex-col min-h-screen shadow-sm">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-100">
        <Image src="/logo-long.png" alt="Logo" width={140} height={36} className="mb-4 object-contain" />
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
            JD
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">John Doe</p>
            <p className="text-xs text-gray-400 truncate">ID: S2024001 · Year 2</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                active
                  ? "bg-indigo-600 text-white font-medium shadow-sm"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon size={16} className={active ? "text-white" : "text-gray-400"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={() => router.push("/test/login")}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </aside>
  );
}
