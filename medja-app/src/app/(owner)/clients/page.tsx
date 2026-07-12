import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { getMember } from "@/lib/auth";
import { Badge, EmptyState } from "@/components/ui";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const member = await getMember();
  const supabase = await createServerClient();

  let query = supabase
    .from("clients")
    .select("id, name, phone, kind")
    .order("created_at", { ascending: false });
  if (q?.trim()) {
    const term = `%${q.trim()}%`;
    query = query.or(`name.ilike.${term},phone.ilike.${term}`);
  }
  const { data: clients } = await query;

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold">Clients</h1>
          <p className="text-sm text-muted">{member?.name}&apos;s company</p>
        </div>
        <Link href="/clients/new" className="btn-primary">
          + New client
        </Link>
      </header>

      <form className="mb-4" action="/clients">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by name or phone…"
          className="w-full rounded-xl border border-line px-4 py-3 text-base outline-none focus:border-primary"
        />
      </form>

      {!clients?.length ? (
        <EmptyState
          title={q ? "No matches" : "No clients yet"}
          hint={q ? "Try a different search." : "Add your first client to start booking jobs."}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {clients.map((c) => (
            <Link
              key={c.id}
              href={`/clients/${c.id}`}
              className="card flex items-center gap-3 p-3 hover:bg-muted-bg"
            >
              <div className="flex-1">
                <div className="font-bold">{c.name}</div>
                <div className="text-sm text-muted">{c.phone ?? "—"}</div>
              </div>
              <Badge value={c.kind} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
