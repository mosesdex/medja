"use client";

import { useState } from "react";
import { completeOnboarding } from "./actions";

const SERVICES = [
  { v: "residential", l: "Home / residential", d: "Apartments, duplexes, deep cleans" },
  { v: "commercial", l: "Office / commercial", d: "Offices, shops, daily contracts" },
  { v: "post_construction", l: "Post-construction", d: "New builds, site handover cleans" },
];

const TOTAL = 3;

export function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [pending, setPending] = useState(false);

  const canNext =
    step === 1 ? owner.trim() !== "" && name.trim() !== "" : true;

  const field =
    "mt-1 w-full rounded-xl border border-line px-4 py-3 text-base outline-none focus:border-primary";

  return (
    <div>
      {/* progress */}
      <div className="mb-6 flex items-center gap-2">
        {Array.from({ length: TOTAL }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i < step ? "bg-primary" : "bg-muted-bg"}`}
          />
        ))}
      </div>

      <form action={completeOnboarding} onSubmit={() => setPending(true)}>
        {/* Step 1 — keep all fields mounted so FormData always has them */}
        <div className={step === 1 ? "block" : "hidden"}>
          <h1 className="font-display text-2xl font-bold">Welcome to Medja 👋</h1>
          <p className="mt-1 text-sm text-muted">Let&apos;s set up your cleaning company. Takes a minute.</p>
          <div className="card mt-5 flex flex-col gap-4 p-6">
            <label className="text-sm font-semibold">
              Your name
              <input name="owner_name" required value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="e.g. Dex" className={field} />
            </label>
            <label className="text-sm font-semibold">
              Company name
              <input name="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="SparkleClean Services Ltd" className={field} />
            </label>
          </div>
        </div>

        {/* Step 2 */}
        <div className={step === 2 ? "block" : "hidden"}>
          <h1 className="font-display text-2xl font-bold">What do you clean?</h1>
          <p className="mt-1 text-sm text-muted">Pick the services you offer — we&apos;ll tailor job checklists to each.</p>
          <div className="card mt-5 flex flex-col gap-3 p-5">
            {SERVICES.map((s) => (
              <label key={s.v} className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-3">
                <input type="checkbox" name="service_types" value={s.v} defaultChecked className="mt-0.5 h-5 w-5 accent-primary" />
                <span>
                  <span className="block text-sm font-semibold">{s.l}</span>
                  <span className="block text-xs text-muted">{s.d}</span>
                </span>
              </label>
            ))}
            <label className="mt-1 text-sm font-semibold">
              City
              <input name="city" placeholder="Lagos" className={field} />
            </label>
          </div>
        </div>

        {/* Step 3 */}
        <div className={step === 3 ? "block" : "hidden"}>
          <h1 className="font-display text-2xl font-bold">You&apos;re all set, {owner || "there"}!</h1>
          <p className="mt-1 text-sm text-muted">{name || "Your company"} is ready. How would you like to start?</p>
          <div className="card mt-5 flex flex-col gap-3 p-5">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-3">
              <input type="radio" name="seed" value="fresh" defaultChecked className="mt-0.5 h-5 w-5 accent-primary" />
              <span>
                <span className="block text-sm font-semibold">Start fresh</span>
                <span className="block text-xs text-muted">An empty workspace — add your real clients and staff.</span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-3">
              <input type="radio" name="seed" value="sample" className="mt-0.5 h-5 w-5 accent-primary" />
              <span>
                <span className="block text-sm font-semibold">Explore with sample data</span>
                <span className="block text-xs text-muted">Realistic Lagos clients, staff, jobs &amp; an invoice to try things out.</span>
              </span>
            </label>
          </div>
        </div>

        {/* nav */}
        <div className="mt-6 flex gap-3">
          {step > 1 && (
            <button type="button" onClick={() => setStep((s) => s - 1)} className="btn-outline flex-1">
              Back
            </button>
          )}
          {step < TOTAL ? (
            <button
              type="button"
              disabled={!canNext}
              onClick={() => setStep((s) => s + 1)}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              Continue
            </button>
          ) : (
            <button type="submit" disabled={pending} className="btn-primary flex-1 disabled:opacity-60">
              {pending ? "Setting up…" : "Enter Medja"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
