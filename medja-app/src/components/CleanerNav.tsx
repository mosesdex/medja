"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/my-jobs", label: "My jobs" },
  { href: "/my-pay", label: "My pay" },
  { href: "/my-profile", label: "Profile" },
];

export function CleanerNav() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-white px-2 pb-[env(safe-area-inset-bottom)]">
      {ITEMS.map((it) => {
        const active = path === it.href || path.startsWith(it.href + "/");
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-[11px] font-semibold ${
              active ? "text-accent" : "text-muted"
            }`}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
