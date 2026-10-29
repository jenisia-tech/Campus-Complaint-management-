import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--text-main)",
        campus: {
          bg: "var(--background)",
          card: "var(--card)",
          border: "var(--border)",
          text: "var(--text-main)",
          muted: "var(--text-secondary)",
          accent: "var(--accent)",
          surface: "var(--surface-secondary)",
          navy: "#173B57",
          teal: "#246B67",
          softTeal: "#E5F4F2",
          // Dark tokens
          darkBg: "#111D2B",
          darkCard: "#1C2B3B",
          darkAccent: "#2DD4BF",
          darkSurface: "#243B4B",
          darkBorder: "#34465A",
          // Status tokens
          success: "var(--success)",
          pending: "var(--pending)",
          critical: "var(--critical)",
        },
        notepad: {
          paper: "#F4F7FB",
          card: "#FFFFFF",
          border: "#D9E2EC",
          line: "#D9E2EC",
          amber: "#246B67",
          teal: "#246B67",
          navy: "#173B57",
          softTeal: "#E5F4F2",
          darkBg: "#111D2B",
          darkCard: "#1C2B3B",
          darkBorder: "#34465A",
          darkLine: "#243B4B",
          darkAccent: "#2DD4BF",
          darkSurface: "#243B4B",
        },
        navy: {
          50: "#F4F7FB",
          100: "#D9E2EC",
          200: "#B9CADA",
          300: "#8FAEC6",
          400: "#526579",
          500: "#3A556E",
          600: "#2B445B",
          700: "#243B4B",
          800: "#1C2B3B",
          900: "#173B57", // Primary navy
          950: "#111D2B", // Dark background
        },
        teal: {
          50: "#E5F4F2", // Soft teal
          100: "#CCEAE6",
          200: "#99D5CD",
          300: "#66C0B4",
          400: "#2DD4BF", // Dark primary accent
          500: "#246B67", // Secondary teal
          600: "#1E5855",
          700: "#174543",
          800: "#17664F", // Light success
          900: "#0D2726",
          950: "#071716",
        },
        primary: {
          50: "#E5F4F2",
          100: "#CCEAE6",
          200: "#99D5CD",
          300: "#66C0B4",
          400: "#2DD4BF",
          500: "#246B67",
          600: "#1E5855",
          700: "#173B57",
          800: "#122E44",
          900: "#0D2131",
        },
      },
    },
  },
  plugins: [],
};

export default config;
