"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/dashboard", label: "Home" },
  { href: "/jobs", label: "Jobs" },
  { href: "/money", label: "Money" },
  { href: "/staff", label: "Staff" },
  { href: "/clients", label: "Clients" },
];

export function OwnerNav() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-white px-2 pb-[env(safe-area-inset-bottom)] md:static md:h-dvh md:w-56 md:flex-col md:border-r md:border-t-0 md:px-3 md:py-5">
      <div className="hidden items-center gap-2 px-2 pb-4 md:flex">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-display text-base font-bold text-white">
          M
        </div>
        <span className="font-display text-lg font-bold">Medja</span>
      </div>
      {ITEMS.map((it) => {
        const active = path === it.href || path.startsWith(it.href + "/");
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold md:flex-none md:flex-row md:justify-start md:gap-3 md:px-3 md:py-3 md:text-sm ${
              active
                ? "text-primary md:bg-primary-soft"
                : "text-muted hover:text-ink"
            }`}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
