import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: "#060b14",
        "border-subtle": "rgba(0,220,255,0.1)",
        accent: {
          DEFAULT: "#00dcff",
          hover: "#33e4ff",
        },
        sega: {
          bg: "#0a0e1a",
          "bg-dark": "#060b14",
          cyan: "#00dcff",
          yellow: "#ffe066",
          red: "#ff6b7a",
          green: "#00e87a",
          blue: "#7a8aa4",
          white: "#e8f0f7",
          muted: "#8fa3b0",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        pixel: ["var(--font-pixel)", "monospace"],
      },
      boxShadow: {
        "sega-glow": "0 0 12px rgba(0,220,255,0.35), 0 0 24px rgba(0,220,255,0.15)",
        "sega-glow-sm": "0 0 6px rgba(0,220,255,0.4)",
        "sega-inner": "inset 0 0 20px rgba(0,220,255,0.06)",
        "sega-btn": "0 0 8px rgba(0,220,255,0.3), inset 0 0 8px rgba(0,220,255,0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
