import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

/**
 * VENDE YA — Tailwind Design System
 * Mobile-first. Brand: Salsa (red-orange), Lima (green), Plin (purple).
 * No indigo/blue. All brand tokens are also exposed via globals.css
 * `@theme inline` so utilities like `bg-salsa-500` work in v4.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--salsa-500)",
          foreground: "var(--salsa-50)",
        },
        secondary: {
          DEFAULT: "var(--lima-100)",
          foreground: "var(--lima-900)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "oklch(0.985 0 0)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        // Brand
        salsa: {
          50:  "var(--salsa-50)",
          100: "var(--salsa-100)",
          200: "var(--salsa-200)",
          300: "var(--salsa-300)",
          400: "var(--salsa-400)",
          500: "var(--salsa-500)",
          600: "var(--salsa-600)",
          700: "var(--salsa-700)",
          800: "var(--salsa-800)",
          900: "var(--salsa-900)",
        },
        lima: {
          50:  "var(--lima-50)",
          100: "var(--lima-100)",
          200: "var(--lima-200)",
          300: "var(--lima-300)",
          400: "var(--lima-400)",
          500: "var(--lima-500)",
          600: "var(--lima-600)",
          700: "var(--lima-700)",
          800: "var(--lima-800)",
          900: "var(--lima-900)",
        },
        plin: {
          400: "var(--plin-500)",
          500: "var(--plin-500)",
          600: "var(--plin-600)",
        },
        tambo: "var(--tambo)",
        // Chart
        chart: {
          1: "var(--chart-1)",
          2: "var(--chart-2)",
          3: "var(--chart-3)",
          4: "var(--chart-4)",
          5: "var(--chart-5)",
        },
      },
      borderRadius: {
        sm: "calc(var(--radius) - 4px)",
        md: "calc(var(--radius) - 2px)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "JetBrains Mono", "monospace"],
        display: ["var(--font-display)", "var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        lift: "var(--shadow-lift)",
        "glow-salsa": "var(--shadow-glow-salsa)",
        "glow-lima": "var(--shadow-glow-lima)",
      },
      keyframes: {
        "pulse-live": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.6)", opacity: "0.6" },
        },
        "bid-bounce": {
          "0%":   { transform: "scale(0.96)", opacity: "0.5" },
          "50%":  { transform: "scale(1.05)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "float-up": {
          "0%":   { transform: "translateY(0) scale(0.8)", opacity: "0" },
          "15%":  { transform: "translateY(-10px) scale(1.1)", opacity: "1" },
          "100%": { transform: "translateY(-160px) scale(1)", opacity: "0" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "slide-up": {
          from: { transform: "translateY(8px)", opacity: "0" },
          to:   { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "pulse-live": "pulse-live 1.6s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bid-bounce": "bid-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "float-up":   "float-up 2.5s ease-out forwards",
        shimmer:      "shimmer 1.5s linear infinite",
        "slide-up":   "slide-up 0.3s ease-out",
      },
      spacing: {
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
