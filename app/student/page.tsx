import Link from "next/link";

export default function StudentFlow() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold text-gray-800">Student Flow</h1>
      <p className="text-gray-500">Coming soon.</p>
      <Link href="/" className="text-gray-600 underline text-sm">← Back</Link>
    </div>
  );
}
