"use client";

import { BookOpen, TrendingUp, CalendarCheck, ClipboardList, ArrowUpRight, Clock, ChevronRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const stats = [
  { label: "Enrolled Courses", value: "5", sub: "14 credit hours", icon: BookOpen, color: "bg-blue-50 text-blue-600" },
  { label: "Current GPA", value: "3.72", sub: "+0.12 from last semester", icon: TrendingUp, color: "bg-green-50 text-green-600" },
  { label: "Attendance", value: "88%", sub: "Min. required: 75%", icon: CalendarCheck, color: "bg-orange-50 text-orange-600" },
  { label: "Pending Tasks", value: "3", sub: "Assignments due soon", icon: ClipboardList, color: "bg-red-50 text-red-600" },
];

const gradeData = [
  { course: "CS201", Assignments: 85, Midterm: 78 },
  { course: "CS202", Assignments: 90, Midterm: 82 },
  { course: "MA201", Assignments: 74, Midterm: 70 },
  { course: "CS203", Assignments: 88, Midterm: 75 },
  { course: "EN201", Assignments: 87, Midterm: 80 },
];

const upcoming = [
  { course: "CS202", task: "ER Diagram Assignment", due: "Jun 27", urgent: true },
  { course: "MA201", task: "Problem Set 4", due: "Jun 28", urgent: true },
  { course: "CS203", task: "Lab Report 3", due: "Jul 2", urgent: false },
];

const announcements = [
  { title: "Mid-term exams: Jul 14–18", date: "Jun 20", tag: "Exam" },
  { title: "Semester 2 registration now open", date: "Jun 15", tag: "Academic" },
  { title: "Library portal maintenance Jun 22", date: "Jun 18", tag: "Notice" },
];

const tagStyle: Record<string, string> = {
  Exam: "bg-red-50 text-red-600",
  Academic: "bg-blue-50 text-blue-600",
  Notice: "bg-gray-100 text-gray-500",
};

export default function Overview() {
  return (
    <div className="w-full space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Good morning, John 👋</h2>
        <p className="text-gray-400 text-sm mt-0.5">Semester 1 · Academic Year 2025/2026 · BSc Computer Science</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                  <Icon size={18} />
                </div>
                <ArrowUpRight size={16} className="text-gray-300" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Chart + sidebar */}
      <div className="grid grid-cols-3 gap-4">
        {/* Grade chart */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-semibold text-gray-900">Grade Overview</p>
              <p className="text-xs text-gray-400 mt-0.5">Assignments vs Mid-term by course</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={gradeData} barCategoryGap="30%" barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="course" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                cursor={{ fill: "#f9fafb" }}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: "#9ca3af" }} />
              <Bar dataKey="Assignments" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Midterm" fill="#e0e7ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Upcoming */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex-1">
            <p className="font-semibold text-gray-900 mb-4">Upcoming Deadlines</p>
            <div className="flex flex-col gap-3">
              {upcoming.map((item) => (
                <div key={item.task} className="flex items-start gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${item.urgent ? "bg-red-400" : "bg-gray-300"}`} />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800 font-medium truncate">{item.task}</p>
                    <p className="text-xs text-gray-400">{item.course} · Due {item.due}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Announcements */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <p className="font-semibold text-gray-900 mb-4">Announcements</p>
        <div className="divide-y divide-gray-50">
          {announcements.map((a) => (
            <div key={a.title} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tagStyle[a.tag]}`}>{a.tag}</span>
                <p className="text-sm text-gray-800">{a.title}</p>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Clock size={12} />
                <span className="text-xs">{a.date}</span>
                <ChevronRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
