const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const courseColors: Record<string, string> = {
  CS201: "bg-blue-50 border-l-4 border-blue-400",
  CS202: "bg-blue-50 border-l-4 border-blue-400",
  MA201: "bg-purple-50 border-l-4 border-purple-400",
  CS203: "bg-emerald-50 border-l-4 border-emerald-400",
  EN201: "bg-orange-50 border-l-4 border-orange-400",
};

const slots = [
  { time: "8:00 – 9:00", Monday: { code: "MA201", name: "Discrete Mathematics", room: "C301" }, Tuesday: null, Wednesday: null, Thursday: null, Friday: { code: "MA201", name: "Discrete Mathematics", room: "C301" } },
  { time: "9:00 – 10:30", Monday: { code: "CS201", name: "Data Structures", room: "B201" }, Tuesday: null, Wednesday: { code: "CS201", name: "Data Structures", room: "B201" }, Thursday: null, Friday: null },
  { time: "11:00 – 12:30", Monday: null, Tuesday: { code: "CS202", name: "Database Systems", room: "A105" }, Wednesday: null, Thursday: { code: "CS202", name: "Database Systems", room: "A105" }, Friday: null },
  { time: "1:00 – 3:00", Monday: null, Tuesday: null, Wednesday: null, Thursday: { code: "EN201", name: "Technical Writing", room: "A202" }, Friday: null },
  { time: "2:00 – 3:30", Monday: null, Tuesday: null, Wednesday: { code: "CS203", name: "Operating Systems", room: "B105" }, Thursday: null, Friday: { code: "CS203", name: "Operating Systems", room: "B105" } },
];

export default function Timetable() {
  return (
    <div className="w-full space-y-6">
      {/* Legend */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-6 flex-wrap">
        {Object.entries(courseColors).map(([code, style]) => (
          <div key={code} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-sm ${style.split(" ")[0]} ${style.split(" ")[1]} ${style.split(" ")[2]}`} />
            <span className="text-xs text-gray-600 font-mono">{code}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wide w-32">Time</th>
              {days.map((d) => (
                <th key={d} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slots.map((slot) => (
              <tr key={slot.time} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-4 text-xs text-gray-600 font-mono whitespace-nowrap">{slot.time}</td>
                {days.map((d) => {
                  const entry = slot[d as keyof typeof slot] as { code: string; name: string; room: string } | null;
                  return (
                    <td key={d} className="px-3 py-3">
                      {entry ? (
                        <div className={`rounded-lg px-3 py-2.5 ${courseColors[entry.code] ?? "bg-gray-50 border-l-4 border-gray-300"}`}>
                          <p className="font-semibold text-gray-800 text-xs">{entry.name}</p>
                          <p className="text-xs text-gray-600 font-mono mt-0.5">{entry.code} · {entry.room}</p>
                        </div>
                      ) : (
                        <div className="h-12" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
