import { redirect } from "next/navigation";
import { getUser, getMember } from "@/lib/auth";
import { createCompany } from "@/features/company/actions";

export default async function OnboardingPage() {
  const user = await getUser();
  if (!user) redirect("/login");
  const member = await getMember();
  if (member) redirect("/dashboard");

  const services = [
    { v: "residential", l: "Home / residential" },
    { v: "commercial", l: "Office / commercial" },
    { v: "post_construction", l: "Post-construction" },
  ];

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-5 px-6 py-10">
      <div>
        <h1 className="font-display text-2xl font-bold">Set up your company</h1>
        <p className="text-sm text-muted">
          A few details and you&apos;re ready to schedule your first job.
        </p>
      </div>
      <form action={createCompany} className="card flex flex-col gap-4 p-6">
        <label className="text-sm font-semibold">
          Company name
          <input
            name="name"
            required
            placeholder="SparkleClean Services Ltd"
            className="mt-1 w-full rounded-xl border border-line px-4 py-3 text-base outline-none focus:border-primary"
          />
        </label>
        <label className="text-sm font-semibold">
          Your name
          <input
            name="owner_name"
            required
            placeholder="e.g. Dex"
            className="mt-1 w-full rounded-xl border border-line px-4 py-3 text-base outline-none focus:border-primary"
          />
        </label>
        <label className="text-sm font-semibold">
          City
          <input
            name="city"
            placeholder="Lagos"
            className="mt-1 w-full rounded-xl border border-line px-4 py-3 text-base outline-none focus:border-primary"
          />
        </label>
        <fieldset>
          <legend className="text-sm font-semibold">Services you offer</legend>
          <div className="mt-2 flex flex-col gap-2">
            {services.map((s) => (
              <label key={s.v} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="service_types"
                  value={s.v}
                  defaultChecked
                  className="h-5 w-5 accent-primary"
                />
                {s.l}
              </label>
            ))}
          </div>
        </fieldset>
        <button type="submit" className="btn-primary w-full">
          Create company
        </button>
      </form>
    </main>
  );
}
