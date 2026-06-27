"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";

const titles: Record<string, string> = {
  "/test/dashboard": "Overview",
  "/test/dashboard/courses": "My Courses",
  "/test/dashboard/assignments": "Assignments",
  "/test/dashboard/grades": "Grades",
  "/test/dashboard/attendance": "Attendance",
  "/test/dashboard/timetable": "Timetable",
  "/test/dashboard/exams": "Exam Registration",
  "/test/dashboard/fees": "Fee Payment",
  "/test/dashboard/profile": "Profile",
};

export default function Header() {
  const pathname = usePathname();
  const title = titles[pathname] ?? "Dashboard";

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0">
      <h1 className="font-semibold text-gray-900">{title}</h1>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell size={18} className="text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
          JD
        </div>
      </div>
    </header>
  );
}
