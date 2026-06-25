"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";

const initialAssignments = [
  { id: 1, course: "CS202", title: "ER Diagram Assignment", due: "Jun 27, 2026", status: "Pending", marks: null },
  { id: 2, course: "MA201", title: "Problem Set 4", due: "Jun 28, 2026", status: "Pending", marks: null },
  { id: 3, course: "CS203", title: "Lab Report 3", due: "Jul 2, 2026", status: "Pending", marks: null },
  { id: 4, course: "CS201", title: "Sorting Algorithm Analysis", due: "Jun 15, 2026", status: "Submitted", marks: null },
  { id: 5, course: "EN201", title: "Technical Report Draft", due: "Jun 10, 2026", status: "Graded", marks: "87/100" },
  { id: 6, course: "CS202", title: "SQL Query Lab", due: "Jun 5, 2026", status: "Graded", marks: "92/100" },
  { id: 7, course: "MA201", title: "Problem Set 3", due: "May 30, 2026", status: "Graded", marks: "78/100" },
];

const statusConfig: Record<string, { label: string; style: string }> = {
  Pending:   { label: "Pending",   style: "bg-amber-50 text-amber-600 border border-amber-200" },
  Submitted: { label: "Submitted", style: "bg-blue-50 text-blue-600 border border-blue-200" },
  Graded:    { label: "Graded",    style: "bg-green-50 text-green-600 border border-green-200" },
};

type Assignment = typeof initialAssignments[0];

export default function Assignments() {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [submitting, setSubmitting] = useState<Assignment | null>(null);
  const [fileName, setFileName] = useState("");
  const [notes, setNotes] = useState("");
  const [toast, setToast] = useState("");

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  function handleSubmit() {
    if (!submitting) return;
    setAssignments((p) => p.map((a) => a.id === submitting.id ? { ...a, status: "Submitted" } : a));
    showToast(`${submitting.title} submitted`);
    setSubmitting(null); setFileName(""); setNotes("");
  }

  const pending = assignments.filter((a) => a.status === "Pending").length;
  const submitted = assignments.filter((a) => a.status === "Submitted").length;
  const graded = assignments.filter((a) => a.status === "Graded").length;

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending", value: pending, style: "bg-amber-50 text-amber-600" },
          { label: "Submitted", value: submitted, style: "bg-blue-50 text-blue-600" },
          { label: "Graded", value: graded, style: "bg-green-50 text-green-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full mt-2 inline-block ${s.style}`}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <p className="font-semibold text-gray-900">All Assignments</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Course</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Title</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Due Date</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Marks</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {assignments.map((a) => {
              const cfg = statusConfig[a.status];
              return (
                <tr key={a.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-indigo-500 font-semibold">{a.course}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{a.title}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{a.due}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{a.marks ?? "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.style}`}>{cfg.label}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {a.status === "Pending" && (
                      <button onClick={() => setSubmitting(a)} className="flex items-center gap-1.5 text-xs bg-gray-900 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg transition-colors ml-auto">
                        <Upload size={12} /> Submit
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {submitting && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button onClick={() => { setSubmitting(null); setFileName(""); setNotes(""); }} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100">
              <X size={16} className="text-gray-400" />
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Submit Assignment</h2>
            <p className="text-sm text-gray-400 mb-5">{submitting.title} · <span className="font-mono text-indigo-500">{submitting.course}</span></p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl px-4 py-6 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-all">
                  <Upload size={20} className="text-gray-300 mb-2" />
                  {fileName
                    ? <p className="text-sm text-gray-700 font-medium">{fileName}</p>
                    : <p className="text-sm text-gray-400">Click to select a file</p>}
                  <input type="file" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")} />
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes to Lecturer <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional notes..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-300 resize-none" />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={handleSubmit} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 text-sm font-medium transition-colors">Submit Assignment</button>
              <button onClick={() => { setSubmitting(null); setFileName(""); setNotes(""); }} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
          {toast}
        </div>
      )}
    </div>
  );
}
