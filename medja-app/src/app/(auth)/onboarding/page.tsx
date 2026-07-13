import { redirect } from "next/navigation";
import { getUser, getMember } from "@/lib/auth";
import { OnboardingWizard } from "@/features/company/OnboardingWizard";

export default async function OnboardingPage() {
  const user = await getUser();
  if (!user) redirect("/login");
  const member = await getMember();
  if (member) redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-10">
      <div className="mb-6 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-display text-base font-bold text-white">
          M
        </div>
        <span className="font-display text-lg font-bold">Medja</span>
      </div>
      <OnboardingWizard />
    </main>
  );
}
