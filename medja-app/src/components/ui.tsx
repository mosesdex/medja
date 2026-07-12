import { formatNaira } from "@/lib/money";

const BADGE_STYLES: Record<string, string> = {
  residential: "bg-primary-soft text-primary",
  commercial: "bg-violet-50 text-violet-700",
  post_construction: "bg-amber-soft text-amber",
  done: "bg-accent-soft text-accent",
  paid: "bg-accent-soft text-accent",
  in_progress: "bg-amber-soft text-amber",
  booked: "bg-muted-bg text-muted",
  en_route: "bg-primary-soft text-primary",
  invoiced: "bg-primary-soft text-primary",
  balance_due: "bg-red-50 text-danger",
  overdue: "bg-red-50 text-danger",
  draft: "bg-muted-bg text-muted",
  sent: "bg-primary-soft text-primary",
  vetted: "bg-accent-soft text-accent",
  pending: "bg-amber-soft text-amber",
};

const LABELS: Record<string, string> = {
  post_construction: "Post-const.",
  in_progress: "In progress",
  balance_due: "Balance due",
  en_route: "En route",
};

export function Badge({ value }: { value: string }) {
  return (
    <span className={`badge ${BADGE_STYLES[value] ?? "bg-muted-bg text-muted"}`}>
      {LABELS[value] ?? value.charAt(0).toUpperCase() + value.slice(1)}
    </span>
  );
}

export function Naira({ kobo }: { kobo: number | null | undefined }) {
  return <span className="money">{formatNaira(kobo ?? 0)}</span>;
}

export function StatTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "green" | "amber";
}) {
  const color =
    tone === "green" ? "text-accent" : tone === "amber" ? "text-amber" : "text-ink";
  return (
    <div className="card p-4">
      <div className="text-xs font-semibold text-muted">{label}</div>
      <div className={`mt-1 font-display text-2xl font-bold money ${color}`}>
        {value}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="card flex flex-col items-center gap-1 p-8 text-center">
      <div className="font-display text-base font-semibold">{title}</div>
      {hint && <div className="text-sm text-muted">{hint}</div>}
    </div>
  );
}
