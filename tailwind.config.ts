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
        charcoal: "#0a0c12",
        "border-subtle": "rgba(255,255,255,0.08)",
        accent: {
          DEFAULT: "#7a9daa",
          hover: "#8aadba",
        },
        sega: {
          bg: "#141c2b",
          "bg-dark": "#0e1320",
          cyan: "#7a9daa",
          yellow: "#9aaa7a",
          red: "#ae7a82",
          green: "#7a9f88",
          blue: "#7a8aa4",
          white: "#dce4eb",
          muted: "#8fa3b0",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        pixel: ["var(--font-pixel)", "monospace"],
      },
      boxShadow: {
        "sega-glow": "0 0 10px rgba(106, 141, 154, 0.18)",
        "sega-inner": "inset 0 0 20px rgba(106, 141, 154, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
