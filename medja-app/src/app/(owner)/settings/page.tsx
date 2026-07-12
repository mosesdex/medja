import { createServerClient } from "@/lib/supabase/server";
import { getMember } from "@/lib/auth";
import { setCompanySlug } from "@/features/company/actions";
import { SeedButton } from "@/features/company/SeedButton";
import { PLANS, isTrialExpired, type PlanTier } from "@/features/billing/plans";
import { formatNaira } from "@/lib/money";

export default async function SettingsPage() {
  const member = await getMember();
  const supabase = await createServerClient();
  const { data: company } = await supabase
    .from("companies")
    .select("name, slug, plan, trial_ends_on")
    .eq("id", member?.companyId ?? "")
    .maybeSingle();

  const c = company as {
    name: string;
    slug: string | null;
    plan: PlanTier;
    trial_ends_on: string | null;
  } | null;
  const plan = c?.plan ?? "trial";
  const expired = isTrialExpired(plan, c?.trial_ends_on ?? null, new Date());
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 font-display text-xl font-bold">Settings</h1>

      <div className="card mb-4 p-4">
        <h2 className="mb-2 font-display text-sm font-semibold">Company</h2>
        <div className="flex justify-between py-1 text-sm">
          <span className="text-muted">Name</span>
          <span className="font-semibold">{c?.name}</span>
        </div>
        <div className="flex justify-between py-1 text-sm">
          <span className="text-muted">Current plan</span>
          <span className="font-semibold capitalize">
            {plan}
            {plan === "trial" && c?.trial_ends_on
              ? ` (ends ${new Date(c.trial_ends_on).toLocaleDateString("en-NG")})`
              : ""}
          </span>
        </div>
      </div>

      <div className="card mb-4 p-4">
        <h2 className="mb-1 font-display text-sm font-semibold">Public booking link</h2>
        <p className="mb-3 text-sm text-muted">
          Share this link on WhatsApp status or Instagram — clients book straight into Medja.
        </p>
        {c?.slug && (
          <div className="mb-3 rounded-xl bg-muted-bg p-3 text-sm font-semibold text-primary">
            {appUrl || "https://your-domain"}/book/{c.slug}
          </div>
        )}
        <form action={setCompanySlug} className="flex gap-2">
          <div className="flex flex-1 items-center rounded-xl border border-line px-3 text-sm text-muted">
            /book/
            <input
              name="slug"
              defaultValue={c?.slug ?? ""}
              placeholder="sparkleclean"
              className="w-full bg-transparent py-2.5 pl-1 text-base text-ink outline-none"
            />
          </div>
          <button className="btn-primary">{c?.slug ? "Update" : "Set link"}</button>
        </form>
      </div>

      {expired && (
        <div className="card mb-4 border-amber/40 bg-amber-soft p-3 text-sm font-semibold text-amber">
          Your free trial has ended — choose a plan to keep using Medja.
        </div>
      )}

      <h2 className="mb-2 font-display text-base font-semibold">Plans</h2>
      <div className="grid gap-3 md:grid-cols-3">
        {(["starter", "growth", "pro"] as PlanTier[]).map((tier) => {
          const p = PLANS[tier];
          const current = plan === tier;
          return (
            <div key={tier} className={`card p-4 ${current ? "border-primary" : ""}`}>
              <div className="font-display text-base font-semibold">{p.name}</div>
              <div className="my-1 font-display text-2xl font-bold money">
                {formatNaira(p.priceKobo)}
                <span className="text-sm font-semibold text-muted">/mo</span>
              </div>
              <ul className="mb-3 mt-2 flex flex-col gap-1 text-sm text-muted">
                {p.features.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
              <button className={current ? "btn-outline w-full" : "btn-primary w-full"} disabled={current}>
                {current ? "Current plan" : "Choose (Paystack)"}
              </button>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-muted">
        Plan changes are billed via Paystack subscriptions; staff-seat limits are
        enforced per tier.
      </p>

      <div className="card mt-4 p-4">
        <h2 className="mb-1 font-display text-sm font-semibold">Try it with sample data</h2>
        <p className="mb-3 text-sm text-muted">
          Load realistic Lagos clients, staff, jobs and an invoice to explore Medja. Only works on an empty company.
        </p>
        <SeedButton />
      </div>
    </div>
  );
}
