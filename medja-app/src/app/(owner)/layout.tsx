import { requireRole } from "@/lib/auth";
import { OwnerNav } from "@/components/OwnerNav";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("owner", "supervisor", "accountant");
  return (
    <div className="md:flex">
      <OwnerNav />
      <main className="min-h-dvh flex-1 px-4 pb-24 pt-4 md:px-6 md:pb-6">
        {children}
      </main>
    </div>
  );
}
