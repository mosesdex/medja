/** Medja brand tokens, shared across native screens. */
export const c = {
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  primarySoft: "#EFF6FF",
  accent: "#059669",
  accentSoft: "#ECFDF5",
  ink: "#0F172A",
  muted: "#64748B",
  mutedBg: "#F1F5F9",
  line: "#E2E8F0",
  bg: "#F8FAFC",
  card: "#FFFFFF",
  danger: "#DC2626",
  amber: "#D97706",
  amberSoft: "#FFFBEB",
  white: "#FFFFFF",
};

export const badgeStyle: Record<string, { bg: string; fg: string }> = {
  residential: { bg: c.primarySoft, fg: c.primary },
  commercial: { bg: "#F5F3FF", fg: "#7C3AED" },
  post_construction: { bg: c.amberSoft, fg: c.amber },
  booked: { bg: c.mutedBg, fg: c.muted },
  en_route: { bg: c.primarySoft, fg: c.primary },
  in_progress: { bg: c.amberSoft, fg: c.amber },
  done: { bg: c.accentSoft, fg: c.accent },
  invoiced: { bg: c.primarySoft, fg: c.primary },
  paid: { bg: c.accentSoft, fg: c.accent },
  balance_due: { bg: "#FEF2F2", fg: c.danger },
  overdue: { bg: "#FEF2F2", fg: c.danger },
  vetted: { bg: c.accentSoft, fg: c.accent },
  pending: { bg: c.amberSoft, fg: c.amber },
};

export const badgeLabel: Record<string, string> = {
  post_construction: "Post-const.",
  in_progress: "In progress",
  balance_due: "Balance due",
  en_route: "En route",
};
