import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { addExpense } from "@/features/expenses/actions";
import { DeleteExpense } from "@/features/expenses/DeleteExpense";
import { Naira } from "@/components/ui";
import { formatNaira } from "@/lib/money";

export default async function ExpensesPage() {
  const supabase = await createServerClient();
  const { data: expenses } = await supabase
    .from("expenses")
    .select("id, category, note, amount_kobo, spent_on")
    .order("spent_on", { ascending: false })
    .limit(50);

  const total = (expenses ?? []).reduce((s, e) => s + e.amount_kobo, 0);
  const field =
    "w-full rounded-xl border border-line px-3 py-2.5 text-base outline-none focus:border-primary";

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-4 flex items-center gap-3">
        <Link href="/money" className="btn-outline px-3 py-2">←</Link>
        <h1 className="flex-1 font-display text-xl font-bold">Expenses</h1>
        <span className="font-display font-bold text-amber money">{formatNaira(total)}</span>
      </header>

      <form action={addExpense} className="card mb-4 flex flex-col gap-3 p-4">
        <div className="grid grid-cols-2 gap-2">
          <select name="category" className={field} defaultValue="supplies">
            <option value="supplies">Supplies</option>
            <option value="transport">Transport</option>
            <option value="advance">Staff advance</option>
            <option value="other">Other</option>
          </select>
          <input name="amount_naira" type="number" min="0" step="500" placeholder="₦ amount" className={field} required />
        </div>
        <input name="note" placeholder="Note (optional)" className={field} />
        <button className="btn-primary w-full">Add expense</button>
      </form>

      <div className="flex flex-col gap-2">
        {expenses?.map((e) => (
          <div key={e.id} className="card flex items-center justify-between gap-3 p-3">
            <div className="min-w-0 flex-1">
              <div className="font-bold capitalize">{e.category}</div>
              <div className="truncate text-sm text-muted">{e.note ?? new Date(e.spent_on).toLocaleDateString("en-NG")}</div>
            </div>
            <Naira kobo={e.amount_kobo} />
            <DeleteExpense id={e.id as string} />
          </div>
        ))}
      </div>
    </div>
  );
}
