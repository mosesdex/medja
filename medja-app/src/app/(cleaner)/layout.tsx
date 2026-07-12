import { requireRole } from "@/lib/auth";
import { CleanerNav } from "@/components/CleanerNav";

export default async function CleanerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("cleaner");
  return (
    <div className="min-h-dvh">
      <main className="mx-auto max-w-md px-4 pb-24 pt-4">{children}</main>
      <CleanerNav />
    </div>
  );
}
