import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-white font-display">
          M
        </div>
        <span className="font-display text-3xl font-bold">Medja</span>
      </div>
      <h1 className="font-display text-2xl font-bold leading-tight">
        Run your cleaning company from your phone
      </h1>
      <p className="text-muted">
        Scheduling, staff, quotes, naira invoices and Paystack payments — built
        for Nigerian cleaning companies.
      </p>
      <Link href="/login" className="btn-primary w-full">
        Get started
      </Link>
    </main>
  );
}
