const attendance = [
  { code: "CS201", name: "Data Structures & Algorithms", total: 24, attended: 22, percent: 92 },
  { code: "CS202", name: "Database Systems", total: 24, attended: 20, percent: 83 },
  { code: "MA201", name: "Discrete Mathematics", total: 30, attended: 26, percent: 87 },
  { code: "CS203", name: "Operating Systems", total: 24, attended: 21, percent: 88 },
  { code: "EN201", name: "Technical Writing", total: 14, attended: 13, percent: 93 },
];

function statusConfig(percent: number) {
  if (percent >= 90) return { label: "Good", style: "bg-green-50 text-green-600 border border-green-200", bar: "bg-green-500" };
  if (percent >= 75) return { label: "Satisfactory", style: "bg-amber-50 text-amber-600 border border-amber-200", bar: "bg-amber-400" };
  return { label: "At Risk", style: "bg-red-50 text-red-600 border border-red-200", bar: "bg-red-500" };
}

export default function Attendance() {
  const overall = Math.round(attendance.reduce((s, a) => s + a.percent, 0) / attendance.length);
  const cfg = statusConfig(overall);

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-3xl font-bold text-gray-900">{overall}%</p>
          <p className="text-xs text-gray-600 mt-1">Overall Attendance</p>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
            <div className={`h-1.5 rounded-full ${cfg.bar}`} style={{ width: `${overall}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-3xl font-bold text-gray-900">75%</p>
          <p className="text-xs text-gray-600 mt-1">Minimum Required</p>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
            <div className="h-1.5 rounded-full bg-gray-400" style={{ width: "75%" }} />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
          <div>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-xs text-gray-600 mt-1">Courses at Risk</p>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ml-auto ${cfg.style}`}>{cfg.label}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <p className="font-semibold text-gray-900">Attendance by Course</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Course</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Attended / Total</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide w-48">Progress</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Percentage</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((a) => {
              const s = statusConfig(a.percent);
              return (
                <tr key={a.code} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{a.name}</p>
                    <p className="text-xs text-blue-500 font-mono mt-0.5">{a.code}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{a.attended} / {a.total}</td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`h-2 rounded-full transition-all ${s.bar}`} style={{ width: `${a.percent}%` }} />
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">{a.percent}%</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${s.style}`}>{s.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
