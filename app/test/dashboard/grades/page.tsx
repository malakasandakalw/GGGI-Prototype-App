"use client";

import { useState } from "react";
import { X } from "lucide-react";

const currentGrades = [
  { code: "CS201", name: "Data Structures & Algorithms", assignments: 85, midterm: 78 },
  { code: "CS202", name: "Database Systems", assignments: 90, midterm: 82 },
  { code: "MA201", name: "Discrete Mathematics", assignments: 74, midterm: 70 },
  { code: "CS203", name: "Operating Systems", assignments: 88, midterm: 75 },
  { code: "EN201", name: "Technical Writing", assignments: 87, midterm: 80 },
];

const pastGrades = [
  { code: "CS101", name: "Introduction to Programming", grade: "A", gpa: 4.0 },
  { code: "CS102", name: "Web Development Fundamentals", grade: "A-", gpa: 3.7 },
  { code: "MA101", name: "Calculus I", grade: "B+", gpa: 3.3 },
  { code: "EN101", name: "Academic Writing", grade: "A", gpa: 4.0 },
];

const gradeColor: Record<string, string> = {
  "A": "bg-green-50 text-green-700 border border-green-200",
  "A-": "bg-green-50 text-green-600 border border-green-200",
  "B+": "bg-blue-50 text-blue-700 border border-blue-200",
  "B": "bg-blue-50 text-blue-600 border border-blue-200",
};

type PastGrade = typeof pastGrades[0];

export default function Grades() {
  const [appealCourse, setAppealCourse] = useState<PastGrade | null>(null);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [appealed, setAppealed] = useState<string[]>([]);
  const [toast, setToast] = useState("");

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  function handleAppeal() {
    if (!appealCourse) return;
    setAppealed((p) => [...p, appealCourse.code]);
    showToast(`Appeal submitted for ${appealCourse.name}`);
    setAppealCourse(null); setReason(""); setDescription("");
  }

  const avgAssignments = Math.round(currentGrades.reduce((s, g) => s + g.assignments, 0) / currentGrades.length);
  const avgMidterm = Math.round(currentGrades.reduce((s, g) => s + g.midterm, 0) / currentGrades.length);

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Current GPA", value: "3.72", sub: "Year 2, Semester 1" },
          { label: "Avg. Assignments", value: `${avgAssignments}%`, sub: "Across all courses" },
          { label: "Avg. Mid-term", value: `${avgMidterm}%`, sub: "Across all courses" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-600 mt-1">{s.label}</p>
            <p className="text-xs text-gray-300 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Current semester */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <p className="font-semibold text-gray-900">Current Semester</p>
          <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">In Progress</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Course</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Assignments</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide w-40">Progress</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Mid-term</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Final</th>
            </tr>
          </thead>
          <tbody>
            {currentGrades.map((g) => (
              <tr key={g.code} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{g.name}</p>
                  <p className="text-xs text-blue-500 font-mono mt-0.5">{g.code}</p>
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900">{g.assignments}%</td>
                <td className="px-6 py-4">
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${g.assignments}%` }} />
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900">{g.midterm}%</td>
                <td className="px-6 py-4 text-gray-300 text-xs">Not released</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Previous semester */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <p className="font-semibold text-gray-900">Previous Semester</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Course</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Final Grade</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">GPA Points</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {pastGrades.map((g) => (
              <tr key={g.code} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{g.name}</p>
                  <p className="text-xs text-blue-500 font-mono mt-0.5">{g.code}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${gradeColor[g.grade] ?? "bg-gray-100 text-gray-600"}`}>{g.grade}</span>
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900">{g.gpa}</td>
                <td className="px-6 py-4 text-right">
                  {appealed.includes(g.code)
                    ? <span className="text-xs text-gray-300">Appeal submitted</span>
                    : <button onClick={() => setAppealCourse(g)} className="text-xs border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg text-gray-600 hover:text-gray-700 hover:bg-gray-50 transition-colors">Appeal Grade</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Appeal modal */}
      {appealCourse && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-gray-200 relative">
            <button onClick={() => setAppealCourse(null)} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100">
              <X size={16} className="text-gray-600" />
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Appeal Grade</h2>
            <p className="text-sm text-gray-600 mb-5">{appealCourse.name} — Current grade: <span className={`text-xs font-bold px-2 py-0.5 rounded-full ml-1 ${gradeColor[appealCourse.grade] ?? "bg-gray-100 text-gray-600"}`}>{appealCourse.grade}</span></p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Appeal</label>
                <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-300">
                  <option value="">Select a reason</option>
                  <option>Marking error</option>
                  <option>Missing submission recorded</option>
                  <option>Medical circumstances</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Explain your appeal in detail..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-300 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supporting Document <span className="text-gray-600 font-normal">(optional)</span></label>
                <input type="file" className="w-full text-sm text-gray-600" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleAppeal} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-sm font-medium transition-colors">Submit Appeal</button>
              <button onClick={() => setAppealCourse(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl border border-gray-700 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
          {toast}
        </div>
      )}
    </div>
  );
}
