import Link from "next/link";

interface Step {
  done: boolean;
  label: string;
  href: string;
}

/** Onboarding checklist shown until the company has set itself up. */
export function GettingStarted({ steps }: { steps: Step[] }) {
  const remaining = steps.filter((s) => !s.done).length;
  if (remaining === 0) return null;

  return (
    <div className="card mb-4 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold">Get set up</h2>
        <span className="text-xs font-bold text-muted">
          {steps.length - remaining}/{steps.length}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {steps.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className={`flex items-center gap-3 rounded-lg px-2 py-2 text-sm ${
              s.done ? "text-muted" : "font-semibold hover:bg-muted-bg"
            }`}
          >
            <span
              className={`flex h-5 w-5 flex-none items-center justify-center rounded-md border-2 text-[11px] text-white ${
                s.done ? "border-accent bg-accent" : "border-line"
              }`}
            >
              {s.done ? "✓" : ""}
            </span>
            <span className={s.done ? "line-through" : ""}>{s.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
