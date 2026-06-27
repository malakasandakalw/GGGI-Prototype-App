"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";

export function FloatingHomeButton() {
  const pathname = usePathname();

  // Don't show on the home page itself
  if (pathname === "/") return null;

  return (
    <Link
      href="/"
      aria-label="Go to home page"
      title="Home"
      className="fixed bottom-6 right-6 z-50 flex h-8 w-8 items-center justify-center bg-blue-600 text-white border border-blue-700 transition-colors hover:bg-blue-700"
    >
      <Home size={15} />
    </Link>
  );
}
