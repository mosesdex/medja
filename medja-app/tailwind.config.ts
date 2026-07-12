import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#2563EB", dark: "#1D4ED8", soft: "#EFF6FF" },
        accent: { DEFAULT: "#059669", soft: "#ECFDF5" },
        ink: "#0F172A",
        muted: { DEFAULT: "#64748B", bg: "#F1F5F9" },
        line: "#E2E8F0",
        danger: "#DC2626",
        amber: { DEFAULT: "#D97706", soft: "#FFFBEB" },
      },
      fontFamily: {
        display: ["Poppins", "system-ui", "sans-serif"],
        sans: ["Open Sans", "system-ui", "sans-serif"],
      },
      borderRadius: { xl: "14px", "2xl": "16px" },
      boxShadow: {
        card: "0 1px 3px rgba(15,23,42,.07),0 4px 14px rgba(15,23,42,.05)",
      },
    },
  },
  plugins: [],
} satisfies Config;
