import Link from "next/link";
import { createClient } from "@/features/clients/actions";

export default function NewClientPage() {
  const field =
    "mt-1 w-full rounded-xl border border-line px-4 py-3 text-base outline-none focus:border-primary";
  return (
    <div className="mx-auto max-w-lg">
      <header className="mb-4 flex items-center gap-3">
        <Link href="/clients" className="btn-outline px-3 py-2">
          ←
        </Link>
        <h1 className="font-display text-xl font-bold">New client</h1>
      </header>
      <form action={createClient} className="card flex flex-col gap-4 p-5">
        <label className="text-sm font-semibold">
          Name
          <input name="name" required className={field} placeholder="Mrs. Adebayo" />
        </label>
        <label className="text-sm font-semibold">
          Phone (WhatsApp)
          <input name="phone" type="tel" className={field} placeholder="0803 123 4567" />
        </label>
        <label className="text-sm font-semibold">
          Client type
          <select name="kind" className={field} defaultValue="residential">
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="developer">Developer</option>
          </select>
        </label>
        <hr className="border-line" />
        <p className="text-sm font-semibold text-muted">First site (optional)</p>
        <label className="text-sm font-semibold">
          Site label
          <input name="site_label" className={field} placeholder="Lekki Phase 1 home" />
        </label>
        <label className="text-sm font-semibold">
          Address
          <input name="site_address" className={field} placeholder="12 Admiralty Way" />
        </label>
        <label className="text-sm font-semibold">
          Access note
          <input name="site_access" className={field} placeholder="Gateman: Sunday, call on arrival" />
        </label>
        <button type="submit" className="btn-primary w-full">
          Save client
        </button>
      </form>
    </div>
  );
}
