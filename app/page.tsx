import Link from "next/link";

const roles = [
  { label: "Test Flow", href: "/test", description: "General test prototype walkthrough" },
  { label: "Super Admin Flow", href: "/super-admin", description: "Platform-wide administration" },
  { label: "HOD Flow", href: "/hod", description: "Head of Department management" },
  { label: "Lecturer Flow", href: "/lecturer", description: "Course and student management" },
  { label: "Student Flow", href: "/student", description: "Learning and submissions" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-16">
      <div className="mb-10 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Prototype Demo</h1>
        <p className="text-gray-600 text-sm">Select a user role to explore its flow</p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-md">
        {roles.map((role) => (
          <Link key={role.href} href={role.href}>
            <button className="w-full bg-white hover:bg-gray-900 hover:text-white border border-gray-200 text-gray-900 rounded-2xl px-6 py-5 text-left transition-all group">
              <span className="block text-base font-semibold">{role.label}</span>
              <span className="block text-xs mt-0.5 text-gray-600 group-hover:text-gray-300">{role.description}</span>
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}
