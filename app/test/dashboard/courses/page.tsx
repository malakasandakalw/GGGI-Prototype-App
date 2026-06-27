"use client";

import { useState } from "react";
import { BookOpen, Plus, X } from "lucide-react";

const initialEnrolled = [
  { code: "CS201", name: "Data Structures & Algorithms", lecturer: "Dr. Anura Perera", credits: 3, schedule: "Mon/Wed 9:00–10:30", room: "B201" },
  { code: "CS202", name: "Database Systems", lecturer: "Dr. Samanthi Dias", credits: 3, schedule: "Tue/Thu 11:00–12:30", room: "A105" },
  { code: "MA201", name: "Discrete Mathematics", lecturer: "Prof. Kamal Silva", credits: 3, schedule: "Mon/Fri 8:00–9:00", room: "C301" },
  { code: "CS203", name: "Operating Systems", lecturer: "Dr. Nimal Fernando", credits: 3, schedule: "Wed/Fri 2:00–3:30", room: "B105" },
  { code: "EN201", name: "Technical Writing", lecturer: "Ms. Dilini Rajapaksa", credits: 2, schedule: "Thu 1:00–3:00", room: "A202" },
];

const availableCourses = [
  { code: "CS204", name: "Computer Networks", lecturer: "Dr. Ruwan Jayasena", credits: 3, schedule: "Mon/Wed 11:00–12:30", seats: 12 },
  { code: "CS205", name: "Software Engineering", lecturer: "Dr. Priya Mendis", credits: 3, schedule: "Tue/Thu 9:00–10:30", seats: 5 },
  { code: "MA202", name: "Linear Algebra", lecturer: "Prof. Kamal Silva", credits: 3, schedule: "Wed/Fri 8:00–9:00", seats: 20 },
  { code: "CS206", name: "Artificial Intelligence", lecturer: "Dr. Tharindu Wijeratne", credits: 3, schedule: "Mon/Thu 2:00–3:30", seats: 8 },
];

type Course = { code: string; name: string; lecturer: string; credits: number; schedule: string; seats?: number; room?: string };

export default function Courses() {
  const [enrolled, setEnrolled] = useState(initialEnrolled);
  const [available, setAvailable] = useState(availableCourses);
  const [confirmCourse, setConfirmCourse] = useState<Course | null>(null);
  const [dropCourse, setDropCourse] = useState<Course | null>(null);
  const [toast, setToast] = useState("");

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  function handleEnroll() {
    if (!confirmCourse) return;
    setEnrolled((p) => [...p, { ...confirmCourse, room: "TBA" }]);
    setAvailable((p) => p.filter((c) => c.code !== confirmCourse.code));
    showToast(`Enrolled in ${confirmCourse.name}`);
    setConfirmCourse(null);
  }

  function handleDrop() {
    if (!dropCourse) return;
    setEnrolled((p) => p.filter((c) => c.code !== dropCourse.code));
    showToast(`Dropped ${dropCourse.name}`);
    setDropCourse(null);
  }

  const totalCredits = enrolled.reduce((s, c) => s + c.credits, 0);

  return (
    <div className="w-full space-y-6">
      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Enrolled", value: enrolled.length },
          { label: "Credit Hours", value: totalCredits },
          { label: "Available to Add", value: available.length },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <BookOpen size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-600">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Enrolled */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <p className="font-semibold text-gray-900">Enrolled Courses</p>
          <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{enrolled.length} courses</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Course</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Lecturer</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Schedule</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Room</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Credits</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {enrolled.map((c) => (
              <tr key={c.code} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{c.name}</p>
                  <p className="text-xs text-blue-500 font-mono mt-0.5">{c.code}</p>
                </td>
                <td className="px-6 py-4 text-gray-600 text-sm">{c.lecturer}</td>
                <td className="px-6 py-4 text-gray-600 text-sm">{c.schedule}</td>
                <td className="px-6 py-4 text-gray-600 text-sm">{c.room}</td>
                <td className="px-6 py-4"><span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">{c.credits} cr</span></td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => setDropCourse(c)} className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors">Drop</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Available */}
      {available.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <p className="font-semibold text-gray-900">Available for Enrollment</p>
            <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">Registration open</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Course</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Lecturer</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Schedule</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Credits</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Seats</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {available.map((c) => (
                <tr key={c.code} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{c.name}</p>
                    <p className="text-xs text-blue-500 font-mono mt-0.5">{c.code}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{c.lecturer}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{c.schedule}</td>
                  <td className="px-6 py-4"><span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">{c.credits} cr</span></td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium ${c.seats <= 5 ? "text-red-500" : "text-green-600"}`}>{c.seats} left</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setConfirmCourse(c)} className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors ml-auto">
                      <Plus size={12} /> Enroll
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Enroll modal */}
      {confirmCourse && (
        <Modal onClose={() => setConfirmCourse(null)}>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Confirm Enrollment</h2>
          <p className="text-sm text-gray-600 mb-5">Review details before enrolling</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-5 text-sm space-y-2">
            <Row label="Course" value={confirmCourse.name} />
            <Row label="Code" value={confirmCourse.code} mono />
            <Row label="Lecturer" value={confirmCourse.lecturer} />
            <Row label="Schedule" value={confirmCourse.schedule} />
            <Row label="Credits" value={`${confirmCourse.credits} credit hours`} />
          </div>
          <div className="flex gap-3">
            <button onClick={handleEnroll} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-sm font-medium transition-colors">Confirm Enrollment</button>
            <button onClick={() => setConfirmCourse(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          </div>
        </Modal>
      )}

      {/* Drop modal */}
      {dropCourse && (
        <Modal onClose={() => setDropCourse(null)}>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Drop Course</h2>
          <p className="text-sm text-gray-600 mb-5">This action cannot be undone during the semester.</p>
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-5 text-sm">
            <p className="font-medium text-red-800">{dropCourse.name}</p>
            <p className="text-red-500 font-mono text-xs mt-0.5">{dropCourse.code}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleDrop} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2.5 text-sm font-medium transition-colors">Yes, Drop Course</button>
            <button onClick={() => setDropCourse(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
          </div>
        </Modal>
      )}

      <Toast message={toast} />
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}</span>
      <span className={`text-gray-900 font-medium ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-gray-200 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 transition-colors">
          <X size={16} className="text-gray-600" />
        </button>
        {children}
      </div>
    </div>
  );
}

function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 right-6 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl border border-gray-700 flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
      {message}
    </div>
  );
}
