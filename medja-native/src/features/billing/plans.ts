export type PlanTier = "trial" | "starter" | "growth" | "pro";

export interface Plan {
  tier: PlanTier;
  name: string;
  priceKobo: number; // monthly
  staffLimit: number; // Infinity for unlimited
  features: string[];
}

export const PLANS: Record<PlanTier, Plan> = {
  trial: {
    tier: "trial",
    name: "Free trial",
    priceKobo: 0,
    staffLimit: 5,
    features: ["All Growth features for 14 days"],
  },
  starter: {
    tier: "starter",
    name: "Starter",
    priceKobo: 1_500_000, // ₦15,000
    staffLimit: 5,
    features: ["Jobs, quotes & invoices", "Paystack links", "WhatsApp sharing", "Staff vetting"],
  },
  growth: {
    tier: "growth",
    name: "Growth",
    priceKobo: 3_500_000, // ₦35,000
    staffLimit: 20,
    features: ["Everything in Starter", "Recurring contracts", "GPS + photo proof", "Payroll", "Reconciliation"],
  },
  pro: {
    tier: "pro",
    name: "Pro",
    priceKobo: 7_500_000, // ₦75,000
    staffLimit: Infinity,
    features: ["Everything in Growth", "Multi-site rollups", "Reports", "WhatsApp Business API", "Priority support"],
  },
};

/** Whether adding one more staff member is allowed under the plan. */
export function canAddStaff(tier: PlanTier, currentStaff: number): boolean {
  return currentStaff < PLANS[tier].staffLimit;
}

/** Whether the trial has expired (returns false for non-trial plans). */
export function isTrialExpired(tier: PlanTier, trialEndsOn: string | null, today: Date): boolean {
  if (tier !== "trial" || !trialEndsOn) return false;
  return new Date(trialEndsOn).getTime() < today.getTime();
}
