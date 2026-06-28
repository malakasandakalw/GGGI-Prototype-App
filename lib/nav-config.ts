import {
  LayoutDashboard, Users, BookMarked, Globe, Settings, ScrollText,
  UserCog, Calendar, BarChart3, Megaphone, ClipboardList, ArrowLeftRight,
  Receipt, Layers, CheckCircle, CheckSquare, ClipboardCheck, Award,
  BookOpen, FileText, Search,
} from "lucide-react";
import type { NavItem, Role } from "@/lib/types";

export const navConfig: Record<Role, NavItem[]> = {
  "super-admin": [
    { label: "Dashboard", icon: LayoutDashboard, href: "/super-admin/dashboard" },
    { label: "User Management", icon: Users, href: "/super-admin/users" },
    { label: "Programs", icon: BookMarked, href: "/super-admin/programs" },
    { label: "Open Learning", icon: Globe, href: "/super-admin/open-learning" },
    { label: "Settings", icon: Settings, href: "/super-admin/settings" },
    { label: "Audit Log", icon: ScrollText, href: "/super-admin/audit-log" },
  ],
  "program-admin": [
    { label: "Dashboard", icon: LayoutDashboard, href: "/program-admin/dashboard" },
    { label: "Programs", icon: BookMarked, href: "/program-admin/programs" },
    { label: "HOD Accounts", icon: UserCog, href: "/program-admin/hods" },
    { label: "Academic Calendar", icon: Calendar, href: "/program-admin/calendar" },
    { label: "Reports", icon: BarChart3, href: "/program-admin/reports" },
    { label: "Announcements", icon: Megaphone, href: "/program-admin/announcements" },
  ],
  registrar: [
    { label: "Dashboard", icon: LayoutDashboard, href: "/registrar/dashboard" },
    { label: "Applications", icon: ClipboardList, href: "/registrar/applications" },
    { label: "Students", icon: Users, href: "/registrar/students" },
    { label: "Cross-Enrollment", icon: ArrowLeftRight, href: "/registrar/cross-enrollment" },
    { label: "Payment Log", icon: Receipt, href: "/registrar/payments" },
  ],
  hod: [
    { label: "Dashboard", icon: LayoutDashboard, href: "/hod/dashboard" },
    { label: "Programs", icon: BookMarked, href: "/hod/programs" },
    { label: "Modules", icon: Layers, href: "/hod/modules" },
    { label: "Lecturers", icon: UserCog, href: "/hod/lecturers" },
    { label: "Verify Lectures", icon: CheckCircle, href: "/hod/verification/lectures", badge: "pending-lectures" },
    { label: "Verify Quizzes", icon: CheckSquare, href: "/hod/verification/quizzes", badge: "pending-quizzes" },
    { label: "Exam Calendar", icon: Calendar, href: "/hod/calendar" },
    { label: "Gradebook", icon: ClipboardCheck, href: "/hod/gradebook" },
    { label: "Results", icon: Award, href: "/hod/results" },
    { label: "Reports", icon: BarChart3, href: "/hod/reports" },
    { label: "Open Learning", icon: Globe, href: "/hod/open-learning" },
  ],
  lecturer: [
    { label: "Dashboard", icon: LayoutDashboard, href: "/lecturer/dashboard" },
    { label: "My Modules", icon: Layers, href: "/lecturer/modules" },
  ],
  "cohort-student": [
    { label: "Dashboard", icon: LayoutDashboard, href: "/cohort-student/dashboard" },
    { label: "My Modules", icon: BookOpen, href: "/cohort-student/modules" },
    { label: "Exam Calendar", icon: Calendar, href: "/cohort-student/calendar" },
    { label: "Grades", icon: Award, href: "/cohort-student/grades" },
    { label: "Transcript", icon: FileText, href: "/cohort-student/transcript" },
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

export const roleLabels: Record<Role, string> = {
  "super-admin": "Super Admin",
  "program-admin": "Program Admin",
  registrar: "Registrar",
  hod: "Head of Department",
  lecturer: "Lecturer",
  "cohort-student": "Cohort Student",
  "ol-student": "Open Learning Student",
};
