import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        // Upscale department-store palette: bold red accent on black/white.
        brand: {
          50: "#fff1f2",
          100: "#ffe1e3",
          200: "#ffc7cb",
          400: "#f4475a",
          500: "#e11b30", // primary red — CTA, sale, badges
          600: "#c20f23",
          700: "#a00c1d",
          900: "#5f0911",
        },
        ink: {
          DEFAULT: "#0a0a0a",
          800: "#1a1a1a",
          700: "#2b2b2b",
        },
        surface: {
          DEFAULT: "#ffffff",
          muted: "#f6f6f6",
          sunken: "#efefef",
        },
        line: "#e5e5e5",
        star: "#f5a623",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)",
        pop: "0 8px 30px rgba(0,0,0,0.12)",
      },
      maxWidth: {
        store: "1400px",
      },
    },
  },
  plugins: [],
};

export default config;
