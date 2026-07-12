import Link from "next/link";
import { createStaff } from "@/features/staff/actions";

export default function NewStaffPage() {
  const field =
    "mt-1 w-full rounded-xl border border-line px-4 py-3 text-base outline-none focus:border-primary";
  return (
    <div className="mx-auto max-w-lg">
      <header className="mb-4 flex items-center gap-3">
        <Link href="/staff" className="btn-outline px-3 py-2">←</Link>
        <h1 className="font-display text-xl font-bold">Add staff</h1>
      </header>
      <form action={createStaff} className="card flex flex-col gap-4 p-5">
        <label className="text-sm font-semibold">
          Name
          <input name="name" required className={field} placeholder="Chidinma Okafor" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-semibold">
            Phone
            <input name="phone" type="tel" className={field} placeholder="0803…" />
          </label>
          <label className="text-sm font-semibold">
            Role
            <input name="role_title" className={field} placeholder="Cleaner" defaultValue="Cleaner" />
          </label>
        </div>

        <hr className="border-line" />
        <p className="text-sm font-semibold text-muted">Vetting record</p>
        <label className="text-sm font-semibold">
          NIN
          <input name="nin" className={field} placeholder="National ID number" />
        </label>
        <label className="text-sm font-semibold">
          Guarantor name
          <input name="guarantor_name" className={field} placeholder="e.g. Mr. Emeka Okafor" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-semibold">
            Guarantor phone
            <input name="guarantor_phone" type="tel" className={field} />
          </label>
          <label className="text-sm font-semibold">
            Background check
            <input name="background_check" className={field} placeholder="cleared 2026-02" />
          </label>
        </div>
        <label className="text-sm font-semibold">
          Guarantor address
          <input name="guarantor_address" className={field} />
        </label>

        <hr className="border-line" />
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-semibold">
            Pay rate (₦)
            <input name="pay_naira" type="number" min="0" step="500" className={field} placeholder="4500" />
          </label>
          <label className="text-sm font-semibold">
            Basis
            <select name="pay_basis" className={field} defaultValue="per_job">
              <option value="per_job">Per job</option>
              <option value="per_day">Per day</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>
        </div>

        <button type="submit" className="btn-primary w-full">Save staff</button>
        <p className="text-xs text-muted">
          NIN and guarantor ID document uploads (to private storage) are wired for
          when you connect Supabase Storage.
        </p>
      </form>
    </div>
  );
}
