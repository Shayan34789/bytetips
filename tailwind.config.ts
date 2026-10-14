import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      colors: {
        ink: "#0f172a",
        muted: "#64748b",
        canvas: "#ffffff",
        surface: "#f8fafc",
        line: "#e2e8f0",
        accent: {
          DEFAULT: "#0284c7",
          light: "#f0f9ff",
          mid: "#7dd3fc",
        },
      },
    },
  },
  plugins: [],
};

export default config;
