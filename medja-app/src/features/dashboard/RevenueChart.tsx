import { formatNaira } from "@/lib/money";

/** Simple accessible 6-month revenue bar chart (brand primary bars). */
export function RevenueChart({
  data,
}: {
  data: { label: string; kobo: number }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.kobo));
  const hasAny = data.some((d) => d.kobo > 0);

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-sm font-semibold">Revenue collected — 6 months</h2>
        <span className="text-xs text-muted">paid invoices</span>
      </div>
      {!hasAny ? (
        <p className="py-6 text-center text-sm text-muted">
          No collected revenue yet — it appears here as invoices get paid.
        </p>
      ) : (
        <div className="flex items-end gap-2" style={{ height: 160 }}>
          {data.map((d) => (
            <div key={d.label} className="flex flex-1 flex-col items-center justify-end gap-1">
              <span className="text-[10px] font-semibold text-ink money">
                {d.kobo > 0 ? formatNaira(d.kobo).replace("₦", "₦") : ""}
              </span>
              <div
                className="w-full rounded-t bg-primary"
                style={{ height: `${Math.max(4, (d.kobo / max) * 120)}px` }}
                title={`${d.label}: ${formatNaira(d.kobo)}`}
              />
              <span className="text-[11px] font-semibold text-muted">{d.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
