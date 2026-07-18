import {
  LayoutDashboard, Users, BookMarked, Globe, Settings, ScrollText,
  UserCog, Calendar, BarChart3, Megaphone, ClipboardList, ArrowLeftRight,
  Receipt, Layers, ClipboardCheck, Award,
  BookOpen, FileText, Search, MessageSquare, TrendingUp,
} from "lucide-react";
import type { NavItem, Role } from "@/lib/types";

export const navConfig: Record<Role, NavItem[]> = {
  "super-admin": [
    { label: "Dashboard", icon: LayoutDashboard, href: "/super-admin/dashboard" },
    { label: "User Management", icon: Users, href: "/super-admin/users" },
    { label: "Programs", icon: BookMarked, href: "/super-admin/programs" },
    { label: "Open Learning", icon: Globe, href: "/super-admin/open-learning" },
    { label: "Reports", icon: BarChart3, href: "/super-admin/reports" },
    { label: "Announcements", icon: Megaphone, href: "/super-admin/announcements" },
    { label: "Settings", icon: Settings, href: "/super-admin/settings" },
    { label: "Audit Log", icon: ScrollText, href: "/super-admin/audit-log" },
  ],
  "program-admin": [
    { label: "Dashboard", icon: LayoutDashboard, href: "/program-admin/dashboard" },
    { label: "Programs", icon: BookMarked, href: "/program-admin/programs" },
    { label: "Modules", icon: Layers, href: "/program-admin/modules" },
    { label: "Student Results", icon: ClipboardCheck, href: "/program-admin/results" },
    { label: "HOD Accounts", icon: UserCog, href: "/program-admin/hods" },
    { label: "Open Learning", icon: Globe, href: "/program-admin/open-learning" },
    { label: "Academic Calendar", icon: Calendar, href: "/program-admin/calendar" },
    { label: "Reports", icon: BarChart3, href: "/program-admin/reports" },
    { label: "Announcements", icon: Megaphone, href: "/program-admin/announcements" },
    { label: "Escalations", icon: MessageSquare, href: "/program-admin/escalations" },
  ],
  registrar: [
    { label: "Dashboard", icon: LayoutDashboard, href: "/registrar/dashboard" },
    { label: "Applications", icon: ClipboardList, href: "/registrar/applications" },
    { label: "Program Clerks", icon: UserCog, href: "/registrar/clerks" },
    { label: "Students", icon: Users, href: "/registrar/students" },
    { label: "Cross-Enrollment", icon: ArrowLeftRight, href: "/registrar/cross-enrollment" },
    { label: "Payment Log", icon: Receipt, href: "/registrar/payments" },
    { label: "Reports", icon: BarChart3, href: "/registrar/reports" },
  ],
  hod: [
    { label: "Dashboard", icon: LayoutDashboard, href: "/hod/dashboard" },
    { label: "Programs", icon: BookMarked, href: "/hod/programs" },
    { label: "Modules", icon: Layers, href: "/hod/modules" },
    { label: "Lecturers", icon: UserCog, href: "/hod/lecturers" },
    { label: "Exam Calendar", icon: Calendar, href: "/hod/calendar" },
    { label: "Gradebook", icon: ClipboardCheck, href: "/hod/gradebook" },
    { label: "Results", icon: Award, href: "/hod/results" },
    { label: "Reports", icon: BarChart3, href: "/hod/reports" },
    { label: "Announcements", icon: Megaphone, href: "/hod/announcements" },
    { label: "Open Learning", icon: Globe, href: "/hod/open-learning" },
  ],
  lecturer: [
    { label: "Dashboard", icon: LayoutDashboard, href: "/lecturer/dashboard" },
    { label: "My Modules", icon: Layers, href: "/lecturer/modules" },
    { label: "Open Learning", icon: Globe, href: "/lecturer/open-learning" },
    { label: "Messages", icon: MessageSquare, href: "/lecturer/messages" },
    { label: "Exam Calendar", icon: Calendar, href: "/lecturer/calendar" },
    { label: "Reports", icon: BarChart3, href: "/lecturer/reports" },
  ],
  "cohort-student": [
    { label: "Dashboard", icon: LayoutDashboard, href: "/cohort-student/dashboard" },
    { label: "My Modules", icon: BookOpen, href: "/cohort-student/modules" },
    { label: "Exam Calendar", icon: Calendar, href: "/cohort-student/calendar" },
    { label: "Grades", icon: Award, href: "/cohort-student/grades" },
    { label: "Transcript", icon: FileText, href: "/cohort-student/transcript" },
    { label: "Progression", icon: TrendingUp, href: "/cohort-student/progression" },
    { label: "Cross-Enrollment", icon: ArrowLeftRight, href: "/cohort-student/cross-enrollment" },
    { label: "Explore (OL)", icon: Globe, href: "/cohort-student/explore" },
  ],
  "ol-student": [
    { label: "Dashboard", icon: LayoutDashboard, href: "/ol-student/dashboard" },
    { label: "Course Catalog", icon: Search, href: "/ol-student/catalog" },
    { label: "My Courses", icon: BookOpen, href: "/ol-student/courses" },
    { label: "Certificates", icon: Award, href: "/ol-student/certificates" },
    { label: "Cohort Modules", icon: ArrowLeftRight, href: "/ol-student/cross-enrollment" },
  ],
};

// Unified student navigation (Phase 2). Both student roles render this one list.
// OL items are always shown (anyone can browse/enrol); cohort items appear only once the
// student actually has cohort access (own programme or a cross-enrolled module).
// `role` decides only which own-tree Dashboard / Cross-Enrollment page the entry points at —
// the cohort content routes are shared and not role-locked.
export function studentNavItems(opts: { role: Role; hasCohortAccess: boolean }): NavItem[] {
  const { role, hasCohortAccess } = opts;
  const items: NavItem[] = [
    { label: "Dashboard", icon: LayoutDashboard, href: `/${role}/dashboard` },
  ];
  if (hasCohortAccess) {
    items.push(
      { label: "My Modules", icon: Layers, href: "/cohort-student/modules" },
      { label: "Exam Calendar", icon: Calendar, href: "/cohort-student/calendar" },
      { label: "Grades", icon: Award, href: "/cohort-student/grades" },
      { label: "Transcript", icon: FileText, href: "/cohort-student/transcript" },
      { label: "Progression", icon: TrendingUp, href: "/cohort-student/progression" },
    );
  }
  items.push(
    { label: "Course Catalog", icon: Search, href: "/ol-student/catalog" },
    { label: "My OL Courses", icon: BookOpen, href: "/ol-student/courses" },
    { label: "Certificates", icon: Award, href: "/ol-student/certificates" },
    { label: "Cross-Enrollment", icon: ArrowLeftRight, href: `/${role}/cross-enrollment` },
  );
  return items;
}

export const roleLabels: Record<Role, string> = {
  "super-admin": "Super Admin",
  "program-admin": "Program Admin",
  registrar: "Registrar",
  hod: "Head of Department",
  lecturer: "Lecturer",
  "cohort-student": "Cohort Student",
  "ol-student": "Open Learning Student",
};
