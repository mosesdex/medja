import { EmptyState } from "@/components/ui";

export default function StaffPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 font-display text-xl font-bold">Staff</h1>
      <EmptyState
        title="Staff & vetting arrive in Phase 2"
        hint="Profiles with NIN/guarantor records, teams, and the cleaner field app."
      />
    </div>
  );
}
