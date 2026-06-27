"use client";

import { useState } from "react";
import { FileText, X } from "lucide-react";

const exams = [
  { id: 1, code: "CS201", name: "Data Structures & Algorithms", date: "Jul 14, 2026", time: "9:00 AM", duration: "3 hrs", venue: "Exam Hall A", registered: false },
  { id: 2, code: "CS202", name: "Database Systems", date: "Jul 15, 2026", time: "9:00 AM", duration: "3 hrs", venue: "Exam Hall B", registered: false },
  { id: 3, code: "MA201", name: "Discrete Mathematics", date: "Jul 15, 2026", time: "2:00 PM", duration: "2.5 hrs", venue: "Exam Hall A", registered: false },
  { id: 4, code: "CS203", name: "Operating Systems", date: "Jul 17, 2026", time: "9:00 AM", duration: "3 hrs", venue: "Exam Hall C", registered: false },
  { id: 5, code: "EN201", name: "Technical Writing", date: "Jul 18, 2026", time: "1:00 PM", duration: "2 hrs", venue: "Exam Hall B", registered: false },
];

type Exam = typeof exams[0];

export default function ExamRegistration() {
  const [examList, setExamList] = useState(exams);
  const [confirmExam, setConfirmExam] = useState<Exam | null>(null);
  const [specialNeeds, setSpecialNeeds] = useState("");
  const [toast, setToast] = useState("");

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  function handleRegister() {
    if (!confirmExam) return;
    setExamList((p) => p.map((e) => e.id === confirmExam.id ? { ...e, registered: true } : e));
    showToast(`Registered for ${confirmExam.name}`);
    setConfirmExam(null); setSpecialNeeds("");
  }

  const registeredCount = examList.filter((e) => e.registered).length;

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Exams", value: examList.length },
          { label: "Registered", value: registeredCount },
          { label: "Remaining", value: examList.length - registeredCount },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <FileText size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-600">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <p className="font-semibold text-gray-900">Mid-term Examinations</p>
          <span className="text-xs text-gray-600">Jul 14–18, 2026</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Course</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Date & Time</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Duration</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Venue</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {examList.map((e) => (
              <tr key={e.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{e.name}</p>
                  <p className="text-xs text-blue-500 font-mono mt-0.5">{e.code}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-gray-800 font-medium">{e.date}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{e.time}</p>
                </td>
                <td className="px-6 py-4 text-gray-600">{e.duration}</td>
                <td className="px-6 py-4 text-gray-600">{e.venue}</td>
                <td className="px-6 py-4">
                  {e.registered
                    ? <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-600 border border-green-200 font-medium">Registered</span>
                    : <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200 font-medium">Pending</span>}
                </td>
                <td className="px-6 py-4 text-right">
                  {!e.registered && (
                    <button onClick={() => setConfirmExam(e)} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors">Register</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmExam && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-gray-200 relative">
            <button onClick={() => setConfirmExam(null)} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100">
              <X size={16} className="text-gray-600" />
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Confirm Registration</h2>
            <p className="text-sm text-gray-600 mb-5">Review exam details before registering</p>
            <div className="bg-gray-50 rounded-xl p-4 mb-5 text-sm space-y-2">
              {[
                { label: "Course", value: confirmExam.name },
                { label: "Date", value: `${confirmExam.date} at ${confirmExam.time}` },
                { label: "Duration", value: confirmExam.duration },
                { label: "Venue", value: confirmExam.venue },
              ].map((r) => (
                <div key={r.label} className="flex justify-between">
                  <span className="text-gray-600">{r.label}</span>
                  <span className="text-gray-900 font-medium">{r.value}</span>
                </div>
              ))}
            </div>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Special Requirements <span className="text-gray-600 font-normal">(optional)</span></label>
              <input value={specialNeeds} onChange={(e) => setSpecialNeeds(e.target.value)} placeholder="e.g. Extra time, wheelchair access" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-300" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleRegister} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-sm font-medium transition-colors">Confirm Registration</button>
              <button onClick={() => setConfirmExam(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
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
